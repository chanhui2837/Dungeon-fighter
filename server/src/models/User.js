import mongoose from 'mongoose';

const InventoryItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  count: { type: Number, default: 1 },
}, { _id: false });

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 20 },
  email: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
  // Character data
  character: {
    name: { type: String, default: function() { return this.username } },
    level: { type: Number, default: 1 },
    exp: { type: Number, default: 0 },
    gold: { type: Number, default: 100 },
    statPoints: { type: Number, default: 0 },
    stats: {
      str: { type: Number, default: 5 },
      agi: { type: Number, default: 5 },
      int: { type: Number, default: 5 },
    },
    hp: { type: Number, default: 100 },
    mp: { type: Number, default: 50 },
    // equipment slots: weapon/top/bottom/accessory1/accessory2
    equipment: {
      weapon: { type: String, default: null },
      top: { type: String, default: null },
      bottom: { type: String, default: null },
      accessory1: { type: String, default: null },
      accessory2: { type: String, default: null },
    },
    avatar: {
      head: { type: String, default: 'head_none' },
      top: { type: String, default: 'top_none' },
      bottom: { type: String, default: 'bottom_none' },
      weapon: { type: String, default: 'weapon_none' },
      accessory: { type: String, default: 'acc_none' },
    },
    skills: {
      type: [String],
      default: []
    },
    unlockedSkills: { type: [String], default: [] }
  },
  // 시작은 기본 검 + 기본 갑옷만 지급 (포션/스킬 없음)
  inventory: { type: [InventoryItemSchema], default: () => [{ itemId: 'rusty_sword', count: 1 }, { itemId: 'leather_armor', count: 1 }] },
  avatarInventory: { type: [String], default: () => ['head_none', 'top_none', 'bottom_none', 'weapon_none', 'acc_none'] },
  progress: {
    currentDungeon: { type: String, default: 'forest' },
    clearedDungeons: { type: [String], default: [] },
    playTime: { type: Number, default: 0 },
    monstersKilled: { type: Number, default: 0 },
  },
  settings: { type: Object, default: {} },
  lastLogin: { type: Date, default: Date.now },
}, { timestamps: true });

UserSchema.methods.toSafeJSON = function() {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
