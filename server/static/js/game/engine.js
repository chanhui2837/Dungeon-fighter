const TILE = 80;
const COLS = 16, ROWS = 10;
const GAME_W = COLS * TILE, GAME_H = ROWS * TILE;

const MAX_ITEM_LEVEL = 5;

function _(key) {
    if (typeof LANG !== 'undefined' && LANG.t) return LANG.t(key);
    const en = {
        'exp': 'EXP', 'tokens': 'Tokens', 'coins': 'Coins', 'kills': 'Kills',
        'wave': 'Wave', 'hp': 'HP', 'atk': 'ATK', 'def': 'DEF', 'shield': ' Shield',
        'items': 'ITEMS', 'stage_clear': 'STAGE CLEAR!', 'game_over': 'GAME OVER',
        'continue': 'Continue', 'upgrade': 'UPGRADE', 'buy': 'BUY', 'skip': 'SKIP',
        'my_items': 'MY ITEMS', 'close': 'CLOSE',
    };
    return en[key] || key;
}

const ITEMS_DATA = {
    gun:      { id: 'gun',   name: 'Pistol',         icon: 'W', cat: 'weapon', desc: lv => lv>0?'ATK +'+(lv*5+7)+' / '+lv*2+' perm/lv':'Acquire' },
    armor:    { id: 'armor', name: 'Armor',           icon: 'A', cat: 'armor',  desc: lv => lv>0?'DEF +'+(lv*3):'Acquire' },
    drink:    { id: 'drink', name: 'Energy Drink',   icon: 'C', cat: 'drink',   desc: lv => lv>0?'HP Regen '+lv+'%/s':'Acquire' },
    bomb:     { id: 'bomb',  name: 'Grenade',        icon: 'S', cat: 'bomb',    desc: lv => lv>0?'DMG '+(10+lv*10)+' AoE':'Acquire' },
    shotgun:  { id: 'shotgun', name: 'Shotgun',     icon: 'W', cat: 'weapon',  desc: lv => lv>0?'ATK +'+(lv*4+2)+' pierce':'Acquire' },
    sniper:   { id: 'sniper', name: 'Sniper Rifle', icon: 'W', cat: 'weapon',  desc: lv => lv>0?'ATK +'+(lv*llv+3)+' 2x crit':'Acquire' },
    katana:   { id: 'katana', name: 'Katana',       icon: 'W', cat: 'weapon',  desc: lv => lv>0?'ATK +'+(lv*5+1)+' fast':'Acquire' },
    shield:   { id: 'shield', name: 'Shield',       icon: 'A', cat: 'armor',   desc: lv => lv>0?'DEF +'+(lv*3)+' SHD':'Acquire' },
    boots:    { id: 'boots',  name: 'Swift Boots',  icon: 'S', cat: 'bomb',    desc: lv => lv>0?'SPD +'+(lv*0.3).toFixed(1):'Acquire' },
    vampire:  { id: 'vampire',name: 'Vampire Fang', icon: 'W', cat: 'weapon',  desc: lv => lv>0?'LS '+(lv*2)+'%/hit':'Acquire' },
    regen:    { id: 'regen',  name: 'Regen Ring',   icon: 'C', cat: 'drink',   desc: lv => lv>0?'HP Regen '+(lv+1)+'%/s':'Acquire' },
    fireball: { id: 'fireball',name: 'Fireball Staff',icon: 'W',cat: 'weapon',  desc: lv => lv>0?'ATK +'+(lv*4+6)+' burn':'Acquire' },
    iceblast: { id: 'iceblast',name: 'Ice Blast Orb',icon: 'W',cat: 'weapon',  desc: lv => lv>0?'ATK +'+(lv*3+7)+' slow':'Acquire' },
    excalibur:{ id: 'excalibur',name: 'Excalibur',  icon: 'W', cat: 'weapon',  desc: lv => lv>0?'ATK +'+(lv*6+10)+' divine':'Acquire' },
};

const INGAME_UPGRADES = {
    health_potion: { id: 'health_potion', name: 'Health Potion', desc: 'Heal 70 HP', cost: 12, icon: 'C',
      apply: g => { g.player.hp = Math.min(g.player.maxHp, g.player.hp + 70); } },
    shield_potion: { id: 'shield_potion', name: 'Shield Potion', desc: 'Gain 30 shield', cost: 14, icon: 'C',
      apply: g => { g.player.shield = (g.player.shield || 0) + 30; } },
};

/* ===== PLAYER ===== */
class Player {
    constructor(character) {
        this.x = GAME_W / 2;
        this.y = GAME_H - 80;
        this.size = 18;
        this.hp = 100;
        this.maxHp = 100;
        this.speed = 1.8;
        this.attackDmg = 10;
        this.attackSpeed = 20;
        this.attackCooldown = 0;
        this.keys = {};
        this.alive = true;
        this.character = character || {};
        this.moveDir = 'down';
        this.animFrame = 0;
        this.animTimer = 0;
        this.invincible = 0;
        this.shield = 0;
        this.maxShield = 0;
        this.defense = 0;
        this.hpRegen = 0;
    }

