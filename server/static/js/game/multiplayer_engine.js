// ========== SOCKET.IO MULTIPLAYER SYNC ==========
// Host-authoritative: the host drives waves/monsters; guests follow
// synced state and report kills back so the host can count them.

function initSocket() {
    if (window.socket && window.socket.connected) return window.socket;
    const s = io({
        transports: ['polling'],  // polling only — Render WebSocket 불안정 제거
        reconnection: true,
        reconnectionDelay: 100,
        reconnectionDelayMax: 1000,
        reconnectionAttempts: 30,
        timeout: 30000,
        pingInterval: 10000,
        pingTimeout: 60000,
    });
    s.on('connect', () => {
        console.log('[DF-MP] socket connected', s.id, 'transport:', s.io.engine.transport.name);
        const currentUser = (window.api && window.api.userData) ? window.api.userData.username : null;
        s.emit('auth', { username: currentUser });
        if (window._dfRoomCode) s.emit('join_game', { code: window._dfRoomCode });
    });
    s.on('disconnect', (reason) => {
        console.warn('[DF-MP] socket disconnect:', reason);
        if (reason === 'io server disconnect' || reason === 'transport close') {
            setTimeout(() => { if (s && !s.connected) s.connect(); }, 3000);
        }
    });
    s.on('connect_error', (err) => {
        console.warn('[DF-MP] connect_error:', err.message || err);
    });
    s.on('error', (e) => {
        console.warn('[DF-MP] server error:', e);
    });
    window.socket = s;
    return window.socket;
}

// ========== 동기화 상수 ==========
const REMOTE_SCALE  = 0.35;   // 로컬 Player.draw 스케일과 일치
const LERP_PLAYER   = 0.70;   // 플레이어 위치 보간 계수 ← 더 빠르게 따라가도록
const LERP_MONSTER  = 0.55;   // 몬스터 위치 보간 계수 ← 더 빠르게
const SYNC_INTERVAL = 2;      // 플레이어 위치 전송 주기 (매 2프레임 = ~30Hz, polling 최적화)
const MONSTER_SYNC_INTERVAL = 1; // 몬스터 전송 주기 감소 (매 프레임 = 더 부드러운 동기화)
const GHOST_TIMEOUT = 15000;  // 15초 이상 업데이트 없으면 다른 플레이어 제거

