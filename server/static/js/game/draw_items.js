const ITEM_ICONS = {};

ITEM_ICONS.drawCombatIcon = function(ctx, itemId, x, y, size) {
    ctx.save();
    const s = size || 32;
    const cx = x + s/2, cy = y + s/2;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x, y, s, s);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, s, s);

    if (itemId === 'gun') {
        ctx.fillStyle = '#ff6b35'; ctx.strokeStyle = '#ccc';
        ctx.beginPath(); ctx.moveTo(cx-10,cy+6); ctx.lineTo(cx+10,cy+6);
        ctx.lineTo(cx+10,cy-2); ctx.lineTo(cx+6,cy-3); ctx.lineTo(cx+6,cy-6);
        ctx.lineTo(cx-4,cy-6); ctx.lineTo(cx-4,cy+0); ctx.lineTo(cx-10,cy+0); ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ff6b35'; ctx.beginPath();
        ctx.arc(cx+9, cy+6, 2.5, 0, Math.PI*2); ctx.fill();
    } else if (itemId === 'armor') {
        ctx.fillStyle = '#4a9eff'; ctx.strokeStyle = '#fff';
        ctx.beginPath(); ctx.moveTo(cx,cy-8); ctx.lineTo(cx+10,cy-4); ctx.lineTo(cx+10,cy+8);
        ctx.lineTo(cx,cy+10); ctx.lineTo(cx-10,cy+8); ctx.lineTo(cx-10,cy-4); ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#5ab5ff'; ctx.font='bold 9px monospace'; ctx.textAlign='center';
        ctx.fillText('A',cx,cy+2);
    } else if (itemId === 'drink') {
        ctx.fillStyle = '#4ade80'; ctx.strokeStyle = '#fff';
        ctx.beginPath(); ctx.moveTo(cx-7,cy-10); ctx.lineTo(cx+7,cy-10); ctx.lineTo(cx+10,cy-2);
        ctx.lineTo(cx+10,cy+10); ctx.lineTo(cx-10,cy+10); ctx.lineTo(cx-10,cy-2); ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#3cb5'; ctx.fillRect(cx-5,cy-8,10,5);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign='center';
        ctx.fillText('+',cx,cy+4);
    } else if (itemId === 'bomb') {
        ctx.fillStyle = '#c084fc'; ctx.strokeStyle = '#fff';
        ctx.beginPath(); ctx.arc(cx,cy,11,0,Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(cx,cy-2,3.5,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ff4400'; ctx.fillRect(cx-1,cy-16,2,5);
    } else if (itemId === 'shotgun') {
        ctx.fillStyle = '#8b4513'; ctx.strokeStyle = '#ccc';
        ctx.fillRect(cx-14,cy-2,16,5); ctx.fillRect(cx-14,cy+3,16,2);
        ctx.fillStyle = '#a0522d'; ctx.beginPath(); ctx.arc(cx+8,cy-2,3,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ff6b35'; ctx.font='bold 8px monospace'; ctx.textAlign='center';
        ctx.fillText('SG',cx,cy-3);
    } else if (itemId === 'sniper') {
        ctx.fillStyle = '#2c3e50'; ctx.strokeStyle = '#fff';
        ctx.fillRect(cx-14,cy-2,22,3); ctx.fillRect(cx+8,cy-4,4,7);
        ctx.fillStyle = '#ff0'; ctx.font='bold 8px monospace'; ctx.textAlign='center';
        ctx.fillText('SR',cx+3,cy-3);
    } else if (itemId === 'katana') {
        ctx.fillStyle = '#c0c0c0'; ctx.strokeStyle = '#888';
        ctx.beginPath(); ctx.moveTo(cx-12,cy+10); ctx.lineTo(cx,cy-14); ctx.lineTo(cx+3,cy-14); ctx.lineTo(cx-9,cy+8); ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#8b4513'; ctx.fillRect(cx-4,cy+4,6,8);
    } else if (itemId === 'shield') {
        ctx.fillStyle = '#4a9eff'; ctx.strokeStyle = '#fff';
        ctx.beginPath(); ctx.moveTo(cx,cy-14); ctx.lineTo(cx+12,cy-6); ctx.lineTo(cx+10,cy+12);
        ctx.lineTo(cx,cy+10); ctx.lineTo(cx-10,cy+12); ctx.lineTo(cx-12,cy-6); ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ccc'; ctx.font='bold 10px monospace'; ctx.textAlign='center';
        ctx.fillText('S',cx,cy);
    } else if (itemId === 'boots') {
        ctx.fillStyle = '#8b4513'; ctx.strokeStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(cx-6,cy+6,6,4,0,Math.PI,0,false); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx+6,cy+6,6,4,0,Math.PI,0,false); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#a0522d'; ctx.fillRect(cx-13,cy-8,26,10);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 7px monospace'; ctx.textAlign='center';
        ctx.fillText('SPD',cx,cy);
    } else if (itemId === 'vampire') {
        ctx.fillStyle = '#8b0000'; ctx.strokeStyle = '#f00';
        ctx.beginPath(); ctx.moveTo(cx-10,cy-12); ctx.lineTo(cx-6,cy-2); ctx.lineTo(cx,cy+14);
        ctx.lineTo(cx+6,cy-2); ctx.lineTo(cx+10,cy-12); ctx.lineTo(cx,cy-6); ctx.closePath();
        ctx.fill(); ctx.stroke();
    } else if (itemId === 'regen') {
        ctx.fillStyle = '#4ade80'; ctx.strokeStyle = '#fff';
        ctx.beginPath(); ctx.arc(cx+2,cy,9,0,Math.PI*2); ctx.stroke(); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx-2,cy-2,3,0,Math.PI*2); ctx.fillStyle='#fff'; ctx.fill();
        ctx.fillStyle = '#4ade80'; ctx.font='bold 10px monospace'; ctx.textAlign='center';
        ctx.fillText('R',cx+2,cy+4);
    } else if (itemId === 'fireball') {
        ctx.fillStyle = '#ff4500'; ctx.strokeStyle = '#ffa500';
        ctx.beginPath(); ctx.arc(cx,cy,12,0,Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffa500'; ctx.beginPath(); ctx.arc(cx,cy-3,7,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(cx-1,cy-5,4,0,Math.PI*2); ctx.fill();
    } else if (itemId === 'iceblast') {
        ctx.fillStyle = '#00bfff'; ctx.strokeStyle = '#fff';
        ctx.beginPath(); ctx.arc(cx,cy,10,0,Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(cx-6,cy-6); ctx.lineTo(cx-3,cy-4); ctx.lineTo(cx-2,cy-8); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx+4,cy-3); ctx.lineTo(cx+2,cy-6); ctx.lineTo(cx+7,cy-5); ctx.closePath(); ctx.fill();
    } else if (itemId === 'excalibur') {
        ctx.fillStyle = '#ffd700'; ctx.strokeStyle = '#fff';
        ctx.fillRect(cx-1,cy-14,4,25);
        ctx.fillStyle = '#daa520'; ctx.fillRect(cx-8,cy-10,18,6);
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx+1,cy-8,2,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
};

ITEM_ICONS.drawCostumeIcon = function(ctx, itemId, type, x, y) {
    ctx.save();
    const s = 32, cx = x + s/2, cy = y + s/2;
    ctx.fillStyle = '#1a1a2e'; ctx.fillRect(x, y, s, s);
    ctx.strokeStyle = '#555'; ctx.lineWidth = 1.5; ctx.strokeRect(x, y, s, s);

    if (type === 'hat') {
        ctx.fillStyle = '#daa520'; ctx.strokeStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(cx,cy+2,14,5,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#b8860b'; ctx.fillRect(cx-5,cy-10,10,12);
        if (itemId === 'crown' || itemId === 'crown_gold') {
            ctx.fillStyle = '#ffd700';
            for (let i=0;i<3;i++) { ctx.beginPath(); ctx.arc(cx-5+i*5,cy-10,3,0,Math.PI,false); ctx.fill(); }
        } else if (itemId === 'wizard' || itemId === 'witch') {
            ctx.fillStyle = '#7b2d8e';
            ctx.beginPath(); ctx.moveTo(cx,cy-22); ctx.lineTo(cx-8,cy-8); ctx.lineTo(cx+8,cy-8); ctx.closePath(); ctx.fill();
        } else if (itemId === 'top_hat' || itemId === 'fedora') {
            ctx.fillStyle = '#333';
            ctx.fillRect(cx-8,cy-6,16,10);
            ctx.fillRect(cx-10,cy-10,20,5);
        }
    } else if (type === 'clothes') {
        ctx.fillStyle = '#4682b4'; ctx.strokeStyle = '#fff';
        ctx.beginPath(); ctx.moveTo(cx-12,cy-10); ctx.lineTo(cx+12,cy-10); ctx.lineTo(cx+10,cy+12);
        ctx.lineTo(cx-10,cy+12); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ccc'; ctx.fillRect(cx-2,cy-10,4,22);
        if (itemId === 'armor') {
            ctx.fillStyle = '#888'; ctx.fillRect(cx-8,cy-4,16,3);
            ctx.fillRect(cx-8,cy+2,16,3);
        }
    }
    ctx.restore();
};

ITEM_ICONS.drawPetIcon = function(ctx, petId, x, y) {
    ctx.save();
    const s = 32, cx = x + s/2, cy = y + s/2;
    ctx.fillStyle = '#1a1a2e'; ctx.fillRect(x, y, s, s);
    ctx.strokeStyle = '#555'; ctx.lineWidth = 1.5; ctx.strokeRect(x, y, s, s);

    if (petId === 'dog') {
        ctx.fillStyle = '#c8a060';
        ctx.beginPath(); ctx.ellipse(cx,cy,8,6,0,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx-6,cy-7,5,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx-7,cy+4); ctx.lineTo(cx-3,cy); ctx.lineTo(cx+1,cy+5); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx-4,cy-12); ctx.lineTo(cx-8,cy-8); ctx.lineTo(cx-6,cy-5); ctx.fill();
        ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(cx-7,cy-8,1.2,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx-2,cy-9,1.5,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(cx-4,cy-10,0.8,0,Math.PI*2); ctx.fill();
    } else if (petId === 'cat') {
        ctx.fillStyle = '#ff8c69';
        ctx.beginPath(); ctx.arc(cx,cy,7,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ff8c69';
        ctx.beginPath(); ctx.moveTo(cx-5,cy-8); ctx.lineTo(cx-9,cy-15); ctx.lineTo(cx-3,cy-10); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx+5,cy-8); ctx.lineTo(cx+9,cy-15); ctx.lineTo(cx+3,cy-10); ctx.fill();
        ctx.fillStyle = '#32c8'; ctx.beginPath(); ctx.arc(cx-2,cy-2,1.5,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx+2,cy-2,1.5,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#333'; ctx.beginPath(); ctx.moveTo(cx+1,cy-1); ctx.lineTo(cx+3,cy-5); ctx.moveTo(cx+3,cy-5); ctx.lineTo(cx+6,cy-3); ctx.stroke();
    } else if (petId === 'rabbit') {
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(cx,cy-2,6,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ddd'; ctx.beginPath(); ctx.arc(cx,cy+6,7,0,Math.PI); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(cx-2,cy-12,3,8,0,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx+2,cy-12,3,8,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = '#faa'; ctx.beginPath(); ctx.ellipse(cx-2,cy-12,1.5,4,0,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx+2,cy-12,1.5,4,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(cx-1.5,cy-3,1,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx+1.5,cy-3,1,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = '#f88'; ctx.beginPath(); ctx.arc(cx,cy-1,1,0,Math.PI,false); ctx.fill();
    } else if (petId === 'fox') {
        ctx.fillStyle = '#ff6b35';
        ctx.beginPath(); ctx.arc(cx,cy,8,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx-5,cy-5); ctx.lineTo(cx-10,cy-12); ctx.lineTo(cx-2,cy-6); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx+5,cy-5); ctx.lineTo(cx+10,cy-12); ctx.lineTo(cx+2,cy-6); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx,cy+1,5,0,Math.PI); ctx.fill();
        ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(cx-1,cy-2,1,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx+1,cy-2,1,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
};