    update() {
        if (!this.alive) return;
        let dx = 0, dy = 0;
        if (this.keys['w'] || this.keys['arrowup']) dy = -this.speed;
        if (this.keys['s'] || this.keys['arrowdown']) dy = this.speed;
        if (this.keys['a'] || this.keys['arrowleft']) dx = -this.speed;
        if (this.keys['d'] || this.keys['arrowright']) dx = this.speed;
        if (dx && dy) { dx *= 0.707; dy *= 0.707; }
        const moving = dx !== 0 || dy !== 0;
        if (moving) {
            if (Math.abs(dx) > Math.abs(dy)) {
                this.moveDir = dx > 0 ? 'right' : 'left';
            } else {
                this.moveDir = dy > 0 ? 'down' : 'up';
            }
            this.animTimer++;
            if (this.animTimer >= 6) {
                this.animTimer = 0;
                this.animFrame++;
            }
        } else {
            this.animFrame = 0;
            this.animTimer = 0;
        }
        this.x = Math.max(this.size, Math.min(GAME_W - this.size, this.x + dx));
        this.y = Math.max(this.size, Math.min(GAME_H - this.size, this.y + dy));
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.invincible > 0) this.invincible--;
    }

    draw(ctx) {
        if (!this.alive) return;
        if (this.invincible > 0 && Math.floor(this.invincible / 4) % 2 === 0) return;

        const s = 0.35;
        drawCharacter(ctx, this.x, this.y + 20 * s, s,
            this.character.hat, this.character.clothes,
            this.character.hat_color, this.character.clothes_color,
            this.moveDir, this.animFrame);

        const hpW = 40, hpH = 4;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(this.x - hpW / 2 - 1, this.y - 28, hpW + 2, hpH + 2);
        ctx.fillStyle = this.hp / this.maxHp > 0.3 ? '#4ade80' : '#ff4444';
        ctx.fillRect(this.x - hpW / 2, this.y - 27, hpW * (this.hp / this.maxHp), hpH);
        if (this.shield > 0) {
            ctx.fillStyle = 'rgba(50,130,255,0.6)';
            ctx.fillRect(this.x - hpW / 2, this.y - 32, hpW * Math.min(1, this.shield / 50), 3);
        }
    }

    attack(mx, my) {
        if (this.attackCooldown > 0 || !this.alive) return null;
        this.attackCooldown = this.attackSpeed;
        const angle = Math.atan2(my - this.y, mx - this.x);
        let dmg = this.attackDmg;
        if (this._game && this._game.sniperCritChance > 0 && Math.random() < this._game.sniperCritChance) {
            dmg *= 2;
            this._game._lastCrit = true;
        }
        return [{
            x: this.x, y: this.y,
            vx: Math.cos(angle) * 6,
            vy: Math.sin(angle) * 6,
            dmg: dmg,
            radius: 6, life: 50,
            owner: 'player',
            pierce: this._game && (this._game.gameItems.shotgun || {}).level > 0 ? 1 : 0,
        }];
    }

    takeDamage(dmg) {
        if (this.invincible > 0) return;
        let actual = dmg;
        if (this.shield > 0) {
            const absorbed = Math.min(this.shield, actual);
            this.shield -= absorbed;
            actual -= absorbed;
        }
        this.hp -= actual;
        this.invincible = 20;
        if (this.hp <= 0) { this.hp = 0; this.alive = false; }
    }

    getDefense() { return this.defense || 0; }
}

/* ===== MONSTER ===== */
class Monster {
    constructor(stage, monsterClass, x, y, wave) {
        const base = MONSTER_CLASS_BASES[monsterClass] || MONSTER_CLASS_BASES[0];
        const stageMul = Math.pow(5, stage - 1);
        const scale = stageMul * (1 + (wave - 1) * 0.02);
        this.monsterClass = monsterClass;
        this.stage = stage || 1;
        this.x = x;
        this.y = y;
        this.size = base.size;
        this.maxHp = Math.round(base.hp * scale);
        this.hp = this.maxHp;
        this.speed = base.speed + stageMul * 0.05;
        this.dmg = Math.round(base.dmg * scale);
        this.exp = Math.round(base.exp * scale);
        this.tokens = Math.round(base.tokens * scale);
        this.alive = true;
        this.attackCooldown = 0;
        this.attackSpeed = 30;
        this.wobble = Math.random() * Math.PI * 2;
    }

    update(player) {
        if (!this.alive) return;
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this._burnTicks > 0) { this._burnTicks--; this.takeDamage(this._burnDmg); }
        if (this._slow > 0) { this._slow--; if (this._slow === 0) this.speed *= 2.5; }
        this.wobble += 0.05;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 2) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
    }

    draw(ctx) {
        if (!this.alive) return;
        const designs = MONSTER_DESIGNS[this.stage];
        if (!designs) return;
        const data = designs[this.monsterClass] || designs[0];
        ctx.save();
        if (this.monsterClass === 4) { ctx.shadowColor = '#ff0'; ctx.shadowBlur = 20; }
        data.draw(ctx, this.x, this.y, this.size, Math.sin(this.wobble) * 2);
        if (this.monsterClass === 4) ctx.shadowBlur = 0;
        ctx.restore();

        const hpW = this.size * 2.5, hpH = 3;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(this.x - hpW / 2 - 1, this.y - this.size - 10, hpW + 2, hpH + 2);
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(this.x - hpW / 2, this.y - this.size - 9, hpW * (this.hp / this.maxHp), hpH);
    }

    takeDamage(dmg) {
        this.hp -= dmg;
        if (this.hp <= 0) { this.hp = 0; this.alive = false; }
    }
}

/* ===== ITEM DROP ===== */
class ItemDrop {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.life = 600;
        this.size = 8;
        this.collected = false;
        this.bob = Math.random() * Math.PI * 2;
        const colors = { hp: '#ff4444', token: '#ffd700', exp: '#9b59b6' };
        this.color = colors[type] || '#fff';
    }

    draw(ctx) {
        if (this.collected) return;
        this.bob += 0.05;
        const bobY = Math.sin(this.bob) * 2;
        const pulse = 1 + Math.sin(this.bob * 2) * 0.15;

        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y + bobY, this.size * pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fff';
        ctx.font = '7px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const labels = { hp: '+', token: 'T', exp: 'E' };
        ctx.fillText(labels[this.type] || '?', this.x, this.y + bobY + 1);
    }
}

