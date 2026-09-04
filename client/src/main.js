import { api, getToken, setToken, getServerUrl } from './utils/api.js';
import { state, gameData, loadSettings, saveSettings, defaultSettings } from './utils/store.js';
import { Game } from './game/Game.js';
import { audio } from './utils/audio.js';
import { io } from 'socket.io-client';

// DOM
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

// Screens
const authScreen = $('#authScreen'), lobbyScreen = $('#lobbyScreen'), gameScreen = $('#gameScreen');

// Toast
function toast(msg, type='ok'){
  const wrap = $('#toastWrap');
  const el = document.createElement('div');
  el.className=`toast ${type}`;
  el.textContent=msg;
  wrap.appendChild(el);
  setTimeout(()=> { el.style.opacity='0'; el.style.transform='translateY(6px)'; setTimeout(()=>el.remove(),300); }, 2600);
}

// Auth UI
const loginForm=$('#loginForm'), signupForm=$('#signupForm'), authMsg=$('#authMsg');
$$('.tab-btn').forEach(btn=>{
  if(btn.closest('.auth-card')) btn.addEventListener('click', ()=>{
    $$('.auth-card .tab-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const tab=btn.dataset.tab;
    loginForm.classList.toggle('active', tab==='login');
    signupForm.classList.toggle('active', tab==='signup');
  });
});

async function checkServer(){
  const el=$('#serverStatus');
  try{
    const h = await api.health();
    el.textContent=`● 서버 정상 • ${new Date(h.time).toLocaleTimeString()}`;
    el.classList.add('ok');
  }catch{
    el.textContent='● 서버 연결 실패 - 로컬 모드로 동작 (저장 제한)';
    el.style.color='#f87171';
  }
}
checkServer();

function showScreen(name){
  authScreen.classList.toggle('active', name==='auth');
  lobbyScreen.classList.toggle('active', name==='lobby');
  gameScreen.classList.toggle('active', name==='game');
  if(name==='game') setTimeout(()=> game?.renderer.resize(), 80);
}

function validateAuthForm(){
  // helper
}

// Signup
signupForm.addEventListener('submit', async e=>{
  e.preventDefault();
  const username=$('#signupId').value.trim();
  const email=$('#signupEmail').value.trim();
  const pw=$('#signupPw').value;
  const pw2=$('#signupPw2').value;
  if(pw!==pw2) return showAuthMsg('비밀번호가 일치하지 않습니다','err');
  if(pw.length<6) return showAuthMsg('비밀번호는 6자 이상','err');
  try{
    showAuthMsg('가입 중...','');
    const { token, user } = await api.signup({ username, email, password: pw });
    setToken(token);
    state.user=user; state.character=user.character; state.inventory=user.inventory; state.avatarInventory=user.avatarInventory; state.progress=user.progress;
    showAuthMsg('가입 성공! 자동 로그인','ok');
    toast('환영합니다, '+username+'님!');
    await afterLogin();
  }catch(err){ showAuthMsg(err.message,'err'); }
});
loginForm.addEventListener('submit', async e=>{
  e.preventDefault();
  const username=$('#loginId').value.trim();
  const password=$('#loginPw').value;
  try{
    showAuthMsg('로그인 중...','');
    const { token, user } = await api.login({ username, password });
    setToken(token);
    state.user=user; state.character=user.character; state.inventory=user.inventory; state.avatarInventory=user.avatarInventory; state.progress=user.progress;
    showAuthMsg('로그인 성공','ok');
    toast(`다시 오신 걸 환영합니다, ${username}님`);
    await afterLogin();
  }catch(err){ showAuthMsg(err.message,'err'); }
});
function showAuthMsg(m, type){ authMsg.textContent=m; authMsg.className='auth-msg '+type; }

// Auto login if token exists
(async()=>{
  const t=getToken();
  if(t){
    try{
      const { user } = await api.me();
      state.user=user; state.character=user.character; state.inventory=user.inventory; state.avatarInventory=user.avatarInventory; state.progress=user.progress;
      await afterLogin();
    }catch{
      setToken(null);
      showScreen('auth');
    }
  } else showScreen('auth');
})();

// Logout
function logout(){
  setToken(null);
  state.user=null;
  if(socket) { socket.disconnect(); socket=null; }
  if(game) game.stop();
  showScreen('auth');
  toast('로그아웃 되었습니다');
}
$('#btnLogout').addEventListener('click', logout);
$('#btnLogout2').addEventListener('click', logout);

// Load game data
async function loadGameData(){
  try{
    const [items, dungeonsRes, skillsRes] = await Promise.all([
      api.items().catch(()=>({items:{}})),
      fetch(`${getServerUrl()}/api/game/dungeons`).then(r=>r.json()).catch(()=>({dungeons:{}})),
      fetch(`${getServerUrl()}/api/game/skills`).then(r=>r.json()).catch(()=>({skills:{}})),
    ]);
    // fetch avatars too
    const av = await fetch(`${getServerUrl()}/api/game/avatars`).then(r=>r.json()).catch(()=>({avatars:{}}));
    // also fetch items if needed
    gameData.items = items.items || (await fetch(`${getServerUrl()}/api/game/items`).then(r=>r.json()).then(j=>j.items).catch(()=>({})));
    // fallback static if server not reachable
    if(!Object.keys(gameData.items).length){
      gameData.items = {
        rusty_sword:{id:'rusty_sword',name:'녹슨 검',type:'weapon',slot:'weapon',rarity:'common',stats:{atk:5}},
        iron_sword:{id:'iron_sword',name:'강철 검',type:'weapon',slot:'weapon',rarity:'uncommon',stats:{atk:12}},
        flame_blade:{id:'flame_blade',name:'화염 대검',type:'weapon',slot:'weapon',rarity:'rare',stats:{atk:25}},
        leather_armor:{id:'leather_armor',name:'가죽 갑옷',type:'armor',slot:'top',rarity:'common',stats:{def:4}},
        hp_potion:{id:'hp_potion',name:'HP 포션',type:'consumable',rarity:'common',stats:{heal:50}},
        mp_potion:{id:'mp_potion',name:'MP 포션',type:'consumable',rarity:'common',stats:{mpHeal:30}},
      };
    }
    gameData.dungeons = dungeonsRes.dungeons || {
      forest:{id:'forest',name:'어둠숲 입구',reqLv:1,monsters:['slime','goblin'],bg:'#0f2a1a',desc:'초보자용 숲'},
      cave:{id:'cave',name:'해골 동굴',reqLv:3,monsters:['goblin','skeleton'],bg:'#1c1a2e',desc:'해골 동굴'},
      orc_camp:{id:'orc_camp',name:'오크 야영지',reqLv:6,monsters:['orc'],bg:'#2a1a0f',desc:'오크 근거지'},
      dragon_lair:{id:'dragon_lair',name:'흑룡의 둥지',reqLv:10,monsters:['orc'],boss:'boss_dragon',bg:'#0f0a0a',desc:'전설의 둥지'},
    };
    gameData.skills = skillsRes.skills || {
      slash:{id:'slash',name:'베기',key:'Q',mp:0,cd:600,dmg:1.2,unlockLv:1,icon:'⚔️',desc:'전방 베기'},
      fireball:{id:'fireball',name:'화염구',key:'W',mp:15,cd:2500,dmg:2.0,unlockLv:2,icon:'🔥',desc:'화염구 발사'},
      heal:{id:'heal',name:'치유',key:'E',mp:20,cd:8000,heal:60,unlockLv:3,icon:'💚',desc:'체력 회복'},
      dash:{id:'dash',name:'돌진',key:'R',mp:10,cd:4000,dashDist:140,unlockLv:5,icon:'💨',desc:'돌진'},
      meteor:{id:'meteor',name:'메테오',key:'T',mp:40,cd:12000,dmg:3.5,unlockLv:8,icon:'☄️',desc:'광역 메테오'},
    };
    gameData.avatars = av.avatars || {
      head:[{id:'head_none',name:'없음',slot:'head'},{id:'head_crown',name:'황금 왕관',slot:'head',icon:'👑'}],
      top:[{id:'top_none',name:'기본',slot:'top'}],
      bottom:[{id:'bottom_none',name:'기본',slot:'bottom'}],
      weapon:[{id:'weapon_none',name:'맨손',slot:'weapon'}],
      accessory:[{id:'acc_none',name:'없음',slot:'accessory'}],
      get all(){ return [...this.head,...this.top,...this.bottom,...this.weapon,...this.accessory]; }
    };
  }catch(e){ console.warn('gameData load fail',e); }
}

// After login: load data, render lobby, connect socket not yet
let socket=null;
let game=null;

async function afterLogin(){
  await loadGameData();
  renderLobby();
  showScreen('lobby');
  fetchLeaderboard();
  // preview loop
  startPreview();
  // auto save interval
  startAutoSave();
  // ensure socket connected for chat/matching (fix: 채팅이 소켓 미연결로 전송 안 되던 버그)
  connectSocket();
}

function getExpNeed(lv){
  return Math.floor(80 * Math.pow(1.35, lv-1));
}

// Lobby renders
function renderLobby(){
  if(!state.character) return;
  $('#briefName').textContent=state.user.username;
  $('#briefLv').textContent=`Lv.${state.character.level}`;
  const need=getExpNeed(state.character.level);
  const pct= Math.min(100, (state.character.exp/need)*100);
  $('#briefExp').style.width=pct+'%';

  renderDungeonList();
  renderSkills();
  renderStats();
  renderSkillBar(); // for game bottom but also preview?
}

function renderDungeonList(){
  const wrap=$('#dungeonList');
  wrap.innerHTML='';
  for(const [id,d] of Object.entries(gameData.dungeons)){
    const el=document.createElement('div');
    el.className='d-card'+(state.selectedDungeon===id?' active':'');
    el.innerHTML=`
      <h4>${d.name}</h4>
      <p>${d.desc||''}</p>
      <span class="req">요구 Lv.${d.reqLv}</span>
      ${d.boss?'<span class="boss">BOSS</span>':''}
    `;
    el.addEventListener('click', ()=>{
      if(state.character.level < d.reqLv){ toast(`Lv.${d.reqLv} 이상 입장 가능`,'err'); return; }
      state.selectedDungeon=id;
      $$('.d-card').forEach(c=>c.classList.remove('active'));
      el.classList.add('active');
      $('#gameDungeonName').textContent=d.name;
      // also update preview bg
      renderPreviewBG(d.bg);
    });
    wrap.appendChild(el);
  }
  const sel=gameData.dungeons[state.selectedDungeon];
  if(sel) renderPreviewBG(sel.bg);
}
let previewBg='#0f2a1a';
function renderPreviewBG(bg){ previewBg=bg; }

function renderStats(){
  const c=state.character;
  if(!c) return;
  const calc = calcTotalStats();
  const grid=$('#statGrid');
  grid.innerHTML=`
    <div class="stat-item"><b>${c.level}</b><span>LEVEL</span></div>
    <div class="stat-item"><b>${c.gold}</b><span>GOLD</span></div>
    <div class="stat-item"><b>${calc.atk}</b><span>ATK</span></div>
    <div class="stat-item"><b>${calc.def}</b><span>DEF</span></div>
    <div class="stat-item"><b>${calc.maxHp}</b><span>HP</span></div>
    <div class="stat-item"><b>${calc.spd||120}</b><span>SPD</span></div>
  `;
  $('#statPointsInfo').textContent=`스탯 포인트: ${c.statPoints||0}`;
  // inv stats
  const invStats=$('#invStats');
  if(invStats) invStats.innerHTML=`<div class="muted">총합 ATK ${calc.atk} · DEF ${calc.def} · HP ${calc.maxHp}</div>`;
}

function calcTotalStats(){
  const base = state.character.stats || {str:5,agi:5,int:5};
  let atk=10, def=2, hp=100, mp=50, spd=120, str=base.str||5, agi=base.agi||5, int=base.int||5;
  // equipment bonuses
  const equip=state.character.equipment||{};
  for(const itemId of Object.values(equip)){
    if(!itemId) continue;
    const it=gameData.items[itemId];
    if(it?.stats){ atk+=it.stats.atk||0; def+=it.stats.def||0; hp+=it.stats.hp||0; mp+=it.stats.mp||0; spd+=it.stats.spd||0; str+=it.stats.str||0; agi+=it.stats.agi||0; int+=it.stats.int||0; }
  }
  // avatar bonuses
  const av=state.character.avatar||{};
  const allAv = gameData.avatars.all || [];
  for(const aid of Object.values(av)){
    const a=allAv.find(x=>x.id===aid);
    if(a?.stats){ atk+=a.stats.atk||0; def+=a.stats.def||0; hp+=a.stats.hp||0; mp+=a.stats.mp||0; spd+=a.stats.spd||0; }
  }
  atk += Math.floor(str*1.5);
  def += Math.floor(agi*0.5);
  hp += str*8;
  mp += int*6;
  spd += agi*2;
  return { atk, def, maxHp:hp, maxMp:mp, spd, str, agi, int };
}

function renderSkills(){
  const wrap=$('#skillList');
  wrap.innerHTML='';
  for(const [id,s] of Object.entries(gameData.skills)){
    const unlocked = (state.character.unlockedSkills||[]).includes(id) || state.character.level >= s.unlockLv;
    const el=document.createElement('div');
    el.className='skill-card'+(unlocked?'':' locked');
    el.innerHTML=`
      <h4>${s.icon||'✨'} ${s.name} <span style="margin-left:auto;font-size:11px;background:${unlocked?'#22c55e':'#475569'};color:#fff;padding:2px 6px;border-radius:999px">${s.key}</span></h4>
      <p>${s.desc}</p>
      <div class="meta"><span class="meta-tag">MP ${s.mp}</span><span class="meta-tag">CD ${(s.cd/1000).toFixed(1)}s</span><span class="meta-tag">Lv.${s.unlockLv}</span></div>
    `;
    wrap.appendChild(el);
  }
}

// Stat add
$$('[data-add]').forEach(btn=>{
  btn.addEventListener('click', async ()=>{
    const stat=btn.dataset.add;
    if((state.character.statPoints||0)<=0) return toast('스탯 포인트가 없습니다','err');
    state.character.stats[stat]=(state.character.stats[stat]||5)+1;
    state.character.statPoints--;
    renderStats();
    await saveToServer();
    toast(`${stat.toUpperCase()} +1`);
  });
});

// Preview canvas (lobby hero) - High Quality Chibi Hero
let previewAnim=null;
function startPreview(){
  const canvas=$('#previewCanvas');
  if(!canvas) return;
  const ctx=canvas.getContext('2d');
  if(previewAnim) cancelAnimationFrame(previewAnim);
  let t=0;
  function loop(){
    t+=0.015;
    const w=canvas.width, h=canvas.height;
    ctx.clearRect(0,0,w,h);
    // premium background: gradient + dungeon tint + subtle grid
    const bg = previewBg||'#0f2a1a';
    const g = ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0, bg); g.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    // vignette
    const vg = ctx.createRadialGradient(w/2,h/2,0,w/2,h/2, Math.max(w,h)*0.7);
    vg.addColorStop(0,'transparent'); vg.addColorStop(1,'rgba(0,0,0,0.5)');
    ctx.fillStyle=vg; ctx.fillRect(0,0,w,h);
    // grid
    ctx.strokeStyle='rgba(255,255,255,.05)'; ctx.lineWidth=1;
    for(let i=0;i<w;i+=36){ ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,h); ctx.stroke(); }
    for(let i=0;i<h;i+=36){ ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(w,i); ctx.stroke(); }
    // subtle floating runes
    ctx.fillStyle='rgba(245,158,11,.07)';
    for(let i=0;i<3;i++){
      const rx = 42 + i*97 + Math.sin(t*0.7+i)*6;
      const ry = 54 + i*61;
      ctx.beginPath(); ctx.arc(rx,ry, 18 + i*4, 0, Math.PI*2); ctx.fill();
    }
    const cx=w/2, cy=h/2 + Math.sin(t)*3.5;
    // shadow with blur
    ctx.fillStyle='rgba(0,0,0,.38)'; ctx.beginPath(); ctx.ellipse(cx, cy+54, 38, 11,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(cx, cy+54, 56, 16,0,0,Math.PI*2); ctx.fill();

    const avatar = state.character?.avatar || {};
    const topId = avatar.top || 'top_none';
    const headId = avatar.head || 'head_none';
    const weaponId = avatar.weapon || 'weapon_none';
    const accId = avatar.accessory || 'acc_none';
    const bottomId = avatar.bottom || 'bottom_none';

    // --- accessory behind (wings/cape) ---
    if(accId==='acc_wings'){
      ctx.save(); ctx.translate(cx,cy-6);
      // left wing gradient
      const wg = ctx.createLinearGradient(-22,-10, -6, 12);
      wg.addColorStop(0,'rgba(167,139,250,0.95)'); wg.addColorStop(1,'rgba(99,102,241,0.65)');
      ctx.fillStyle=wg;
      ctx.beginPath(); ctx.moveTo(-6,2); ctx.quadraticCurveTo(-26,-14, -30, -6); ctx.quadraticCurveTo(-32,8, -16,14); ctx.quadraticCurveTo(-10,6, -6,2); ctx.fill();
      // right wing
      const wg2 = ctx.createLinearGradient(6,2, 22,-10);
      wg2.addColorStop(0,'rgba(99,102,241,0.65)'); wg2.addColorStop(1,'rgba(167,139,250,0.95)');
      ctx.fillStyle=wg2;
      ctx.beginPath(); ctx.moveTo(6,2); ctx.quadraticCurveTo(26,-14, 30,-6); ctx.quadraticCurveTo(32,8, 16,14); ctx.quadraticCurveTo(10,6, 6,2); ctx.fill();
      // feather lines
      ctx.strokeStyle='rgba(255,255,255,.28)'; ctx.lineWidth=1;
      for(let i=0;i<3;i++){ ctx.beginPath(); ctx.moveTo(-14+i*3, -2+i*4); ctx.lineTo(-22+i*2, 6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(14-i*3, -2+i*4); ctx.lineTo(22-i*2, 6); ctx.stroke(); }
      ctx.restore();
    } else if(accId==='acc_cape'){
      const capeGrad = ctx.createLinearGradient(cx-22,cy-16, cx-8, cy+30);
      capeGrad.addColorStop(0,'#ef4444'); capeGrad.addColorStop(1,'#7f1d1d');
      ctx.fillStyle=capeGrad;
      ctx.beginPath(); ctx.moveTo(cx-18,cy-14); ctx.lineTo(cx-8,cy-14); ctx.lineTo(cx-12,cy+36); ctx.lineTo(cx-24,cy+32); ctx.closePath(); ctx.fill();
      ctx.fillStyle='rgba(0,0,0,.2)'; ctx.fillRect(cx-18,cy-14,3,46);
    }

    // --- legs / boots ---
    const bottomColor = bottomId==='bottom_armor' ? '#334155' : '#1e40af';
    // left leg
    ctx.fillStyle=bottomColor; 
    ctx.fillRect(cx-13, cy+16, 11, 22);
    ctx.fillStyle='rgba(255,255,255,.14)'; ctx.fillRect(cx-13, cy+16, 11, 4);
    // right leg
    ctx.fillStyle=bottomColor; ctx.fillRect(cx+2, cy+16, 11, 22);
    ctx.fillStyle='rgba(255,255,255,.14)'; ctx.fillRect(cx+2, cy+16, 11, 4);
    // boots
    ctx.fillStyle='#0f172a'; ctx.fillRect(cx-14, cy+36, 13, 6); ctx.fillRect(cx+1, cy+36, 13, 6);
    ctx.fillStyle='#334155'; ctx.fillRect(cx-14, cy+36, 13, 2);

    // --- torso with armor plates ---
    const topMap = {top_knight:'#475569', top_mage:'#6d28d9', top_street:'#0ea5e9', top_none:'#1e293b'};
    const topColor = topMap[topId] || '#1e293b';
    // base torso
    ctx.fillStyle=topColor; ctx.beginPath(); ctx.roundRect(cx-19, cy-16, 38, 34, 6); ctx.fill();
    // highlight
    ctx.fillStyle='rgba(255,255,255,.18)'; ctx.beginPath(); ctx.roundRect(cx-19, cy-16, 38, 8, [6,6,0,0]); ctx.fill();
    // belt
    ctx.fillStyle='#92400e'; ctx.fillRect(cx-19, cy+8, 38, 6);
    ctx.fillStyle='#f59e0b'; ctx.fillRect(cx-4, cy+8, 8, 6);
    ctx.strokeStyle='rgba(0,0,0,.35)'; ctx.lineWidth=1; ctx.strokeRect(cx-19, cy-16, 38, 34);
    // chest emblem
    ctx.fillStyle= topId==='top_mage' ? '#a78bfa' : '#f59e0b';
    ctx.beginPath(); ctx.arc(cx, cy-4, 5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(cx-1.5, cy-5, 1.8,0,Math.PI*2); ctx.fill();

    // --- arms ---
    // left arm
    ctx.fillStyle='#fde68a'; ctx.fillRect(cx-23, cy-10, 8, 18);
    ctx.fillStyle=topColor; ctx.fillRect(cx-23, cy-10, 8, 10);
    // right arm (weapon side) - slightly forward
    const armBob = Math.sin(t*1.2)*1.2;
    ctx.fillStyle='#fde68a'; ctx.fillRect(cx+15, cy-10+armBob, 8, 18);
    ctx.fillStyle=topColor; ctx.fillRect(cx+15, cy-10+armBob, 8, 10);

    // --- head with face ---
    // neck
    ctx.fillStyle='#fde68a'; ctx.fillRect(cx-5, cy-22, 10, 8);
    // face base with gradient
    const faceGrad = ctx.createRadialGradient(cx-3, cy-30, 2, cx, cy-28, 19);
    faceGrad.addColorStop(0,'#fef3c7'); faceGrad.addColorStop(1,'#fde68a');
    ctx.fillStyle=faceGrad; ctx.beginPath(); ctx.arc(cx, cy-28, 18,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.18)'; ctx.lineWidth=1.2; ctx.stroke();
    // eyes
    ctx.fillStyle='#0f172a'; ctx.beginPath(); ctx.arc(cx-6, cy-28, 2.2,0,Math.PI*2); ctx.arc(cx+6, cy-28, 2.2,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(cx-5.2, cy-28.8, 0.9,0,Math.PI*2); ctx.arc(cx+6.8, cy-28.8, 0.9,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#38bdf8'; ctx.beginPath(); ctx.arc(cx-6, cy-27.6, 0.7,0,Math.PI*2); ctx.arc(cx+6, cy-27.6, 0.7,0,Math.PI*2); ctx.fill();
    // blush
    ctx.fillStyle='rgba(239,68,68,.18)'; ctx.beginPath(); ctx.ellipse(cx-10, cy-24, 3,1.6,0,0,Math.PI*2); ctx.ellipse(cx+10, cy-24, 3,1.6,0,0,Math.PI*2); ctx.fill();
    // mouth
    ctx.strokeStyle='#92400e'; ctx.lineWidth=1.1; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(cx-2, cy-22); ctx.quadraticCurveTo(cx, cy-21, cx+2, cy-22); ctx.stroke();
    // hair / bangs
    ctx.fillStyle='#451a03'; ctx.beginPath(); ctx.arc(cx, cy-36, 17, Math.PI*1.05, Math.PI*1.92); ctx.fill();
    ctx.fillStyle='#78350f'; ctx.beginPath(); ctx.ellipse(cx, cy-38, 16, 9, 0,0,Math.PI*2); ctx.fill();

    // --- head avatar ---
    if(headId==='head_crown'){
      // golden crown with gems
      ctx.fillStyle='#f59e0b'; ctx.beginPath(); ctx.moveTo(cx-12,cy-40); ctx.lineTo(cx-8,cy-48); ctx.lineTo(cx-3,cy-42); ctx.lineTo(cx+3,cy-48); ctx.lineTo(cx+8,cy-42); ctx.lineTo(cx+12,cy-40); ctx.lineTo(cx+12,cy-36); ctx.lineTo(cx-12,cy-36); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#fbbf24'; ctx.fillRect(cx-12,cy-38,24,3);
      ctx.fillStyle='#ef4444'; ctx.beginPath(); ctx.arc(cx,cy-42,2.2,0,Math.PI*2); ctx.arc(cx-7,cy-40,1.6,0,Math.PI*2); ctx.arc(cx+7,cy-40,1.6,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(cx,cy-42.7,0.7,0,Math.PI*2); ctx.fill();
    } else if(headId==='head_helm'){
      ctx.fillStyle='#64748b'; ctx.beginPath(); ctx.roundRect(cx-14,cy-44,28,18,6); ctx.fill();
      ctx.fillStyle='#94a3b8'; ctx.fillRect(cx-14,cy-38,28,4);
      ctx.fillStyle='#0f172a'; ctx.fillRect(cx-2,cy-36,4,8);
      ctx.fillStyle='#ef4444'; ctx.beginPath(); ctx.arc(cx-6,cy-32,1.4,0,Math.PI*2); ctx.arc(cx+6,cy-32,1.4,0,Math.PI*2); ctx.fill();
    } else if(headId==='head_hood'){
      ctx.fillStyle='#1e293b'; ctx.beginPath(); ctx.arc(cx,cy-34,16, Math.PI*1.1, Math.PI*1.9); ctx.fill();
      ctx.fillStyle='#0f172a'; ctx.beginPath(); ctx.ellipse(cx,cy-44,13,7,0,0,Math.PI); ctx.fill();
    } else if(headId==='head_halo'){
      ctx.strokeStyle='rgba(250,204,21,.95)'; ctx.lineWidth=3; ctx.shadowColor='#facc15'; ctx.shadowBlur=10; ctx.beginPath(); ctx.ellipse(cx,cy-44,14,5,0,0,Math.PI*2); ctx.stroke(); ctx.shadowBlur=0;
      // small sparkles
      ctx.fillStyle='#fef08a'; for(let i=0;i<3;i++){ const ax=cx+Math.cos(t*2+i)*14, ay=cy-44+Math.sin(t*2+i)*4; ctx.beginPath(); ctx.arc(ax,ay,1,0,Math.PI*2); ctx.fill();}
    }

    // --- weapon ---
    if(weaponId!=='weapon_none'){
      ctx.save(); ctx.translate(cx+19, cy-6+armBob);
      if(weaponId==='weapon_sword_aura'){
        // blade with aura
        ctx.shadowColor='#38bdf8'; ctx.shadowBlur=8;
        const bladeGrad = ctx.createLinearGradient(0,-2,18,-2);
        bladeGrad.addColorStop(0,'#e2e8f0'); bladeGrad.addColorStop(1,'#f8fafc');
        ctx.fillStyle=bladeGrad; ctx.beginPath(); ctx.moveTo(4,-2); ctx.lineTo(26,-2); ctx.lineTo(30,0); ctx.lineTo(26,2); ctx.lineTo(4,2); ctx.closePath(); ctx.fill();
        ctx.shadowBlur=0;
        ctx.fillStyle='#0f172a'; ctx.fillRect(0,-3,5,6);
        ctx.fillStyle='#f59e0b'; ctx.fillRect(2,-4,2,8);
        // gem
        ctx.fillStyle='#06b6d4'; ctx.beginPath(); ctx.arc(2,0,1.6,0,Math.PI*2); ctx.fill();
      } else if(weaponId==='weapon_staff_gold'){
        ctx.fillStyle='#92400e'; ctx.fillRect(0,-2,22,3);
        ctx.fillStyle='#f59e0b'; ctx.beginPath(); ctx.arc(22, -0.5,5,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#fef3c7'; ctx.beginPath(); ctx.arc(22,-0.5,2.5,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle='#f59e0b'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(18,-6); ctx.lineTo(22,-0.5); ctx.lineTo(18,5); ctx.stroke();
      } else if(weaponId==='weapon_bow'){
        ctx.strokeStyle='#78350f'; ctx.lineWidth=2.2; ctx.beginPath(); ctx.arc(12,0,10, -0.8, 0.8); ctx.stroke();
        ctx.strokeStyle='#e5e7eb'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(12,-8); ctx.lineTo(12,8); ctx.stroke();
        ctx.fillStyle='#ef4444'; ctx.beginPath(); ctx.moveTo(6,-1); ctx.lineTo(14,0); ctx.lineTo(6,1); ctx.fill();
      } else {
        ctx.fillStyle='#e5e7eb'; ctx.fillRect(0,-2,22,3);
      }
      ctx.restore();
    }

    // name plate with bg
    const name = state.user?.username||'모험가';
    ctx.font='800 13px Noto Sans KR'; const tw=ctx.measureText(name).width;
    ctx.fillStyle='rgba(0,0,0,.45)'; ctx.beginPath(); ctx.roundRect(cx-tw/2-8, cy-68, tw+16, 18, 9); ctx.fill();
    ctx.fillStyle='#f1f5f9'; ctx.textAlign='center'; ctx.fillText(name, cx, cy-56);
    ctx.font='700 10px JetBrains Mono'; ctx.fillStyle='#f59e0b'; ctx.fillText(`Lv.${state.character?.level||1}`, cx, cy-46);
    // level bar mini
    const need = Math.floor(80 * Math.pow(1.35, (state.character?.level||1)-1));
    const pct = Math.min(1, (state.character?.exp||0)/need);
    ctx.fillStyle='rgba(0,0,0,.45)'; ctx.beginPath(); ctx.roundRect(cx-28, cy-42, 56, 4, 2); ctx.fill();
    ctx.fillStyle='#22c55e'; ctx.beginPath(); ctx.roundRect(cx-28, cy-42, 56*pct, 4, 2); ctx.fill();

    previewAnim=requestAnimationFrame(loop);
  }
  loop();
}

// Leaderboard
async function fetchLeaderboard(){
  try{
    const { leaderboard } = await api.leaderboard().catch(()=>({leaderboard:[]}));
    const wrap=$('#leaderboard');
    if(!leaderboard?.length){ wrap.innerHTML='<p class="muted">랭킹 데이터 없음</p>'; return; }
    wrap.innerHTML= leaderboard.slice(0,8).map((u,i)=> `
      <div class="lb-row"><span class="rank">${i+1}</span><span>${u.username}</span><span>Lv.${u.level}</span><span style="color:var(--muted)">${u.kills||0} Kill</span></div>
    `).join('');
  }catch{ }
}

// Chat logic
let chatScope='world';
$$('.chat-tab').forEach(b=>{
  b.addEventListener('click', ()=>{
    $$('.chat-tab').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    chatScope=b.dataset.chat;
    state.chatScope=chatScope;
  });
});
function addChatMsg(entry){
  const log=$('#chatLog');
  const el=document.createElement('div');
  el.className=`chat-msg ${entry.scope}`;
  const whisperTag = entry.scope==='whisper' ? `<span style="color:#f9a8d4">[귓속말]</span> ` : '';
  const safeFrom = escapeHtml(String(entry.from||'Unknown'));
  const safeMsg = escapeHtml(String(entry.message||''));
  el.innerHTML=`${whisperTag}<span class="from">${safeFrom}:</span> ${safeMsg} <span style="color:var(--muted);font-size:11px;float:right">${new Date(entry.time).toLocaleTimeString()}</span>`;
  log.appendChild(el);
  log.scrollTop=log.scrollHeight;
  // also ingame log
  const ig=$('#ingameChatLog');
  if(ig){ const cl=el.cloneNode(true); ig.appendChild(cl); ig.scrollTop=ig.scrollHeight; if(ig.children.length>50) ig.removeChild(ig.firstChild); }
  if(log.children.length>100) log.removeChild(log.firstChild);
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;' }[c])); }

$('#btnChatSend').addEventListener('click', sendChat);
$('#chatInput').addEventListener('keydown', e=>{ if(e.key==='Enter') sendChat(); });
function sendChat(){
  const input=$('#chatInput');
  const msg=input.value.trim();
  if(!msg) return;
  if(!socket || !socket.connected){
    toast('서버 연결 중... 잠시 후 다시 시도','err');
    connectSocket();
    return;
  }
  if(msg.startsWith('/w ') || msg.startsWith('/귓 ')){
    const parts=msg.split(' ');
    const to=parts[1]; const text=parts.slice(2).join(' ');
    if(!to||!text) return toast('사용법: /w 닉네임 메시지','err');
    socket.emit('chat:whisper',{to, message:text});
  } else {
    if(chatScope==='party') socket.emit('chat:party',{message:msg});
    else if(chatScope==='whisper'){
      const to=prompt('귓속말 대상 닉네임');
      if(to) socket.emit('chat:whisper',{to, message:msg});
      else return;
    } else socket.emit('chat:world',{message:msg});
  }
  input.value='';
}

// Matching
$('#btnQueueJoin').addEventListener('click', ()=>{
  if(!socket) connectSocket();
  socket.emit('match:join',{dungeonId:state.selectedDungeon});
  $('#queueStatus').textContent='대기열 참가 중...';
});
$('#btnQueueLeave').addEventListener('click', ()=>{
  socket?.emit('match:leave');
  $('#queueStatus').textContent='대기열 없음';
});
$('#btnEnterSolo').addEventListener('click', ()=>{
  enterDungeon(state.selectedDungeon, false);
});

// Socket connection
function connectSocket(){
  if(socket) return socket;
  const url=getServerUrl();
  socket = io(url, { auth:{ token: getToken() }, transports:['websocket','polling'] });
  socket.on('connect', ()=>{
    console.log('socket connected', socket.id);
    socket.emit('player:ready',{ character: state.character, dungeonId: state.selectedDungeon });
    toast('서버와 연결됨');
  });
  socket.on('connect_error', err=>{
    console.error(err);
    toast('서버 연결 실패: '+err.message,'err');
  });
  socket.on('chat:world', addChatMsg);
  socket.on('chat:party', addChatMsg);
  socket.on('chat:whisper', addChatMsg);
  socket.on('chat:error', ({message})=> toast(message,'err'));
  socket.on('match:status', ({status, position})=>{
    if(status==='queued') $('#queueStatus').textContent=`대기열 ${position}번째`;
    else if(status==='already') toast('이미 대기열에 참가 중','err');
    else if(status==='left') $('#queueStatus').textContent='대기열 없음';
  });
  socket.on('match:queueUpdate', ({dungeonId,count})=>{
    if(dungeonId===state.selectedDungeon) $('#queueCount').textContent=`대기 ${count}명`;
  });
  socket.on('match:found', ({partyId,dungeonId,members})=>{
    toast(`파티 구성 완료! (${members.length}명) 던전 입장`, 'ok');
    $('#queueStatus').textContent=`파티 구성됨 (${members.map(m=>m.username).join(', ')})`;
    state.partyId=partyId;
    setTimeout(()=> enterDungeon(dungeonId, true), 900);
  });
  socket.on('party:left', ()=> state.partyId=null);
  // for game: reward handling will be via game.onReward
  socket.on('error:join', ({message})=> toast(message,'err'));

  // online count mock (use io.engine? just show 1 + party)
  setInterval(async()=>{
    try{
      const h=await api.health();
      $('#onlineCount').textContent=`온라인`;
    }catch{}
  },5000);

  return socket;
}

// Enter dungeon -> switch to game screen + init Game
async function enterDungeon(dungeonId, isParty){
  state.selectedDungeon=dungeonId;
  const d=gameData.dungeons[dungeonId];
  $('#gameDungeonName').textContent=d?.name||dungeonId;
  if(!socket) connectSocket();
  // ensure socket ready
  if(!socket.connected) await new Promise(res=> socket.once('connect', res));
  // join dungeon via socket
  socket.emit('dungeon:switch',{dungeonId});
  // switch UI
  showScreen('game');
  if(!game){
    const canvas=$('#gameCanvas');
    game = new Game(canvas, socket);
    game.onReward = handleReward;
    game.onHpChange = (p)=>{
      updateGameHud();
    };
    bindGameInput();
  } else {
    game.socket=socket;
    game.bindSocket(); // rebind? but we already bound; need to ensure game uses same socket
    game.dungeon=dungeonId;
  }
  game.setMeFromState();
  game.start();
  renderSkillBar();
  updateGameHud();
  // ingame chat input
  $('#ingameChatInput').addEventListener('keydown', e=>{
    if(e.key==='Enter'){
      const msg=e.target.value.trim();
      if(!msg) return;
      if(msg.startsWith('/w ')){
        const parts=msg.split(' '); const to=parts[1]; const text=parts.slice(2).join(' ');
        if(to&&text) socket.emit('chat:whisper',{to,message:text});
      } else {
        // if party exists send party else world
        if(state.partyId) socket.emit('chat:party',{message:msg});
        else socket.emit('chat:world',{message:msg});
      }
      e.target.value='';
    }
  });
}

$('#btnLeaveDungeon').addEventListener('click', ()=>{
  if(game) game.stop();
  socket?.emit('party:leave');
  showScreen('lobby');
  renderLobby();
});

// Game HUD
function updateGameHud(){
  if(!game || !state.character) return;
  const me=game.me;
  const calc=calcTotalStats();
  // use server authoritative hp/mp? game.me holds it
  $('#hpBar').style.width=`${(me.hp/me.maxHp*100).toFixed(1)}%`;
  $('#hpText').textContent=`${Math.ceil(me.hp)}/${me.maxHp}`;
  $('#mpBar').style.width=`${(me.mp/me.maxMp*100).toFixed(1)}%`;
  $('#mpText').textContent=`${Math.ceil(me.mp)}/${me.maxMp}`;
  const need=getExpNeed(state.character.level);
  const pct=(state.character.exp/need*100);
  $('#expBar').style.width=pct+'%';
}

function renderSkillBar(){
  const bar=$('#skillBar');
  bar.innerHTML='';
  for(const [id,s] of Object.entries(gameData.skills)){
    const unlocked = (state.character.unlockedSkills||[]).includes(id) || (state.character.level >= s.unlockLv);
    const el=document.createElement('div');
    el.className='skill-key'+(unlocked?'':' cooldown');
    el.dataset.skill=id;
    const cdUntil = game?.skillCooldowns[id]||0;
    const now=Date.now();
    const isCd = now < cdUntil;
    if(isCd) el.classList.add('cooldown');
    el.innerHTML=`
      <span class="key">${s.key}</span>
      <span class="icon">${s.icon}</span>
      <span class="name">${s.name}</span>
      <div class="cd-overlay">${isCd? Math.ceil((cdUntil-now)/1000)+'s':''}</div>
    `;
    if(unlocked){
      el.addEventListener('click', ()=> tryUseSkill(id));
    }
    bar.appendChild(el);
  }
  // refresh cooldown overlay every 100ms
  if(renderSkillBar._timer) clearInterval(renderSkillBar._timer);
  renderSkillBar._timer=setInterval(()=>{
    if(!game) return;
    $$('.skill-key').forEach(el=>{
      const id=el.dataset.skill;
      const until=game.skillCooldowns[id]||0;
      const remaining=Math.max(0, until - Date.now());
      el.classList.toggle('cooldown', remaining>0);
      const ov=el.querySelector('.cd-overlay');
      if(ov) ov.textContent= remaining>0 ? Math.ceil(remaining/1000)+'s' : '';
    });
    // also update hp/mp bars
    updateGameHud();
  }, 100);
}

function tryUseSkill(id){
  if(!game) return;
  const s=gameData.skills[id];
  if(!s) return;
  if((state.character.level||1) < s.unlockLv) return toast('레벨이 부족합니다','err');
  const ok=game.trySkill(id);
  if(!ok){
    const until=game.skillCooldowns[id]||0;
    if(Date.now()<until) toast(`쿨타임 ${Math.ceil((until-Date.now())/1000)}초 남음`,'err');
    else toast('마나가 부족합니다','err');
  } else {
    // optimistic mp deduct for HUD
    const cost=s.mp||0;
    game.me.mp=Math.max(0, game.me.mp - cost);
    updateGameHud();
  }
}

function bindGameInput(){
  // keyboard for skills & attack
  window.addEventListener('keydown', e=>{
    if(!game || !gameScreen.classList.contains('active')) return;
    // ignore if typing in input
    if(e.target.tagName==='INPUT' || e.target.tagName==='TEXTAREA') return;
    const k=e.key.toLowerCase();
    const map=state.settings.controls.keys;
    // skill keys map via gameData skills key property
    for(const [id,s] of Object.entries(gameData.skills)){
      const boundKey = (s.key||'').toLowerCase();
      // also check custom map? use boundKey directly
      if(k===boundKey){
        e.preventDefault();
        tryUseSkill(id);
        return;
      }
    }
    if(k===map.attack || k===' '){
      e.preventDefault(); game.tryAttack();
    }
    if(k===map.potion || k==='p'){
      e.preventDefault(); usePotion();
    }
  });
  // mouse attack
  const canvas=$('#gameCanvas');
  canvas.addEventListener('mousedown', e=>{
    if(e.button===0) game.tryAttack();
    if(e.button===2){
      // right click fireball if unlocked
      if(state.character.level>=2) tryUseSkill('fireball');
    }
  });
  // mobile buttons
  $$('.mob-btn').forEach(b=>{
    b.addEventListener('touchstart', e=>{ e.preventDefault(); tryUseSkill(b.dataset.skill); });
    b.addEventListener('click', ()=> tryUseSkill(b.dataset.skill));
  });
  // joystick
  initJoystick();
}

function initJoystick(){
  const base=$('#joystick .joy-base');
  const stick=base?.querySelector('.joy-stick');
  if(!base||!stick|| base._bound) return;
  base._bound=true;
  let active=false, center={x:0,y:0};
  function getCenter(){ const r=base.getBoundingClientRect(); return {x:r.left+r.width/2, y:r.top+r.height/2, r:r.width/2}; }
  base.addEventListener('touchstart', e=>{
    active=true; const c=getCenter(); center=c; e.preventDefault();
  }, {passive:false});
  base.addEventListener('touchmove', e=>{
    if(!active) return;
    const t=e.touches[0];
    const dx=t.clientX-center.x, dy=t.clientY-center.y;
    const dist=Math.hypot(dx,dy);
    const max=40;
    const ang=Math.atan2(dy,dx);
    const d=Math.min(dist,max);
    const x=Math.cos(ang)*d, y=Math.sin(ang)*d;
    stick.style.transform=`translate(${x}px, ${y}px)`;
    if(game){
      const nx = Math.cos(ang)*(d/max), ny=Math.sin(ang)*(d/max);
      game._joyVec = {x: nx, y: ny};
    }
    e.preventDefault();
  }, {passive:false});
  const end=()=>{
    active=false; stick.style.transform='translate(0,0)';
    if(game) game._joyVec=null;
  };
  base.addEventListener('touchend', end);
  base.addEventListener('touchcancel', end);
}

// Potion use
function usePotion(){
  if(!state.character) return;
  // find potion in inventory
  const idx = state.inventory.findIndex(i=> i.itemId==='hp_potion' && i.count>0);
  if(idx===-1) return toast('HP 포션이 없습니다','err');
  // heal 50
  if(game){
    const before=game.me.hp;
    game.me.hp=Math.min(game.me.maxHp, game.me.hp+50);
    game.showDamage(game.me.x, game.me.y-20, '+50', '#22c55e');
    game.renderer.spawnParticles(game.me.x, game.me.y, '#22c55e',8);
    updateGameHud();
    if(game.me.hp===before) return toast('체력이 이미 가득 찼습니다');
  }
  state.inventory[idx].count--;
  if(state.inventory[idx].count<=0) state.inventory.splice(idx,1);
  renderInventory();
  saveToServer();
}

// Reward handler (exp/gold/drops)
function handleReward({exp, gold, drops}){
  if(!state.character) return;
  state.character.exp = (state.character.exp||0) + (exp||0);
  state.character.gold = (state.character.gold||0) + (gold||0);
  state.progress.monstersKilled = (state.progress.monstersKilled||0)+1;
  if(drops){
    for(const itemId of drops){
      const existing=state.inventory.find(i=> i.itemId===itemId);
      if(existing) existing.count=(existing.count||1)+1;
      else state.inventory.push({itemId, count:1});
      // check if avatar item?
      const allAv=gameData.avatars.all||[];
      const isAvatar = allAv.find(a=>a.id===itemId);
      if(isAvatar){
        if(!state.avatarInventory.includes(itemId)){
          state.avatarInventory.push(itemId);
          toast(`아바타 획득: ${isAvatar.name}`,'ok');
        }
      } else {
        const it=gameData.items[itemId];
        toast(`아이템 획득: ${it?.name||itemId}`,'ok');
      }
    }
    renderInventory();
    renderAvatarGrid();
  }
  // level up check
  let need=getExpNeed(state.character.level);
  let leveled=false;
  while(state.character.exp >= need){
    state.character.exp -= need;
    state.character.level++;
    state.character.statPoints=(state.character.statPoints||0)+3;
    // unlock skills
    for(const [id,s] of Object.entries(gameData.skills)){
      if(s.unlockLv <= state.character.level && !state.character.unlockedSkills.includes(id)){
        state.character.unlockedSkills.push(id);
        toast(`스킬 해금: ${s.name} [${s.key}]`,'ok');
      }
    }
    // heal on level up
    state.character.hp = calcTotalStats().maxHp;
    state.character.mp = calcTotalStats().maxMp;
    if(game){ game.me.hp=state.character.hp; game.me.mp=state.character.mp; game.me.level=state.character.level; }
    need=getExpNeed(state.character.level);
    toast(`레벨업! Lv.${state.character.level}`,'ok');
    game?.renderer.spawnParticles(game.me.x, game.me.y, '#f59e0b', 20);
    leveled=true;
  }
  if(leveled) audio.playSfx('levelup');
  renderStats();
  renderSkills();
  renderSkillBar();
  updateGameHud();
  saveToServer();
  // also update brief
  $('#briefLv').textContent=`Lv.${state.character.level}`;
  $('#briefExp').style.width=`${Math.min(100, state.character.exp/need*100)}%`;
}

// Inventory UI
function renderInventory(){
  const grid=$('#inventoryGrid');
  if(!grid) return;
  const filter = grid._filter||'all';
  grid.innerHTML='';
  const filtered = state.inventory.filter(entry=>{
    const it=gameData.items[entry.itemId];
    if(!it) return filter==='all';
    if(filter==='equipment') return ['weapon','armor','accessory'].includes(it.type);
    if(filter==='consumable') return it.type==='consumable';
    return true;
  });
  if(filtered.length===0) grid.innerHTML='<p class="muted">아이템 없음</p>';
  for(const entry of filtered){
    const it=gameData.items[entry.itemId] || {name:entry.itemId, rarity:'common', desc:''};
    const el=document.createElement('div');
    el.className='item-card';
    el.innerHTML=`
      <div class="icon">${rarityIcon(it.rarity)}${typeIcon(it.type)}</div>
      <div class="name">${it.name}</div>
      ${entry.count>1? `<div style="font-size:11px;color:var(--muted)">x${entry.count}</div>`:''}
      <div class="rarity rarity-${it.rarity||'common'}">${it.rarity||'common'}</div>
    `;
    el.title=`${it.desc||''}\n${it.stats? JSON.stringify(it.stats):''}`;
    el.addEventListener('click', ()=> onItemClick(entry, it));
    grid.appendChild(el);
  }
  renderEquipSlots();
}
function rarityIcon(r){ return ({common:'○',uncommon:'●',rare:'◆',epic:'★',legendary:'✦'})[r]||'○'; }
function typeIcon(t){ return ({weapon:'⚔️',armor:'🛡️',accessory:'💍',consumable:'🧪'})[t]||'📦'; }

$$('[data-inv]').forEach(b=>{
  b.addEventListener('click', ()=>{
    $$('[data-inv]').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    $('#inventoryGrid')._filter=b.dataset.inv;
    renderInventory();
  });
});

function renderEquipSlots(){
  const wrap=$('#equipSlots');
  if(!wrap) return;
  const slots = [
    {key:'weapon', label:'무기'},
    {key:'top', label:'상의'},
    {key:'bottom', label:'하의'},
    {key:'accessory1', label:'악세1'},
    {key:'accessory2', label:'악세2'},
  ];
  wrap.innerHTML='';
  for(const s of slots){
    const itemId=state.character.equipment[s.key];
    const it=itemId? gameData.items[itemId]:null;
    const el=document.createElement('div');
    el.className='equip-slot'+(it?' filled':'');
    el.innerHTML=`
      <span style="font-size:11px;color:var(--muted)">${s.label}</span>
      ${it? `<b style="font-size:13px">${it.name}</b><span style="font-size:11px;color:var(--muted)">${it.stats? Object.entries(it.stats).map(([k,v])=>k+'+'+v).join(' '):''}</span>` : '<span class="muted">비어 있음</span>'}
      ${it? '<button class="btn ghost tiny" style="margin-top:6px">해제</button>':''}
    `;
    if(it) el.querySelector('button').addEventListener('click', ()=>{
      // unequip -> to inventory
      const existing=state.inventory.find(i=>i.itemId===itemId);
      if(existing) existing.count++;
      else state.inventory.push({itemId, count:1});
      state.character.equipment[s.key]=null;
      renderInventory(); renderStats(); saveToServer();
      if(game) game.setMeFromState();
    });
    wrap.appendChild(el);
  }
}

function onItemClick(entry, it){
  if(it.type==='consumable'){
    if(entry.itemId==='hp_potion'){ usePotion(); return; }
    if(entry.itemId==='mp_potion'){
      if(!game) return;
      game.me.mp=Math.min(game.me.maxMp, game.me.mp + 30);
      game.showDamage(game.me.x, game.me.y-20, '+30 MP', '#3b82f6');
      updateGameHud();
      entry.count--; if(entry.count<=0) state.inventory.splice(state.inventory.indexOf(entry),1);
      renderInventory(); saveToServer();
      return;
    }
  }
  if(['weapon','armor','accessory'].includes(it.type)){
    // equip
    const slotMap={weapon:'weapon', armor:'top', accessory:'accessory1'};
    // choose slot: for accessory pick first empty
    let slot=slotMap[it.type] || 'weapon';
    if(it.slot && state.character.equipment[it.slot]!==undefined) slot=it.slot;
    if(it.type==='accessory'){
      if(!state.character.equipment.accessory1) slot='accessory1';
      else if(!state.character.equipment.accessory2) slot='accessory2';
      else slot='accessory1'; // replace
    }
    // if occupied, swap to inventory
    const prev=state.character.equipment[slot];
    if(prev){
      const ex=state.inventory.find(i=>i.itemId===prev);
      if(ex) ex.count++; else state.inventory.push({itemId:prev,count:1});
    }
    state.character.equipment[slot]=entry.itemId;
    entry.count--; if(entry.count<=0) state.inventory.splice(state.inventory.indexOf(entry),1);
    renderInventory(); renderStats(); saveToServer();
    if(game) game.setMeFromState();
    toast(`${it.name} 장착`);
  }
}

// Avatar
let avatarSlot='head';
$$('.avatar-tab').forEach(b=>{
  b.addEventListener('click', ()=>{
    $$('.avatar-tab').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    avatarSlot=b.dataset.slot;
    renderAvatarGrid();
  });
});
function renderAvatarGrid(){
  const grid=$('#avatarGrid');
  if(!grid) return;
  const list = gameData.avatars[avatarSlot] || [];
  grid.innerHTML='';
  const owned = new Set(state.avatarInventory||[]);
  for(const av of list){
    const has = owned.has(av.id);
    const equipped = state.character.avatar[avatarSlot]===av.id;
    const el=document.createElement('div');
    el.className='item-card'+(equipped?' filled':'');
    el.style.opacity = has? '1' : '.35';
    el.style.borderColor = equipped? 'var(--accent)' : '';
    el.innerHTML=`
      <div class="icon">${av.icon||'🧑'}</div>
      <div class="name">${av.name}</div>
      <div class="rarity rarity-${av.rarity||'common'}">${av.rarity||'common'}</div>
      ${equipped?'<div style="font-size:10px;color:var(--accent);font-weight:800;margin-top:4px">장착중</div>': has?'<div style="font-size:10px;color:var(--success)">보유중</div>':'<div style="font-size:10px;color:var(--muted)">미보유</div>'}
    `;
    if(has){
      el.addEventListener('click', ()=>{
        state.character.avatar[avatarSlot]=av.id;
        renderAvatarGrid();
        renderLobby(); // preview
        avatarPreviewDraw();
        socket?.emit('player:avatar',{avatar: state.character.avatar});
        if(game) game.updateAvatar(state.character.avatar);
        saveToServer();
        toast(`${av.name} 장착`);
      });
    }
    grid.appendChild(el);
  }
  $('#avatarOwnedCount').textContent= state.avatarInventory.length;
}
let avatarPreviewAnim=null;
function avatarPreviewDraw(){
  const canvas=$('#avatarCanvas');
  if(!canvas) return;
  const ctx=canvas.getContext('2d');
  if(avatarPreviewAnim) cancelAnimationFrame(avatarPreviewAnim);
  let t=0;
  function loop(){
    t+=0.015;
    const w=canvas.width, h=canvas.height;
    ctx.clearRect(0,0,w,h);
    const g = ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0, previewBg||'#0f2a1a'); g.addColorStop(1,'rgba(0,0,0,0.6)');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='rgba(255,255,255,.05)'; ctx.lineWidth=1;
    for(let i=0;i<w;i+=36){ ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,h); ctx.stroke(); }
    const cx=w/2, cy=148 + Math.sin(t)*2.5;
    ctx.fillStyle='rgba(0,0,0,.38)'; ctx.beginPath(); ctx.ellipse(cx, cy+54, 38,11,0,0,Math.PI*2); ctx.fill();
    // reuse same high-quality draw as lobby - simplified call by inlining (keep sync with startPreview)
    const avatar = state.character?.avatar || {};
    const topId = avatar.top || 'top_none';
    const headId = avatar.head || 'head_none';
    const weaponId = avatar.weapon || 'weapon_none';
    const accId = avatar.accessory || 'acc_none';
    const bottomId = avatar.bottom || 'bottom_none';
    // accessory behind
    if(accId==='acc_wings'){
      ctx.save(); ctx.translate(cx,cy-6);
      const wg = ctx.createLinearGradient(-22,-10, -6, 12);
      wg.addColorStop(0,'rgba(167,139,250,0.95)'); wg.addColorStop(1,'rgba(99,102,241,0.65)');
      ctx.fillStyle=wg; ctx.beginPath(); ctx.moveTo(-6,2); ctx.quadraticCurveTo(-26,-14, -30,-6); ctx.quadraticCurveTo(-32,8, -16,14); ctx.quadraticCurveTo(-10,6, -6,2); ctx.fill();
      const wg2 = ctx.createLinearGradient(6,2, 22,-10);
      wg2.addColorStop(0,'rgba(99,102,241,0.65)'); wg2.addColorStop(1,'rgba(167,139,250,0.95)');
      ctx.fillStyle=wg2; ctx.beginPath(); ctx.moveTo(6,2); ctx.quadraticCurveTo(26,-14,30,-6); ctx.quadraticCurveTo(32,8,16,14); ctx.quadraticCurveTo(10,6,6,2); ctx.fill();
      ctx.restore();
    } else if(accId==='acc_cape'){
      const capeGrad = ctx.createLinearGradient(cx-22,cy-16, cx-8, cy+30);
      capeGrad.addColorStop(0,'#ef4444'); capeGrad.addColorStop(1,'#7f1d1d');
      ctx.fillStyle=capeGrad; ctx.beginPath(); ctx.moveTo(cx-18,cy-14); ctx.lineTo(cx-8,cy-14); ctx.lineTo(cx-12,cy+36); ctx.lineTo(cx-24,cy+32); ctx.closePath(); ctx.fill();
    }
    const bottomColor = bottomId==='bottom_armor' ? '#334155' : '#1e40af';
    ctx.fillStyle=bottomColor; ctx.fillRect(cx-13, cy+16, 11, 22); ctx.fillRect(cx+2, cy+16, 11, 22);
    ctx.fillStyle='#0f172a'; ctx.fillRect(cx-14, cy+36, 13, 6); ctx.fillRect(cx+1, cy+36, 13, 6);
    const topMap = {top_knight:'#475569', top_mage:'#6d28d9', top_street:'#0ea5e9', top_none:'#1e293b'};
    const topColor = topMap[topId] || '#1e293b';
    ctx.fillStyle=topColor; ctx.beginPath(); ctx.roundRect(cx-19, cy-16, 38, 34, 6); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.18)'; ctx.beginPath(); ctx.roundRect(cx-19, cy-16, 38, 8, [6,6,0,0]); ctx.fill();
    ctx.fillStyle='#92400e'; ctx.fillRect(cx-19, cy+8, 38, 6); ctx.fillStyle='#f59e0b'; ctx.fillRect(cx-4, cy+8, 8, 6);
    ctx.fillStyle='#fde68a'; ctx.fillRect(cx-5, cy-22, 10, 8);
    const faceGrad = ctx.createRadialGradient(cx-3, cy-30, 2, cx, cy-28, 19);
    faceGrad.addColorStop(0,'#fef3c7'); faceGrad.addColorStop(1,'#fde68a');
    ctx.fillStyle=faceGrad; ctx.beginPath(); ctx.arc(cx, cy-28, 18,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.18)'; ctx.lineWidth=1.2; ctx.stroke();
    ctx.fillStyle='#0f172a'; ctx.beginPath(); ctx.arc(cx-6, cy-28, 2.2,0,Math.PI*2); ctx.arc(cx+6, cy-28, 2.2,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#451a03'; ctx.beginPath(); ctx.arc(cx, cy-36, 17, Math.PI*1.05, Math.PI*1.92); ctx.fill();
    ctx.fillStyle='#78350f'; ctx.beginPath(); ctx.ellipse(cx, cy-38, 16, 9, 0,0,Math.PI*2); ctx.fill();
    if(headId==='head_crown'){
      ctx.fillStyle='#f59e0b'; ctx.beginPath(); ctx.moveTo(cx-12,cy-40); ctx.lineTo(cx-8,cy-48); ctx.lineTo(cx-3,cy-42); ctx.lineTo(cx+3,cy-48); ctx.lineTo(cx+8,cy-42); ctx.lineTo(cx+12,cy-40); ctx.lineTo(cx+12,cy-36); ctx.lineTo(cx-12,cy-36); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#ef4444'; ctx.beginPath(); ctx.arc(cx,cy-42,2.2,0,Math.PI*2); ctx.fill();
    } else if(headId==='head_helm'){
      ctx.fillStyle='#64748b'; ctx.beginPath(); ctx.roundRect(cx-14,cy-44,28,18,6); ctx.fill();
    } else if(headId==='head_halo'){
      ctx.strokeStyle='rgba(250,204,21,.95)'; ctx.lineWidth=3; ctx.shadowColor='#facc15'; ctx.shadowBlur=10; ctx.beginPath(); ctx.ellipse(cx,cy-44,14,5,0,0,Math.PI*2); ctx.stroke(); ctx.shadowBlur=0;
    }
    if(weaponId==='weapon_sword_aura'){
      ctx.save(); ctx.translate(cx+19, cy-6);
      ctx.shadowColor='#38bdf8'; ctx.shadowBlur=8;
      ctx.fillStyle='#e2e8f0'; ctx.beginPath(); ctx.moveTo(4,-2); ctx.lineTo(26,-2); ctx.lineTo(30,0); ctx.lineTo(26,2); ctx.lineTo(4,2); ctx.closePath(); ctx.fill();
      ctx.shadowBlur=0; ctx.fillStyle='#0f172a'; ctx.fillRect(0,-3,5,6);
      ctx.restore();
    } else if(weaponId==='weapon_staff_gold'){
      ctx.fillStyle='#92400e'; ctx.fillRect(cx+19, cy-8, 22,3);
      ctx.fillStyle='#f59e0b'; ctx.beginPath(); ctx.arc(cx+41, cy-6.5,5,0,Math.PI*2); ctx.fill();
    } else if(weaponId==='weapon_bow'){
      ctx.strokeStyle='#78350f'; ctx.lineWidth=2.2; ctx.beginPath(); ctx.arc(cx+31,cy-6,10, -0.8,0.8); ctx.stroke();
    }
    ctx.fillStyle='#f1f5f9'; ctx.font='800 12px Noto Sans KR'; ctx.textAlign='center'; ctx.fillText(state.user?.username||'모험가', cx, 38);
    avatarPreviewAnim=requestAnimationFrame(loop);
  }
  loop();
}

// Open modals
$('#btnInventory').addEventListener('click', ()=>{ renderInventory(); $('#invModal').showModal(); });
$('#btnAvatar').addEventListener('click', ()=>{ renderAvatarGrid(); avatarPreviewDraw(); $('#avatarModal').showModal(); });
$('#btnSettings').addEventListener('click', openSettings);
$('#btnGameSettings').addEventListener('click', openSettings);

function openSettings(){
  loadSettingsToUI();
  $('#settingsModal').showModal();
}
function loadSettingsToUI(){
  const s=state.settings;
  $('#setResolution').value=s.graphics.resolution;
  $('#setFps').value=s.graphics.fps;
  $('#setShadow').value=s.graphics.shadow;
  $('#setParticles').checked=s.graphics.particles;
  $('#setBgm').value=s.audio.bgm;
  $('#setSfx').value=s.audio.sfx;
  $('#setMute').checked=s.audio.mute;
  $('#setJoystick').checked=s.controls.joystick;
  $('.joystick').style.display = s.controls.joystick ? '' : 'none';
  // keybinds
  const list=$('#keybindList');
  const keys=s.controls.keys;
  const labels={up:'위로',down:'아래',left:'왼쪽',right:'오른쪽',attack:'공격',skill1:'스킬1(Q)',skill2:'스킬2(W)',skill3:'스킬3(E)',skill4:'스킬4(R)',skill5:'스킬5(T)',potion:'포션'};
  list.innerHTML= Object.entries(labels).map(([k,label])=> `
    <div class="kb-row"><span>${label}</span><kbd data-kb="${k}">${keys[k]?.toUpperCase()||'-'}</kbd></div>
  `).join('');
  // bind kb edit
  list.querySelectorAll('kbd').forEach(kbd=>{
    kbd.addEventListener('click', ()=>{
      kbd.textContent='...';
      const handler=(e)=>{
        e.preventDefault();
        const key=e.key.toLowerCase();
        if(key.length===1 || key===' '){
          state.settings.controls.keys[kbd.dataset.kb]= key===' ' ? ' ' : key;
          saveSettings(state.settings);
          loadSettingsToUI();
        }
        window.removeEventListener('keydown', handler);
      };
      window.addEventListener('keydown', handler, {once:true});
    });
  });
}
// settings change listeners - now actually applied
function applyAllSettings(){
  saveSettings(state.settings);
  audio.apply(state.settings);
  if(game) game.applySettings(state.settings);
  // notify renderer via event
  window.dispatchEvent(new CustomEvent('df:settings', {detail: state.settings}));
  // immediate resize for resolution change
  game?.renderer.resize();
}
$('#setResolution').addEventListener('change', e=>{ state.settings.graphics.resolution=e.target.value; applyAllSettings(); toast(`해상도 ${e.target.value} 적용됨`); });
$('#setFps').addEventListener('change', e=>{ state.settings.graphics.fps=Number(e.target.value); applyAllSettings(); toast(`FPS ${e.target.value} 적용됨`); });
$('#setShadow').addEventListener('change', e=>{ state.settings.graphics.shadow=e.target.value; applyAllSettings(); toast(`그림자 ${e.target.value} 적용됨`); });
$('#setParticles').addEventListener('change', e=>{ state.settings.graphics.particles=e.target.checked; applyAllSettings(); });
$('#setBgm').addEventListener('input', e=>{ state.settings.audio.bgm=Number(e.target.value); applyAllSettings(); });
$('#setSfx').addEventListener('input', e=>{ state.settings.audio.sfx=Number(e.target.value); applyAllSettings(); if(!state.settings.audio.mute) audio.playSfx('hit'); });
$('#setMute').addEventListener('change', e=>{ state.settings.audio.mute=e.target.checked; applyAllSettings(); });
$('#setJoystick').addEventListener('change', e=>{
  state.settings.controls.joystick=e.target.checked;
  saveSettings(state.settings);
  $('.joystick').style.display=e.target.checked?'':'none';
  $('#joystick').style.display= e.target.checked ? '' : 'none';
  if(!e.target.checked) $('#joystick').style.display='none';
  else if(window.innerWidth<=900) $('#joystick').style.display='block';
});
$('#btnResetKeys').addEventListener('click', ()=>{
  state.settings.controls.keys={...defaultSettings.controls.keys};
  saveSettings(state.settings); loadSettingsToUI(); toast('키 초기화');
});
$('#btnChangePw').addEventListener('click', async ()=>{
  const cur=$('#curPw').value, nw=$('#newPw').value;
  if(!cur||!nw) return toast('비밀번호 입력','err');
  try{ await api.changePw({currentPassword:cur, newPassword:nw}); toast('비밀번호 변경 성공'); $('#curPw').value=''; $('#newPw').value=''; }catch(e){ toast(e.message,'err'); }
});
$('#btnWithdraw').addEventListener('click', async ()=>{
  const pw=prompt('탈퇴 확인: 비밀번호를 입력하세요');
  if(!pw) return;
  if(!confirm('정말 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다')) return;
  try{ await api.withdraw({password:pw}); toast('탈퇴 완료'); logout(); }catch(e){ toast(e.message,'err'); }
});

// Save to server
let saveTimer=null;
async function saveToServer(){
  if(!state.user || !getToken()) return;
  try{
    // update character hp/mp from game if active
    if(game){
      state.character.hp=game.me.hp;
      state.character.mp=game.me.mp;
    }
    await api.save({ character: state.character, inventory: state.inventory, avatarInventory: state.avatarInventory, progress: state.progress });
  }catch(e){ console.warn('save fail', e.message); }
}
function startAutoSave(){
  if(saveTimer) clearInterval(saveTimer);
  saveTimer=setInterval(saveToServer, 10000);
  window.addEventListener('beforeunload', ()=>{
    if(!getToken()) return;
    const data=JSON.stringify({character:state.character, inventory:state.inventory, avatarInventory:state.avatarInventory, progress:state.progress});
    // sendBeacon does not support Authorization header -> use fetch keepalive which does
    try{
      fetch(`${getServerUrl()}/api/auth/save`,{method:'PUT', headers:{'Content-Type':'application/json','Authorization':`Bearer ${getToken()}`}, body:data, keepalive:true});
    }catch{}
    // fallback beacon only if server were to accept cookie auth (not used) - kept but not relied upon
  });
  document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='hidden') saveToServer(); });
}

// Init audio with current settings
audio.init(state.settings);

// Cross-browser dialog polyfill & compat check
(function(){
  // dialog polyfill fallback for Safari/Firefox older
  const dlgSupported = typeof HTMLDialogElement !== 'undefined' && typeof document.createElement('dialog').showModal === 'function';
  if(!dlgSupported){
    document.querySelectorAll('dialog.modal').forEach(d=>{
      d.showModal = function(){ this.setAttribute('open',''); this.style.display='block'; document.body.style.overflow='hidden'; };
      const origClose = d.close?.bind(d);
      d.close = function(v){ this.removeAttribute('open'); this.style.display=''; document.body.style.overflow=''; if(origClose) try{origClose(v);}catch{} };
      d.addEventListener('click', (e)=>{
        if(e.target===d) d.close();
      });
    });
    console.warn('[Compat] dialog polyfill active');
  }
  // cross-browser test hint
  const ua=navigator.userAgent;
  console.log('[Client] UA', ua, 'settings', state.settings, 'dialogSupported', dlgSupported);
})();

// Initial responsive joystick visibility
if(state.settings.controls.joystick){
  if(window.innerWidth<=900) $('#joystick').style.display='block';
}

// Export for debug
window._state=state;
window._gameData=gameData;
