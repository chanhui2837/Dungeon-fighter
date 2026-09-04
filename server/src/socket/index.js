import { socketAuth } from '../middleware/auth.js';
import { MONSTERS, DUNGEONS, ITEMS, SKILLS, calcStats, rollDrops } from '../utils/gameData.js';
import { validateMovement, validateAttack, validateSkill } from './anticheat.js';

const WORLD_SIZE = { w: 1600, h: 1200 };
const TICK_RATE = 20; // 20Hz server tick
const MAX_PLAYERS_PER_DUNGEON = 8;

// runtime state
const players = new Map(); // socketId -> playerState
const userSocketMap = new Map(); // userId -> socketId
const dungeons = new Map(); // dungeonId -> { players:Set<socketId>, monsters: [], _monsterIdSeq }
const queues = new Map(); // dungeonId -> [{socketId,userId,username,level}]
const parties = new Map(); // partyId -> { id, dungeonId, members: Set<socketId>, leader }
const chatHistory = { world: [] }; // keep last 100

function getOrCreateDungeon(dungeonId) {
  if (!dungeons.has(dungeonId)) {
    dungeons.set(dungeonId, { players: new Set(), monsters: [], _seq: 1, lastSpawn: Date.now() });
    spawnMonsters(dungeonId, 6);
  }
  return dungeons.get(dungeonId);
}

function spawnMonsters(dungeonId, count) {
  const dungeon = getOrCreateDungeon(dungeonId);
  const def = DUNGEONS[dungeonId] || DUNGEONS.forest;
  for (let i = 0; i < count; i++) {
    const pool = def.monsters || ['slime'];
    const type = pool[Math.floor(Math.random() * pool.length)];
    const tmpl = MONSTERS[type];
    if (!tmpl) continue;
    // boss chance
    let finalType = type;
    if (def.boss && Math.random() < 0.02) finalType = def.boss;
    const mdef = MONSTERS[finalType];
    dungeon.monsters.push({
      id: `m_${dungeon._seq++}`,
      type: finalType,
      x: 200 + Math.random() * (WORLD_SIZE.w - 400),
      y: 200 + Math.random() * (WORLD_SIZE.h - 400),
      hp: mdef.hp,
      maxHp: mdef.hp,
      atk: mdef.atk,
      target: null,
      state: 'wander',
      wanderAngle: Math.random() * Math.PI * 2,
      lastAttack: 0,
      lastMove: Date.now(),
    });
  }
}

function broadcastToDungeon(dungeonId, event, data, except) {
  const dungeon = dungeons.get(dungeonId);
  if (!dungeon) return;
  for (const sid of dungeon.players) {
    if (sid === except) continue;
    const p = players.get(sid);
    if (p?.socket) p.socket.emit(event, data);
  }
}

