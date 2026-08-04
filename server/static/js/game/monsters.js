const MONSTER_CLASS_BASES = [
    { hp: 15, speed: 1.2, dmg: 4, exp: 8, tokens: 3, size: 18 },
    { hp: 28, speed: 1.0, dmg: 9, exp: 16, tokens: 7, size: 22 },
    { hp: 50, speed: 0.9, dmg: 16, exp: 28, tokens: 12, size: 26 },
    { hp: 80, speed: 1.1, dmg: 25, exp: 45, tokens: 18, size: 32 },
    { hp: 180, speed: 0.7, dmg: 45, exp: 120, tokens: 50, size: 42 },
];

const MONSTER_DESIGNS = {
    1: [
        { name: 'Slime', waveMin: 1, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#4ade80';
            ctx.beginPath(); ctx.ellipse(x, y + b, r*0.7, r*0.5, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#222'; const e = r*0.08;
            ctx.beginPath(); ctx.arc(x - r*0.2, y - r*0.05 + b, e, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.2, y - r*0.05 + b, e, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Skeleton', waveMin: 5, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#ddd';
            ctx.beginPath(); ctx.arc(x, y - r*0.25 + b, r*0.2, 0, Math.PI*2); ctx.fill();
            ctx.fillRect(x - r*0.06, y - r*0.05 + b, r*0.12, r*0.45);
            ctx.strokeStyle = '#ddd'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(x - r*0.06, y + r*0.05 + b); ctx.lineTo(x - r*0.4, y + r*0.15 + b); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + r*0.06, y + r*0.05 + b); ctx.lineTo(x + r*0.4, y + r*0.15 + b); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x - r*0.04, y + r*0.4 + b); ctx.lineTo(x - r*0.25, y + r*0.65 + b); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + r*0.04, y + r*0.4 + b); ctx.lineTo(x + r*0.25, y + r*0.65 + b); ctx.stroke();
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x - r*0.08, y - r*0.25 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.08, y - r*0.25 + b, 2, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Golem', waveMin: 15, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#8a6a3a';
            ctx.fillRect(x - r*0.35, y - r*0.35 + b, r*0.7, r*0.7);
            ctx.fillStyle = '#6a4a2a'; ctx.fillRect(x - r*0.25, y - r*0.25 + b, r*0.5, r*0.1);
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x - r*0.12, y - r*0.08 + b, r*0.05, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.12, y - r*0.08 + b, r*0.05, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Treant', waveMin: 30, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#5a3a1a';
            ctx.fillRect(x - r*0.08, y - r*0.15 + b, r*0.16, r*0.5);
            ctx.fillStyle = '#2a6a1a';
            ctx.beginPath(); ctx.arc(x, y - r*0.45 + b, r*0.45, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x - r*0.12, y - r*0.5 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.12, y - r*0.5 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#3a7a2a'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(x - r*0.3, y - r*0.25 + b); ctx.lineTo(x - r*0.55, y - r*0.5 + b); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + r*0.3, y - r*0.25 + b); ctx.lineTo(x + r*0.55, y - r*0.5 + b); ctx.stroke();
        }},
        { name: 'Forest King', waveMin: 50, draw: (ctx, x, y, r, b) => {
            ctx.shadowColor = '#4ade80'; ctx.shadowBlur = 15;
            ctx.fillStyle = '#2a5a1a';
            ctx.beginPath(); ctx.arc(x, y + b, r*0.7, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ffd700';
            for (let i = 0; i < 5; i++) { const a = i*Math.PI*2/5 - Math.PI/2;
                ctx.beginPath(); ctx.arc(x + Math.cos(a)*r*0.4, y - r*0.25 + Math.sin(a)*r*0.25 + b, r*0.05, 0, Math.PI*2); ctx.fill(); }
            ctx.fillStyle = '#ff0';
            ctx.beginPath(); ctx.arc(x, y - r*0.05 + b, r*0.08, 0, Math.PI*2); ctx.fill();
            ctx.shadowBlur = 0;
        }},
    ],
    2: [
        { name: 'Sand Crab', waveMin: 1, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#d4a050';
            ctx.beginPath(); ctx.ellipse(x, y + b, r*0.6, r*0.4, 0, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#b08030'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(x - r*0.6, y - r*0.05 + b); ctx.lineTo(x - r*0.35, y - r*0.2 + b); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + r*0.6, y - r*0.05 + b); ctx.lineTo(x + r*0.35, y - r*0.2 + b); ctx.stroke();
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x - r*0.15, y - r*0.05 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.15, y - r*0.05 + b, r*0.04, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Mummy', waveMin: 5, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#e8d4a0';
            ctx.fillRect(x - r*0.12, y - r*0.3 + b, r*0.24, r*0.6);
            ctx.beginPath(); ctx.arc(x, y - r*0.45 + b, r*0.18, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#c0a070'; ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath(); ctx.moveTo(x - r*0.12, y - r*0.15 + i*r*0.12 + b); ctx.lineTo(x + r*0.12, y - r*0.05 + i*r*0.12 + b); ctx.stroke(); }
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x - r*0.06, y - r*0.45 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.06, y - r*0.45 + b, 2, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Sand Golem', waveMin: 15, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#c8a060';
            ctx.fillRect(x - r*0.4, y - r*0.4 + b, r*0.8, r*0.8);
            ctx.fillStyle = '#a08040';
            ctx.fillRect(x - r*0.25, y - r*0.25 + b, r*0.5, r*0.08);
            ctx.fillRect(x - r*0.25, y + r*0.15 + b, r*0.5, r*0.08);
            ctx.fillStyle = '#ff0';
            ctx.beginPath(); ctx.arc(x - r*0.12, y - r*0.08 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.12, y - r*0.08 + b, r*0.04, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Scorpion', waveMin: 30, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#8a3010';
            ctx.beginPath(); ctx.ellipse(x, y + b, r*0.5, r*0.3, 0, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#8a3010'; ctx.lineWidth = 2;
            for (let s = -1; s <= 1; s += 2) {
                ctx.beginPath(); ctx.moveTo(x + s*r*0.15, y + r*0.1 + b);
                ctx.lineTo(x + s*r*0.5, y + r*0.15 + b); ctx.stroke(); }
            ctx.fillStyle = '#c84020';
            ctx.beginPath(); ctx.arc(x, y - r*0.2 + b, r*0.12, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x - r*0.05, y - r*0.2 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.05, y - r*0.2 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#c84020'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(x, y - r*0.1 + b); ctx.lineTo(x, y - r*0.6 + b);
            ctx.lineTo(x - r*0.15, y - r*0.5 + b); ctx.moveTo(x, y - r*0.6 + b); ctx.lineTo(x + r*0.15, y - r*0.5 + b); ctx.stroke();
        }},
        { name: 'Pharaoh', waveMin: 50, draw: (ctx, x, y, r, b) => {
            ctx.shadowColor = '#ffa500'; ctx.shadowBlur = 15;
            ctx.fillStyle = '#daa520';
            ctx.fillRect(x - r*0.3, y - r*0.2 + b, r*0.6, r*0.6);
            ctx.fillStyle = '#ffd700';
            ctx.beginPath(); ctx.moveTo(x, y - r*0.8 + b); ctx.lineTo(x - r*0.2, y - r*0.35 + b);
            ctx.lineTo(x + r*0.2, y - r*0.35 + b); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x - r*0.1, y - r*0.05 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.1, y - r*0.05 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#8a6000'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(x, y + r*0.1 + b); ctx.lineTo(x, y + r*0.4 + b); ctx.stroke();
            ctx.shadowBlur = 0;
        }},
    ],
    3: [
        { name: 'Bat', waveMin: 1, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#3a1a3a';
            ctx.beginPath(); ctx.ellipse(x, y + b, r*0.3, r*0.25, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#5a3a5a';
            ctx.beginPath(); ctx.moveTo(x - r*0.3, y + b); ctx.lineTo(x - r*0.7, y - r*0.2 + b);
            ctx.lineTo(x - r*0.3, y + r*0.1 + b); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x + r*0.3, y + b); ctx.lineTo(x + r*0.7, y - r*0.2 + b);
            ctx.lineTo(x + r*0.3, y + r*0.1 + b); ctx.fill();
            ctx.fillStyle = '#f44';
            ctx.beginPath(); ctx.arc(x - r*0.08, y - r*0.02 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.08, y - r*0.02 + b, 2, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Spider', waveMin: 5, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#2a1a2a';
            ctx.beginPath(); ctx.arc(x, y + b, r*0.3, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#2a1a2a'; ctx.lineWidth = 2;
            for (let s = 0; s < 8; s++) {
                const a = s * Math.PI/4; const legLen = r*0.5;
                ctx.beginPath(); ctx.moveTo(x + Math.cos(a)*r*0.2, y + Math.sin(a)*r*0.2 + b);
                ctx.lineTo(x + Math.cos(a)*legLen, y + Math.sin(a)*legLen + b); ctx.stroke(); }
            ctx.fillStyle = '#f44';
            ctx.beginPath(); ctx.arc(x - r*0.08, y - r*0.05 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.08, y - r*0.05 + b, 2, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Cave Troll', waveMin: 15, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#6a5a4a';
            ctx.fillRect(x - r*0.4, y - r*0.3 + b, r*0.8, r*0.7);
            ctx.fillStyle = '#4a3a2a';
            ctx.beginPath(); ctx.arc(x, y - r*0.5 + b, r*0.25, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ff0';
            ctx.beginPath(); ctx.arc(x - r*0.1, y - r*0.55 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.1, y - r*0.55 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#8a5040';
            ctx.fillRect(x - r*0.02, y - r*0.4 + b, r*0.04, r*0.05);
        }},
        { name: 'Wraith', waveMin: 30, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = 'rgba(160,80,200,0.5)';
            ctx.beginPath(); ctx.arc(x, y - r*0.3 + b, r*0.2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x - r*0.3, y + b); ctx.lineTo(x - r*0.4, y + r*0.6 + b);
            ctx.lineTo(x + r*0.4, y + r*0.6 + b); ctx.lineTo(x + r*0.3, y + b); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(x - r*0.08, y - r*0.3 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.08, y - r*0.3 + b, 2, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Dark Lord', waveMin: 50, draw: (ctx, x, y, r, b) => {
            ctx.shadowColor = '#800'; ctx.shadowBlur = 20;
            ctx.fillStyle = '#1a0a1a';
            ctx.fillRect(x - r*0.35, y - r*0.2 + b, r*0.7, r*0.7);
            ctx.fillStyle = '#3a1a3a';
            ctx.beginPath(); ctx.arc(x, y - r*0.5 + b, r*0.25, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#f00';
            ctx.beginPath(); ctx.arc(x - r*0.1, y - r*0.55 + b, r*0.06, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.1, y - r*0.55 + b, r*0.06, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#5a3a3a'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(x - r*0.35, y - r*0.15 + b); ctx.lineTo(x - r*0.55, y - r*0.4 + b); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + r*0.35, y - r*0.15 + b); ctx.lineTo(x + r*0.55, y - r*0.4 + b); ctx.stroke();
            ctx.shadowBlur = 0;
        }},
    ],
    4: [
        { name: 'Ice Imp', waveMin: 1, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#aae0f0';
            ctx.beginPath(); ctx.arc(x, y + b, r*0.3, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#6ab0c0';
            ctx.beginPath(); ctx.moveTo(x - r*0.2, y + r*0.2 + b); ctx.lineTo(x, y + r*0.5 + b); ctx.lineTo(x + r*0.2, y + r*0.2 + b); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(x - r*0.08, y - r*0.03 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.08, y - r*0.03 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#4a8a9a'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(x - r*0.15, y - r*0.2 + b); ctx.lineTo(x - r*0.25, y - r*0.4 + b); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + r*0.15, y - r*0.2 + b); ctx.lineTo(x + r*0.25, y - r*0.4 + b); ctx.stroke();
        }},
        { name: 'Frost Wolf', waveMin: 5, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#cce0f0';
            ctx.beginPath(); ctx.ellipse(x, y + b, r*0.5, r*0.3, 0, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.35, y - r*0.1 + b, r*0.2, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x + r*0.4, y - r*0.15 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.3, y - r*0.15 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#8ab0c0';
            ctx.beginPath(); ctx.moveTo(x - r*0.4, y - r*0.05 + b); ctx.lineTo(x - r*0.6, y - r*0.3 + b); ctx.lineTo(x - r*0.5, y + b); ctx.fill();
        }},
        { name: 'Yeti', waveMin: 15, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#e8e8f0';
            ctx.beginPath(); ctx.arc(x, y - r*0.15 + b, r*0.4, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#d0d0e0';
            ctx.fillRect(x - r*0.3, y + r*0.15 + b, r*0.6, r*0.45);
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x - r*0.12, y - r*0.2 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.12, y - r*0.2 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#8a5040';
            ctx.beginPath(); ctx.arc(x, y - r*0.08 + b, r*0.05, 0, Math.PI); ctx.fill();
        }},
        { name: 'Ice Golem', waveMin: 30, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#6ac0d0';
            ctx.fillRect(x - r*0.4, y - r*0.4 + b, r*0.8, r*0.8);
            ctx.fillStyle = '#8ad8e8';
            for (let i = 0; i < 4; i++) {
                ctx.fillRect(x - r*0.3 + i*r*0.15, y - r*0.3 + i*r*0.08 + b, r*0.1, r*0.1); }
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(x - r*0.1, y - r*0.08 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.1, y - r*0.08 + b, r*0.04, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Frost Queen', waveMin: 50, draw: (ctx, x, y, r, b) => {
            ctx.shadowColor = '#8ae0f0'; ctx.shadowBlur = 20;
            ctx.fillStyle = '#c0e8f4';
            ctx.beginPath(); ctx.arc(x, y - r*0.3 + b, r*0.2, 0, Math.PI*2); ctx.fill();
            ctx.fillRect(x - r*0.25, y - r*0.1 + b, r*0.5, r*0.5);
            ctx.fillStyle = '#fff';
            for (let i = 0; i < 6; i++) {
                const a = i*Math.PI/3 - Math.PI/2;
                ctx.beginPath(); ctx.arc(x + Math.cos(a)*r*0.35, y + Math.sin(a)*r*0.2 + b, r*0.04, 0, Math.PI*2); ctx.fill(); }
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x - r*0.08, y - r*0.3 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.08, y - r*0.3 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.shadowBlur = 0;
        }},
    ],
    5: [
        { name: 'Ember', waveMin: 1, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#ff6600';
            ctx.beginPath(); ctx.arc(x, y + b, r*0.2, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ffaa00';
            ctx.beginPath(); ctx.arc(x - r*0.1, y - r*0.1 + b, r*0.1, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.1, y + r*0.05 + b, r*0.08, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ff0';
            ctx.beginPath(); ctx.arc(x, y - r*0.15 + b, r*0.04, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Fire Elemental', waveMin: 5, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#ff4400';
            ctx.beginPath(); ctx.moveTo(x, y - r*0.7 + b); ctx.lineTo(x - r*0.3, y + b);
            ctx.lineTo(x - r*0.2, y + r*0.3 + b); ctx.lineTo(x, y + r*0.1 + b);
            ctx.lineTo(x + r*0.2, y + r*0.3 + b); ctx.lineTo(x + r*0.3, y + b); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#ffaa00';
            ctx.beginPath(); ctx.arc(x, y - r*0.3 + b, r*0.1, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ff0';
            ctx.beginPath(); ctx.arc(x - r*0.05, y - r*0.35 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.05, y - r*0.35 + b, 2, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Lava Golem', waveMin: 15, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#8a3a00';
            ctx.fillRect(x - r*0.4, y - r*0.35 + b, r*0.8, r*0.7);
            ctx.fillStyle = '#ff4400';
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(x - r*0.3 + i*r*0.2, y - r*0.2 + i*r*0.12 + b, r*0.1, r*0.05); }
            ctx.fillStyle = '#ff0';
            ctx.beginPath(); ctx.arc(x - r*0.1, y - r*0.1 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.1, y - r*0.1 + b, r*0.04, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Demon', waveMin: 30, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#6a1a1a';
            ctx.fillRect(x - r*0.3, y - r*0.2 + b, r*0.6, r*0.6);
            ctx.beginPath(); ctx.arc(x, y - r*0.5 + b, r*0.25, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#aa2a2a';
            ctx.beginPath(); ctx.moveTo(x - r*0.15, y - r*0.65 + b); ctx.lineTo(x - r*0.2, y - r*0.9 + b); ctx.lineTo(x, y - r*0.7 + b); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x + r*0.15, y - r*0.65 + b); ctx.lineTo(x + r*0.2, y - r*0.9 + b); ctx.lineTo(x, y - r*0.7 + b); ctx.fill();
            ctx.fillStyle = '#ff0';
            ctx.beginPath(); ctx.arc(x - r*0.1, y - r*0.55 + b, r*0.05, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.1, y - r*0.55 + b, r*0.05, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Lava Dragon', waveMin: 50, draw: (ctx, x, y, r, b) => {
            ctx.shadowColor = '#ff4400'; ctx.shadowBlur = 20;
            ctx.fillStyle = '#8a2a00';
            ctx.beginPath(); ctx.ellipse(x, y + b, r*0.8, r*0.4, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillRect(x + r*0.4, y - r*0.15 + b, r*0.3, r*0.2);
            ctx.fillStyle = '#ff6600';
            ctx.beginPath(); ctx.moveTo(x - r*0.3, y - r*0.15 + b); ctx.lineTo(x - r*0.6, y - r*0.5 + b); ctx.lineTo(x - r*0.2, y - r*0.2 + b); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x + r*0.3, y - r*0.15 + b); ctx.lineTo(x + r*0.6, y - r*0.5 + b); ctx.lineTo(x + r*0.2, y - r*0.2 + b); ctx.fill();
            ctx.fillStyle = '#ff0';
            ctx.beginPath(); ctx.arc(x + r*0.55, y - r*0.15 + b, r*0.06, 0, Math.PI*2); ctx.fill();
            ctx.shadowBlur = 0;
        }},
    ],
    6: [
        { name: 'Rat', waveMin: 1, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#8a7a6a';
            ctx.beginPath(); ctx.ellipse(x, y + b, r*0.4, r*0.25, 0, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.35, y - r*0.05 + b, r*0.15, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x + r*0.4, y - r*0.1 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#8a7a6a'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x - r*0.3, y - b*0.2 + b); ctx.lineTo(x - r*0.5, y - r*0.3 + b); ctx.stroke();
        }},
        { name: 'Animated Armor', waveMin: 5, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#8a8a8a';
            ctx.fillRect(x - r*0.2, y - r*0.35 + b, r*0.4, r*0.7);
            ctx.fillStyle = '#6a6a6a';
            ctx.beginPath(); ctx.arc(x, y - r*0.55 + b, r*0.18, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#aaa';
            ctx.fillRect(x - r*0.15, y - r*0.1 + b, r*0.3, r*0.05);
            ctx.fillRect(x - r*0.15, y + r*0.1 + b, r*0.3, r*0.05);
            ctx.fillStyle = '#ff0';
            ctx.beginPath(); ctx.arc(x - r*0.06, y - r*0.55 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.06, y - r*0.55 + b, 2, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Stone Golem', waveMin: 15, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#6a6a6a';
            ctx.fillRect(x - r*0.45, y - r*0.35 + b, r*0.9, r*0.7);
            ctx.fillStyle = '#8a8a8a';
            ctx.fillRect(x - r*0.3, y - r*0.25 + b, r*0.6, r*0.1);
            ctx.fillRect(x - r*0.2, y + r*0.15 + b, r*0.4, r*0.1);
            ctx.fillStyle = '#444';
            ctx.beginPath(); ctx.arc(x - r*0.12, y - r*0.08 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.12, y - r*0.08 + b, r*0.04, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Mummy Lord', waveMin: 30, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#d4b878';
            ctx.fillRect(x - r*0.15, y - r*0.3 + b, r*0.3, r*0.6);
            ctx.beginPath(); ctx.arc(x, y - r*0.45 + b, r*0.2, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ffd700';
            ctx.beginPath(); ctx.arc(x, y - r*0.75 + b, r*0.12, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#444';
            ctx.beginPath(); ctx.arc(x - r*0.06, y - r*0.45 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.06, y - r*0.45 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#b09858'; ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath(); ctx.moveTo(x - r*0.15, y - r*0.15 + i*r*0.12 + b);
                ctx.lineTo(x + r*0.15, y - r*0.05 + i*r*0.12 + b); ctx.stroke(); }
        }},
        { name: 'Tomb King', waveMin: 50, draw: (ctx, x, y, r, b) => {
            ctx.shadowColor = '#daa520'; ctx.shadowBlur = 15;
            ctx.fillStyle = '#4a3a2a';
            ctx.fillRect(x - r*0.35, y - r*0.2 + b, r*0.7, r*0.7);
            ctx.fillStyle = '#c0a060';
            ctx.beginPath(); ctx.arc(x, y - r*0.6 + b, r*0.25, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x - r*0.08, y - r*0.65 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.08, y - r*0.65 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ffd700';
            ctx.beginPath(); ctx.arc(x, y - r*0.85 + b, r*0.08, 0, Math.PI*2); ctx.fill();
            ctx.shadowBlur = 0;
        }},
    ],
    7: [
        { name: 'Wisp', waveMin: 1, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#c080ff';
            ctx.beginPath(); ctx.arc(x, y + b, r*0.15, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#e0c0ff';
            ctx.beginPath(); ctx.arc(x - r*0.05, y - r*0.05 + b, r*0.06, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(x, y - r*0.08 + b, r*0.03, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Poltergeist', waveMin: 5, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = 'rgba(200,200,255,0.4)';
            ctx.beginPath(); ctx.arc(x, y - r*0.2 + b, r*0.25, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x - r*0.3, y + r*0.05 + b);
            ctx.lineTo(x - r*0.4, y + r*0.5 + b); ctx.lineTo(x - r*0.1, y + r*0.4 + b);
            ctx.lineTo(x + r*0.1, y + r*0.5 + b); ctx.lineTo(x + r*0.4, y + r*0.5 + b);
            ctx.lineTo(x + r*0.3, y + r*0.05 + b); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x - r*0.08, y - r*0.2 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.08, y - r*0.2 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x, y - r*0.1 + b, r*0.05, 0, Math.PI); ctx.stroke();
        }},
        { name: 'Spectre', waveMin: 15, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = 'rgba(120,40,180,0.5)';
            ctx.beginPath(); ctx.arc(x, y + b, r*0.4, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = 'rgba(180,80,220,0.4)';
            ctx.beginPath(); ctx.moveTo(x - r*0.3, y + b);
            ctx.lineTo(x - r*0.5, y + r*0.6 + b); ctx.lineTo(x, y + r*0.4 + b);
            ctx.lineTo(x + r*0.5, y + r*0.6 + b); ctx.lineTo(x + r*0.3, y + b); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(x - r*0.1, y - r*0.05 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.1, y - r*0.05 + b, r*0.04, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Reaper', waveMin: 30, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#1a1a2a';
            ctx.fillRect(x - r*0.25, y - r*0.5 + b, r*0.5, r*0.8);
            ctx.fillStyle = '#2a2a3a';
            ctx.beginPath(); ctx.arc(x, y - r*0.6 + b, r*0.2, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#f00';
            ctx.beginPath(); ctx.arc(x - r*0.06, y - r*0.65 + b, r*0.03, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.06, y - r*0.65 + b, r*0.03, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#2a2a3a'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(x - r*0.25, y + r*0.1 + b); ctx.lineTo(x - r*0.5, y + r*0.5 + b); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + r*0.25, y + r*0.1 + b); ctx.lineTo(x + r*0.5, y + r*0.5 + b); ctx.stroke();
        }},
        { name: 'Lich King', waveMin: 50, draw: (ctx, x, y, r, b) => {
            ctx.shadowColor = '#8000ff'; ctx.shadowBlur = 20;
            ctx.fillStyle = '#2a1a3a';
            ctx.fillRect(x - r*0.35, y - r*0.2 + b, r*0.7, r*0.6);
            ctx.fillStyle = '#ddd';
            ctx.beginPath(); ctx.arc(x, y - r*0.5 + b, r*0.22, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x - r*0.08, y - r*0.55 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.08, y - r*0.55 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.fillRect(x - r*0.02, y - r*0.45 + b, r*0.04, r*0.06);
            ctx.fillStyle = '#c080ff';
            ctx.beginPath(); ctx.arc(x, y - r*0.75 + b, r*0.1, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#5a3a6a'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(x, y + r*0.4 + b); ctx.lineTo(x, y + r*0.6 + b); ctx.stroke();
            ctx.shadowBlur = 0;
        }},
    ],
    8: [
        { name: 'Crystal Shard', waveMin: 1, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#80e0e0';
            ctx.beginPath(); ctx.moveTo(x, y - r*0.5 + b); ctx.lineTo(x - r*0.2, y + r*0.1 + b);
            ctx.lineTo(x - r*0.1, y + r*0.3 + b); ctx.lineTo(x + r*0.1, y + r*0.3 + b);
            ctx.lineTo(x + r*0.2, y + r*0.1 + b); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#c0f0f0';
            ctx.beginPath(); ctx.moveTo(x, y - r*0.4 + b); ctx.lineTo(x - r*0.08, y + b);
            ctx.lineTo(x + r*0.08, y + b); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x, y - r*0.2 + b, 2, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Crystal Golem', waveMin: 5, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#60c0c0';
            ctx.fillRect(x - r*0.35, y - r*0.35 + b, r*0.7, r*0.7);
            ctx.fillStyle = '#80e0e0';
            for (let i = 0; i < 3; i++) {
                ctx.beginPath(); ctx.moveTo(x - r*0.25 + i*r*0.15, y - r*0.35 + b);
                ctx.lineTo(x - r*0.15 + i*r*0.2, y - r*0.45 + b);
                ctx.lineTo(x - r*0.05 + i*r*0.2, y - r*0.35 + b); ctx.fill(); }
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x - r*0.1, y - r*0.08 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.1, y - r*0.08 + b, r*0.04, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Prism', waveMin: 15, draw: (ctx, x, y, r, b) => {
            const colors = ['#ff4488','#44ff88','#4488ff','#ff8844'];
            for (let i = 0; i < 4; i++) {
                ctx.fillStyle = colors[i];
                ctx.beginPath(); ctx.arc(x, y + b, r*0.3 - i*r*0.05, 0, Math.PI*2); ctx.fill(); }
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(x - r*0.08, y - r*0.05 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.08, y - r*0.05 + b, r*0.04, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Diamond Knight', waveMin: 30, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#80c0e0';
            ctx.fillRect(x - r*0.3, y - r*0.3 + b, r*0.6, r*0.65);
            ctx.fillStyle = '#c0e8f4';
            ctx.beginPath(); ctx.moveTo(x, y - r*0.65 + b); ctx.lineTo(x - r*0.2, y - r*0.35 + b);
            ctx.lineTo(x + r*0.2, y - r*0.35 + b); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.fillRect(x - r*0.15, y - r*0.1 + b, r*0.3, r*0.04);
            ctx.fillRect(x - r*0.15, y + r*0.12 + b, r*0.3, r*0.04);
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x - r*0.08, y - r*0.5 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.08, y - r*0.5 + b, 2, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Crystal Queen', waveMin: 50, draw: (ctx, x, y, r, b) => {
            ctx.shadowColor = '#80f0f0'; ctx.shadowBlur = 20;
            ctx.fillStyle = '#b0e8f4';
            ctx.beginPath(); ctx.arc(x, y - r*0.25 + b, r*0.2, 0, Math.PI*2); ctx.fill();
            ctx.fillRect(x - r*0.3, y - r*0.05 + b, r*0.6, r*0.55);
            ctx.fillStyle = '#e0f8ff';
            for (let i = 0; i < 8; i++) {
                const a = i*Math.PI/4;
                ctx.beginPath(); ctx.moveTo(x + Math.cos(a)*r*0.25, y + Math.sin(a)*r*0.05 + b);
                ctx.lineTo(x + Math.cos(a)*r*0.5, y + Math.sin(a)*r*0.15 + b);
                ctx.lineTo(x + Math.cos(a)*r*0.25, y + Math.sin(a)*r*0.3 + b); ctx.fill(); }
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x - r*0.08, y - r*0.25 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.08, y - r*0.25 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.shadowBlur = 0;
        }},
    ],
    9: [
        { name: 'Storm Imp', waveMin: 1, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#888';
            ctx.beginPath(); ctx.arc(x, y + b, r*0.25, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ff0';
            ctx.beginPath(); ctx.arc(x - r*0.15, y - r*0.2 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.15, y - r*0.2 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#ff0'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x - r*0.1, y - r*0.35 + b); ctx.lineTo(x - r*0.2, y - r*0.5 + b); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + r*0.1, y - r*0.35 + b); ctx.lineTo(x + r*0.2, y - r*0.5 + b); ctx.stroke();
        }},
        { name: 'Thunder Beast', waveMin: 5, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#4a4a5a';
            ctx.beginPath(); ctx.ellipse(x, y + b, r*0.5, r*0.3, 0, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.35, y - r*0.1 + b, r*0.2, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ff0';
            ctx.beginPath(); ctx.arc(x + r*0.4, y - r*0.15 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#ff0'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x - r*0.2, y - r*0.1 + b); ctx.lineTo(x - r*0.4, y - r*0.3 + b); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + r*0.1, y - r*0.2 + b); ctx.lineTo(x + r*0.3, y - r*0.4 + b); ctx.stroke();
        }},
        { name: 'Tornado', waveMin: 15, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = 'rgba(150,150,170,0.3)';
            ctx.beginPath(); ctx.moveTo(x, y - r*0.7 + b);
            ctx.lineTo(x - r*0.1, y - r*0.3 + b); ctx.lineTo(x - r*0.4, y + b);
            ctx.lineTo(x - r*0.3, y + r*0.3 + b); ctx.lineTo(x, y + r*0.2 + b);
            ctx.lineTo(x + r*0.3, y + r*0.3 + b); ctx.lineTo(x + r*0.4, y + b);
            ctx.lineTo(x + r*0.1, y - r*0.3 + b); ctx.closePath(); ctx.fill();
            ctx.fillStyle = 'rgba(200,200,220,0.2)';
            ctx.beginPath(); ctx.moveTo(x, y - r*0.5 + b);
            ctx.lineTo(x - r*0.25, y + b); ctx.lineTo(x + r*0.25, y + b); ctx.closePath(); ctx.fill();
        }},
        { name: 'Storm Giant', waveMin: 30, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#5a5a6a';
            ctx.fillRect(x - r*0.4, y - r*0.3 + b, r*0.8, r*0.7);
            ctx.beginPath(); ctx.arc(x, y - r*0.5 + b, r*0.28, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(x - r*0.1, y - r*0.55 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.1, y - r*0.55 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#ff0'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(x - r*0.4, y - r*0.2 + b); ctx.lineTo(x - r*0.2, y - r*0.1 + b); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + r*0.2, y - r*0.2 + b); ctx.lineTo(x + r*0.4, y - r*0.3 + b); ctx.stroke();
        }},
        { name: 'Storm Lord', waveMin: 50, draw: (ctx, x, y, r, b) => {
            ctx.shadowColor = '#ff0'; ctx.shadowBlur = 20;
            ctx.fillStyle = '#3a3a4a';
            ctx.beginPath(); ctx.arc(x, y + b, r*0.6, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#6a6a8a';
            for (let i = 0; i < 8; i++) {
                const a = i*Math.PI/4;
                ctx.beginPath(); ctx.arc(x + Math.cos(a)*r*0.5, y + Math.sin(a)*r*0.5 + b, r*0.08, 0, Math.PI*2); ctx.fill(); }
            ctx.fillStyle = '#ff0';
            ctx.beginPath(); ctx.arc(x, y - r*0.05 + b, r*0.08, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#ff0'; ctx.lineWidth = 2;
            for (let i = 0; i < 4; i++) {
                const a = i*Math.PI/2;
                ctx.beginPath(); ctx.moveTo(x + Math.cos(a)*r*0.15, y + Math.sin(a)*r*0.15 + b);
                ctx.lineTo(x + Math.cos(a)*r*0.6, y + Math.sin(a)*r*0.6 + b); ctx.stroke(); }
            ctx.shadowBlur = 0;
        }},
    ],
    10: [
        { name: 'Piranha', waveMin: 1, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#4a8a6a';
            ctx.beginPath(); ctx.ellipse(x, y + b, r*0.4, r*0.2, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#3a7a5a';
            ctx.beginPath(); ctx.moveTo(x + r*0.35, y + b); ctx.lineTo(x + r*0.6, y - r*0.1 + b);
            ctx.lineTo(x + r*0.6, y + r*0.1 + b); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x + r*0.15, y - r*0.02 + b, 2, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Sea Serpent', waveMin: 5, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#3a8a6a';
            ctx.beginPath(); ctx.ellipse(x, y + b, r*0.5, r*0.25, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#2a6a4a';
            ctx.beginPath(); ctx.arc(x + r*0.45, y - r*0.05 + b, r*0.18, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ff0';
            ctx.beginPath(); ctx.arc(x + r*0.5, y - r*0.1 + b, r*0.03, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#2a6a4a'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(x - r*0.4, y + b); ctx.lineTo(x - r*0.65, y - r*0.1 + b); ctx.stroke();
        }},
        { name: 'Kraken', waveMin: 15, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#5a3a6a';
            ctx.beginPath(); ctx.arc(x, y + b, r*0.35, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#5a3a6a'; ctx.lineWidth = 2;
            for (let i = 0; i < 6; i++) {
                const a = i*Math.PI/3;
                ctx.beginPath(); ctx.moveTo(x + Math.cos(a)*r*0.3, y + Math.sin(a)*r*0.3 + b);
                ctx.quadraticCurveTo(x + Math.cos(a)*r*0.7, y + Math.sin(a)*r*0.7 + b,
                    x + Math.cos(a)*r*0.5, y + Math.sin(a)*r*0.4 + b); ctx.stroke(); }
            ctx.fillStyle = '#ff0';
            ctx.beginPath(); ctx.arc(x - r*0.1, y - r*0.05 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.1, y - r*0.05 + b, r*0.04, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Siren', waveMin: 30, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#6ab0a0';
            ctx.beginPath(); ctx.arc(x, y - r*0.3 + b, r*0.2, 0, Math.PI*2); ctx.fill();
            ctx.fillRect(x - r*0.15, y - r*0.1 + b, r*0.3, r*0.3);
            ctx.fillStyle = '#4a8a80';
            ctx.beginPath(); ctx.moveTo(x - r*0.1, y + r*0.2 + b);
            ctx.lineTo(x - r*0.25, y + r*0.6 + b); ctx.lineTo(x, y + r*0.45 + b);
            ctx.lineTo(x + r*0.25, y + r*0.6 + b); ctx.lineTo(x + r*0.1, y + r*0.2 + b); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x - r*0.07, y - r*0.35 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.07, y - r*0.35 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#f88';
            ctx.beginPath(); ctx.arc(x, y - r*0.25 + b, r*0.04, 0, Math.PI); ctx.fill();
        }},
        { name: 'Leviathan', waveMin: 50, draw: (ctx, x, y, r, b) => {
            ctx.shadowColor = '#00aaff'; ctx.shadowBlur = 20;
            ctx.fillStyle = '#2a5a7a';
            ctx.beginPath(); ctx.ellipse(x, y + b, r*0.9, r*0.45, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#1a4a6a';
            ctx.beginPath(); ctx.arc(x + r*0.75, y - r*0.15 + b, r*0.3, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ff0';
            ctx.beginPath(); ctx.arc(x + r*0.8, y - r*0.2 + b, r*0.06, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#4a8aaa';
            ctx.beginPath(); ctx.arc(x - r*0.6, y - r*0.15 + b, r*0.15, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.6, y - r*0.15 + b, r*0.15, 0, Math.PI*2); ctx.fill();
            ctx.shadowBlur = 0;
        }},
    ],
    11: [
        { name: 'Cherub', waveMin: 1, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#ffe8d0';
            ctx.beginPath(); ctx.arc(x, y + b, r*0.25, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.moveTo(x - r*0.2, y - r*0.05 + b); ctx.lineTo(x - r*0.4, y - r*0.3 + b);
            ctx.lineTo(x - r*0.25, y - r*0.05 + b); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x + r*0.2, y - r*0.05 + b); ctx.lineTo(x + r*0.4, y - r*0.3 + b);
            ctx.lineTo(x + r*0.25, y - r*0.05 + b); ctx.fill();
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x - r*0.08, y - r*0.05 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.08, y - r*0.05 + b, 2, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Angel Knight', waveMin: 5, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#e8e8f0';
            ctx.fillRect(x - r*0.2, y - r*0.3 + b, r*0.4, r*0.6);
            ctx.beginPath(); ctx.arc(x, y - r*0.5 + b, r*0.2, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ffd700';
            ctx.beginPath(); ctx.arc(x, y - r*0.7 + b, r*0.1, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.moveTo(x - r*0.15, y - r*0.1 + b); ctx.lineTo(x - r*0.35, y - r*0.4 + b);
            ctx.lineTo(x - r*0.2, y - r*0.05 + b); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x + r*0.15, y - r*0.1 + b); ctx.lineTo(x + r*0.35, y - r*0.4 + b);
            ctx.lineTo(x + r*0.2, y - r*0.05 + b); ctx.fill();
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x - r*0.06, y - r*0.5 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.06, y - r*0.5 + b, 2, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Seraph', waveMin: 15, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#fff0d0';
            ctx.beginPath(); ctx.arc(x, y - r*0.2 + b, r*0.25, 0, Math.PI*2); ctx.fill();
            ctx.fillRect(x - r*0.2, y + r*0.05 + b, r*0.4, r*0.4);
            ctx.fillStyle = '#ffd700';
            for (let i = 0; i < 3; i++) {
                ctx.beginPath(); ctx.arc(x - r*0.3 - i*r*0.1, y - r*0.1 - i*r*0.05 + b, r*0.06, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(x + r*0.3 + i*r*0.1, y - r*0.1 - i*r*0.05 + b, r*0.06, 0, Math.PI*2); ctx.fill(); }
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x - r*0.08, y - r*0.2 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.08, y - r*0.2 + b, 2, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Archangel', waveMin: 30, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#f0e8d0';
            ctx.fillRect(x - r*0.3, y - r*0.25 + b, r*0.6, r*0.6);
            ctx.beginPath(); ctx.arc(x, y - r*0.5 + b, r*0.25, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ffd700';
            ctx.beginPath(); ctx.arc(x, y - r*0.75 + b, r*0.12, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.moveTo(x - r*0.2, y - r*0.1 + b); ctx.lineTo(x - r*0.5, y - r*0.5 + b);
            ctx.lineTo(x - r*0.3, y - r*0.05 + b); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x + r*0.2, y - r*0.1 + b); ctx.lineTo(x + r*0.5, y - r*0.5 + b);
            ctx.lineTo(x + r*0.3, y - r*0.05 + b); ctx.fill();
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x - r*0.08, y - r*0.5 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.08, y - r*0.5 + b, 2, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Celestial', waveMin: 50, draw: (ctx, x, y, r, b) => {
            ctx.shadowColor = '#fff'; ctx.shadowBlur = 30;
            ctx.fillStyle = '#fff8e8';
            ctx.beginPath(); ctx.arc(x, y + b, r*0.7, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ffd700';
            ctx.beginPath(); ctx.arc(x, y + b, r*0.4, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#f0e8d0';
            ctx.beginPath(); ctx.arc(x, y + b, r*0.25, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x - r*0.08, y - r*0.03 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.08, y - r*0.03 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ffd700';
            for (let i = 0; i < 12; i++) {
                const a = i*Math.PI/6;
                ctx.beginPath(); ctx.arc(x + Math.cos(a)*r*0.55, y + Math.sin(a)*r*0.55 + b, r*0.03, 0, Math.PI*2); ctx.fill(); }
            ctx.shadowBlur = 0;
        }},
    ],
    12: [
        { name: 'Dragon Hatchling', waveMin: 1, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#8a4a2a';
            ctx.beginPath(); ctx.ellipse(x, y + b, r*0.4, r*0.25, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillRect(x + r*0.3, y - r*0.1 + b, r*0.25, r*0.15);
            ctx.fillStyle = '#aa5a3a';
            ctx.beginPath(); ctx.moveTo(x - r*0.2, y - r*0.1 + b); ctx.lineTo(x - r*0.45, y - r*0.35 + b);
            ctx.lineTo(x - r*0.15, y - r*0.15 + b); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x + r*0.2, y - r*0.1 + b); ctx.lineTo(x + r*0.45, y - r*0.35 + b);
            ctx.lineTo(x + r*0.15, y - r*0.15 + b); ctx.fill();
            ctx.fillStyle = '#ff0';
            ctx.beginPath(); ctx.arc(x + r*0.4, y - r*0.08 + b, 2, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Fire Drake', waveMin: 5, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#aa3a1a';
            ctx.beginPath(); ctx.ellipse(x, y + b, r*0.55, r*0.35, 0, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.5, y - r*0.1 + b, r*0.22, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ff4400';
            ctx.beginPath(); ctx.moveTo(x - r*0.3, y + b); ctx.lineTo(x - r*0.55, y - r*0.15 + b);
            ctx.lineTo(x - r*0.25, y + r*0.05 + b); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x + r*0.3, y + b); ctx.lineTo(x + r*0.6, y - r*0.15 + b);
            ctx.lineTo(x + r*0.3, y + r*0.05 + b); ctx.fill();
            ctx.fillStyle = '#ff0';
            ctx.beginPath(); ctx.arc(x + r*0.55, y - r*0.1 + b, r*0.04, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Wyvern', waveMin: 15, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#6a3a2a';
            ctx.beginPath(); ctx.ellipse(x, y + b, r*0.6, r*0.3, 0, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x + r*0.5, y - r*0.1 + b); ctx.lineTo(x + r*0.75, y - r*0.15 + b);
            ctx.lineTo(x + r*0.6, y + r*0.05 + b); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#5a2a1a';
            ctx.beginPath(); ctx.moveTo(x - r*0.3, y - r*0.1 + b); ctx.lineTo(x - r*0.6, y - r*0.45 + b);
            ctx.lineTo(x - r*0.25, y - r*0.15 + b); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x + r*0.3, y - r*0.1 + b); ctx.lineTo(x + r*0.6, y - r*0.45 + b);
            ctx.lineTo(x + r*0.25, y - r*0.15 + b); ctx.fill();
            ctx.fillStyle = '#f00';
            ctx.beginPath(); ctx.arc(x + r*0.7, y - r*0.12 + b, r*0.04, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Dragon Knight', waveMin: 30, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#8a4a2a';
            ctx.fillRect(x - r*0.3, y - r*0.3 + b, r*0.6, r*0.65);
            ctx.beginPath(); ctx.arc(x, y - r*0.5 + b, r*0.25, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#daa520';
            ctx.fillRect(x - r*0.2, y - r*0.1 + b, r*0.4, r*0.04);
            ctx.fillRect(x - r*0.2, y + r*0.15 + b, r*0.4, r*0.04);
            ctx.fillStyle = '#ff4400';
            ctx.beginPath(); ctx.moveTo(x - r*0.25, y - r*0.1 + b); ctx.lineTo(x - r*0.5, y - r*0.35 + b);
            ctx.lineTo(x - r*0.2, y - r*0.15 + b); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x + r*0.25, y - r*0.1 + b); ctx.lineTo(x + r*0.5, y - r*0.35 + b);
            ctx.lineTo(x + r*0.2, y - r*0.15 + b); ctx.fill();
            ctx.fillStyle = '#ff0';
            ctx.beginPath(); ctx.arc(x - r*0.08, y - r*0.5 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.08, y - r*0.5 + b, 2, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Ancient Dragon', waveMin: 50, draw: (ctx, x, y, r, b) => {
            ctx.shadowColor = '#ff4400'; ctx.shadowBlur = 25;
            ctx.fillStyle = '#5a2a1a';
            ctx.beginPath(); ctx.ellipse(x, y + b, r*0.9, r*0.5, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillRect(x + r*0.6, y - r*0.15 + b, r*0.4, r*0.25);
            ctx.fillStyle = '#ff6600';
            ctx.beginPath(); ctx.moveTo(x - r*0.4, y - r*0.15 + b); ctx.lineTo(x - r*0.75, y - r*0.55 + b);
            ctx.lineTo(x - r*0.35, y - r*0.25 + b); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x + r*0.4, y - r*0.15 + b); ctx.lineTo(x + r*0.75, y - r*0.55 + b);
            ctx.lineTo(x + r*0.35, y - r*0.25 + b); ctx.fill();
            ctx.fillStyle = '#daa520';
            ctx.beginPath(); ctx.arc(x + r*0.8, y - r*0.15 + b, r*0.08, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ff0';
            ctx.beginPath(); ctx.arc(x + r*0.82, y - r*0.18 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.shadowBlur = 0;
        }},
    ],
    13: [
        { name: 'Shadow', waveMin: 1, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = 'rgba(20,20,30,0.6)';
            ctx.beginPath(); ctx.ellipse(x, y + b, r*0.5, r*0.35, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = 'rgba(40,40,50,0.5)';
            ctx.beginPath(); ctx.moveTo(x - r*0.3, y - r*0.1 + b);
            ctx.lineTo(x - r*0.2, y + r*0.4 + b); ctx.lineTo(x + r*0.2, y + r*0.4 + b);
            ctx.lineTo(x + r*0.3, y - r*0.1 + b); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#f00';
            ctx.beginPath(); ctx.arc(x - r*0.08, y - r*0.05 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.08, y - r*0.05 + b, 2, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Wraith', waveMin: 5, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = 'rgba(30,30,50,0.7)';
            ctx.beginPath(); ctx.arc(x, y - r*0.25 + b, r*0.2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x - r*0.35, y + b);
            ctx.lineTo(x - r*0.4, y + r*0.6 + b); ctx.lineTo(x, y + r*0.4 + b);
            ctx.lineTo(x + r*0.4, y + r*0.6 + b); ctx.lineTo(x + r*0.35, y + b); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#0ff';
            ctx.beginPath(); ctx.arc(x - r*0.08, y - r*0.25 + b, r*0.03, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.08, y - r*0.25 + b, r*0.03, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Dullahan', waveMin: 15, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#2a2a3a';
            ctx.fillRect(x - r*0.3, y - r*0.2 + b, r*0.6, r*0.7);
            ctx.fillStyle = '#4a4a5a';
            ctx.fillRect(x - r*0.15, y - r*0.35 + b, r*0.3, r*0.2);
            ctx.fillStyle = '#f00';
            ctx.beginPath(); ctx.arc(x - r*0.06, y - r*0.25 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.06, y - r*0.25 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#5a5a6a'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(x - r*0.3, y + b); ctx.lineTo(x - r*0.55, y + r*0.3 + b); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + r*0.3, y + b); ctx.lineTo(x + r*0.55, y + r*0.3 + b); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x, y + r*0.5 + b); ctx.lineTo(x, y + r*0.7 + b); ctx.stroke();
        }},
        { name: 'Nightmare', waveMin: 30, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#1a1a2a';
            ctx.beginPath(); ctx.ellipse(x, y + b, r*0.65, r*0.35, 0, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.45, y - r*0.15 + b, r*0.22, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#f00';
            ctx.beginPath(); ctx.arc(x + r*0.5, y - r*0.2 + b, r*0.05, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.38, y - r*0.2 + b, r*0.05, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#3a3a4a';
            ctx.beginPath(); ctx.moveTo(x - r*0.4, y - b + b); ctx.lineTo(x - r*0.65, y - r*0.35 + b);
            ctx.lineTo(x - r*0.5, y - r*0.1 + b); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x + r*0.3, y - r*0.1 + b); ctx.lineTo(x + r*0.55, y - r*0.4 + b);
            ctx.lineTo(x + r*0.4, y - r*0.15 + b); ctx.fill();
        }},
        { name: 'Shadow King', waveMin: 50, draw: (ctx, x, y, r, b) => {
            ctx.shadowColor = '#400'; ctx.shadowBlur = 25;
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(x - r*0.4, y - r*0.2 + b, r*0.8, r*0.8);
            ctx.fillStyle = '#1a1a2a';
            ctx.beginPath(); ctx.arc(x, y - r*0.6 + b, r*0.3, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#f00';
            ctx.beginPath(); ctx.arc(x - r*0.1, y - r*0.65 + b, r*0.07, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.1, y - r*0.65 + b, r*0.07, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#4a4a5a';
            ctx.beginPath(); ctx.arc(x, y - r*0.8 + b, r*0.1, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#2a2a3a'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(x - r*0.4, y + r*0.15 + b); ctx.lineTo(x - r*0.6, y + r*0.4 + b); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + r*0.4, y + r*0.15 + b); ctx.lineTo(x + r*0.6, y + r*0.4 + b); ctx.stroke();
            ctx.shadowBlur = 0;
        }},
    ],
    14: [
        { name: 'Seedling', waveMin: 1, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#6aaa3a';
            ctx.beginPath(); ctx.arc(x, y + r*0.1 + b, r*0.25, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#8aca5a';
            ctx.beginPath(); ctx.moveTo(x, y - r*0.3 + b); ctx.lineTo(x - r*0.15, y - r*0.6 + b);
            ctx.lineTo(x + r*0.15, y - r*0.6 + b); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x - r*0.08, y + r*0.05 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.08, y + r*0.05 + b, 2, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Vine Beast', waveMin: 5, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#4a8a2a';
            ctx.fillRect(x - r*0.12, y - r*0.3 + b, r*0.24, r*0.6);
            ctx.fillStyle = '#6aaa3a';
            ctx.beginPath(); ctx.arc(x, y - r*0.45 + b, r*0.2, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#3a7a1a'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(x - r*0.12, y + b); ctx.lineTo(x - r*0.45, y + r*0.35 + b); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + r*0.12, y + b); ctx.lineTo(x + r*0.45, y + r*0.35 + b); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x - r*0.12, y - r*0.1 + b); ctx.lineTo(x - r*0.4, y - r*0.3 + b); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + r*0.12, y - r*0.1 + b); ctx.lineTo(x + r*0.4, y - r*0.3 + b); ctx.stroke();
            ctx.fillStyle = '#f44';
            ctx.beginPath(); ctx.arc(x - r*0.06, y - r*0.45 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.06, y - r*0.45 + b, 2, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Thorn Elemental', waveMin: 15, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#3a6a1a';
            ctx.beginPath(); ctx.arc(x, y + b, r*0.35, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#5a8a3a';
            for (let i = 0; i < 8; i++) {
                const a = i*Math.PI/4;
                ctx.beginPath(); ctx.moveTo(x + Math.cos(a)*r*0.3, y + Math.sin(a)*r*0.3 + b);
                ctx.lineTo(x + Math.cos(a)*r*0.55, y + Math.sin(a)*r*0.55 + b);
                ctx.lineTo(x + Math.cos(a)*r*0.35, y + Math.sin(a)*r*0.4 + b); ctx.fill(); }
            ctx.fillStyle = '#ff0';
            ctx.beginPath(); ctx.arc(x - r*0.1, y - r*0.05 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.1, y - r*0.05 + b, r*0.04, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Carnivore', waveMin: 30, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#6a3a1a';
            ctx.fillRect(x - r*0.2, y - r*0.1 + b, r*0.4, r*0.45);
            ctx.fillStyle = '#8a4a2a';
            ctx.beginPath(); ctx.arc(x, y - r*0.35 + b, r*0.3, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ff4488';
            ctx.beginPath(); ctx.arc(x, y - r*0.35 + b, r*0.15, Math.PI*0.2, Math.PI*0.8); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(x - r*0.1, y - r*0.4 + b, r*0.03, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.1, y - r*0.4 + b, r*0.03, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x - r*0.1, y - r*0.4 + b, 1, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.1, y - r*0.4 + b, 1, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Flower Queen', waveMin: 50, draw: (ctx, x, y, r, b) => {
            ctx.shadowColor = '#ff69b4'; ctx.shadowBlur = 20;
            ctx.fillStyle = '#8aca5a';
            ctx.fillRect(x - r*0.15, y - r*0.1 + b, r*0.3, r*0.45);
            ctx.fillStyle = '#ff69b4';
            for (let i = 0; i < 6; i++) {
                const a = i*Math.PI/3;
                ctx.beginPath(); ctx.ellipse(x + Math.cos(a)*r*0.3, y - r*0.4 + Math.sin(a)*r*0.2 + b,
                    r*0.12, r*0.06, a, 0, Math.PI*2); ctx.fill(); }
            ctx.fillStyle = '#ffd700';
            ctx.beginPath(); ctx.arc(x, y - r*0.4 + b, r*0.08, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x - r*0.03, y - r*0.42 + b, 1, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.03, y - r*0.42 + b, 1, 0, Math.PI*2); ctx.fill();
            ctx.shadowBlur = 0;
        }},
    ],
    15: [
        { name: 'Void Slime', waveMin: 1, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#2a1a3a';
            ctx.beginPath(); ctx.ellipse(x, y + b, r*0.6, r*0.45, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#4a2a5a';
            ctx.beginPath(); ctx.ellipse(x, y - r*0.1 + b, r*0.3, r*0.2, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#c080ff';
            ctx.beginPath(); ctx.arc(x - r*0.12, y - r*0.05 + b, r*0.03, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.12, y - r*0.05 + b, r*0.03, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Void Walker', waveMin: 5, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#1a0a2a';
            ctx.fillRect(x - r*0.15, y - r*0.3 + b, r*0.3, r*0.6);
            ctx.fillStyle = '#3a1a5a';
            ctx.beginPath(); ctx.arc(x, y - r*0.5 + b, r*0.2, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#c080ff';
            ctx.beginPath(); ctx.arc(x - r*0.06, y - r*0.55 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.06, y - r*0.55 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#4a2a6a'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(x - r*0.15, y + r*0.15 + b); ctx.lineTo(x - r*0.4, y + r*0.45 + b); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + r*0.15, y + r*0.15 + b); ctx.lineTo(x + r*0.4, y + r*0.45 + b); ctx.stroke();
        }},
        { name: 'Abyssal', waveMin: 15, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#1a0a2a';
            ctx.beginPath(); ctx.arc(x, y + b, r*0.35, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ff0';
            ctx.beginPath(); ctx.arc(x, y - r*0.05 + b, r*0.12, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x - r*0.04, y - r*0.08 + b, r*0.03, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.04, y - r*0.08 + b, r*0.03, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#4a2a6a'; ctx.lineWidth = 2;
            for (let i = 0; i < 6; i++) {
                const a = i*Math.PI/3;
                ctx.beginPath(); ctx.moveTo(x + Math.cos(a)*r*0.2, y + Math.sin(a)*r*0.2 + b);
                ctx.lineTo(x + Math.cos(a)*r*0.55, y + Math.sin(a)*r*0.55 + b); ctx.stroke(); }
        }},
        { name: 'Void Giant', waveMin: 30, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#1a0a2a';
            ctx.fillRect(x - r*0.45, y - r*0.35 + b, r*0.9, r*0.7);
            ctx.fillStyle = '#2a1a3a';
            ctx.beginPath(); ctx.arc(x, y - r*0.55 + b, r*0.3, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#c080ff';
            ctx.beginPath(); ctx.arc(x - r*0.1, y - r*0.6 + b, r*0.05, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.1, y - r*0.6 + b, r*0.05, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#3a2a4a'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(x - r*0.45, y - r*0.2 + b); ctx.lineTo(x - r*0.7, y - r*0.4 + b); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + r*0.45, y - r*0.2 + b); ctx.lineTo(x + r*0.7, y - r*0.4 + b); ctx.stroke();
        }},
        { name: 'Void Lord', waveMin: 50, draw: (ctx, x, y, r, b) => {
            ctx.shadowColor = '#8000ff'; ctx.shadowBlur = 25;
            ctx.fillStyle = '#0a001a';
            ctx.fillRect(x - r*0.45, y - r*0.25 + b, r*0.9, r*0.8);
            ctx.fillStyle = '#2a0a4a';
            ctx.beginPath(); ctx.arc(x, y - r*0.6 + b, r*0.35, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#f0f';
            ctx.beginPath(); ctx.arc(x - r*0.12, y - r*0.65 + b, r*0.06, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.12, y - r*0.65 + b, r*0.06, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#c080ff';
            ctx.beginPath(); ctx.arc(x, y - r*0.85 + b, r*0.12, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#5a3a7a'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(x - r*0.45, y + r*0.15 + b); ctx.lineTo(x - r*0.7, y + r*0.5 + b); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + r*0.45, y + r*0.15 + b); ctx.lineTo(x + r*0.7, y + r*0.5 + b); ctx.stroke();
            ctx.shadowBlur = 0;
        }},
    ],
    16: [
        { name: 'Star Imp', waveMin: 1, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#4488ff';
            ctx.beginPath(); ctx.arc(x, y + b, r*0.2, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#88bbff';
            for (let i = 0; i < 5; i++) {
                const a = i*Math.PI*2/5 - Math.PI/2;
                ctx.beginPath(); ctx.arc(x + Math.cos(a)*r*0.3, y + Math.sin(a)*r*0.3 + b, r*0.04, 0, Math.PI*2); ctx.fill(); }
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(x - r*0.05, y - r*0.03 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.05, y - r*0.03 + b, 2, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Cosmic Beast', waveMin: 5, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#2a4a8a';
            ctx.beginPath(); ctx.ellipse(x, y + b, r*0.55, r*0.3, 0, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.4, y - r*0.1 + b, r*0.2, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#88bbff';
            ctx.beginPath(); ctx.arc(x + r*0.45, y - r*0.15 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(x - r*0.3, y - r*0.05 + b, r*0.03, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.2, y - r*0.15 + b, r*0.03, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x, y - r*0.2 + b, r*0.03, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Nebula', waveMin: 15, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = 'rgba(100,50,180,0.3)';
            ctx.beginPath(); ctx.arc(x, y + b, r*0.5, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = 'rgba(180,80,220,0.2)';
            ctx.beginPath(); ctx.arc(x - r*0.15, y - r*0.1 + b, r*0.35, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = 'rgba(80,150,255,0.2)';
            ctx.beginPath(); ctx.arc(x + r*0.15, y + r*0.05 + b, r*0.3, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff';
            for (let i = 0; i < 6; i++) {
                const a = Math.random()*Math.PI*2;
                ctx.beginPath(); ctx.arc(x + Math.cos(a)*r*0.25, y + Math.sin(a)*r*0.25 + b, 1, 0, Math.PI*2); ctx.fill(); }
            ctx.fillStyle = '#f0f';
            ctx.beginPath(); ctx.arc(x, y + b, r*0.06, 0, Math.PI*2); ctx.fill();
        }},
        { name: 'Galaxy Guardian', waveMin: 30, draw: (ctx, x, y, r, b) => {
            ctx.fillStyle = '#1a3a6a';
            ctx.fillRect(x - r*0.35, y - r*0.3 + b, r*0.7, r*0.65);
            ctx.fillStyle = '#4a8acc';
            ctx.fillRect(x - r*0.25, y - r*0.1 + b, r*0.5, r*0.05);
            ctx.fillRect(x - r*0.25, y + r*0.15 + b, r*0.5, r*0.05);
            ctx.fillStyle = '#88bbff';
            ctx.beginPath(); ctx.arc(x, y - r*0.55 + b, r*0.2, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(x - r*0.06, y - r*0.58 + b, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.06, y - r*0.58 + b, 2, 0, Math.PI*2); ctx.fill();
            for (let i = 0; i < 3; i++) {
                ctx.beginPath(); ctx.arc(x - r*0.15 + i*r*0.15, y - r*0.2 + b, 1, 0, Math.PI*2); ctx.fill(); }
        }},
        { name: 'Cosmic Deity', waveMin: 50, draw: (ctx, x, y, r, b) => {
            ctx.shadowColor = '#88bbff'; ctx.shadowBlur = 30;
            ctx.fillStyle = '#1a2a5a';
            ctx.beginPath(); ctx.arc(x, y + b, r*0.8, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#4a8acc';
            ctx.beginPath(); ctx.arc(x, y + b, r*0.55, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#88bbff';
            ctx.beginPath(); ctx.arc(x, y + b, r*0.35, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(x - r*0.08, y - r*0.03 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + r*0.08, y - r*0.03 + b, r*0.04, 0, Math.PI*2); ctx.fill();
            for (let i = 0; i < 12; i++) {
                const a = i*Math.PI/6;
                ctx.fillStyle = ['#fff','#88f','#f8f','#ff8'][i%4];
                ctx.beginPath(); ctx.arc(x + Math.cos(a)*r*0.7, y + Math.sin(a)*r*0.7 + b, r*0.03, 0, Math.PI*2); ctx.fill(); }
            ctx.shadowBlur = 0;
        }},
    ],
};
