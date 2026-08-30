import mongoose from 'mongoose';

const MAX_RETRIES = 5;

export async function connectDB(uri) {
  if (!uri) {
    console.warn('[DB] MONGODB_URI not set - running in memory/no-DB mode (data will not persist across restarts)');
    console.warn('[DB] Render 배포 시 Atlas URI를 반드시 설정하세요: mongodb+srv://user:pass@cluster.mongodb.net/dungeon_fighter?retryWrites=true&w=majority');
    return null;
  }
  // Atlas 권장 옵션 + 타임아웃
  const opts = {
    autoIndex: true,
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    retryWrites: true,
  };
  mongoose.set('strictQuery', true);

  // 연결 이벤트 로깅 (Render 로그에서 확인 가능)
  mongoose.connection.on('connected', ()=> console.log('[DB] Mongoose connected'));
  mongoose.connection.on('disconnected', ()=> console.warn('[DB] Mongoose disconnected'));
  mongoose.connection.on('error', (err)=> console.error('[DB] Mongoose error', err.message));
  mongoose.connection.on('reconnected', ()=> console.log('[DB] Mongoose reconnected'));

  for(let attempt=1; attempt<=MAX_RETRIES; attempt++){
    try {
      await mongoose.connect(uri, opts);
      console.log(`[DB] MongoDB connected: ${mongoose.connection.host} (attempt ${attempt}) db=${mongoose.connection.name}`);
      return mongoose.connection;
    } catch (e) {
      console.error(`[DB] Mongo connection failed (attempt ${attempt}/${MAX_RETRIES}):`, e.message);
      if(attempt===MAX_RETRIES){
        console.warn('[DB] All retries failed - Continuing without DB (in-memory fallback)');
        console.warn('[DB] Atlas IP whitelist에 0.0.0.0/0 또는 Render IP를 추가했는지 확인하세요');
        return null;
      }
      const delay = Math.min(3000*attempt, 10000);
      console.log(`[DB] Retrying in ${delay}ms...`);
      await new Promise(r=> setTimeout(r, delay));
    }
  }
}

export function isDBConnected() {
  return mongoose.connection.readyState === 1;
}
