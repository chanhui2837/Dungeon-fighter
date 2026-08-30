import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken, authMiddleware } from '../middleware/auth.js';
import { isDBConnected } from '../config/db.js';
import { getExpForLevel } from '../utils/gameData.js';

// In-memory fallback when DB not connected (for demo / local without Mongo)
const memUsers = new Map();
let memIdSeq = 1;

async function findUserByUsername(username) {
  if (isDBConnected()) return User.findOne({ username });
  for (const u of memUsers.values()) if (u.username === username) return u;
  return null;
}
async function findUserById(id) {
  if (isDBConnected()) return User.findById(id);
  return memUsers.get(String(id)) || null;
}
async function findUserByEmail(email) {
  if (isDBConnected()) return User.findOne({ email });
  for (const u of memUsers.values()) if (u.email === email) return u;
  return null;
}

function memToSafe(u) {
  const { passwordHash, ...safe } = u;
  return safe;
}

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: '모든 필드를 입력하세요' });
    if (username.length < 3) return res.status(400).json({ error: '아이디는 3자 이상' });
    if (password.length < 6) return res.status(400).json({ error: '비밀번호는 6자 이상' });
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return res.status(400).json({ error: '아이디는 영문/숫자/_ 만 가능' });

    if (await findUserByUsername(username)) return res.status(409).json({ error: '이미 존재하는 아이디입니다' });
    if (await findUserByEmail(email)) return res.status(409).json({ error: '이미 존재하는 이메일입니다' });

    const passwordHash = await bcrypt.hash(password, 12);

    if (isDBConnected()) {
      const user = await User.create({ username, email, passwordHash });
      const token = signToken({ id: String(user._id), username });
      return res.status(201).json({ token, user: user.toSafeJSON() });
    } else {
      const id = String(memIdSeq++);
      const user = {
        _id: id, id,
        username, email, passwordHash,
        character: {
          name: username, level: 1, exp: 0, gold: 150, statPoints: 0,
          stats: { str: 5, agi: 5, int: 5 }, hp: 100, mp: 50,
          equipment: { weapon: null, top: null, bottom: null, accessory1: null, accessory2: null },
          avatar: { head: 'head_none', top: 'top_none', bottom: 'bottom_none', weapon: 'weapon_none', accessory: 'acc_none' },
          skills: ['slash'], unlockedSkills: ['slash']
        },
        inventory: [{ itemId: 'hp_potion', count: 3 }, { itemId: 'rusty_sword', count: 1 }],
        avatarInventory: ['head_none','top_none','bottom_none','weapon_none','acc_none','head_hood'],
        progress: { currentDungeon: 'forest', clearedDungeons: [], playTime: 0, monstersKilled: 0 },
        createdAt: new Date(), updatedAt: new Date()
      };
      memUsers.set(id, user);
      const token = signToken({ id, username });
      return res.status(201).json({ token, user: memToSafe(user) });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '회원가입 실패' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: '아이디와 비밀번호를 입력하세요' });
    const user = await findUserByUsername(username);
    if (!user) return res.status(401).json({ error: '아이디 또는 비밀번호가 틀렸습니다' });
    const hash = user.passwordHash;
    const ok = await bcrypt.compare(password, hash);
    if (!ok) return res.status(401).json({ error: '아이디 또는 비밀번호가 틀렸습니다' });

    // update lastLogin
    if (isDBConnected()) { user.lastLogin = new Date(); await user.save(); }

    const id = String(user._id || user.id);
    const token = signToken({ id, username: user.username });
    const safe = isDBConnected() ? user.toSafeJSON() : memToSafe(user);
    res.json({ token, user: safe });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '로그인 실패' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  const user = await findUserById(req.userId);
  if (!user) return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
  const safe = isDBConnected() ? user.toSafeJSON() : memToSafe(user);
  res.json({ user: safe });
});

