import { Renderer } from './Renderer.js';
import { Input } from './Input.js';
import { state, gameData } from '../utils/store.js';
import { audio } from '../utils/audio.js';

export class Game{
  constructor(canvas, socket){
    this.canvas=canvas;
    this.socket=socket;
    this.renderer=new Renderer(canvas);
    this.renderer.applySettings(state.settings);
    this.input=new Input(canvas);
    this.me={ x:800,y:600, vx:0,vy:0, hp:100,maxHp:100, mp:50,maxMp:50, level:1, username:'나', facing:1, isAttacking:false, avatar:{} };
    this.players=new Map(); // id -> p
    this.monsters=new Map(); // id -> m
    this.projectiles=[];
    this.effects=[];
    this.dungeon=null;
    this.running=false;
    this.lastAttack=0;
    this.skillCooldowns={};
    this.onReward=null;
    this.onHpChange=null;
    this.ping=0;
    this._fpsLast=0;
    this._fpsInterval=1000/60;

    this.bindSocket();
    window.addEventListener('resize', ()=> this.renderer.resize());
    this.renderer.resize();
    // react to settings changes
    window.addEventListener('df:settings', (e)=> {
      this.renderer.applySettings(e.detail||state.settings);
      this._fpsInterval = 1000 / ((e.detail||state.settings).graphics?.fps || 60);
    });
  }
  applySettings(settings){
    this.renderer.applySettings(settings);
    this._fpsInterval = 1000 / (settings.graphics?.fps || 60);
  }

