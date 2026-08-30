import { io as Client } from 'socket.io-client';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const NUM_CLIENTS = 20;
const TEST_DURATION_MS = 15000;

// need a token - we will create test accounts via REST first
async function createToken(username) {
  const res = await fetch(`${SERVER_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email: `${username}@test.local`, password: 'test1234' })
  });
  let data = await res.json();
  if (!res.ok && data.error?.includes('이미')) {
    const login = await fetch(`${SERVER_URL}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: 'test1234' })
    });
    data = await login.json();
  }
  return data.token;
}

async function run() {
  console.log(`[LoadTest] Server ${SERVER_URL} with ${NUM_CLIENTS} clients`);

  const tokens = [];
  for (let i = 0; i < NUM_CLIENTS; i++) {
    const t = await createToken(`loadtest_${i}_${Date.now() % 100000}`);
    tokens.push(t);
    if (!t) console.warn(`no token for ${i}`);
  }

  const clients = [];
  const latencies = [];
  let moves = 0, syncErrors = 0, connects = 0;

  for (let i = 0; i < NUM_CLIENTS; i++) {
    const token = tokens[i];
    if (!token) continue;
    const socket = Client(SERVER_URL, { auth: { token }, transports: ['websocket'] });
    clients.push(socket);

    socket.on('connect', () => {
      connects++;
      socket.emit('player:ready', { character: { level: 5, stats: { str:5, agi:10, int:5 }, hp: 100, avatar:{} }, dungeonId: 'forest' });
      // simulate movement every 80ms
      const interval = setInterval(() => {
        const before = Date.now();
        socket.timeout(1000).emit('ping:check', (err, res) => {
          if (!err && res) latencies.push(Date.now() - before);
        });
        const x = 300 + Math.random()*800, y = 300 + Math.random()*600;
        socket.volatile.emit('player:move', { x, y, vx: (Math.random()-0.5)*100, vy: (Math.random()-0.5)*100, facing: Math.random()>0.5?1:-1 });
        moves++;
        // occasional attack
        if (Math.random() < 0.08) socket.emit('player:attack', {});
      }, 80 + Math.random()*40);
      socket._interval = interval;
    });
    socket.on('player:correction', () => syncErrors++);
    socket.on('connect_error', (e) => console.error(`client ${i} error`, e.message));
  }

  setTimeout(() => {
    for (const c of clients) { clearInterval(c._interval); c.disconnect(); }
    const avgLatency = latencies.length ? latencies.reduce((a,b)=>a+b,0)/latencies.length : 0;
    const p95 = latencies.length ? [...latencies].sort((a,b)=>a-b)[Math.floor(latencies.length*0.95)] : 0;
    console.log('\n=== LOAD TEST RESULT ===');
    console.log(`Clients connected: ${connects}/${NUM_CLIENTS}`);
    console.log(`Messages sent: ${moves}`);
    console.log(`Avg latency: ${avgLatency.toFixed(1)}ms`);
    console.log(`P95 latency: ${p95}ms`);
    console.log(`Sync corrections (anti-cheat): ${syncErrors}`);
    console.log(`Latency <100ms ratio: ${(latencies.filter(x=>x<100).length / Math.max(1,latencies.length) *100).toFixed(1)}%`);
    const pass = avgLatency < 100 && connects >= NUM_CLIENTS * 0.9;
    console.log(pass ? '✅ PASS - 동기화 안정적' : '❌ FAIL - 지연 또는 연결 실패');
    process.exit(pass ? 0 : 1);
  }, TEST_DURATION_MS);
}

run().catch(e=>{ console.error(e); process.exit(1) });