/* ===== GAME ===== */
class Game {
    constructor(stageId, items, character, onEnd, playerCount, pets) {
        this.stageId = stageId;
        this.items = items;
        this.character = character || {};
        this.onEnd = onEnd;
        this.playerCount = Math.max(1, playerCount || 1);
        this.equippedPet = (pets && pets.length > 0) ? pets[0] : null;
        this.petX = GAME_W / 2 - 30;
        this.petY = GAME_H - 60;
        this.petAnim = 0;
        this.player = new Player(character);
        this.player._game = this;
        this.monsters = [];
        this.projectiles = [];
        this.drops = [];
        this.wave = 0;
        this.maxWave = 50;
        this.waveMonsters = 0;
        this.waveMonstersSpawned = 0;
        this.spawnTimer = 0;
        this.waveDelay = 0;
        this.waveActive = false;
        this.stageComplete = false;
        this.totalExp = 0;
        this.totalTokens = 0;
        this.totalCoins = 0;
        this.kills = 0;
        this.waveKills = 0;
        this.gameOver = false;
        this.paused = false;
        this.shopOpen = false;
        this.shopOptions = [];

        this.showingItems = false;
        this.mouseHeld = false;
        this.mouseX = GAME_W / 2;
        this.mouseY = GAME_H / 2;
        this.autoAim = localStorage.getItem('auto_aim') === 'true';

        this.gameItems = {
            gun:      { level: 0, name: 'Pistol' },
            armor:    { level: 0, name: 'Armor' },
            drink:    { level: 0, name: 'Energy Drink' },
            bomb:     { level: 0, name: 'Grenade' },
            shotgun:  { level: 0, name: 'Shotgun' },
            sniper:   { level: 0, name: 'Sniper Rifle' },
            katana:   { level: 0, name: 'Katana' },
            shield:   { level: 0, name: 'Shield' },
            boots:    { level: 0, name: 'Swift Boots' },
            vampire:  { level: 0, name: 'Vampire Fang' },
            regen:    { level: 0, name: 'Regen Ring' },
            fireball: { level: 0, name: 'Fireball Staff' },
            iceblast: { level: 0, name: 'Ice Blast Orb' },
            excalibur:{ level: 0, name: 'Excalibur' },
        };
        this.bombDamage = 10;
        this.bombCooldown = 0;

        this.player.attackDmg = 3;
        this.player.defense = 0;
        this.player.hpRegen = 0;
        this.player.maxHp = 80;
        this.player.hp = 80;
        this.player.attackSpeed = 25;

        this.coinUnlocks = items || {};
        this.equippedItems = (items && items._equipped) ? items._equipped : [];
        this.hpUpgradeCount = 0;
        this.applyItemEffects();

        this.map = getMap(stageId - 1);
        this.decorations = getDecorations(stageId - 1);
        this.colors = getStageColors(stageId);

        this.startNextWave();
    }

    startNextWave() {
        this.wave++;
        if (this.wave > this.maxWave) { this.stageComplete = true; return; }
        this.waveActive = true;
        this.waveKills = 0;
        const baseCount = 3 + this.wave * 0.5;
        const multi = this.playerCount > 1 ? this.playerCount * 0.7 : 1;
        this.waveMonsters = Math.min(Math.round(baseCount * multi), 40 * this.playerCount);
        this.waveMonstersSpawned = 0;
        this.spawnTimer = 0;
    }

    openShop() {
        this.shopOpen = true;
        this.shopOptions = [];

        const itemKeys = ['gun','armor','drink','bomb','shotgun','sniper','katana','shield','boots','vampire','regen','fireball','iceblast','excalibur'];
        const candidates = [];

        const allMaxed = itemKeys.every(k => this.gameItems[k].level >= MAX_ITEM_LEVEL);

        if (allMaxed) {
            candidates.push({
                id: 'coin_cache',
                name: 'Coin Cache',
                desc: 'Convert 20 Tokens → 10 Coins',
                cost: 20,
                icon: 'C',
                apply: g => { g.totalCoins += 10; }
            });
            candidates.push({
                id: 'coin_cache2',
                name: 'Large Coin Cache',
                desc: 'Convert 50 Tokens → 30 Coins',
                cost: 50,
                icon: 'C',
                apply: g => { g.totalCoins += 30; }
            });
        } else {
            for (const key of itemKeys) {
                const unlockData = this.coinUnlocks[key];
                if (!unlockData || !unlockData.unlocked) continue;
                if (!this.equippedItems.includes(key)) continue;
                const item = this.gameItems[key];
                const data = ITEMS_DATA[key];
                if (item.level === 0) {
                    candidates.push({
                        id: 'acquire_' + key,
                        name: 'Acquire ' + data.name,
                        desc: 'Get ' + data.name + ' (★1)',
                        cost: 15,
                        icon: data.icon,
                        apply: g => {
                            g.gameItems[key].level = 1;
                            g.applyItemEffects();
                        }
                    });
                } else if (item.level < MAX_ITEM_LEVEL) {
                    const newLv = item.level + 1;
                    candidates.push({
                        id: 'upgrade_' + key,
                        name: 'Upgrade ' + data.name,
                        desc: '→ ★' + newLv + ' ' + data.desc(newLv),
                        cost: 10 + item.level * 8,
                        icon: data.icon,
                        apply: g => {
                            g.gameItems[key].level = newLv;
                            g.applyItemEffects();
                        }
                    });
                }
            }

            candidates.push({
                id: 'hp_upgrade',
                name: 'Max HP Up',
                desc: 'HP +10 (Current: ' + this.player.maxHp + ')',
                cost: 10 + this.hpUpgradeCount * 5,
                icon: 'C',
                apply: g => {
                    g.player.maxHp += 10;
                    g.player.hp += 10;
                    g.hpUpgradeCount++;
                }
            });

            const potionKeys = Object.keys(INGAME_UPGRADES);
            for (const pk of potionKeys) {
                candidates.push({ ...INGAME_UPGRADES[pk] });
            }
        }

        while (candidates.length > 0 && this.shopOptions.length < 3) {
            const idx = Math.floor(Math.random() * candidates.length);
            this.shopOptions.push(candidates[idx]);
            candidates.splice(idx, 1);
        }
    }