  bindSocket(){
    if(!this.socket) return;
    this.socket.on('dungeon:joined', (data)=>{
      this.dungeon = data.dungeonId;
      this.renderer.world={w: data.worldSize.w, h: data.worldSize.h};
      this.players.clear(); this.monsters.clear();
      for(const p of data.players){
        if(p.id===this.socket.id) Object.assign(this.me, p);
        else this.players.set(p.id, {...p, vx:0, vy:0});
      }
      for(const m of data.monsters){ this.monsters.set(m.id, {...m}); }
    });
    this.socket.on('player:join', (p)=>{ if(p.id!==this.socket.id) this.players.set(p.id,{...p}); });
    this.socket.on('player:leave', ({id})=> this.players.delete(id));
    this.socket.on('player:move', ({id,x,y,vx,vy,facing})=>{
      const p=this.players.get(id);
      if(p){ p.x=x; p.y=y; p.vx=vx; p.vy=vy; if(facing) p.facing=facing; }
    });
    this.socket.on('player:attack', ({id})=>{
      const p= id===this.socket.id? this.me : this.players.get(id);
      if(p){ p.isAttacking=true; setTimeout(()=>p.isAttacking=false,180); this.spawnSlash(p.x,p.y); audio.playSfx('hit'); }
    });
    this.socket.on('player:avatar', ({id, avatar})=>{
      if(id===this.socket.id) this.me.avatar=avatar;
      else { const p=this.players.get(id); if(p) p.avatar=avatar; }
    });
    this.socket.on('player:hit', ({id,hp,maxHp,dmg})=>{
      const p= id===this.socket.id? this.me : this.players.get(id);
      if(p){ p.hp=hp; p.maxHp=maxHp; p._hitUntil=Date.now()+300; this.showDamage(p.x,p.y-20, dmg, '#ef4444'); if(id===this.socket.id) this.onHpChange?.(p); }
    });
    this.socket.on('player:heal', ({id,hp,amount})=>{
      const p=id===this.socket.id?this.me:this.players.get(id);
      if(p){ p.hp=hp; this.showDamage(p.x,p.y-24, `+${amount}`, '#22c55e'); if(id===this.socket.id) this.onHpChange?.(p); audio.playSfx('heal'); }
    });
    this.socket.on('player:dash', ({id,x,y})=>{
      const p=id===this.socket.id?this.me:this.players.get(id);
      if(p){ p.x=x; p.y=y; this.renderer.spawnParticles(p.x,p.y,'#06b6d4',10); }
    });
    this.socket.on('monster:hit', ({monsterId,hp,dmg,dead})=>{
      const m=this.monsters.get(monsterId);
      if(m){ m.hp=hp; this.showDamage(m.x,m.y, dmg, '#f59e0b'); this.renderer.spawnParticles(m.x,m.y,'#ef4444',6); if(dead) this.effects.push({type:'hit',x:m.x,y:m.y, t:Date.now()}); }
    });
    this.socket.on('monster:hitBatch', ({hits})=>{ for(const h of hits){ const m=this.monsters.get(h.id); if(m){ m.hp=h.hp; this.showDamage(m.x,m.y,h.dmg); }} });
    this.socket.on('monster:dead', ({monsterId})=>{
      const m=this.monsters.get(monsterId);
      if(m){ this.renderer.spawnParticles(m.x,m.y,'#f59e0b',14); this.monsters.delete(monsterId); }
    });
    this.socket.on('monster:move', ({id,x,y})=>{ const m=this.monsters.get(id); if(m){ m.x=x; m.y=y; } });
    this.socket.on('monsters:spawn', ({monsters})=>{ for(const m of monsters) this.monsters.set(m.id,m); });
    this.socket.on('monster:shoot', ({from,to})=>{
      this.projectiles.push({x:from.x,y:from.y, tx:to.x,ty:to.y, t:Date.now(), dur:400, color:'#a78bfa'});
    });
    this.socket.on('monster:attack', ()=>{});
    this.socket.on('player:respawn', ({id,x,y,hp})=>{
      const p=id===this.socket.id?this.me:this.players.get(id);
      if(p){ p.x=x; p.y=y; p.hp=hp; this.showDamage(p.x,p.y,'부활','#22c55e'); if(id===this.socket.id) this.onHpChange?.(p); }
    });
    this.socket.on('player:skill', ({id,skillId})=>{
      const p=id===this.socket.id?this.me:this.players.get(id);
      if(p){ this.showSkillEffect(p, skillId); audio.playSfx('skill'); }
    });
    this.socket.on('skill:fireball', ({from,to})=>{
      this.projectiles.push({x:from.x,y:from.y, tx:to.x,ty:to.y, t:Date.now(), dur:500, color:'#f59e0b'});
      setTimeout(()=> this.renderer.spawnParticles(to.x,to.y,'#f59e0b',12), 480);
    });
    this.socket.on('skill:meteor', ({x,y})=>{
      this.effects.push({type:'meteor', x,y, r:10, maxR:90, t:Date.now(), dur:900});
      this.renderer.spawnParticles(x,y,'#ef4444',18);
    });
    this.socket.on('skill:cd', ({skillId,until})=>{ this.skillCooldowns[skillId]=until; });
    this.socket.on('reward', (data)=> { this.onReward?.(data); if(data?.exp) audio.playSfx('hit'); });
    this.socket.on('player:correction', ({x,y})=>{ this.me.x=x; this.me.y=y; });
  }

  setMeFromState(){
    if(!state.character) return;
    const c=state.character;
    this.me.username=state.user?.username||'모험가';
    this.me.level=c.level||1;
    this.me.avatar=c.avatar||{};
    this.me.hp=c.hp||100; this.me.maxHp= this.calcMaxHp(c);
    this.me.mp=c.mp||50; this.me.maxMp= this.calcMaxMp(c);
  }
  calcMaxHp(c){
    const baseStats = c.stats || {str:5,agi:5,int:5};
    let extraHp=0;
    try{
      if(gameData?.items){
        for(const eid of Object.values(c.equipment||{})){
          const it=gameData.items[eid];
          if(it?.stats?.hp) extraHp+=it.stats.hp;
        }
        for(const aid of Object.values(c.avatar||{})){
          const av = gameData.avatars?.all?.find(a=>a.id===aid);
          if(av?.stats?.hp) extraHp+=av.stats.hp;
        }
      }
    }catch{}
    return 100 + (baseStats.str||5)*8 + extraHp;
  }
  calcMaxMp(c){
    let extraMp=0;
    try{
      if(gameData?.items){
        for(const eid of Object.values(c.equipment||{})){
          const it=gameData.items[eid];
          if(it?.stats?.mp) extraMp+=it.stats.mp;
        }
        for(const aid of Object.values(c.avatar||{})){
          const av = gameData.avatars?.all?.find(a=>a.id===aid);
          if(av?.stats?.mp) extraMp+=av.stats.mp;
        }
      }
    }catch{}
    return 50 + (c.stats?.int||5)*6 + extraMp;
  }

