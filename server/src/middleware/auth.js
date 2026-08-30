import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me_please_32chars';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch { return null; }
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: '인증 토큰이 필요합니다' });
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: '토큰이 유효하지 않습니다' });
  req.userId = decoded.id;
  req.username = decoded.username;
  next();
}

export function socketAuth(token) {
  if (!token) return null;
  return verifyToken(token);
}