    applyItemEffects() {
        const g = this.gameItems;
        const perm = (key) => {
            const v = this.coinUnlocks[key];
            return v && typeof v === 'object' ? (v.permLv || 0) : 0;
        };

        let atk = 3;
        atk += perm('gun') * 2 + (g.gun.level>0 ? g.gun.level*5+7 : 0);
        atk += perm('shotgun')*2 + (g.shotgun.level>0 ? g.shotgun.level*4+2 : 0);
        if (g.sniper.level>0) atk += g.sniper.level*6+3;
        if (g.katana.level>0) atk += g.katana.level*5+1;
        if (g.fireball.level>0) atk += g.fireball.level*4+6;
        if (g.iceblast.level>0) atk += g.iceblast.level*3+7;
        if (g.excalibur.level>0) atk += g.excalibur.level*6+10;
        this.player.attackDmg = atk;

        let def = 0;
        def += perm('armor')*1 + (g.armor.level>0 ? g.armor.level*3 : 0);
        if (g.shield.level>0) def += g.shield.level*3;
        this.player.defense = def;

        this.player.hpRegen = 0;
        if (g.drink.level>0) this.player.hpRegen += g.drink.level;
        if (g.regen.level>0) this.player.hpRegen += g.regen.level + 1;

        this.player.maxHp = 80 + perm('drink')*5;
        this.player.hp = Math.min(this.player.hp, this.player.maxHp);

        this.player.shield = 0;
        this.player.maxShield = 0;
        if (g.shield.level>0) {
            this.player.maxShield = g.shield.level*10;
            this.player.shield = this.player.maxShield;
        }

        if (g.boots.level>0) this.player.speed = 1.8 + g.boots.level*0.3;
        else this.player.speed = 1.8;

        if (g.vampire.level>0) this.vampirePercent = g.vampire.level*2;
        else this.vampirePercent = 0;

        if (g.sniper.level>0) this.sniperCritChance = 0.2;
        else this.sniperCritChance = 0;

        if (g.katana.level>0) this.player.attackSpeed = Math.max(10, 20 - g.katana.level*2);
        else this.player.attackSpeed = 20;

        this.bombDamage = 10 + perm('bomb')*3 + (g.bomb.level>0 ? g.bomb.level*10 : 0);

        if (this.equippedPet) {
            const petBonus = { dog: 1.1, cat: 1.15, rabbit: 1.05, fox: 1.08 };
            const mult = petBonus[this.equippedPet] || 1.1;
            this.player.attackDmg = Math.round(this.player.attackDmg * mult);
            this.bombDamage = Math.round(this.bombDamage * mult);
        }
    }

    handleShopClick(mx, my) {
        const W = GAME_W, H = GAME_H;
        const cardW = 280, cardH = 210, gap = 40;
        const totalW = 3 * cardW + 2 * gap;
        const startX = (W - totalW) / 2;
        const cardsY = 210;

        for (let i = 0; i < this.shopOptions.length; i++) {
            const cx = startX + i * (cardW + gap);
            if (mx >= cx && mx <= cx + cardW && my >= cardsY && my <= cardsY + cardH) {
                const opt = this.shopOptions[i];
                if (this.totalTokens >= opt.cost) {
                    this.totalTokens -= opt.cost;
                    opt.apply(this);
                    this.shopOpen = false;
                    this.waveDelay = 40;
                }
                return;
            }
        }

        const skipX = W / 2 - 80, skipY = 470, skipW = 160, skipH = 45;
        if (mx >= skipX && mx <= skipX + skipW && my >= skipY && my <= skipY + skipH) {
            this.shopOpen = false;
            this.waveDelay = 40;
        }
    }

    toggleItems() {
        this.showingItems = !this.showingItems;
    }

    handleItemsClick(mx, my) {
        const closeX = GAME_W / 2 - 60, closeW = 120, closeH = 40;
        const closeY = this._itemsCloseY || 435;
        if (mx >= closeX && mx <= closeX + closeW && my >= closeY && my <= closeY + closeH) {
            this.showingItems = false;
        }
    }

    roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    nearestMonster(mx, my) {
        let best = null, bestDist = Infinity;
        for (const m of this.monsters) {
            if (!m.alive) continue;
            const dx = m.x - mx, dy = m.y - my;
            const dist = dx * dx + dy * dy;
            if (dist < bestDist) { bestDist = dist; best = m; }
        }
        return best;
    }

    fireAtTarget(mx, my) {
        let tx = mx, ty = my;
        if (this.autoAim) {
            const nearest = this.nearestMonster(tx, ty);
            if (nearest) { tx = nearest.x; ty = nearest.y; }
        }
        const pList = this.player.attack(tx, ty);
        if (pList) {
            const arr = Array.isArray(pList) ? pList : [pList];
            for (const p of arr) {
                if ((this.gameItems.fireball || {}).level > 0) p._burn = this.gameItems.fireball.level * 2;
                if ((this.gameItems.iceblast || {}).level > 0) p._slow = 3;
                this.projectiles.push(p);
            }
        }
    }

    fireBombs() {
        const count = 1 + Math.floor(this.gameItems.bomb.level / 2);
        const angle = Math.atan2(this.mouseY - this.player.y, this.mouseX - this.player.x);
        const spread = 0.15;
        for (let i = 0; i < count; i++) {
            const a = angle + (i - (count - 1) / 2) * spread;
            this.projectiles.push({
                x: this.player.x, y: this.player.y,
                vx: Math.cos(a) * 4,
                vy: Math.sin(a) * 4,
                dmg: this.bombDamage,
                radius: 10, life: 40,
                owner: 'player',
                pierce: 999,
                isBomb: true,
            });
        }
    }