  start(){
    if(this.running) return;
    this.running=true;
    this.renderer.resize();
    this.renderer.applySettings(state.settings);
    this._fpsInterval = 1000 / (state.settings.graphics?.fps || 60);
    this.setMeFromState();
    let last = performance.now();
    const loop = (now)=>{
      if(!this.running) return;
      const elapsed = now - this._fpsLast;
      if(elapsed < this._fpsInterval){
        requestAnimationFrame(loop);
        return;
      }
      this._fpsLast = now - (elapsed % this._fpsInterval);
      const dt = Math.min(0.05, (now-last)/1000);
      last=now;
      this.update(dt);
      this.render();
      requestAnimationFrame(loop);
    };
    this._fpsLast = performance.now();
    requestAnimationFrame(loop);
    // ping loop
    this._pingTimer=setInterval(()=>{
      const s=Date.now();
      this.socket?.timeout(2000).emit('ping:check',(err, serverTime)=>{
        if(!err) this.ping = Date.now()-s;
        const el=document.getElementById('gamePing');
        if(el) el.textContent=`ping ${this.ping}ms`;
      });
    },2000);
  }
  stop(){
    this.running=false;
    if(this._pingTimer) clearInterval(this._pingTimer);
  }

  update(dt){
    // input -> movement
    const keys = state.settings.controls.keys;
    const vec = this.input.getVector(keys);
    const spd = (state.character?.stats ? 120 + (state.character.stats.agi||5)*2 : 130);
    let nx = this.me.x + vec.x * spd * dt;
    let ny = this.me.y + vec.y * spd * dt;
    nx=Math.max(16,Math.min(this.renderer.world.w-16,nx));
    ny=Math.max(16,Math.min(this.renderer.world.h-16,ny));
    const moving = vec.x!==0||vec.y!==0;
    if(moving){
      if(vec.x!==0) this.me.facing = vec.x>0?1:-1;
    }
    // send move at ~20hz
    const now=Date.now();
    if(!this._lastSend || now - this._lastSend > 50){
      if(Math.hypot(nx - this.me.x, ny - this.me.y) > 0.5 || moving){
        this.me.x=nx; this.me.y=ny;
        this.me.vx=vec.x*spd; this.me.vy=vec.y*spd;
        this.socket?.volatile.emit('player:move',{x:this.me.x,y:this.me.y,vx:this.me.vx,vy:this.me.vy,facing:this.me.facing});
        this._lastSend=now;
      }
    } else {
      this.me.x=nx; this.me.y=ny;
    }

    // update projectiles
    for(let i=this.projectiles.length-1;i>=0;i--){
      const p=this.projectiles[i];
      const prog = (Date.now()-p.t)/p.dur;
      if(prog>=1){ this.projectiles.splice(i,1); continue; }
      p.x = p.x + (p.tx - p.x)*0.18; // not accurate but visual
      // we store from interpolation differently: lerp from origin
    }

    // update effects
    for(let i=this.effects.length-1;i>=0;i--){
      const e=this.effects[i];
      const age=Date.now()-e.t;
      if(e.type==='meteor'){ e.r = 10 + (e.maxR-10)*(age/e.dur); if(age>e.dur) this.effects.splice(i,1); }
      else if(e.type==='slash'){ if(age>260) this.effects.splice(i,1); }
      else if(age>400) this.effects.splice(i,1);
    }
  }