function syncGameWithRoom(gameInstance, roomCode, isHost) {
    gameInstance.roomCode = roomCode;
    window._dfRoomCode = roomCode;
    gameInstance.otherPlayers = {};
    gameInstance.remoteProjectiles = [];
    gameInstance._syncFrame = 0;
    gameInstance._isHost = !!isHost;
    gameInstance._syncMode = !isHost;   // 게스트는 몬스터 스폰/웨이브 로직을 직접 돌리지 않음

    if (!window.socket || !window.socket.connected) initSocket();
    const s = window.socket;
    s.emit('join_game', { code: roomCode });

    // game_started에서 전달된 all_players 정보로 otherPlayers 초기화
    if (window._dfAllPlayers && window._dfAllPlayers.length > 0) {
        const me = (api.userData && api.userData.username) || '';
        window._dfAllPlayers.forEach(p => {
            if (p.username === me) return;
            console.log('[DF-MP] Initializing player from all_players:', p.username);
            gameInstance.otherPlayers[p.username] = {
                x: 0, y: 0, tx: 0, ty: 0,
                hp: 100, maxHp: 100,
                dir: 'down', frame: 0,
                anim: 0, animT: 0,
                hatId: (p.character || {}).hat,
                clothesId: (p.character || {}).clothes,
                hatColor: (p.character || {}).hat_color,
                clothesColor: (p.character || {}).clothes_color,
                lastSeen: Date.now(),
            };
        });
        window._dfAllPlayers = null; // 초기화 후 정리
    }

    // ── 새 플레이어 참가 (게임 도중 / 게임 시작 직후) ──
    s.off('player_joined');
    s.on('player_joined', data => {
        if (!gameInstance || gameInstance.gameOver || gameInstance.stageComplete) return;
        const me = (api.userData && api.userData.username) || '';
        if (data.username === me) return;
        if (gameInstance.otherPlayers[data.username]) return; // 이미 있음
        gameInstance.otherPlayers[data.username] = {
            x: 0, y: 0, tx: 0, ty: 0,
            hp: 100, maxHp: 100,
            dir: 'down', frame: 0,
            anim: 0, animT: 0,
            hatId: (data.character || {}).hat,
            clothesId: (data.character || {}).clothes,
            hatColor: (data.character || {}).hat_color,
            clothesColor: (data.character || {}).clothes_color,
            lastSeen: Date.now(),
        };
    });

    // ── 다른 플레이어 위치 수신 ──
    s.off('player_state');
    s.on('player_state', data => {
        if (gameInstance.gameOver || gameInstance.stageComplete) return;
        const me = (api.userData && api.userData.username) || '';
        if (data.username === me) return;
        const cur = gameInstance.otherPlayers[data.username];
        if (!cur) {
            // 처음 등장 → 보간 없이 즉시 배치
            console.log('[DF-MP] New player detected:', data.username, 'pos:', data.x, data.y);
            gameInstance.otherPlayers[data.username] = {
                x: data.x, y: data.y,
                tx: data.x, ty: data.y,
                hp: data.hp, maxHp: data.maxHp || 100,
                dir: data.dir, frame: data.frame || 0,
                anim: 0, animT: 0,
                hatId: data.hatId, clothesId: data.clothesId,
                hatColor: data.hatColor, clothesColor: data.clothesColor,
                lastSeen: Date.now(),
            };
        } else {
            // 목표 위치만 갱신 — 실제 이동은 renderOtherPlayers에서 lerp
            cur.tx = data.x; cur.ty = data.y;
            cur.hp = data.hp; cur.maxHp = data.maxHp || cur.maxHp || 100;
            cur.dir = data.dir; cur.frame = data.frame || 0;
            // 코스튬은 포함된 경우에만 업데이트 (10프레임마다만 전송되므로)
            if (data.hatId       !== undefined) cur.hatId        = data.hatId;
            if (data.clothesId   !== undefined) cur.clothesId    = data.clothesId;
            if (data.hatColor    !== undefined) cur.hatColor     = data.hatColor;
            if (data.clothesColor !== undefined) cur.clothesColor = data.clothesColor;
            cur.lastSeen = Date.now();
        }
    });

    // ── 다른 플레이어 총알 수신 ──
    s.off('bullet_fired');
    s.on('bullet_fired', data => {
        if (gameInstance.gameOver || gameInstance.stageComplete) return;
        const me = (api.userData && api.userData.username) || '';
        if (data.username === me) return;
        const dx = data.toX - data.x, dy = data.toY - data.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        gameInstance.projectiles.push({
            x: data.x, y: data.y,
            vx: (dx / dist) * 8, vy: (dy / dist) * 8,
            radius: 6, dmg: 15,
            isPlayerProjectile: true, isRemote: true,
            life: 50, owner: 'player',
        });
    });

    // ── 몬스터 + 웨이브 상태 수신 (호스트 → 게스트) ──
    s.off('monster_sync');
    s.on('monster_sync', data => {
        if (!gameInstance || gameInstance.stageComplete) return;
        if (!data || !data.monsters) return;
        const g = gameInstance;
        if (g._firstMonsterSync === undefined) {
            console.log('[DF-MP] First monster_sync received! monsters:', data.monsters.length, 'wave:', data.wave);
            g._firstMonsterSync = true;
        }

        // 웨이브 상태 동기화
        if (data.wave != null) {
            g.wave                 = data.wave;
            g.waveActive           = !!data.waveActive;
            g.waveDelay            = data.waveDelay   || 0;
            g.waveMonsters         = data.waveMonsters || 0;
            g.waveMonstersSpawned  = data.waveMonstersSpawned || 0;
        }
        // 상점 동기화
        if (data.shopOpen != null) {
            g.shopOpen = !!data.shopOpen;
            if (data.shopOpen && data.shopOptions) {
                g.shopOptions = data.shopOptions;
            }
        }
        // 게임 종료 상태 동기화
        if (data.stageComplete != null) g.stageComplete = !!data.stageComplete;
        if (data.gameOver != null) g.gameOver = !!data.gameOver;

        // 수신한 몬스터를 id 기준으로 인덱싱
        const byId = {};
        data.monsters.forEach(m => { byId[m.id] = m; });

        // 기존 로컬 몬스터 업데이트 (위치는 lerp용 목표값으로만 저장)
        for (let i = g.monsters.length - 1; i >= 0; i--) {
            const lm = g.monsters[i];
            if (lm.id == null) { g.monsters.splice(i, 1); continue; }
            const im = byId[lm.id];
            if (!im) { g.monsters.splice(i, 1); continue; }

            // 목표 위치 저장 (실제 이동은 아래 lerp에서)
            if (lm.tx == null) { lm.tx = im.x; lm.ty = im.y; }
            lm.tx = im.x; lm.ty = im.y;
            lm.hp = im.hp;
            if (im.alive === false || im.hp <= 0) lm.alive = false;
        }

        // 호스트에는 있지만 로컬에 없는 몬스터 새로 생성
        data.monsters.forEach(im => {
            if (g.monsters.some(lm => lm.id === im.id)) return;
            if (im.hp <= 0 || im.alive === false) return;
            const mon = new Monster(g.stageId, im.cls, im.x, im.y, g.wave);
            mon.id = im.id;
            mon.hp = im.hp;
            mon.tx = im.x; mon.ty = im.y;  // lerp 초기값
            g.monsters.push(mon);
        });

        // 게스트 모드에서 _rewardedIds가 호스트와 불일치하지 않도록 주기적 정리
        if (g._rewardedIds) {
            const activeIds = new Set(data.monsters.map(m => m.id));
            for (const rid of Object.keys(g._rewardedIds)) {
                if (!activeIds.has(parseInt(rid))) delete g._rewardedIds[rid];
            }
        }
    });

    // ── 게스트가 몬스터 처치 보고 → 호스트에서 공식 처리 ──
    s.off('monster_killed');
    s.on('monster_killed', data => {
        if (!gameInstance || !gameInstance._isHost) return;
        if (gameInstance.gameOver || gameInstance.stageComplete) return;
        const m = gameInstance.monsters.find(mm => mm.id === data.id);
        if (m && m.alive && m.hp > 0) { m.hp = 0; m.alive = false; }
    });

    // ── 플레이어 퇴장 처리 ──
    s.off('player_left');
    s.on('player_left', data => {
        delete gameInstance.otherPlayers[data.username];
    });

    // fireAtTarget를 오버라이드해서 총알을 서버에 브로드캐스트
    const origFire = gameInstance.fireAtTarget.bind(gameInstance);
    gameInstance.fireAtTarget = function(tx, ty) {
        origFire(tx, ty);
        syncPlayerFire(this, tx, ty);
    };

    return gameInstance;
}

