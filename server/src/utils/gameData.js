// Shared game definitions for items, monsters, skills, avatars
export const ITEMS = {
  // Weapons
  rusty_sword: { id: 'rusty_sword', name: '녹슨 검', type: 'weapon', slot: 'weapon', rarity: 'common', stats: { atk: 5 }, price: 10, desc: '초보자용 녹슨 검' },
  iron_sword: { id: 'iron_sword', name: '강철 검', type: 'weapon', slot: 'weapon', rarity: 'uncommon', stats: { atk: 12 }, price: 80, desc: '단단한 강철로 만든 검' },
  flame_blade: { id: 'flame_blade', name: '화염 대검', type: 'weapon', slot: 'weapon', rarity: 'rare', stats: { atk: 25, fire: 8 }, price: 300, desc: '불꽃이 서린 대검' },
  frost_staff: { id: 'frost_staff', name: '서리 지팡이', type: 'weapon', slot: 'weapon', rarity: 'rare', stats: { atk: 18, int: 12, frost: 10 }, price: 320, desc: '냉기를 뿜는 지팡이' },
  // Armor
  leather_armor: { id: 'leather_armor', name: '가죽 갑옷', type: 'armor', slot: 'top', rarity: 'common', stats: { def: 4, hp: 10 }, price: 30, desc: '가벼운 가죽 갑옷' },
  chain_mail: { id: 'chain_mail', name: '사슬 갑옷', type: 'armor', slot: 'top', rarity: 'uncommon', stats: { def: 10, hp: 25 }, price: 120, desc: '사슬로 엮은 갑옷' },
  dragon_scale: { id: 'dragon_scale', name: '용비늘 갑주', type: 'armor', slot: 'top', rarity: 'epic', stats: { def: 22, hp: 60, fireRes: 15 }, price: 800, desc: '용의 비늘로 만든 전설 갑주' },
  // Accessories
  hp_ring: { id: 'hp_ring', name: '생명 반지', type: 'accessory', slot: 'accessory1', rarity: 'uncommon', stats: { hp: 30 }, price: 100, desc: '생명을 불어넣는 반지' },
  swift_boots: { id: 'swift_boots', name: '신속 부츠', type: 'accessory', slot: 'accessory2', rarity: 'rare', stats: { spd: 12 }, price: 250, desc: '바람처럼 달린다' },
  // Consumables
  hp_potion: { id: 'hp_potion', name: 'HP 포션', type: 'consumable', slot: null, rarity: 'common', stats: { heal: 50 }, price: 15, desc: '체력 50 회복', stackable: true },
  mp_potion: { id: 'mp_potion', name: 'MP 포션', type: 'consumable', slot: null, rarity: 'common', stats: { mpHeal: 30 }, price: 15, desc: '마나 30 회복', stackable: true },
};

