import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server as IOServer } from 'socket.io';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import gameRoutes from './routes/game.js';
import { initSocket } from './socket/index.js';
import { startBackupScheduler } from './utils/backup.js';

const PORT = process.env.PORT || 3000;
// Render에서는 CLIENT_URL을 직접 지정하거나 비워두면 동일 오리진 허용
const CLIENT_URL = process.env.CLIENT_URL || '';
// onrender.com 서브도메인 및 localhost 모두 허용하는 동적 CORS
const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
].filter(Boolean);
function corsOrigin(origin, cb){
  if(!origin) return cb(null, true); // same-origin / curl / healthcheck
  if(allowedOrigins.includes(origin)) return cb(null, true);
  // Render static/동적 도메인 허용: *.onrender.com
  if(/^https:\/\/.*\.onrender\.com$/.test(origin)) return cb(null, true);
  // 프로덕션에서 CLIENT_URL 미설정 시 동일 오리진은 이미 !origin 으로 처리, 그 외는 허용 (통합 배포)
  if(process.env.NODE_ENV==='production' && !CLIENT_URL) return cb(null, true);
  return cb(null, false);
}

const app = express();
// Render는 프록시 뒤에 있으므로 trust proxy 필요 (rate-limit, ip)
app.set('trust proxy', 1);
app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false }));
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// rate limit auth - Render 프록시 대응 위해 keyGenerator에 trust proxy 고려
const authLimiter = rateLimit({
  windowMs: 60*1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: '요청이 너무 많습니다. 잠시 후 다시 시도하세요.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

app.get('/api/health', (req,res)=> res.json({ ok:true, time:new Date().toISOString(), uptime: process.uptime(), db: process.env.MONGODB_URI ? 'configured' : 'memory' }));
app.get('/api/ready', (req,res)=> res.json({ ok:true, ready:true }));
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

// serve static if client built exists - Render 통합 배포 대응: 여러 경로 탐색
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const possibleDistPaths = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), 'dist'),
];
let clientDist = possibleDistPaths.find(p=> fs.existsSync(p));
if (clientDist) {
  console.log(`[Server] Serving client from ${clientDist}`);
  app.use(express.static(clientDist, { maxAge: '1d', etag: true }));
  // SPA fallback - 반드시 api/socket.io 이후에 위치
  app.get('*', (req,res)=> {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return res.status(404).json({error:'not found'});
    res.sendFile(path.join(clientDist,'index.html'));
  });
} else {
  console.log('[Server] client/dist not found - API only mode. Paths checked:', possibleDistPaths.join(', '));
}

const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { origin: corsOrigin, methods:['GET','POST'], credentials:true },
  pingInterval: 2500,
  pingTimeout: 5000,
  transports: ['websocket','polling']
});

initSocket(io);

// Render에서는 MONGODB_URI가 없으면 메모리 모드로 동작하지만 Atlas 연결 시 재시도 로직 포함
const mongoUri = process.env.MONGODB_URI;
if(!mongoUri){
  console.warn('[DB] MONGODB_URI not set - Render 대시보드에서 반드시 설정하세요. 현재는 메모리 모드로 실행됩니다.');
}
await connectDB(mongoUri);
startBackupScheduler(Number(process.env.BACKUP_INTERVAL_MS)|| 3600000);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Dungeon Fighter listening on 0.0.0.0:${PORT} env=${process.env.NODE_ENV||'development'}`);
  console.log(`[Server] Health http://localhost:${PORT}/api/health  CORS allowed: ${CLIENT_URL || 'same-origin + *.onrender.com'}`);
});
// Graceful shutdown - Render SIGTERM 대응
process.on('SIGTERM', ()=> {
  console.log('[Server] SIGTERM received, closing...');
  server.close(()=> process.exit(0));
});