// ========== 로컬 상태 서버로 전송 ==========
function emitPlayerSync(gameInstance) {
    gameInstance._syncFrame = (gameInstance._syncFrame || 0) + 1;
    if (!window.socket || !window.socket.connected) return;

    const frame = gameInstance._syncFrame;

    // 진단 로그: 1초에 한 번 (60프레임 마다)
    if (frame === 1 || frame % 60 === 0) {
        console.log('[DF-MP] emitPlayerSync frame:', frame,
            'isHost:', gameInstance._isHost,
            'monsters:', gameInstance.monsters.length,
            'otherPlayers:', Object.keys(gameInstance.otherPlayers || {}).length,
            'roomCode:', gameInstance.roomCode,
            'socket.connected:', window.socket.connected);
    }

    // ── 플레이어 위치 전송 (매 SYNC_INTERVAL 프레임마다) ──
    if (frame % SYNC_INTERVAL === 0) {
        const character = gameInstance.character || {};
        const dirName   = gameInstance.player.moveDir || 'down';

        // 코스튬 데이터는 10프레임마다만 포함 (변하지 않는 데이터라 매번 보낼 필요 없음)
        const includeCostume = (frame % 10 === 0);
        const payload = {
            code:  gameInstance.roomCode,
            x:     Math.round(gameInstance.player.x),
            y:     Math.round(gameInstance.player.y),
            hp:    gameInstance.player.hp,
            maxHp: gameInstance.player.maxHp,
            dir:   dirName,
            frame: gameInstance.player.animFrame || 0,
        };
        if (includeCostume) {
            payload.hatId        = character.hat;
            payload.clothesId    = character.clothes;
            payload.hatColor     = character.hat_color;
            payload.clothesColor = character.clothes_color;
        }
        window.socket.emit('player_update', payload);
    }

    // ── 호스트: 몬스터 + 웨이브 상태 전송 (매 MONSTER_SYNC_INTERVAL 프레임마다) ──
    if (gameInstance._isHost && frame % MONSTER_SYNC_INTERVAL === 0) {
        if (gameInstance._monsterSeq == null) gameInstance._monsterSeq = 0;

        const mData = gameInstance.monsters.map(m => {
            if (m.id == null) m.id = ++gameInstance._monsterSeq;
            return {
                id:    m.id,
                cls:   m.monsterClass,
                x:     Math.round(m.x),
                y:     Math.round(m.y),
                hp:    m.hp,
                alive: m.alive,
            };
        });

        // 죽은 몬스터는 패킷에서 제외 (alive=false인 것들은 게스트가 이미 제거했을 것)
        const aliveMData = mData.filter(m => m.alive !== false && m.hp > 0);

        window.socket.emit('monster_sync', {
            code:                gameInstance.roomCode,
            monsters:            aliveMData,
            wave:                gameInstance.wave,
            waveActive:          gameInstance.waveActive,
            waveDelay:           gameInstance.waveDelay,
            waveMonsters:        gameInstance.waveMonsters,
            waveMonstersSpawned: gameInstance.waveMonstersSpawned,
            shopOpen:            gameInstance.shopOpen,
            shopOptions:         gameInstance.shopOptions,
            stageComplete:       gameInstance.stageComplete,
            gameOver:            gameInstance.gameOver,
        });
    }
}