// PUT /api/auth/save  - sync all character/inventory/progress
router.put('/save', authMiddleware, async (req, res) => {
  try {
    const { character, inventory, avatarInventory, progress } = req.body;
    // anti-cheat: basic validation + item existence check
    const { ITEMS, AVATARS } = await import('../utils/gameData.js');
    const validItemIds = new Set(Object.keys(ITEMS));
    const validAvatarIds = new Set(AVATARS.all.map(a=>a.id));
    if (character) {
      if (character.level > 100 || character.level < 1) return res.status(400).json({ error: '비정상 레벨' });
      if (character.gold != null && (character.gold < 0 || character.gold > 9999999)) return res.status(400).json({ error: '비정상 골드' });
      // exp validation: cannot exceed needed for next level by huge margin
      const need = getExpForLevel(character.level);
      if (character.exp < 0 || character.exp > need * 3) return res.status(400).json({ error: '비정상 경험치' });
      if (character.statPoints != null && (character.statPoints < 0 || character.statPoints > 500)) return res.status(400).json({ error: '비정상 스탯 포인트' });
      if (character.stats){
        for(const v of Object.values(character.stats)){
          if(typeof v !== 'number' || v < 1 || v > 999) return res.status(400).json({ error: '비정상 스탯 값' });
        }
      }
      // equipment must reference valid items or null
      if(character.equipment){
        for(const [slot, itemId] of Object.entries(character.equipment)){
          if(itemId !== null && !validItemIds.has(itemId)) return res.status(400).json({ error: `존재하지 않는 장비 ${itemId}` });
        }
      }
      // avatar must reference valid avatar ids
      if(character.avatar){
        for(const [slot, avId] of Object.entries(character.avatar)){
          if(avId && !validAvatarIds.has(avId)) return res.status(400).json({ error: `존재하지 않는 아바타 ${avId}` });
        }
      }
    }

    if (isDBConnected()) {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ error: '사용자 없음' });
      if (character) {
        // only allow certain fields to be overwritten
        const allowed = ['level','exp','gold','statPoints','stats','hp','mp','equipment','avatar','skills','unlockedSkills','name'];
        for (const k of allowed) if (character[k] !== undefined) user.character[k] = character[k];
      }
      if (Array.isArray(inventory)) {
        if (inventory.length > 100) return res.status(400).json({ error: '인벤토리 초과' });
        for(const entry of inventory){
          if(!entry.itemId || !validItemIds.has(entry.itemId)) return res.status(400).json({ error: `존재하지 않는 아이템 ${entry.itemId}` });
          if(typeof entry.count !== 'number' || entry.count < 1 || entry.count > 9999) return res.status(400).json({ error: '비정상 아이템 수량' });
        }
        user.inventory = inventory;
      }
      if (Array.isArray(avatarInventory)){
        // only allow valid avatar ids and dedupe
        const filtered = [...new Set(avatarInventory.filter(id=> validAvatarIds.has(id)))].slice(0, 100);
        user.avatarInventory = filtered;
      }
      if (progress) {
        // only allow known progress fields
        const allowedProg = ['currentDungeon','clearedDungeons','playTime','monstersKilled'];
        for(const k of Object.keys(progress)) if(!allowedProg.includes(k)) delete progress[k];
        Object.assign(user.progress, progress);
      }
      await user.save();
      return res.json({ ok: true, user: user.toSafeJSON() });
    } else {
      const user = memUsers.get(String(req.userId));
      if (!user) return res.status(404).json({ error: '사용자 없음' });
      if (character) Object.assign(user.character, character);
      if (Array.isArray(inventory)){
        for(const entry of inventory){
          if(!validItemIds.has(entry.itemId)) return res.status(400).json({ error: `존재하지 않는 아이템 ${entry.itemId}` });
        }
        user.inventory = inventory;
      }
      if (Array.isArray(avatarInventory)) user.avatarInventory = [...new Set(avatarInventory.filter(id=> validAvatarIds.has(id)))].slice(0,100);
      if (progress) Object.assign(user.progress, progress);
      user.updatedAt = new Date();
      return res.json({ ok: true, user: memToSafe(user) });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '저장 실패' });
  }
});

// PUT /api/auth/password
router.put('/password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: '새 비밀번호는 6자 이상' });
  const user = await findUserById(req.userId);
  if (!user) return res.status(404).json({ error: '사용자 없음' });
  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return res.status(401).json({ error: '현재 비밀번호가 틀립니다' });
  const hash = await bcrypt.hash(newPassword, 12);
  if (isDBConnected()) { user.passwordHash = hash; await user.save(); }
  else { user.passwordHash = hash; }
  res.json({ ok: true });
});

// DELETE /api/auth/withdraw
router.delete('/withdraw', authMiddleware, async (req, res) => {
  const { password } = req.body;
  const user = await findUserById(req.userId);
  if (!user) return res.status(404).json({ error: '사용자 없음' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: '비밀번호가 틀립니다' });
  if (isDBConnected()) await User.findByIdAndDelete(req.userId);
  else memUsers.delete(String(req.userId));
  res.json({ ok: true });
});

// GET /api/auth/leaderboard (public)
router.get('/leaderboard', async (req, res) => {
  try {
    if (isDBConnected()) {
      const top = await User.find().sort({ 'character.level': -1, 'character.exp': -1 }).limit(20).select('username character.level character.exp progress.monstersKilled');
      return res.json({ leaderboard: top.map(u => ({ username: u.username, level: u.character.level, exp: u.character.exp, kills: u.progress.monstersKilled })) });
    } else {
      const arr = [...memUsers.values()].sort((a,b)=> b.character.level - a.character.level || b.character.exp - a.character.exp).slice(0,20)
        .map(u=>({ username: u.username, level: u.character.level, exp: u.character.exp, kills: u.progress.monstersKilled }));
      return res.json({ leaderboard: arr });
    }
  } catch (e) { res.status(500).json({ error: '랭킹 조회 실패' }); }
});

export default router;