export const AVATARS = {
  head: [
    { id: 'head_none', name: '없음', slot: 'head', rarity: 'common', icon: '🧑' },
    { id: 'head_crown', name: '황금 왕관', slot: 'head', rarity: 'epic', icon: '👑', stats: { def: 5, hp: 20 } },
    { id: 'head_hood', name: '어둠 두건', slot: 'head', rarity: 'rare', icon: '🎭', stats: { spd: 5 } },
    { id: 'head_helm', name: '용기사 투구', slot: 'head', rarity: 'rare', icon: '⛑️', stats: { def: 8 } },
    { id: 'head_halo', name: '천사 후광', slot: 'head', rarity: 'legendary', icon: '😇', stats: { hp: 40, mp: 20 } },
  ],
  top: [
    { id: 'top_none', name: '기본 로브', slot: 'top', rarity: 'common', icon: '👕' },
    { id: 'top_knight', name: '기사 갑주', slot: 'top', rarity: 'rare', icon: '🛡️', stats: { def: 12 } },
    { id: 'top_mage', name: '마법사 로브', slot: 'top', rarity: 'rare', icon: '🧙', stats: { int: 8 } },
    { id: 'top_street', name: '스트릿 후드', slot: 'top', rarity: 'uncommon', icon: '🧥', stats: { spd: 6 } },
  ],
  bottom: [
    { id: 'bottom_none', name: '기본 바지', slot: 'bottom', rarity: 'common', icon: '👖' },
    { id: 'bottom_armor', name: '강철 레깅스', slot: 'bottom', rarity: 'rare', icon: '🦵', stats: { def: 7 } },
  ],
  weapon: [
    { id: 'weapon_none', name: '맨손', slot: 'weapon', rarity: 'common', icon: '✊' },
    { id: 'weapon_sword_aura', name: '오러 소드', slot: 'weapon', rarity: 'epic', icon: '⚔️', stats: { atk: 10 } },
    { id: 'weapon_staff_gold', name: '황금 스태프', slot: 'weapon', rarity: 'epic', icon: '🔱', stats: { int: 10 } },
    { id: 'weapon_bow', name: '정령 활', slot: 'weapon', rarity: 'rare', icon: '🏹', stats: { atk: 8, spd: 5 } },
  ],
  accessory: [
    { id: 'acc_none', name: '없음', slot: 'accessory', rarity: 'common', icon: '○' },
    { id: 'acc_wings', name: '흑날개', slot: 'accessory', rarity: 'legendary', icon: '🦋', stats: { spd: 10, hp: 15 } },
    { id: 'acc_cape', name: '붉은 망토', slot: 'accessory', rarity: 'rare', icon: '🧣', stats: { def: 6 } },
  ],
  // flat list for lookup
  get all() {
    return [...this.head, ...this.top, ...this.bottom, ...this.weapon, ...this.accessory];
  }
};

export const MONSTERS = {
  slime: {
    id: 'slime', name: '슬라임', hp: 40, atk: 6, def: 1, spd: 60, exp: 12, gold: 5,
    pattern: 'chase', size: 22, color: '#4ade80',
    drops: [{ itemId: 'hp_potion', rate: 0.25 }, { itemId: 'rusty_sword', rate: 0.02 }, { itemId: 'head_hood', rate: 0.008 }]
  },
  goblin: {
    id: 'goblin', name: '고블린', hp: 75, atk: 12, def: 3, spd: 90, exp: 25, gold: 12,
    pattern: 'zigzag', size: 26, color: '#a16207',
    drops: [{ itemId: 'iron_sword', rate: 0.05 }, { itemId: 'leather_armor', rate: 0.08 }, { itemId: 'hp_potion', rate: 0.3 }, { itemId: 'top_street', rate: 0.015 }, { itemId: 'weapon_bow', rate: 0.012 }]
  },
  skeleton: {
    id: 'skeleton', name: '스켈레톤', hp: 110, atk: 18, def: 5, spd: 80, exp: 40, gold: 20,
    pattern: 'ranged', projectile: true, size: 28, color: '#e5e7eb',
    drops: [{ itemId: 'chain_mail', rate: 0.06 }, { itemId: 'frost_staff', rate: 0.02 }, { itemId: 'mp_potion', rate: 0.3 }, { itemId: 'head_helm', rate: 0.012 }, { itemId: 'acc_cape', rate: 0.01 }]
  },
  orc: {
    id: 'orc', name: '오크 전사', hp: 180, atk: 28, def: 8, spd: 70, exp: 65, gold: 35,
    pattern: 'charge', size: 34, color: '#7f1d1d',
    drops: [{ itemId: 'flame_blade', rate: 0.04 }, { itemId: 'hp_ring', rate: 0.07 }, { itemId: 'top_knight', rate: 0.02 }, { itemId: 'bottom_armor', rate: 0.018 }, { itemId: 'weapon_sword_aura', rate: 0.008 }]
  },
  boss_dragon: {
    id: 'boss_dragon', name: '심연의 흑룡', hp: 800, atk: 45, def: 15, spd: 55, exp: 500, gold: 300,
    pattern: 'boss', size: 56, color: '#111827',
    drops: [{ itemId: 'dragon_scale', rate: 0.5 }, { itemId: 'flame_blade', rate: 0.3 }, { itemId: 'swift_boots', rate: 0.2 }, { itemId: 'head_crown', rate: 0.12 }, { itemId: 'head_halo', rate: 0.06 }, { itemId: 'acc_wings', rate: 0.08 }, { itemId: 'weapon_staff_gold', rate: 0.1 }, { itemId: 'top_mage', rate: 0.15 }]
  },
};

