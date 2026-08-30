// Simple high-quality Canvas renderer with graphics quality support
export class Renderer{
  constructor(canvas){
    this.canvas=canvas;
    this.ctx=canvas.getContext('2d');
    this.camera={x:0,y:0};
    this.world={w:1600,h:1200};
    this.particles=[];
    this.settings={ graphics:{ resolution:'auto', fps:60, shadow:'high', particles:true } };
    this._resolution='auto';
  }
  applySettings(settings){
    if(!settings) return;
    this.settings = settings;
    this._resolution = settings.graphics?.resolution || 'auto';
    // apply resolution: adjust canvas css max constraints via container
    if(this._resolution !== 'auto'){
      const [rw, rh] = this._resolution.split('x').map(Number);
      if(rw && rh){
        // Use resolution as internal logical size cap - we scale DPR accordingly
        const dpr = Math.min(window.devicePixelRatio||1, 2);
        const scale = Math.min(rw / window.innerWidth, rh / window.innerHeight, 1);
        this._resScale = scale;
      } else this._resScale = 1;
    } else this._resScale = 1;
    this.resize();
  }
  resize(){
    const desiredDpr = Math.min(window.devicePixelRatio||1, 2);
    // resolution scaling: if 800x600 force lower pixel density for performance
    let dpr = desiredDpr;
    if(this._resolution==='800x600') dpr = Math.min(dpr, 1);
    else if(this._resolution==='1280x720') dpr = Math.min(dpr, 1.5);
    if(this._resScale && this._resScale < 1) dpr *= this._resScale;
    const rect = this.canvas.getBoundingClientRect();
    // if canvas is styled to 100% height, rect may be zero at init - use window size if needed
    const w = rect.width || window.innerWidth;
    const h = rect.height || (window.innerHeight - 80);
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.ctx.setTransform(dpr,0,0,dpr,0,0);
    this.viewW=w; this.viewH=h;
    this._currentDpr = dpr;
  }
  setCamera(x,y){
    this.camera.x = Math.max(0, Math.min(this.world.w - this.viewW, x - this.viewW/2));
    this.camera.y = Math.max(0, Math.min(this.world.h - this.viewH, y - this.viewH/2));
  }
  clear(bg='#0b1220'){
    this.ctx.fillStyle=bg;
    this.ctx.fillRect(0,0,this.viewW,this.viewH);
  }
  drawMap(dungeon){
    const ctx=this.ctx;
    const cam=this.camera;
    const shadowQ = this.settings?.graphics?.shadow || 'high';
    // tiled ground
    ctx.save();
    ctx.translate(-cam.x, -cam.y);
    // base
    ctx.fillStyle = dungeon?.bg || '#0f1a2e';
    ctx.fillRect(0,0,this.world.w,this.world.h);
    // grid + decorative
    ctx.strokeStyle='rgba(255,255,255,.04)';
    ctx.lineWidth=1;
    const step = shadowQ==='low'||shadowQ==='off' ? 160 : 80;
    for(let x=0;x<this.world.w;x+=step){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,this.world.h); ctx.stroke(); }
    for(let y=0;y<this.world.h;y+=step){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(this.world.w,y); ctx.stroke(); }
    // pillars / walls border - shadow quality affects thickness
    if(shadowQ!=='off'){
      ctx.fillStyle= shadowQ==='high' ? 'rgba(0,0,0,.35)' : 'rgba(0,0,0,.2)';
      const bw = shadowQ==='low' ? 8 : 16;
      ctx.fillRect(0,0,this.world.w,bw);
      ctx.fillRect(0,this.world.h-bw,this.world.w,bw);
      ctx.fillRect(0,0,bw,this.world.h);
      ctx.fillRect(this.world.w-bw,0,bw,this.world.h);
    }
    // decorative runes - reduce count on low/off
    const runeCount = shadowQ==='high' ? 12 : shadowQ==='medium' ? 8 : shadowQ==='low' ? 4 : 0;
    if(runeCount>0){
      ctx.fillStyle='rgba(245,158,11,.06)';
      for(let i=0;i<runeCount;i++){
        const x=100 + (i*137)%(this.world.w-200), y=100 + (i*271)%(this.world.h-200);
        ctx.beginPath(); ctx.arc(x,y, 40 + (i%3)*10, 0, Math.PI*2); ctx.fill();
      }
    }
    // torch lights - only high/medium
    if(shadowQ==='high' || shadowQ==='medium'){
      for(let i=0;i<6;i++){
        const x= 80 + i*260, y= 80;
        const g=ctx.createRadialGradient(x,y,0,x,y,120);
        g.addColorStop(0,'rgba(245,158,11,.18)'); g.addColorStop(1,'transparent');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,120,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#f59e0b'; ctx.fillRect(x-4,y-4,8,18);
      }
    } else if(shadowQ==='low'){
      for(let i=0;i<3;i++){ const x= 80 + i*520, y= 80; ctx.fillStyle='#f59e0b'; ctx.fillRect(x-4,y-4,8,18); }
    }
    ctx.restore();
  }
  drawPlayer(p, isMe=false){
    const ctx=this.ctx; const cam=this.camera;
    const x=p.x - cam.x, y=p.y - cam.y;
    const shadowQ = this.settings?.graphics?.shadow || 'high';
    ctx.save();
    ctx.translate(x,y);
    // shadow - respects quality setting
    if(shadowQ!=='off'){
      ctx.fillStyle= shadowQ==='low' ? 'rgba(0,0,0,.18)' : 'rgba(0,0,0,.35)';
      ctx.beginPath(); ctx.ellipse(0,18, 18, 7, 0,0,Math.PI*2); ctx.fill();
    }
    // body base
    const facing = p.facing||1;
    ctx.scale(facing,1);
    // avatar colors by equipment (simplified visual)
    // legs
    ctx.fillStyle= this.avatarColor(p.avatar?.bottom, '#3b82f6');
    ctx.fillRect(-8, 6, 16, 14);
    // torso
    ctx.fillStyle= this.avatarColor(p.avatar?.top, '#1e293b');
    ctx.fillRect(-10, -8, 20, 18);
    // head
    ctx.fillStyle='#fde68a';
    ctx.beginPath(); ctx.arc(0, -14, 10, 0, Math.PI*2); ctx.fill();
    // head avatar extra
    if(p.avatar?.head && p.avatar.head!=='head_none'){
      ctx.font='14px serif'; ctx.textAlign='center'; ctx.fillText(this.avatarEmoji(p.avatar.head), 0, -28);
    }
    // weapon
    if(p.avatar?.weapon && p.avatar.weapon!=='weapon_none'){
      ctx.fillStyle='#e5e7eb';
      // sword on side
      const atkSwing = p.isAttacking ? Date.now()%200 <100 ? -0.6 : 0.6 : 0;
      ctx.save(); ctx.rotate(atkSwing);
      ctx.fillRect(10, -10, 18, 4);
      ctx.fillStyle='#f59e0b'; ctx.fillRect(24, -11, 6, 6);
      ctx.restore();
      ctx.font='10px serif'; ctx.fillText(this.avatarEmoji(p.avatar.weapon), 18, -12);
    }
    // accessory wings
    if(p.avatar?.accessory==='acc_wings'){
      ctx.fillStyle='rgba(167,139,250,.7)';
      ctx.beginPath(); ctx.ellipse(-14,-6,10,14, -0.4,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(14,-6,10,14, 0.4,0,Math.PI*2); ctx.fill();
    } else if(p.avatar?.accessory==='acc_cape'){
      ctx.fillStyle='rgba(239,68,68,.85)'; ctx.fillRect(-12,-10,4,22);
    }
    ctx.restore();

    // name & hp bar (not mirrored)
    ctx.save();
    ctx.translate(x,y);
    ctx.textAlign='center';
    ctx.font='700 11px Noto Sans KR';
    ctx.fillStyle= isMe ? '#f59e0b' : '#e6eefc';
    ctx.fillText(p.username || (isMe?'나':'플레이어'), 0, -38);
    if(p.level) { ctx.font='600 10px JetBrains Mono'; ctx.fillStyle='rgba(255,255,255,.7)'; ctx.fillText(`Lv.${p.level}`, 0, -48); }
    // hp
    const w=44, h=5;
    ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(-w/2, -30, w, h);
    ctx.fillStyle= p.hp/p.maxHp <0.3 ? '#ef4444' : '#22c55e';
    ctx.fillRect(-w/2, -30, w*(Math.max(0,p.hp)/Math.max(1,p.maxHp)), h);
    ctx.strokeStyle='rgba(255,255,255,.15)'; ctx.strokeRect(-w/2,-30,w,h);
    // hit flash
    if(p._hitUntil && Date.now()<p._hitUntil){ ctx.fillStyle='rgba(239,68,68,.25)'; ctx.beginPath(); ctx.arc(0,0,22,0,Math.PI*2); ctx.fill(); }
    ctx.restore();
  }
  avatarColor(id, fallback){
    const map={ top_knight:'#475569', top_mage:'#7c3aed', top_street:'#0ea5e9', bottom_armor:'#334155' };
    return map[id]||fallback;
  }
  avatarEmoji(id){
    const map={ head_crown:'👑', head_hood:'🎭', head_helm:'⛑️', head_halo:'😇', weapon_sword_aura:'⚔️', weapon_staff_gold:'🔱', weapon_bow:'🏹', acc_wings:'🦋', acc_cape:'🧣' };
    return map[id]||'';
  }
  drawMonster(m){
    const ctx=this.ctx; const cam=this.camera;
    const x=m.x - cam.x, y=m.y - cam.y;
    const s = m.size||26;
    ctx.save();
    ctx.translate(x,y);
    if((this.settings?.graphics?.shadow||'high')!=='off'){
      ctx.fillStyle='rgba(0,0,0,.32)'; ctx.beginPath(); ctx.ellipse(0, s/2+2, s*0.62, 6,0,0,Math.PI*2); ctx.fill();
    }
    const t = Date.now()*0.004 + (m.id.charCodeAt(2)||0);
    const bob = Math.sin(t)*1.4;
    ctx.translate(0,bob);
    // distinct per-type high quality
    if(m.type==='slime'){
      // jelly wobble
      const wob = Math.sin(t*1.5)*2;
      ctx.fillStyle='#22c55e';
      ctx.beginPath(); ctx.ellipse(0,2, s/2+1, s/2-1 + wob*0.4, 0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.85)'; ctx.beginPath(); ctx.ellipse(-4,-4, 4,2.5,-0.3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#0f172a'; ctx.beginPath(); ctx.arc(-5,-1,2.2,0,Math.PI*2); ctx.arc(5,-1,2.2,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#f87171'; ctx.beginPath(); ctx.arc(-5,-1,1,0,Math.PI*2); ctx.arc(5,-1,1,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(0,0,0,.15)'; ctx.beginPath(); ctx.ellipse(0,6, s/3,2,0,0,Math.PI*2); ctx.fill();
    } else if(m.type==='bat'){
      // wings flapping
      const flap = Math.sin(t*4)*0.5;
      ctx.fillStyle='#3b0764'; ctx.beginPath(); ctx.ellipse(-9, -2+flap, 9,6, -0.4+flap*0.2,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(9, -2-flap, 9,6, 0.4-flap*0.2,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#4c1d95'; ctx.beginPath(); ctx.ellipse(0,0, s/2-2, s/2-4,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fde68a'; ctx.beginPath(); ctx.arc(0,-3,5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#ef4444'; ctx.beginPath(); ctx.arc(-2,-4,1.2,0,Math.PI*2); ctx.arc(2,-4,1.2,0,Math.PI*2); ctx.fill();
    } else if(m.type==='spider'){
      ctx.fillStyle='#111827'; 
      // legs
      ctx.strokeStyle='#1f2937'; ctx.lineWidth=2; ctx.lineCap='round';
      for(let i=-1;i<=1;i+=1){ ctx.beginPath(); ctx.moveTo(-6,i*5); ctx.lineTo(-14, i*7-2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(6,i*5); ctx.lineTo(14, i*7-2); ctx.stroke(); }
      ctx.fillStyle='#1f2937'; ctx.beginPath(); ctx.ellipse(0,0, s/2, s/2.2,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#374151'; ctx.beginPath(); ctx.ellipse(0,2, s/3, s/4,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#ef4444'; for(let i=-1;i<=1;i+=2){ ctx.beginPath(); ctx.arc(i*4,-4,1.6,0,Math.PI*2); ctx.fill(); }
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(-4,-5,0.6,0,Math.PI*2); ctx.arc(4,-5,0.6,0,Math.PI*2); ctx.fill();
    } else if(m.type==='goblin'){
      ctx.fillStyle='#854d0e'; ctx.beginPath(); ctx.roundRect(-s/2,-s/2+2, s, s-4, 5); ctx.fill();
      ctx.fillStyle='#a16207'; ctx.fillRect(-s/2+3, -s/2+6, s-6, 4);
      ctx.fillStyle='#fde68a'; ctx.beginPath(); ctx.arc(0,-6,6,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#0f172a'; ctx.beginPath(); ctx.arc(-3,-7,1.4,0,Math.PI*2); ctx.arc(3,-7,1.4,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#451a03'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(-5,-2); ctx.lineTo(5,-2); ctx.stroke();
      // club
      ctx.fillStyle='#78350f'; ctx.fillRect(8,-2,10,3); ctx.fillStyle='#57534e'; ctx.beginPath(); ctx.arc(18, -0.5,4,0,Math.PI*2); ctx.fill();
    } else if(m.type==='skeleton'){
      ctx.fillStyle='#e7e5e4'; ctx.beginPath(); ctx.roundRect(-7,-10,14,20,4); ctx.fill();
      ctx.fillStyle='#f5f5f4'; ctx.beginPath(); ctx.arc(0,-12,7,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#0f172a'; ctx.beginPath(); ctx.arc(-3,-13,1.8,0,Math.PI*2); ctx.arc(3,-13,1.8,0,Math.PI*2); ctx.fill();
      // glowing eyes
      ctx.fillStyle='#22d3ee'; ctx.shadowColor='#06b6d4'; ctx.shadowBlur=6; ctx.beginPath(); ctx.arc(-3,-13,1,0,Math.PI*2); ctx.arc(3,-13,1,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
      ctx.strokeStyle='#d6d3d1'; ctx.lineWidth=1; for(let i=-1;i<=1;i++){ ctx.beginPath(); ctx.moveTo(-6,i*4-2); ctx.lineTo(-10,i*3); ctx.stroke(); ctx.beginPath(); ctx.moveTo(6,i*4-2); ctx.lineTo(10,i*3); ctx.stroke(); }
    } else if(m.type==='orc'){
      ctx.fillStyle='#7f1d1d'; ctx.beginPath(); ctx.roundRect(-s/2,-s/2, s, s, 6); ctx.fill();
      ctx.fillStyle='#991b1b'; ctx.fillRect(-s/2+4, -s/2+4, s-8,5);
      ctx.fillStyle='#fecaca'; ctx.beginPath(); ctx.arc(0,-8,7,0,Math.PI*2); ctx.fill();
      // tusks
      ctx.fillStyle='#fef3c7'; ctx.beginPath(); ctx.moveTo(-4,-4); ctx.lineTo(-6, -2); ctx.lineTo(-3,-2); ctx.fill(); ctx.beginPath(); ctx.moveTo(4,-4); ctx.lineTo(6,-2); ctx.lineTo(3,-2); ctx.fill();
      ctx.fillStyle='#0f172a'; ctx.beginPath(); ctx.arc(-3,-8,1.6,0,Math.PI*2); ctx.arc(3,-8,1.6,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#450a0a'; ctx.fillRect(-5, -1,10,3);
    } else if(m.type==='golem'){
      ctx.fillStyle='#57534e'; ctx.beginPath(); ctx.roundRect(-s/2,-s/2, s, s-2, 4); ctx.fill();
      ctx.fillStyle='#78716c'; ctx.fillRect(-s/2+3, -s/2+3, s-6, s/3);
      ctx.fillStyle='#a8a29e'; for(let i=0;i<3;i++){ ctx.beginPath(); ctx.arc(-8+i*8, -4,2,0,Math.PI*2); ctx.fill(); }
      ctx.fillStyle='#fbbf24'; ctx.shadowColor='#f59e0b'; ctx.shadowBlur=8; ctx.beginPath(); ctx.arc(-4,-6,2,0,Math.PI*2); ctx.arc(4,-6,2,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
    } else if(m.type==='wraith'){
      ctx.fillStyle='rgba(125,211,252,0.92)'; ctx.beginPath(); ctx.moveTo(0,-s/2); ctx.quadraticCurveTo(s/2,-s/4, s/3,s/2); ctx.lineTo(0,s/2-4); ctx.lineTo(-s/3,s/2); ctx.quadraticCurveTo(-s/2,-s/4,0,-s/2); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.85)'; ctx.beginPath(); ctx.ellipse(-2,-10,6,4,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#0f172a'; ctx.beginPath(); ctx.arc(-2,-10,1.8,0,Math.PI*2); ctx.arc(5,-8,1.4,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(125,211,252,.5)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(-s/3,4); ctx.quadraticCurveTo(-s/4,10, -s/5,5); ctx.stroke();
    } else if(m.type==='lizard'){
      ctx.fillStyle='#15803d'; ctx.beginPath(); ctx.ellipse(0,0, s/2+2, s/2-2,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#16a34a'; ctx.beginPath(); ctx.ellipse(0,2, s/3, s/4,0,0,Math.PI*2); ctx.fill();
      // tail
      ctx.fillStyle='#166534'; ctx.beginPath(); ctx.ellipse( s/2+4,2,8,4,0.3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fde68a'; ctx.beginPath(); ctx.ellipse( -s/2+2, -4,6,5,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#ef4444'; ctx.beginPath(); ctx.arc(-s/2+4,-5,1.5,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(-s/2-1,-5,1.5,0,Math.PI*2); ctx.fill();
    } else if(m.type==='demon'){
      ctx.fillStyle='#450a0a'; ctx.beginPath(); ctx.roundRect(-s/2,-s/2+2, s, s-2, 5); ctx.fill();
      // horns
      ctx.fillStyle='#1c1917'; ctx.beginPath(); ctx.moveTo(-6,-s/2+2); ctx.lineTo(-10,-s/2-4); ctx.lineTo(-4,-s/2); ctx.fill(); ctx.beginPath(); ctx.moveTo(6,-s/2+2); ctx.lineTo(10,-s/2-4); ctx.lineTo(4,-s/2); ctx.fill();
      ctx.fillStyle='#f87171'; ctx.shadowColor='#ef4444'; ctx.shadowBlur=6; ctx.beginPath(); ctx.arc(-3,-6,1.8,0,Math.PI*2); ctx.arc(3,-6,1.8,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
      ctx.fillStyle='#0f172a'; ctx.beginPath(); ctx.arc(-3,-6,0.9,0,Math.PI*2); ctx.arc(3,-6,0.9,0,Math.PI*2); ctx.fill();
    } else if(m.type==='boss_dragon'){
      ctx.fillStyle='#111827';
      ctx.fillStyle='#1f2937'; ctx.beginPath(); ctx.ellipse(-18,-4,18,12,-0.5,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.ellipse(18,-4,18,12,0.5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#7f1d1d'; ctx.beginPath(); ctx.arc(0,0,28,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fillRect(-4,8,8,10);
      ctx.fillStyle='#f59e0b'; ctx.shadowColor='#ef4444'; ctx.shadowBlur=8; ctx.beginPath(); ctx.arc(-8,-8,4,0,Math.PI*2); ctx.arc(8,-8,4,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
      // spikes
      ctx.fillStyle='#450a0a'; for(let i=-2;i<=2;i++){ ctx.beginPath(); ctx.moveTo(i*8, -18); ctx.lineTo(i*8-3,-26); ctx.lineTo(i*8+3,-26); ctx.fill(); }
    } else if(m.type==='boss_frost'){
      ctx.fillStyle='#0c4a6e'; ctx.beginPath(); ctx.roundRect(-s/2,-s/2, s, s, 10); ctx.fill();
      ctx.fillStyle='#38bdf8'; ctx.beginPath(); ctx.arc(0,-8,10,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#e0f2fe'; ctx.beginPath(); ctx.arc(-4,-10,3,0,Math.PI*2); ctx.arc(4,-10,3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#0f172a'; ctx.beginPath(); ctx.arc(-4,-10,1.6,0,Math.PI*2); ctx.arc(4,-10,1.6,0,Math.PI*2); ctx.fill();
      // crown
      ctx.fillStyle='#7dd3fc'; ctx.beginPath(); ctx.moveTo(-10,-18); ctx.lineTo(0,-26); ctx.lineTo(10,-18); ctx.lineTo(10,-14); ctx.lineTo(-10,-14); ctx.closePath(); ctx.fill();
      ctx.shadowColor='#22d3ee'; ctx.shadowBlur=10; ctx.strokeStyle='rgba(255,255,255,.6)'; ctx.lineWidth=1.2; ctx.strokeRect(-s/2,-s/2,s,s); ctx.shadowBlur=0;
    } else if(m.type==='boss_void'){
      ctx.fillStyle='#4c0519'; ctx.beginPath(); ctx.arc(0,0, s/2,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#881337'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0, s/2-3,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle='#f43f5e'; ctx.shadowColor='#9f1239'; ctx.shadowBlur=12; ctx.beginPath(); ctx.arc(-6,-6,3.5,0,Math.PI*2); ctx.arc(6,-6,3.5,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
      // tentacles
      ctx.strokeStyle='#881337'; ctx.lineWidth=2.5; for(let i=-1;i<=1;i++){ ctx.beginPath(); ctx.moveTo(i*8,8); ctx.quadraticCurveTo(i*10,14, i*6,18); ctx.stroke(); }
    } else {
      ctx.fillStyle= m.color || '#4ade80';
      ctx.beginPath(); ctx.arc(0,0,s/2,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#0f172a'; ctx.beginPath(); ctx.arc(-6,-4,3,0,Math.PI*2); ctx.arc(6,-4,3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#ef4444'; ctx.beginPath(); ctx.arc(-6,-4,1.5,0,Math.PI*2); ctx.arc(6,-4,1.5,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
    // hp bar with rarity color
    const isBoss = m.type && m.type.startsWith('boss');
    const w= isBoss? 68: 42, h=5;
    ctx.fillStyle='rgba(0,0,0,.62)'; ctx.beginPath(); ctx.roundRect(x - w/2, y - s/2 -16, w, h, 2); ctx.fill();
    const hpPct = Math.max(0,m.hp)/Math.max(1,m.maxHp);
    ctx.fillStyle= hpPct <0.3 ? '#ef4444' : hpPct <0.6 ? '#f59e0b' : '#22c55e';
    ctx.beginPath(); ctx.roundRect(x - w/2+1, y - s/2 -15, (w-2)*hpPct, h-2, 1); ctx.fill();
    // name
    ctx.fillStyle=isBoss ? '#fbbf24' : '#e6eefc'; ctx.font=isBoss ? '800 11px Noto Sans KR' : '700 10px Noto Sans KR'; ctx.textAlign='center';
    ctx.fillText(m.name||m.type, x, y - s/2 -20);
    if(isBoss){ ctx.fillStyle='rgba(251,191,36,.9)'; ctx.font='700 8px JetBrains Mono'; ctx.fillText('BOSS', x, y - s/2 -30); }
  }
  drawProjectile(p){
    const ctx=this.ctx; const cam=this.camera;
    const x=p.x - cam.x, y=p.y - cam.y;
    ctx.fillStyle=p.color||'#f59e0b';
    const shadowQ = this.settings?.graphics?.shadow||'high';
    if(shadowQ==='high'){ ctx.shadowColor=p.color||'#f59e0b'; ctx.shadowBlur=12; }
    else ctx.shadowBlur=0;
    ctx.beginPath(); ctx.arc(x,y,5,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
  }
  drawEffect(e){
    const ctx=this.ctx; const cam=this.camera;
    const x=e.x - cam.x, y=e.y - cam.y;
    ctx.save(); ctx.translate(x,y);
    if(e.type==='slash'){
      ctx.strokeStyle='rgba(251,191,36,.9)'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(0,0, e.r||36, -0.6, 0.6); ctx.stroke();
    } else if(e.type==='hit'){
      ctx.fillStyle='rgba(239,68,68,.9)'; ctx.beginPath(); ctx.arc(0,0,6,0,Math.PI*2); ctx.fill();
    } else if(e.type==='meteor'){
      const g=ctx.createRadialGradient(0,0,0,0,0,e.r||80);
      g.addColorStop(0,'rgba(245,158,11,.5)'); g.addColorStop(1,'transparent');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(0,0,e.r||80,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }
  spawnParticles(x,y, color='#f59e0b', count=8){
    if(this.settings?.graphics?.particles===false) return;
    const shadowQ = this.settings?.graphics?.shadow||'high';
    // low quality reduces particle count by half
    const effectiveCount = shadowQ==='low' ? Math.ceil(count*0.5) : shadowQ==='off' ? 0 : count;
    if(effectiveCount===0) return;
    for(let i=0;i<effectiveCount;i++){
      this.particles.push({x,y, vx:(Math.random()-0.5)*6, vy:(Math.random()-0.5)*6-1, life:1, decay:0.04+Math.random()*0.03, color, size:2+Math.random()*3});
    }
  }
  updateParticles(){
    const ctx=this.ctx; const cam=this.camera;
    for(let i=this.particles.length-1;i>=0;i--){
      const p=this.particles[i];
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.2; p.life-=p.decay;
      if(p.life<=0){ this.particles.splice(i,1); continue; }
      const x=p.x - cam.x, y=p.y - cam.y;
      ctx.globalAlpha= p.life;
      ctx.fillStyle=p.color; ctx.beginPath(); ctx.arc(x,y,p.size,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
  }
}