    spawnMonster() {
        if (this.waveMonstersSpawned >= this.waveMonsters) return;
        const designs = MONSTER_DESIGNS[this.stageId];
        if (!designs) return;
        let available = designs.filter(m => this.wave >= m.waveMin);
        if (this.wave === 50 && this.waveMonstersSpawned === 0) {
            available = [designs[4]];
        }
        if (available.length === 0) available = [designs[0]];
        const chosen = available[Math.floor(Math.random() * available.length)];
        const monsterClass = designs.indexOf(chosen);
        const side = Math.floor(Math.random() * 4);
        let x, y;
        switch (side) {
            case 0: x = Math.random() * GAME_W; y = -30; break;
            case 1: x = GAME_W + 30; y = Math.random() * GAME_H; break;
            case 2: x = Math.random() * GAME_W; y = GAME_H + 30; break;
            case 3: x = -30; y = Math.random() * GAME_H; break;
        }
        this.monsters.push(new Monster(this.stageId, monsterClass, x, y, this.wave));
        this.waveMonstersSpawned++;
    }

    handleClick(mx, my) {
        if (this.gameOver || this.stageComplete || this.paused) return;
        if (this.shopOpen) { this.handleShopClick(mx, my); return; }
        if (this.showingItems) { this.handleItemsClick(mx, my); return; }
        if (this._itemsBtnX) {
            const hx = this._itemsBtnX - this._itemsBtnW / 2;
            if (mx >= hx && mx <= hx + this._itemsBtnW && my >= this._itemsBtnY && my <= this._itemsBtnY + this._itemsBtnH) {
                this.toggleItems(); return;
            }
        }
        this.fireAtTarget(mx, my);
    }

    update() {
        if (this.gameOver || this.stageComplete || this.paused || this.shopOpen || this.showingItems) return;
        this.player.update();

        if (this.mouseHeld && this.player.alive && this.player.attackCooldown === 0) {
            this.fireAtTarget(this.mouseX, this.mouseY);
        }

        if (this.player.alive && this.player.hpRegen > 0) {
            const regenTimer = 60;
            if (!this._regenTick) this._regenTick = 0;
            this._regenTick++;
            if (this._regenTick >= regenTimer) {
                this._regenTick = 0;
                const pctHeal = Math.ceil(this.player.maxHp * this.player.hpRegen / 100);
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + pctHeal);
            }
        }

        if (this.player.alive && this.gameItems.bomb.level > 0) {
            this.bombCooldown--;
            if (this.bombCooldown <= 0) {
                const interval = Math.max(120, 240 - this.gameItems.bomb.level * 20);
                this.bombCooldown = interval;
                this.fireBombs();
            }
        }