  render(){
    const R=this.renderer;
    R.setCamera(this.me.x, this.me.y);
    R.clear();
    // draw dungeon bg based on selected
    const dId = this.dungeon || state.selectedDungeon || 'forest';
    const bgMap={forest:'#0f2a1a', cave:'#1c1a2e', orc_camp:'#2a1a0f', dragon_lair:'#0f0a0a'};
    R.drawMap({bg:bgMap[dId]});
    // monsters
    for(const m of this.monsters.values()) R.drawMonster(m);
    // projectiles
    for(const p of this.projectiles) R.drawProjectile(p);
    // effects
    for(const e of this.effects) R.drawEffect(e);
    // players (others)
    for(const p of this.players.values()) R.drawPlayer(p,false);
    R.drawPlayer(this.me,true);
    R.updateParticles();
  }

  tryAttack(){
    const now=Date.now();
    if(now - this.lastAttack < 350) return;
    this.lastAttack=now;
    // find nearest monster in front
    let target=null, best=Infinity;
    for(const m of this.monsters.values()){
      const dx=m.x - this.me.x, dy=m.y - this.me.y;
      const dist=Math.hypot(dx,dy);
      const forward = this.me.facing*dx;
      if(forward>-10 && dist<70 && dist<best){ best=dist; target=m; }
    }
    this.socket?.emit('player:attack',{targetId: target?.id || null});
    this.me.isAttacking=true; setTimeout(()=>this.me.isAttacking=false,180);
    this.spawnSlash(this.me.x + this.me.facing*28, this.me.y);
    audio.playSfx('hit');
  }

  trySkill(skillId, extra={}){
    const now=Date.now();
    const until=this.skillCooldowns[skillId]||0;
    if(now < until) return false;
    // mp check client side optimistic (server will validate)
    const costMap={slash:0, fireball:15, heal:20, dash:10, meteor:40};
    if((this.me.mp||0) < (costMap[skillId]||0)) return false;
    // determine target pos from mouse world
    const mouseWorld = this.screenToWorld(this.input.mouse.x, this.input.mouse.y);
    let targetId=null;
    // find monster under mouse within 80px
    for(const m of this.monsters.values()){
      if(Math.hypot(m.x - mouseWorld.x, m.y - mouseWorld.y)<50){ targetId=m.id; break; }
    }
    this.socket?.emit('player:skill',{skillId, tx: mouseWorld.x, ty: mouseWorld.y, targetId, ...extra});
    audio.playSfx(skillId==='heal'?'heal':'skill');
    return true;
  }

  screenToWorld(sx,sy){
    return { x: sx + this.renderer.camera.x, y: sy + this.renderer.camera.y };
  }
  spawnSlash(x,y){ this.effects.push({type:'slash', x, y, r:32, t:Date.now()}); }
  showSkillEffect(p, skillId){
    if(skillId==='heal'){ this.renderer.spawnParticles(p.x,p.y,'#22c55e',12); }
    else if(skillId==='dash'){ this.renderer.spawnParticles(p.x,p.y,'#06b6d4',10); }
    else if(skillId==='fireball'){ this.renderer.spawnParticles(p.x,p.y,'#f59e0b',8); }
  }
  showDamage(x,y, text, color='#fff'){
    const layer=document.getElementById('fxLayer');
    if(!layer) return;
    const el=document.createElement('div');
    el.className='dmg-num';
    el.textContent= typeof text==='number' ? `-${text}` : text;
    el.style.left='50%'; el.style.top='50%';
    // convert world to screen
    const sx = x - this.renderer.camera.x;
    const sy = y - this.renderer.camera.y;
    el.style.left = sx + 'px';
    el.style.top = sy + 'px';
    el.style.color=color;
    el.style.fontSize= typeof text==='number' && text>30 ? '18px' : '14px';
    layer.appendChild(el);
    setTimeout(()=> el.remove(), 900);
  }

  updateAvatar(avatar){ this.me.avatar=avatar; }
}