export function initSocket(io) {
  // auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    const decoded = socketAuth(token);
    if (!decoded) return next(new Error('unauthorized'));
    socket.userId = decoded.id;
    socket.username = decoded.username;
    next();
  });

  io.on('connection', (socket) => {
    console.log(`[WS] connect ${socket.username} ${socket.id}`);
    // prevent duplicate login
    const existing = userSocketMap.get(socket.userId);
    if (existing && existing !== socket.id) {
      const old = players.get(existing);
      if (old?.socket) old.socket.disconnect(true);
    }
    userSocketMap.set(socket.userId, socket.id);

    // init player state
    const initialDungeon = 'forest';
    const player = {
      socket,
      userId: socket.userId,
      username: socket.username,
      x: WORLD_SIZE.w / 2 + (Math.random() - 0.5) * 200,
      y: WORLD_SIZE.h / 2 + (Math.random() - 0.5) * 200,
      vx: 0, vy: 0,
      hp: 100, maxHp: 100, mp: 50, maxMp: 50,
      level: 1,
      avatar: { head: 'head_none', top: 'top_none', bottom: 'bottom_none', weapon: 'weapon_none', accessory: 'acc_none' },
      equipment: {},
      stats: { str: 5, agi: 5, int: 5, atk: 10, def: 2, spd: 130 },
      dungeonId: null,
      partyId: null,
      lastMoveAt: Date.now(),
      lastAttackAt: 0,
      skillCooldowns: {},
      facing: 1,
      isAttacking: false,
      state: 'idle',
    };
    players.set(socket.id, player);

    // join world first - but need to sync initial data from client later via player:ready
    socket.emit('connected', { id: socket.id, worldSize: WORLD_SIZE, tickRate: TICK_RATE });

    // --- player:ready - client sends its saved character to sync server stats
    socket.on('player:ready', (data) => {
      const p = players.get(socket.id);
      if (!p) return;
      if (data?.character) {
        // validate and apply
        p.level = Math.min(100, Math.max(1, data.character.level || 1));
        p.avatar = data.character.avatar || p.avatar;
        p.equipment = data.character.equipment || {};
        p.stats = calcStats(data.character.stats || { str:5,agi:5,int:5 }, p.equipment, p.avatar);
        p.maxHp = p.stats.maxHp || 100;
        p.maxMp = p.stats.maxMp || 50;
        p.hp = Math.min(p.maxHp, data.character.hp ?? p.maxHp);
        p.mp = Math.min(p.maxMp, data.character.mp ?? p.maxMp);
      }
      let dungeonId = data?.dungeonId || initialDungeon;
      const reqLv = DUNGEONS[dungeonId]?.reqLv || 1;
      if ((p.level || 1) < reqLv) {
        socket.emit('error:join', { message: `Lv.${reqLv} 이상만 입장 가능 - ${DUNGEONS[dungeonId]?.name||dungeonId} (현재 Lv.${p.level})` });
        dungeonId = 'forest';
      }
      joinDungeon(socket.id, dungeonId);
    });

    function joinDungeon(sid, dungeonId) {
      const p = players.get(sid);
      if (!p) return;
      // leave previous
      if (p.dungeonId) {
        const prev = dungeons.get(p.dungeonId);
        if (prev) prev.players.delete(sid);
        socket.leave(`dungeon:${p.dungeonId}`);
        broadcastToDungeon(p.dungeonId, 'player:leave', { id: sid, username: p.username });
      }
      // capacity check
      const dungeon = getOrCreateDungeon(dungeonId);
      if (dungeon.players.size >= MAX_PLAYERS_PER_DUNGEON) {
        socket.emit('error:join', { message: '던전이 가득 찼습니다' });
        return;
      }
      p.dungeonId = dungeonId;
      dungeon.players.add(sid);
      socket.join(`dungeon:${dungeonId}`);
      // move to spawn
      p.x = WORLD_SIZE.w / 2 + (Math.random() - 0.5) * 100;
      p.y = WORLD_SIZE.h / 2 + (Math.random() - 0.5) * 100;
      // send dungeon state to joiner
      socket.emit('dungeon:joined', {
        dungeonId,
        worldSize: WORLD_SIZE,
        players: [...dungeon.players].map(id => {
          const pl = players.get(id);
          return pl ? { id, username: pl.username, x: pl.x, y: pl.y, hp: pl.hp, maxHp: pl.maxHp, level: pl.level, avatar: pl.avatar, facing: pl.facing } : null;
        }).filter(Boolean),
        monsters: dungeon.monsters,
      });
      // notify others
      broadcastToDungeon(dungeonId, 'player:join', {
        id: sid, username: p.username, x: p.x, y: p.y, hp: p.hp, maxHp: p.maxHp, level: p.level, avatar: p.avatar, facing: p.facing
      }, sid);
    }

    socket.on('dungeon:switch', ({ dungeonId }) => {
      if (!DUNGEONS[dungeonId]) return socket.emit('error:join', { message: '존재하지 않는 던전' });
      const p = players.get(socket.id);
      const reqLv = DUNGEONS[dungeonId].reqLv || 1;
      if (p && (p.level || 1) < reqLv) return socket.emit('error:join', { message: `Lv.${reqLv} 이상만 입장 가능합니다 (현재 Lv.${p.level||1})` });
      joinDungeon(socket.id, dungeonId);
    });

    // movement - validated
    socket.on('player:move', (data) => {
      const p = players.get(socket.id);
      if (!p || !p.dungeonId) return;
      const now = Date.now();
      const { x, y, vx, vy, facing } = data || {};
      if (typeof x !== 'number' || typeof y !== 'number') return;
      // anticheat
      const res = validateMovement(p, { x, y }, now);
      if (!res.ok) {
        // correct client
        socket.emit('player:correction', { x: p.x, y: p.y });
        return;
      }
      p.x = x; p.y = y;
      if (typeof vx === 'number') p.vx = vx;
      if (typeof vy === 'number') p.vy = vy;
      if (facing) p.facing = facing;
      p.lastMoveAt = now;
      // broadcast to dungeon (except self) - use volatile for lossy but fast
      socket.to(`dungeon:${p.dungeonId}`).volatile.emit('player:move', {
        id: socket.id, x: p.x, y: p.y, vx: p.vx, vy: p.vy, facing: p.facing
      });
    });

    socket.on('player:attack', (data) => {
      const p = players.get(socket.id);
      if (!p || !p.dungeonId) return;
      const now = Date.now();
      if (now - p.lastAttackAt < 350) return; // server cooldown 350ms basic attack
      // range + anticheat
      const targetId = data?.targetId;
      const dungeon = dungeons.get(p.dungeonId);
      if (!dungeon) return;
      // if target is monster
      if (targetId && targetId.startsWith('m_')) {
        const monster = dungeon.monsters.find(m => m.id === targetId);
        if (!monster || monster.hp <= 0) return;
        const dist = Math.hypot(monster.x - p.x, monster.y - p.y);
        if (!validateAttack(p, dist)) {
          socket.emit('attack:rejected', { reason: 'out_of_range_or_speedhack' });
          return;
        }
        p.lastAttackAt = now;
        const dmg = Math.max(1, Math.floor((p.stats.atk || 10) * (0.8 + Math.random() * 0.4) - (MONSTERS[monster.type]?.def || 0) * 0.3));
        monster.hp -= dmg;
        const isDead = monster.hp <= 0;
        // broadcast hit
        io.to(`dungeon:${p.dungeonId}`).emit('monster:hit', { monsterId: monster.id, hp: Math.max(0, monster.hp), maxHp: monster.maxHp, dmg, attacker: socket.id, dead: isDead });
        if (isDead) {
          // drops
          const drops = rollDrops(monster.type);
          const gold = MONSTERS[monster.type]?.gold || 5;
          const exp = MONSTERS[monster.type]?.exp || 10;
          io.to(`dungeon:${p.dungeonId}`).emit('monster:dead', { monsterId: monster.id, drops, gold, exp, killer: socket.id });
          // reward killer directly
          socket.emit('reward', { exp, gold, drops });
          // remove after delay and respawn
          setTimeout(() => {
            const idx = dungeon.monsters.findIndex(m => m.id === monster.id);
            if (idx !== -1) dungeon.monsters.splice(idx, 1);
            // spawn replacement after 3s
            setTimeout(() => spawnMonsters(p.dungeonId, 1), 3000);
          }, 400);
        }
        // broadcast attack animation to all
        io.to(`dungeon:${p.dungeonId}`).emit('player:attack', { id: socket.id, targetId, x: p.x, y: p.y });
      } else {
        // air attack
        p.lastAttackAt = now;
        io.to(`dungeon:${p.dungeonId}`).emit('player:attack', { id: socket.id, x: p.x, y: p.y });
      }
    });

    socket.on('player:skill', (data) => {
      const p = players.get(socket.id);
      if (!p || !p.dungeonId) return;
      const { skillId, tx, ty, targetId } = data || {};
      const skill = SKILLS[skillId];
      if (!skill) return;
      const now = Date.now();
      const v = validateSkill(p, skill, now);
      if (!v.ok) return socket.emit('skill:rejected', { reason: v.reason });

      // deduct mp and set cd
      p.mp = Math.max(0, p.mp - skill.mp);
      p.skillCooldowns[skillId] = now + skill.cd;

      const dungeon = dungeons.get(p.dungeonId);
      let hitMonsters = [];
      let healAmt = 0;

      if (skillId === 'heal') {
        healAmt = skill.heal + (p.stats.int || 0) * 2;
        p.hp = Math.min(p.maxHp, p.hp + healAmt);
        io.to(`dungeon:${p.dungeonId}`).emit('player:heal', { id: socket.id, hp: p.hp, maxHp: p.maxHp, amount: healAmt });
      } else if (skillId === 'dash') {
        // dash in facing dir
        const dist = skill.dashDist || 120;
        const nx = Math.max(20, Math.min(WORLD_SIZE.w - 20, p.x + p.facing * dist));
        // simple wall check not needed
        p.x = nx;
        io.to(`dungeon:${p.dungeonId}`).emit('player:dash', { id: socket.id, x: p.x, y: p.y });
      } else if (skillId === 'meteor') {
        // AOE around tx,ty
        const cx = tx ?? p.x, cy = ty ?? p.y;
        for (const m of dungeon.monsters) {
          if (m.hp <= 0) continue;
          const d = Math.hypot(m.x - cx, m.y - cy);
          if (d < (skill.aoe || 80)) {
            const dmg = Math.floor((p.stats.atk || 10) * skill.dmg + (p.stats.int || 0) * 1.2);
            m.hp -= dmg;
            hitMonsters.push({ id: m.id, dmg, hp: Math.max(0, m.hp), dead: m.hp <= 0 });
          }
        }
        // process dead globally
        for (const h of hitMonsters.filter(x=>x.dead)) {
          const mon = dungeon.monsters.find(mm=>mm.id===h.id);
          if (mon) {
            const drops = rollDrops(mon.type);
            io.to(`dungeon:${p.dungeonId}`).emit('monster:dead', { monsterId: mon.id, drops, gold: MONSTERS[mon.type].gold, exp: MONSTERS[mon.type].exp, killer: socket.id });
            socket.emit('reward', { exp: MONSTERS[mon.type].exp, gold: MONSTERS[mon.type].gold, drops });
            setTimeout(()=> {
              const idx=dungeon.monsters.findIndex(mm=>mm.id===mon.id);
              if(idx!==-1) dungeon.monsters.splice(idx,1);
              setTimeout(()=>spawnMonsters(p.dungeonId,1),3000);
            }, 400);
          }
        }
        io.to(`dungeon:${p.dungeonId}`).emit('skill:meteor', { caster: socket.id, x: cx, y: cy, hits: hitMonsters });
      } else {
        // slash or fireball single target / projectile
        if (targetId) {
          const mon = dungeon.monsters.find(m=>m.id===targetId);
          if (mon && mon.hp>0) {
            const dist = Math.hypot(mon.x - p.x, mon.y - p.y);
            if (dist < (skill.range || 150) + 30) {
              const dmg = Math.floor((p.stats.atk || 10) * skill.dmg + (p.stats.int||0)*0.5);
              mon.hp -= dmg;
              const dead = mon.hp<=0;
              hitMonsters.push({ id: mon.id, dmg, hp: Math.max(0,mon.hp), dead });
              if (dead) {
                const drops = rollDrops(mon.type);
                io.to(`dungeon:${p.dungeonId}`).emit('monster:dead',{monsterId:mon.id,drops,gold:MONSTERS[mon.type].gold,exp:MONSTERS[mon.type].exp,killer:socket.id});
                socket.emit('reward',{exp:MONSTERS[mon.type].exp,gold:MONSTERS[mon.type].gold,drops});
                setTimeout(()=>{ const idx=dungeon.monsters.findIndex(mm=>mm.id===mon.id); if(idx!==-1) dungeon.monsters.splice(idx,1); setTimeout(()=>spawnMonsters(p.dungeonId,1),3000)},400);
              }
            }
          }
        } else if (skillId === 'fireball') {
          // fireball projectile simulation server side: immediate hitscan for simplicity broadcast projectile
          io.to(`dungeon:${p.dungeonId}`).emit('skill:fireball', { caster: socket.id, from:{x:p.x,y:p.y}, to:{x:tx,y:ty} });
          // find closest monster along line within range
          let best=null, bestD=Infinity;
          for (const m of dungeon.monsters) {
            if(m.hp<=0) continue;
            const d = Math.hypot(m.x - (tx ?? p.x), m.y - (ty ?? p.y));
            if (d < 60 && d < bestD) { best=m; bestD=d; }
          }
          if (best) {
            const dmg = Math.floor((p.stats.atk||10)*skill.dmg + (p.stats.int||0)*0.8);
            best.hp -= dmg;
            const dead = best.hp<=0;
            io.to(`dungeon:${p.dungeonId}`).emit('monster:hit',{monsterId:best.id,hp:Math.max(0,best.hp),maxHp:best.maxHp,dmg,attacker:socket.id,dead});
            if(dead){
              const drops=rollDrops(best.type);
              io.to(`dungeon:${p.dungeonId}`).emit('monster:dead',{monsterId:best.id,drops,gold:MONSTERS[best.type].gold,exp:MONSTERS[best.type].exp,killer:socket.id});
              socket.emit('reward',{exp:MONSTERS[best.type].exp,gold:MONSTERS[best.type].gold,drops});
              setTimeout(()=>{ const idx=dungeon.monsters.findIndex(mm=>mm.id===best.id); if(idx!==-1) dungeon.monsters.splice(idx,1); setTimeout(()=>spawnMonsters(p.dungeonId,1),3000)},400);
            }
          }
        } else {
          // slash AOE front
          const range = skill.range || 60;
          for (const m of dungeon.monsters) {
            if(m.hp<=0) continue;
            const dx = m.x - p.x, dy = m.y - p.y;
            const forward = p.facing * dx;
            const dist = Math.hypot(dx,dy);
            if (forward > -10 && dist < range && Math.abs(dy) < 40) {
              const dmg = Math.floor((p.stats.atk||10)*skill.dmg);
              m.hp -= dmg;
              const dead=m.hp<=0;
              hitMonsters.push({id:m.id,dmg,hp:Math.max(0,m.hp),dead});
              if(dead){
                const drops=rollDrops(m.type);
                io.to(`dungeon:${p.dungeonId}`).emit('monster:dead',{monsterId:m.id,drops,gold:MONSTERS[m.type].gold,exp:MONSTERS[m.type].exp,killer:socket.id});
                socket.emit('reward',{exp:MONSTERS[m.type].exp,gold:MONSTERS[m.type].gold,drops});
                setTimeout(()=>{const idx=dungeon.monsters.findIndex(mm=>mm.id===m.id); if(idx!==-1) dungeon.monsters.splice(idx,1); setTimeout(()=>spawnMonsters(p.dungeonId,1),3000)},400);
              }
            }
          }
          if (hitMonsters.length) io.to(`dungeon:${p.dungeonId}`).emit('monster:hitBatch',{hits:hitMonsters});
        }
      }

      // broadcast skill use
      io.to(`dungeon:${p.dungeonId}`).emit('player:skill', { id: socket.id, skillId, mp: p.mp, maxMp: p.maxMp, hits: hitMonsters });
      // send cd to caster
      socket.emit('skill:cd', { skillId, until: p.skillCooldowns[skillId] });
    });

    socket.on('player:avatar', ({ avatar }) => {
      const p = players.get(socket.id);
      if (!p) return;
      if (avatar && typeof avatar === 'object') {
        // validate keys
        const allowed = ['head','top','bottom','weapon','accessory'];
        for (const k of allowed) if (avatar[k]) p.avatar[k]=avatar[k];
        io.to(`dungeon:${p.dungeonId}`).emit('player:avatar', { id: socket.id, avatar: p.avatar });
      }
    });

    socket.on('player:hpmp', ({ hp, mp }) => {
      // client reports hp/mp after taking damage? server is authoritative, ignore unless validation
      // For anti-cheat, we don't trust. Only healing via skills/potions server side.
      // So ignore.
    });

    // Chat
    socket.on('chat:world', ({ message }) => {
      if (!message || typeof message !== 'string') return;
      const trimmed = message.trim();
      if (!trimmed) return;
      if (trimmed.length > 200) message = trimmed.slice(0,200); else message = trimmed;
      const p = players.get(socket.id);
      const now = Date.now();
      if (p._lastChat && now - p._lastChat < 500) return;
      // 5초 6개 도배 방지
      p._chatTimes = (p._chatTimes || []).filter(t=> now - t < 5000);
      if (p._chatTimes.length >= 6) {
        socket.emit('chat:error', { message: '도배 방지: 잠시 후 다시 시도하세요' });
        return;
      }
      p._lastChat = now;
      p._chatTimes.push(now);
      const entry = { from: p.username, message, time: now, scope: 'world' };
      chatHistory.world.push(entry);
      if (chatHistory.world.length > 100) chatHistory.world.shift();
      io.emit('chat:world', entry);
    });
    socket.on('chat:party', ({ message }) => {
      const p = players.get(socket.id);
      if (!p?.partyId) return socket.emit('chat:error', { message: '파티가 없습니다' });
      if (!message || typeof message !== 'string') return;
      const trimmed = message.trim();
      if (!trimmed) return;
      const now = Date.now();
      if (p._lastChat && now - p._lastChat < 500) return;
      p._chatTimes = (p._chatTimes || []).filter(t=> now - t < 5000);
      if (p._chatTimes.length >= 6) {
        socket.emit('chat:error', { message: '도배 방지: 잠시 후 다시 시도하세요' });
        return;
      }
      p._lastChat = now;
      p._chatTimes.push(now);
      const party = parties.get(p.partyId);
      if (!party) return;
      const entry = { from: p.username, message: trimmed.slice(0,200), time: now, scope: 'party', partyId: p.partyId };
      for (const sid of party.members) {
        const mem = players.get(sid);
        if (mem?.socket) mem.socket.emit('chat:party', entry);
      }
    });
    socket.on('chat:whisper', ({ to, message }) => {
      if (!to || !message) return;
      // find target by username
      let targetSid = null;
      for (const [sid, pl] of players.entries()) if (pl.username === to) { targetSid = sid; break; }
      if (!targetSid) return socket.emit('chat:error', { message: `플레이어 ${to} 를 찾을 수 없습니다` });
      const p = players.get(socket.id);
      const payload = { from: p.username, to, message: message.slice(0,200), time: Date.now(), scope: 'whisper' };
      players.get(targetSid).socket.emit('chat:whisper', payload);
      socket.emit('chat:whisper', payload);
    });

    // Matching queue
    socket.on('match:join', ({ dungeonId }) => {
      const p = players.get(socket.id);
      if (!p) return;
      dungeonId = dungeonId || p.dungeonId || 'forest';
      if (!queues.has(dungeonId)) queues.set(dungeonId, []);
      const q = queues.get(dungeonId);
      if (q.find(x=>x.socketId===socket.id)) return socket.emit('match:status', { status: 'already' });
      q.push({ socketId: socket.id, userId: p.userId, username: p.username, level: p.level });
      socket.emit('match:status', { status: 'queued', position: q.length, dungeonId });
      io.emit('match:queueUpdate', { dungeonId, count: q.length });
      // try to form party when >=2 or after 10s solo
      if (q.length >= 2) formParty(dungeonId);
      else setTimeout(()=> {
        const qq = queues.get(dungeonId);
        if (qq && qq.find(x=>x.socketId===socket.id)) formParty(dungeonId);
      }, 10000);
    });

    socket.on('match:leave', () => {
      for (const [dId, q] of queues.entries()) {
        const idx = q.findIndex(x=>x.socketId===socket.id);
        if (idx!==-1) { q.splice(idx,1); socket.emit('match:status',{status:'left'}); io.emit('match:queueUpdate',{dungeonId:dId,count:q.length}); break; }
      }
    });

    function formParty(dungeonId) {
      const q = queues.get(dungeonId);
      if (!q || q.length === 0) return;
      const take = Math.min(4, q.length);
      const members = q.splice(0, take);
      const partyId = `party_${Date.now()}_${Math.floor(Math.random()*1000)}`;
      const memberSids = new Set(members.map(m=>m.socketId));
      parties.set(partyId, { id: partyId, dungeonId, members: memberSids, leader: members[0].socketId });
      for (const m of members) {
        const pl = players.get(m.socketId);
        if (pl) pl.partyId = partyId;
        const s = pl?.socket;
        if (s) {
          // move all to dungeon
          joinDungeon(m.socketId, dungeonId);
          s.emit('match:found', { partyId, dungeonId, members: members.map(x=>({ username:x.username, level:x.level })) });
        }
      }
      io.emit('match:queueUpdate',{dungeonId,count:q.length});
      // auto disband after dungeon? keep
    }

    socket.on('party:leave', () => {
      const p = players.get(socket.id);
      if (!p?.partyId) return;
      const party = parties.get(p.partyId);
      if (party) {
        party.members.delete(socket.id);
        if (party.members.size === 0) parties.delete(p.partyId);
        else if (party.leader === socket.id) party.leader = [...party.members][0];
      }
      p.partyId = null;
      socket.emit('party:left', {});
    });

    // ping for latency
    socket.on('ping:check', (cb) => {
      if (typeof cb === 'function') cb(Date.now());
    });

    socket.on('disconnect', () => {
      console.log(`[WS] disconnect ${socket.username}`);
      const p = players.get(socket.id);
      if (p) {
        if (p.dungeonId) {
          const d = dungeons.get(p.dungeonId);
          if (d) d.players.delete(socket.id);
          broadcastToDungeon(p.dungeonId, 'player:leave', { id: socket.id, username: p.username });
        }
        if (p.partyId) {
          const party = parties.get(p.partyId);
          if (party) { party.members.delete(socket.id); if(party.members.size===0) parties.delete(p.partyId); }
        }
      }
      // remove from queues
      for (const q of queues.values()) {
        const idx = q.findIndex(x=>x.socketId===socket.id);
        if(idx!==-1) q.splice(idx,1);
      }
      players.delete(socket.id);
      userSocketMap.delete(socket.userId);
    });
  });

  // server tick for monsters AI + broadcast
  setInterval(() => {
    const now = Date.now();
    for (const [dId, dungeon] of dungeons.entries()) {
      if (dungeon.players.size === 0) continue;
      // get player positions array
      const pls = [...dungeon.players].map(sid=>players.get(sid)).filter(Boolean);
      if (pls.length===0) continue;
      for (const m of dungeon.monsters) {
        if (m.hp <= 0) continue;
        const tmpl = MONSTERS[m.type];
        if (!tmpl) continue;
        // find nearest player
        let nearest=null, nd=Infinity;
        for(const pl of pls){ const d=Math.hypot(pl.x-m.x, pl.y-m.y); if(d<nd){ nd=d; nearest=pl; } }
        if(!nearest) continue;
        // behavior - boss has unique multi-phase pattern
        if (tmpl.pattern === 'boss') {
          // Boss: slow chase + periodic large AoE slam + ranged fire breath
          // Fire breath every 2.5s if within 350
          if (nd < 350 && now - m.lastAttack > 2500) {
            m.lastAttack = now;
            // AoE slam: damage all players within 140 radius of boss
            const slamRadius = 140;
            for (const pl of pls) {
              const d = Math.hypot(pl.x - m.x, pl.y - m.y);
              if (d < slamRadius) {
                const dmg = Math.max(8, tmpl.atk - Math.floor((pl.stats.def||0)*0.2) + 10);
                pl.hp = Math.max(0, pl.hp - dmg);
                io.to(`dungeon:${dId}`).emit('player:hit', { id: pl.socket.id, hp: pl.hp, maxHp: pl.maxHp, dmg, from: m.id });
                if (pl.hp<=0){ pl.hp=pl.maxHp; pl.x=WORLD_SIZE.w/2; pl.y=WORLD_SIZE.h/2; io.to(`dungeon:${dId}`).emit('player:respawn',{id:pl.socket.id,x:pl.x,y:pl.y,hp:pl.hp}); }
              }
            }
            io.to(`dungeon:${dId}`).emit('monster:attack', { monsterId: m.id, type:'boss_slam', x:m.x, y:m.y, radius: slamRadius });
            // also ranged flame to nearest
            io.to(`dungeon:${dId}`).emit('monster:shoot', { monsterId: m.id, from:{x:m.x,y:m.y}, to:{x:nearest.x,y:nearest.y}, isBoss:true });
            setTimeout(()=>{
              const target = pls.find(p=>p.username===nearest.username);
              if(target && target.hp>0){
                const d2 = Math.hypot(target.x - m.x, target.y - m.y);
                if(d2 < 350){
                  const dmg2 = Math.max(6, tmpl.atk - Math.floor((target.stats.def||0)*0.25));
                  target.hp = Math.max(0, target.hp - dmg2);
                  io.to(`dungeon:${dId}`).emit('player:hit', { id: target.socket.id, hp: target.hp, maxHp: target.maxHp, dmg: dmg2, from: m.id });
                  if(target.hp<=0){ target.hp=target.maxHp; target.x=WORLD_SIZE.w/2; target.y=WORLD_SIZE.h/2; io.to(`dungeon:${dId}`).emit('player:respawn',{id:target.socket.id,x:target.x,y:target.y,hp:target.hp}); }
                }
              }
            }, 400);
          } else if (nd < 600) {
            // slow chase
            const spd = (tmpl.spd || 55) / 60;
            const ang = Math.atan2(nearest.y - m.y, nearest.x - m.x);
            // boss slightly zigzags while chasing
            const wobble = Math.sin(now/600)*0.25;
            m.x += Math.cos(ang + wobble) * spd * 1.8;
            m.y += Math.sin(ang + wobble) * spd * 1.8;
            m.x = Math.max(30, Math.min(WORLD_SIZE.w-30, m.x));
            m.y = Math.max(30, Math.min(WORLD_SIZE.h-30, m.y));
            if (nd < 50 && now - (m._lastMelee||0) > 900) {
              m._lastMelee = now;
              const dmg=Math.max(5, tmpl.atk - Math.floor((nearest.stats.def||0)*0.3));
              nearest.hp=Math.max(0, nearest.hp-dmg);
              io.to(`dungeon:${dId}`).emit('player:hit',{id:nearest.socket.id,hp:nearest.hp,maxHp:nearest.maxHp,dmg,from:m.id});
              io.to(`dungeon:${dId}`).emit('monster:attack',{monsterId:m.id,target:nearest.socket.id});
              if(nearest.hp<=0){ nearest.hp=nearest.maxHp; nearest.x=WORLD_SIZE.w/2; nearest.y=WORLD_SIZE.h/2; io.to(`dungeon:${dId}`).emit('player:respawn',{id:nearest.socket.id,x:nearest.x,y:nearest.y,hp:nearest.hp}); }
            }
            if (now % 100 < 55) io.to(`dungeon:${dId}`).emit('monster:move',{id:m.id,x:m.x,y:m.y});
          } else {
            m.wanderAngle += (Math.random()-0.5)*0.2;
            m.x += Math.cos(m.wanderAngle)*0.6;
            m.y += Math.sin(m.wanderAngle)*0.6;
            m.x = Math.max(30, Math.min(WORLD_SIZE.w-30,m.x));
            m.y = Math.max(30, Math.min(WORLD_SIZE.h-30,m.y));
            if (now % 200 < 55) io.to(`dungeon:${dId}`).emit('monster:move',{id:m.id,x:m.x,y:m.y});
          }
        } else if (tmpl.pattern === 'ranged' && nd < 300 && now - m.lastAttack > 1200) {
          // shoot
          m.lastAttack = now;
          io.to(`dungeon:${dId}`).emit('monster:shoot', { monsterId: m.id, from:{x:m.x,y:m.y}, to:{x:nearest.x,y:nearest.y} });
          // apply damage after delay 300ms
          setTimeout(()=>{
            const pl = players.get([...dungeon.players].find(sid=> players.get(sid)?.username===nearest.username) || '');
            // simpler: find by nearest reference still valid?
            const target = pls.find(p=>p.username===nearest.username);
            if(target){
              const dmg = Math.max(1, tmpl.atk - Math.floor((target.stats.def||0)*0.2));
              target.hp = Math.max(0, target.hp - dmg);
              io.to(`dungeon:${dId}`).emit('player:hit', { id: target.socket.id, hp: target.hp, maxHp: target.maxHp, dmg, from: m.id });
              if(target.hp<=0){
                target.hp = target.maxHp; // respawn at center
                target.x = WORLD_SIZE.w/2; target.y = WORLD_SIZE.h/2;
                io.to(`dungeon:${dId}`).emit('player:respawn', { id: target.socket.id, x: target.x, y: target.y, hp: target.hp });
              }
            }
          }, 300);
        } else if (nd < 500) {
          // chase
          const spd = (tmpl.spd || 70) / 60; // per tick
          const ang = Math.atan2(nearest.y - m.y, nearest.x - m.x);
          // zigzag for goblin
          let finalAng = ang;
          if (tmpl.pattern==='zigzag') finalAng += Math.sin(now/200) * 0.6;
          if (tmpl.pattern==='charge' && nd<180 && now - m.lastAttack > 1500) {
            // charge dash + damage
            m.lastAttack = now;
            const chargeDist = 100;
            m.x += Math.cos(ang)*chargeDist;
            m.y += Math.sin(ang)*chargeDist;
            // damage if still close
            const nd2 = Math.hypot(nearest.x - m.x, nearest.y - m.y);
            if (nd2<40){
              const dmg=Math.max(1, tmpl.atk - Math.floor((nearest.stats.def||0)*0.2));
              nearest.hp=Math.max(0, nearest.hp-dmg);
              io.to(`dungeon:${dId}`).emit('player:hit',{id:nearest.socket.id,hp:nearest.hp,maxHp:nearest.maxHp,dmg,from:m.id});
              if(nearest.hp<=0){ nearest.hp=nearest.maxHp; nearest.x=WORLD_SIZE.w/2; nearest.y=WORLD_SIZE.h/2; io.to(`dungeon:${dId}`).emit('player:respawn',{id:nearest.socket.id,x:nearest.x,y:nearest.y,hp:nearest.hp}); }
            }
            io.to(`dungeon:${dId}`).emit('monster:move',{id:m.id,x:m.x,y:m.y});
          } else {
            m.x += Math.cos(finalAng)*spd*2;
            m.y += Math.sin(finalAng)*spd*2;
            m.x = Math.max(20, Math.min(WORLD_SIZE.w-20, m.x));
            m.y = Math.max(20, Math.min(WORLD_SIZE.h-20, m.y));
            // melee attack if close
            if (nd < 38 && now - m.lastAttack > 800) {
              m.lastAttack = now;
              const dmg=Math.max(1, tmpl.atk - Math.floor((nearest.stats.def||0)*0.3));
              nearest.hp=Math.max(0, nearest.hp-dmg);
              io.to(`dungeon:${dId}`).emit('player:hit',{id:nearest.socket.id,hp:nearest.hp,maxHp:nearest.maxHp,dmg,from:m.id});
              io.to(`dungeon:${dId}`).emit('monster:attack',{monsterId:m.id,target:nearest.socket.id});
              if(nearest.hp<=0){ nearest.hp=nearest.maxHp; nearest.x=WORLD_SIZE.w/2; nearest.y=WORLD_SIZE.h/2; io.to(`dungeon:${dId}`).emit('player:respawn',{id:nearest.socket.id,x:nearest.x,y:nearest.y,hp:nearest.hp}); }
            }
          }
          // broadcast move every 2 ticks (100ms target)
          if (now % 100 < 55) io.to(`dungeon:${dId}`).emit('monster:move',{id:m.id,x:m.x,y:m.y});
        } else {
          // wander
          m.wanderAngle += (Math.random()-0.5)*0.3;
          m.x += Math.cos(m.wanderAngle)*0.8;
          m.y += Math.sin(m.wanderAngle)*0.8;
          m.x = Math.max(20, Math.min(WORLD_SIZE.w-20,m.x));
          m.y = Math.max(20, Math.min(WORLD_SIZE.h-20,m.y));
          if (now % 200 < 55) io.to(`dungeon:${dId}`).emit('monster:move',{id:m.id,x:m.x,y:m.y});
        }
      }
    }
  }, 1000 / TICK_RATE);

  // periodic monster respawn check
  setInterval(()=>{
    for(const [dId,dungeon] of dungeons.entries()){
      if(dungeon.players.size>0 && dungeon.monsters.length < 5){
        spawnMonsters(dId, 2);
        io.to(`dungeon:${dId}`).emit('monsters:spawn', { monsters: dungeon.monsters.slice(-2) });
      }
    }
  }, 5000);
}