function syncPlayerFire(gameInstance, toX, toY) {
    if (!window.socket || !window.socket.connected) return;
    window.socket.emit('player_shoot', {
        code: gameInstance.roomCode,
        x:    gameInstance.player.x,
        y:    gameInstance.player.y,
        toX:  toX,
        toY:  toY,
    });
}

// 게스트 → 호스트: 몬스터 처치 보고
// splice 전에 호출하므로 monster 객체의 id가 아직 유효한 상태
function emitMonsterKilled(gameInstance, monster) {
    if (!window.socket || !window.socket.connected) return;
    if (!gameInstance.roomCode || monster.id == null) return;
    window.socket.emit('monster_killed', { code: gameInstance.roomCode, id: monster.id });
}

// ========== 다른 플레이어 렌더링 ==========
function renderOtherPlayers(ctx, gameInstance) {
    if (!gameInstance.otherPlayers) return;
    const now = Date.now();

    // 진단 로그 (1초에 한 번)
    if (gameInstance._renderLogFrame === undefined) gameInstance._renderLogFrame = 0;
    gameInstance._renderLogFrame++;
    const playerKeys = Object.keys(gameInstance.otherPlayers);
    if (gameInstance._renderLogFrame % 60 === 0 && playerKeys.length > 0) {
        console.log('[DF-MP] renderOtherPlayers:', playerKeys.length, 'players:', playerKeys.join(', '));
    }

    for (const [name, p] of Object.entries(gameInstance.otherPlayers)) {
        if (!p) continue;

        // GHOST_TIMEOUT 이상 업데이트 없으면 제거 (연결 끊김 대비)
        if (p.lastSeen && now - p.lastSeen > GHOST_TIMEOUT) {
            delete gameInstance.otherPlayers[name];
            continue;
        }

        if (p.hp <= 0) continue;

        // 위치 보간 (lerp)
        if (p.tx == null) { p.tx = p.x; p.ty = p.y; }
        p.x += (p.tx - p.x) * LERP_PLAYER;
        p.y += (p.ty - p.y) * LERP_PLAYER;

        // 걷기 애니메이션
        const moving = Math.abs(p.tx - p.x) + Math.abs(p.ty - p.y) > 0.3;
        if (moving) {
            p.animT = (p.animT || 0) + 1;
            if (p.animT >= 6) { p.animT = 0; p.anim = (p.anim || 0) + 1; }
        } else {
            p.anim = 0; p.animT = 0;
        }
        const frame = p.frame != null ? p.frame : p.anim;

        drawCharacter(ctx, p.x, p.y + 20 * REMOTE_SCALE, REMOTE_SCALE,
            p.hatId, p.clothesId, p.hatColor, p.clothesColor,
            p.dir || 'down', frame);

        // 이름표
        ctx.font = '10px monospace';
        const tw = ctx.measureText(name).width + 8;
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(p.x - tw / 2, p.y - 46, tw, 13);
        ctx.fillStyle = '#ffd700';
        ctx.textAlign = 'center';
        ctx.fillText(name, p.x, p.y - 36);

        // HP 바
        const hpW = 30;
        ctx.fillStyle = '#333';
        ctx.fillRect(p.x - hpW / 2, p.y - 52, hpW, 4);
        ctx.fillStyle = p.hp / p.maxHp > 0.3 ? '#4ade80' : '#ff4444';
        ctx.fillRect(p.x - hpW / 2, p.y - 52, hpW * Math.max(0, p.hp / p.maxHp), 4);
    }

    // ── 게스트: 몬스터 위치 보간 (teleport 대신 부드러운 이동) ──
    if (!gameInstance._isHost) {
        for (const m of gameInstance.monsters) {
            if (!m.alive || m.tx == null) continue;
            m.x += (m.tx - m.x) * LERP_MONSTER;
            m.y += (m.ty - m.y) * LERP_MONSTER;
        }
    }
}
