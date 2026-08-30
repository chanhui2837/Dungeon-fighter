import express from 'express';
import { ITEMS, MONSTERS, SKILLS, DUNGEONS, AVATARS } from '../utils/gameData.js';
const router = express.Router();

router.get('/items', (req, res) => res.json({ items: ITEMS }));
router.get('/monsters', (req, res) => res.json({ monsters: MONSTERS }));
router.get('/skills', (req, res) => res.json({ skills: SKILLS }));
router.get('/dungeons', (req, res) => res.json({ dungeons: DUNGEONS }));
router.get('/avatars', (req, res) => res.json({ avatars: AVATARS }));

export default router;
