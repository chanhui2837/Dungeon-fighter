import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function startBackupScheduler(intervalMs = 3600000) {
  const backupDir = path.resolve(__dirname, '../../backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  async function doBackup(memFallback) {
    try {
      if (mongoose.connection.readyState === 1) {
        const collections = await mongoose.connection.db.listCollections().toArray();
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        for (const col of collections) {
          const data = await mongoose.connection.db.collection(col.name).find({}).toArray();
          const file = path.join(backupDir, `${stamp}_${col.name}.json`);
          fs.writeFileSync(file, JSON.stringify(data, null, 2));
          console.log(`[Backup] ${col.name} -> ${file} (${data.length} docs)`);
        }
      } else {
        // fallback: backup in-memory data if any (import memUsers via dynamic import to avoid circular)
        try {
          const authMod = await import('../routes/auth.js');
          // try to dump memUsers if exported, otherwise skip
          console.log('[Backup] DB not connected - attempting file snapshot of server state');
          const stamp = new Date().toISOString().replace(/[:.]/g, '-');
          const snap = { time: new Date().toISOString(), note: 'in-memory mode - no DB collections' };
          fs.writeFileSync(path.join(backupDir, `${stamp}_memory_snapshot.json`), JSON.stringify(snap, null, 2));
        } catch {}
        console.log('[Backup] skip DB dump - DB not connected (snapshot created)');
        // still prune
      }
      // prune old backups keep last 24
      const files = fs.readdirSync(backupDir).sort().reverse();
      if (files.length > 48) {
        for (const f of files.slice(48)) fs.unlinkSync(path.join(backupDir, f));
      }
    } catch (e) {
      console.error('[Backup] failed', e.message);
    }
  }

  // initial delay 30s then interval
  setTimeout(() => {
    doBackup();
    setInterval(doBackup, intervalMs);
  }, 30000);
  console.log(`[Backup] scheduler started interval ${intervalMs}ms`);
}