        if (this.waveActive && !this._syncMode) {
            this.spawnTimer++;
            const interval = Math.max(15, 40 - this.wave * 0.3);
            if (this.spawnTimer >= interval) { this.spawnTimer = 0; this.spawnMonster(); }
        }

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.x += p.vx; p.y += p.vy; p.life--;
            if (p.life <= 0 || p.x < -50 || p.x > GAME_W + 50 || p.y < -50 || p.y > GAME_H + 50) {
                this.projectiles.splice(i, 1); continue;
            }
            if (!p._hitSet) p._hitSet = new Set();
            let hitAny = false;
            for (const m of this.monsters) {
                if (!m.alive || p._hitSet.has(m)) continue;
                const dx = p.x - m.x, dy = p.y - m.y;
                if (dx * dx + dy * dy < (p.radius + m.size) * (p.radius + m.size)) {
                    m.takeDamage(p.dmg);
                    this.spawnHitEffect(m.x, m.y);
                    if (p._burn && !m._burnTicks) { m._burnTicks = p._burn; m._burnDmg = Math.round(p.dmg * 0.3); }
                    if (p._slow && !m._slowed) { m.speed *= 0.4; m._slow = p._slow; }
                    p._hitSet.add(m);
                    hitAny = true;
                    if (p._hitSet.size > p.pierce) break;
                }
            }
            if (hitAny && p._hitSet.size > p.pierce) this.projectiles.splice(i, 1);
        }

        for (const m of this.monsters) {
            if (!m.alive) continue;
            // 게스트 모드에서는 몬스터 AI 이동을 하지 않음 (호스트가 위치를 동기화)
            if (!this._syncMode) {
                m.update(this.player);
            }
            const dx = this.player.x - m.x, dy = this.player.y - m.y;
            if (dx * dx + dy * dy < (this.player.size + m.size) * (this.player.size + m.size)) {
                if (m.attackCooldown === 0) {
                    const dmg = Math.max(1, m.dmg - this.player.getDefense());
                    this.player.takeDamage(dmg, m);
                    m.attackCooldown = m.attackSpeed;
                }
            }
        }

        for (let i = this.monsters.length - 1; i >= 0; i--) {
            const m = this.monsters[i];
            if (!m.alive) {
                // 게스트는 보상을 로컬에서 계산하지 않음 (호스트가 관리)
                if (!this._syncMode) {
                    if (!this._rewardedIds || !this._rewardedIds[m.id]) {
                        this.totalExp += m.exp;
                        this.totalTokens += m.tokens;
                        this.totalCoins += Math.round(m.tokens * 0.5 + m.exp * 0.2);
                        this.kills++; this.waveKills++;
                        if (this.vampirePercent > 0) {
                            this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.vampirePercent);
                        }
                        if (Math.random() < 0.18) {
                            const types = ['hp', 'token', 'exp'];
                            this.drops.push(new ItemDrop(m.x, m.y, types[Math.floor(Math.random() * 3)]));
                        }
                        if (!this._rewardedIds) this._rewardedIds = {};
                        this._rewardedIds[m.id] = true;
                    }
                }
                if (this._syncMode && m.id != null && typeof emitMonsterKilled === 'function') {
                    emitMonsterKilled(this, m);
                }
                this.monsters.splice(i, 1);
            }
        }

        for (let i = this.drops.length - 1; i >= 0; i--) {
            const d = this.drops[i]; d.life--;
            if (d.life <= 0) { this.drops.splice(i, 1); continue; }
            const pickupRange = 14;
            const dx = this.player.x - d.x, dy = this.player.y - d.y;
            if (dx * dx + dy * dy < (this.player.size + pickupRange) * (this.player.size + pickupRange)) {
                if (d.type === 'hp') this.player.hp = Math.min(this.player.maxHp, this.player.hp + 25);
                if (d.type === 'token') this.totalTokens += 3;
                if (d.type === 'exp') this.totalExp += 15;
                this.drops.splice(i, 1);
            }
        }

        const alive = this.monsters.filter(m => m.alive).length;
        if (this.waveActive && !this._syncMode && this.waveMonstersSpawned >= this.waveMonsters && alive === 0) {
            this.waveActive = false;
            const sMul = Math.pow(2, this.stageId - 1);
            this.totalTokens += Math.round((5 + this.wave + this.stageId * 2) * sMul);
            this.totalExp += Math.round((50 + this.stageId * 10) * sMul);
            if (this.wave >= this.maxWave) {
                this.totalTokens += Math.round(200 * sMul);
                this.totalExp += Math.round(500 * sMul);
                this.totalCoins += Math.round(200 * sMul);
                this.stageComplete = true;
            } else if (this.wave % 3 === 0) {
                this.openShop();
            } else {
                this.waveDelay = 70;
            }
        }

        if (this.waveDelay > 0 && !this._syncMode) { this.waveDelay--; if (this.waveDelay === 0) this.startNextWave(); }
        if (!this.player.alive) this.gameOver = true;
    }

    spawnHitEffect(x, y) {
        if (!this.hitEffects) this.hitEffects = [];
        this.hitEffects.push({ x, y, life: 10 });
    }

    render(ctx) {
        const c = this.colors;
        ctx.fillStyle = c.bg;
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        for (let x = 0; x < COLS; x++) {
            for (let y = 0; y < ROWS; y++) {
                ctx.strokeRect(x * TILE, y * TILE, TILE, TILE);
            }
        }

        for (let y = 0; y < this.map.length && y < ROWS; y++) {
            for (let x = 0; x < (this.map[y] || []).length && x < COLS; x++) {
                if (this.map[y][x]) {
                    ctx.fillStyle = c.wall;
                    ctx.fillRect(x * TILE + 4, y * TILE + 4, TILE - 8, TILE - 8);
                    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x * TILE + 4, y * TILE + 4, TILE - 8, TILE - 8);
                }
            }
        }

        if (this.decorations) {
            for (let y = 0; y < this.decorations.length && y < ROWS; y++) {
                for (let x = 0; x < (this.decorations[y] || []).length && x < COLS; x++) {
                    if (this.decorations[y][x]) {
                        const cx = x * TILE + TILE / 2, cy = y * TILE + TILE / 2;
                        ctx.fillStyle = this.colors.deco || 'rgba(255,255,255,0.08)';
                        const wobble = Math.sin((x * 7 + y * 13) * 0.1) * 0.3 + 1;
                        ctx.beginPath();
                        ctx.arc(cx, cy, 3 * wobble, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        }

        for (const d of this.drops) d.draw(ctx);

        for (const m of this.monsters) m.draw(ctx);
        this.player.draw(ctx);
        if (this.equippedPet) {
            this.petAnim += 0.04;
            this.petX += (this.player.x - 25 - this.petX) * 0.06;
            this.petY += (this.player.y + 10 - this.petY) * 0.06;
            this.drawPet(ctx);
        }

        for (const p of this.projectiles) {
            if (p.isBomb) {
                ctx.shadowColor = '#ff4400';
                ctx.shadowBlur = 20;
                ctx.fillStyle = '#ff4400';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffaa00';
                ctx.beginPath();
                ctx.arc(p.x - 2, p.y - 2, p.radius * 0.5, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.shadowColor = '#ffdd44';
                ctx.shadowBlur = 10;
                ctx.fillStyle = '#ffdd44';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.shadowBlur = 0;
        }

        if (this.hitEffects) {
            for (let i = this.hitEffects.length - 1; i >= 0; i--) {
                const e = this.hitEffects[i];
                e.life--;
                if (e.life <= 0) { this.hitEffects.splice(i, 1); continue; }
                ctx.fillStyle = `rgba(255,255,200,${e.life / 10})`;
                ctx.beginPath();
                ctx.arc(e.x, e.y, 8 - e.life * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        this.renderUI(ctx);
    }

    renderUI(ctx) {
        const W = GAME_W, H = GAME_H;
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, H - 70, W, 70);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'left';
        const stageName = (STAGES[this.stageId - 1] || {}).name || ('Stage ' + this.stageId);
        ctx.fillText(stageName, 15, H - 42);
        ctx.fillStyle = '#aaa';
        ctx.font = '16px monospace';
        ctx.fillText(_('wave') + ': ' + this.wave + '/' + this.maxWave, 15, H - 14);

        ctx.textAlign = 'center';
        ctx.font = '16px monospace';
        ctx.fillStyle = '#9b59b6';
        ctx.fillText(_('exp') + ': ' + this.totalExp, W * 0.3, H - 17);
        ctx.fillStyle = '#ffd700';
        ctx.fillText(_('tokens') + ': ' + this.totalTokens, W * 0.45, H - 17);
        ctx.fillStyle = '#4ade80';
        ctx.fillText(_('kills') + ': ' + this.kills, W * 0.6, H - 17);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#888';
        ctx.font = '14px monospace';
        const itemsBtnX = W * 0.75, itemsBtnY = H - 30, itemsBtnW = 130, itemsBtnH = 35;
        ctx.fillStyle = this.showingItems ? '#ffd700' : '#4a4a6a';
        ctx.shadowColor = this.showingItems ? '#ffd700' : '#000';
        ctx.shadowBlur = this.showingItems ? 10 : 0;
        this.roundRect(ctx, itemsBtnX - itemsBtnW / 2, itemsBtnY, itemsBtnW, itemsBtnH, 6);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = this.showingItems ? '#ffd700' : '#666';
        ctx.lineWidth = 2;
        this.roundRect(ctx, itemsBtnX - itemsBtnW / 2, itemsBtnY, itemsBtnW, itemsBtnH, 6);
        ctx.stroke();
        ctx.fillStyle = this.showingItems ? '#000' : '#ccc';
        ctx.font = 'bold 15px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(_('items'), itemsBtnX, itemsBtnY + 23);
        this._itemsBtnX = itemsBtnX;
        this._itemsBtnY = itemsBtnY;
        this._itemsBtnW = itemsBtnW;
        this._itemsBtnH = itemsBtnH;

        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 17px monospace';
        ctx.fillText('HP: ' + this.player.hp + '/' + this.player.maxHp, W - 15, H - 42);
        ctx.fillStyle = '#aaa';
        ctx.font = '15px monospace';
        const shieldTxt = this.player.shield > 0 ? ' SHD:' + Math.round(this.player.shield) : '';
        ctx.fillText('ATK: ' + this.player.attackDmg + ' DEF: ' + this.player.getDefense() + shieldTxt, W - 15, H - 14);

        const hpW = 200, hpH = 10;
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(W - 215 - 2, H - 68 - 2, hpW + 4, hpH + 4);
        ctx.fillStyle = this.player.hp / this.player.maxHp > 0.3 ? '#4ade80' : '#ff4444';
        ctx.fillRect(W - 215, H - 68, hpW * (this.player.hp / this.player.maxHp), hpH);

        if (this.showingItems) {
            this.renderItemsOverlay(ctx, W, H);
        } else if (this.shopOpen) {
            this.renderShop(ctx, W, H);
        } else if (!this.waveActive && this.waveDelay > 0 && !this.stageComplete) {
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 28px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Wave ' + this.wave + ' Complete!', W / 2, H / 2 - 15);
            ctx.font = '16px monospace';
            ctx.fillStyle = '#aaa';
            ctx.fillText('Next wave incoming...', W / 2, H / 2 + 20);
        }

        if (this.stageComplete) {
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 40px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(_('stage_clear'), W / 2, H / 2 - 65);
            ctx.fillStyle = '#fff';
            ctx.font = '18px monospace';
            ctx.fillText(_('exp') + ': ' + this.totalExp + '  ' + _('tokens') + ': ' + this.totalTokens + '  ' + _('coins') + ': ' + this.totalCoins, W / 2, H / 2 - 10);
            const btnX = W / 2 - 100, btnY = H / 2 + 20, btnW = 200, btnH = 45;
            ctx.fillStyle = '#4ade80';
            ctx.strokeStyle = '#2d8a4e';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(btnX, btnY, btnW, btnH, 10);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 18px monospace';
            ctx.fillText(_('continue'), W / 2, btnY + 30);
        }

        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = '#ff4444';
            ctx.font = 'bold 40px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(_('game_over'), W / 2, H / 2 - 50);
            ctx.fillStyle = '#fff';
            ctx.font = '16px monospace';
            ctx.fillText(_('wave') + ': ' + this.wave + ' | ' + _('kills') + ': ' + this.kills, W / 2, H / 2 + 5);
            ctx.fillStyle = '#ffd700';
            ctx.fillText(_('tokens') + ': ' + this.totalTokens, W / 2, H / 2 + 30);
            ctx.fillStyle = '#9b59b6';
            ctx.fillText(_('exp') + ': ' + this.totalExp, W / 2, H / 2 + 55);
            const btnX = W / 2 - 100, btnY = H / 2 + 70, btnW = 200, btnH = 45;
            ctx.fillStyle = '#f87171';
            ctx.strokeStyle = '#b91c1c';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(btnX, btnY, btnW, btnH, 10);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 18px monospace';
            ctx.fillText(_('continue'), W / 2, btnY + 30);
        }
    }

    renderShop(ctx, W, H) {
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 40px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(_('upgrade'), W / 2, 90);

        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 22px monospace';
        ctx.fillText(_('tokens') + ': ' + this.totalTokens, W / 2, 140);

        const cardW = 280, cardH = 210, gap = 40;
        const totalW = 3 * cardW + 2 * gap;
        const startX = (W - totalW) / 2;
        const cardsY = 210;

        const catLabels = { W: 'WEAPON', A: 'ARMOR', C: 'CONSUMABLE', S: 'SPECIAL' };
        const catColors = { W: '#ff6b35', A: '#4a9eff', C: '#4ade80', S: '#c084fc' };

        for (let i = 0; i < this.shopOptions.length; i++) {
            const opt = this.shopOptions[i];
            const cx = startX + i * (cardW + gap);
            const canBuy = this.totalTokens >= opt.cost;
            const catColor = catColors[opt.icon] || '#888';

            ctx.fillStyle = canBuy ? '#2a2a3e' : '#1a1a2e';
            ctx.fillRect(cx, cardsY, cardW, cardH);
            ctx.strokeStyle = canBuy ? catColor : '#555';
            ctx.lineWidth = 3;
            ctx.strokeRect(cx, cardsY, cardW, cardH);

            const catLabel = catLabels[opt.icon] || '';
            ctx.fillStyle = catColor;
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(catLabel, cx + 10, cardsY + 18);

            ctx.fillStyle = canBuy ? '#ffd700' : '#666';
            ctx.font = 'bold 22px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(opt.name, cx + cardW / 2, cardsY + 60);

            ctx.fillStyle = canBuy ? '#ccc' : '#555';
            ctx.font = '16px monospace';
            ctx.fillText(opt.desc, cx + cardW / 2, cardsY + 100);

            ctx.fillStyle = canBuy ? '#fff' : '#555';
            ctx.font = '18px monospace';
            ctx.fillText('Cost: ' + opt.cost + ' T', cx + cardW / 2, cardsY + 140);

            ctx.fillStyle = canBuy ? '#32b850' : '#444';
            ctx.fillRect(cx + 50, cardsY + 155, 180, 40);
            ctx.fillStyle = canBuy ? '#fff' : '#666';
            ctx.font = 'bold 16px monospace';
            ctx.fillText(_('buy'), cx + cardW / 2, cardsY + 183);
        }

        ctx.fillStyle = '#666';
        ctx.fillRect(W / 2 - 80, 470, 160, 45);
        ctx.fillStyle = '#aaa';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(_('skip'), W / 2, 500);

        ctx.fillStyle = '#aaa';
        ctx.font = '14px monospace';
        ctx.fillText('(Shop opens every 3 waves)', W / 2, H - 20);
    }

    renderItemsOverlay(ctx, W, H) {
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(_('my_items'), W / 2, 80);

        const catColors = { gun: '#ff6b35', armor: '#4a9eff', drink: '#4ade80', bomb: '#c084fc' };
        const owned = ['gun', 'armor', 'drink', 'bomb'].filter(k => this.gameItems[k].level > 0);
        const startY = 140;
        const rowH = 65;

        if (owned.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '20px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('No items yet — buy from the shop!', W / 2, startY + 40);
        }

        owned.forEach((key, i) => {
            const y = startY + i * rowH;
            const item = this.gameItems[key];
            const lv = item.level;
            const data = ITEMS_DATA[key];
            const catColor = catColors[key];

            ctx.fillStyle = '#2a2a3e';
            ctx.fillRect(W / 2 - 250, y, 500, 55);
            ctx.strokeStyle = catColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(W / 2 - 250, y, 500, 55);

            ctx.fillStyle = catColor;
            ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(data.name, W / 2 - 230, y + 22);

            ctx.fillStyle = '#aaa';
            ctx.font = '14px monospace';
            ctx.fillText(data.desc(lv), W / 2 - 230, y + 46);

            const starStr = '★'.repeat(lv) + '☆'.repeat(MAX_ITEM_LEVEL - lv);
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 18px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(starStr, W / 2 + 230, y + 35);
        });

        const closeY = startY + Math.max(1, owned.length) * rowH + 15;
        ctx.fillStyle = '#666';
        ctx.fillRect(W / 2 - 60, closeY, 120, 40);
        ctx.fillStyle = '#aaa';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(_('close'), W / 2, closeY + 27);
        this._itemsCloseY = closeY;
    }

    drawPet(ctx) {
        const px = this.petX, py = this.petY;
        const wobble = Math.sin(this.petAnim) * 2;
        const legSwing = Math.sin(this.petAnim * 3) * 3;
        ctx.save();
        ctx.translate(px, py + wobble);

        const petId = this.equippedPet || 'dog';

        if (petId === 'dog') {
            ctx.fillStyle = '#c8a060'; ctx.strokeStyle = '#8b6914'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.ellipse(0,4,10,7,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#c8a060';
            ctx.beginPath(); ctx.arc(2,0,8,0,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.ellipse(9,5,3,5,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#a07850'; ctx.beginPath(); ctx.arc(5,2,3,0,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(-5,-2,2,0,Math.PI); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#c8a060';
            ctx.beginPath(); ctx.moveTo(2,-8); ctx.lineTo(-1,-12); ctx.lineTo(-4,-6); ctx.fill();
            ctx.beginPath(); ctx.moveTo(8,-4); ctx.lineTo(12,-8); ctx.lineTo(8,-2); ctx.fill();
            ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(4,-2,1.5,0,Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(4.5,-2.5,0.6,0,Math.PI*2); ctx.fill();
            ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(1.5,-9,2,0,Math.PI*1.5); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(1.5,-9); ctx.lineTo(1.5,-5); ctx.strokeStyle='#333'; ctx.stroke();
        } else if (petId === 'cat') {
            ctx.fillStyle = '#ff8c69'; ctx.strokeStyle = '#cc6a47'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.ellipse(0,6,8,6,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(2,0,7,0,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#ff8c69';
            ctx.beginPath(); ctx.moveTo(2,-6); ctx.lineTo(-3,-14); ctx.lineTo(1,-7); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(6,-5); ctx.lineTo(12,-12); ctx.lineTo(8,-6); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(8,4,2.5,6,-0.3,0,Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(-4,6,2,4,0.3,0,Math.PI*2); ctx.fill();
            ctx.fillStyle = '#32c8'; ctx.beginPath(); ctx.arc(3,0,2,0,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(7,0,2,0,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(3.3,-1,0.8,0,Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(7.3,-1,0.8,0,Math.PI*2); ctx.fill();
            ctx.fillStyle = '#faa'; ctx.beginPath(); ctx.arc(8,-9,2,0,Math.PI,false); ctx.fill();
        } else if (petId === 'rabbit') {
            ctx.fillStyle = '#fefefe'; ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.ellipse(0,4,9,7,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(0,-2,7,0,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#fefefe';
            ctx.beginPath(); ctx.ellipse(-1,-9,3,8,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.ellipse(5,-9,3,8,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#fcc'; ctx.beginPath(); ctx.ellipse(-1,-9,2,5,0,0,Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(5,-9,2,5,0,0,Math.PI*2); ctx.fill();
            ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(0,0,1,0,Math.PI*2); ctx.fill();
            ctx.fillStyle = '#f88'; ctx.beginPath(); ctx.arc(3,-1,1,0,Math.PI,false); ctx.fill();
        } else if (petId === 'fox') {
            ctx.fillStyle = '#ff6b35'; ctx.strokeStyle = '#cc5522'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.ellipse(0,4,9,6,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(2,0,7,0,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#ff6b35';
            ctx.beginPath(); ctx.moveTo(-2,-4); ctx.lineTo(-8,-12); ctx.lineTo(2,-5); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(4,-4); ctx.lineTo(10,-12); ctx.lineTo(6,-5); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(2,4,4,0,Math.PI); ctx.fill();
            ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(4,0,1.5,0,Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(3.5,-0.8,0.6,0,Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ff6b35'; ctx.beginPath(); ctx.moveTo(2,7); ctx.lineTo(-7,10); ctx.lineTo(1,6); ctx.fill(); ctx.stroke();
        }
        ctx.restore();
    }

    getResults() {
        return {
            stage: this.stageId,
            wave: this.gameOver ? this.wave : 50,
            exp: this.totalExp, tokens: this.totalTokens,
            coins: this.totalCoins, kills: this.kills,
            cleared: this.stageComplete,
        };
    }
}