export const SKILLS = {
  slash: { id: 'slash', name: '베기', key: 'Q', mp: 0, cd: 600, dmg: 1.2, range: 60, desc: '전방 베기', unlockLv: 1, icon: '⚔️' },
  fireball: { id: 'fireball', name: '화염구', key: 'W', mp: 15, cd: 2500, dmg: 2.0, range: 320, projSpeed: 320, desc: '화염구 발사', unlockLv: 2, icon: '🔥' },
  heal: { id: 'heal', name: '치유', key: 'E', mp: 20, cd: 8000, heal: 60, desc: '체력 회복', unlockLv: 3, icon: '💚' },
  dash: { id: 'dash', name: '돌진', key: 'R', mp: 10, cd: 4000, dashDist: 140, desc: '빠르게 돌진', unlockLv: 5, icon: '💨' },
  meteor: { id: 'meteor', name: '메테오', key: 'T', mp: 40, cd: 12000, dmg: 3.5, range: 200, aoe: 90, desc: '광역 메테오', unlockLv: 8, icon: '☄️' },
};

export const DUNGEONS = {
  forest: { id: 'forest', name: '어둠숲 입구', reqLv: 1, monsters: ['slime', 'goblin'], boss: null, bg: '#0f2a1a', desc: '초보자용 숲' },
  cave: { id: 'cave', name: '해골 동굴', reqLv: 3, monsters: ['goblin', 'skeleton'], boss: null, bg: '#1c1a2e', desc: '해골이 득실한 동굴' },
  orc_camp: { id: 'orc_camp', name: '오크 야영지', reqLv: 6, monsters: ['orc', 'goblin', 'skeleton'], boss: null, bg: '#2a1a0f', desc: '오크들의 근거지' },
  dragon_lair: { id: 'dragon_lair', name: '흑룡의 둥지', reqLv: 10, monsters: ['orc', 'skeleton'], boss: 'boss_dragon', bg: '#0f0a0a', desc: '전설의 흑룡이 잠든 곳' },
};

export function getExpForLevel(lv) {
  // exponential curve
  return Math.floor(80 * Math.pow(1.35, lv - 1));
}

export function rollDrops(monsterId) {
  const m = MONSTERS[monsterId];
  if (!m) return [];
  const drops = [];
  for (const d of m.drops) {
    if (Math.random() < d.rate) drops.push(d.itemId);
  }
  return drops;
}

export function calcStats(base, equipment, avatarEquipped) {
  // base: {str, agi, int, hp, mp, atk, def}
  const total = { ...base };
  const addStats = (stats) => {
    if (!stats) return;
    for (const [k, v] of Object.entries(stats)) total[k] = (total[k] || 0) + v;
  };
  for (const itemId of Object.values(equipment || {})) {
    if (!itemId) continue;
    const it = ITEMS[itemId];
    if (it) addStats(it.stats);
  }
  for (const avId of Object.values(avatarEquipped || {})) {
    if (!avId) continue;
    const av = AVATARS.all.find(a => a.id === avId);
    if (av?.stats) addStats(av.stats);
  }
  // derived: atk from str, def from agi etc
  total.atk = (total.atk || 0) + Math.floor((total.str || 0) * 1.5);
  total.def = (total.def || 0) + Math.floor((total.agi || 0) * 0.5);
  total.maxHp = 100 + (total.str || 0) * 8 + (total.hp || 0);
  total.maxMp = 50 + (total.int || 0) * 6 + (total.mp || 0);
  total.spd = 120 + (total.agi || 0) * 2 + (total.spd || 0);
  return total;
}
