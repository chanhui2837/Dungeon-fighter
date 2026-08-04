const SKIN = '#ffc896';
const DARK_GRAY = '#282828';
const GOLD = '#daa520';
const BLACK = '#000000';
const WHITE = '#ffffff';
const RED = '#c83232';
const BLUE = '#4682b4';
const BROWN = '#8b4513';
const PURPLE = '#800080';
const ORANGE = '#ffa500';
const PINK = '#ff69b4';
const CYAN = '#00ffff';
const YELLOW = '#ffff00';
const NAVY = '#000080';
const DARK_GREEN = '#006400';
const MAROON = '#800000';
const TEAL = '#008080';
const GRAY = '#808080';
const GREEN = '#32b850';

const RARITY = { COMMON: 'Common', RARE: 'Rare', EPIC: 'Epic', LEGENDARY: 'Legendary', MYTHIC: 'Mythic', TRANSCEND: 'Transcend' };
const RARITY_COLORS = { Common: '#888', Rare: '#4488ff', Epic: '#aa44ff', Legendary: '#ffaa00', Mythic: '#ff4444', Transcend: '#44ffff' };
const RARITY_PRICES = { Common: 5000, Rare: 20000, Epic: 50000, Legendary: 100000, Mythic: 300000, Transcend: 1000000 };

const AVATAR_ITEMS = {
    hats: [
        { id: null, name: 'None', color: null, rarity: null },
        { id: 'baseball_cap', name: 'Baseball Cap', color: RED, rarity: RARITY.COMMON },
        { id: 'beanie', name: 'Beanie', color: BLUE, rarity: RARITY.COMMON },
        { id: 'crown', name: 'Crown', color: GOLD, rarity: RARITY.EPIC },
        { id: 'top_hat', name: 'Top Hat', color: BLACK, rarity: RARITY.RARE },
        { id: 'cowboy', name: 'Cowboy Hat', color: BROWN, rarity: RARITY.RARE },
        { id: 'wizard', name: 'Wizard Hat', color: PURPLE, rarity: RARITY.EPIC },
        { id: 'santa', name: 'Santa Hat', color: RED, rarity: RARITY.RARE },
        { id: 'fedora', name: 'Fedora', color: DARK_GRAY, rarity: RARITY.COMMON },
        { id: 'headband', name: 'Headband', color: RED, rarity: RARITY.COMMON },
        { id: 'helmet', name: 'Helmet', color: GRAY, rarity: RARITY.RARE },
        { id: 'beret', name: 'Beret', color: GREEN, rarity: RARITY.COMMON },
        { id: 'cap_visor', name: 'Visor Cap', color: ORANGE, rarity: RARITY.COMMON },
        { id: 'party_hat', name: 'Party Hat', color: PINK, rarity: RARITY.RARE },
        { id: 'crown_gold', name: 'Gold Crown', color: GOLD, rarity: RARITY.LEGENDARY },
        { id: 'samurai', name: 'Samurai Helmet', color: DARK_GRAY, rarity: RARITY.LEGENDARY },
        { id: 'pirate_hat', name: 'Pirate Hat', color: BLACK, rarity: RARITY.RARE },
        { id: 'viking', name: 'Viking Helm', color: GRAY, rarity: RARITY.EPIC },
        { id: 'cat_ears', name: 'Cat Ears', color: ORANGE, rarity: RARITY.EPIC },
        { id: 'halo', name: 'Halo', color: GOLD, rarity: RARITY.EPIC },
        { id: 'chef', name: 'Chef Hat', color: WHITE, rarity: RARITY.COMMON },
        { id: 'knight_helm', name: 'Knight Helm', color: GRAY, rarity: RARITY.LEGENDARY },
        { id: 'witch', name: 'Witch Hat', color: PURPLE, rarity: RARITY.LEGENDARY },
        { id: 'sailor', name: 'Sailor Cap', color: WHITE, rarity: RARITY.COMMON },
        { id: 'propeller', name: 'Propeller Cap', color: BLUE, rarity: RARITY.COMMON },
        { id: 'bandana', name: 'Bandana', color: RED, rarity: RARITY.COMMON },
        { id: 'sombrero', name: 'Sombrero', color: BROWN, rarity: RARITY.RARE },
        { id: 'crown_thorns', name: 'Crown of Thorns', color: BROWN, rarity: RARITY.LEGENDARY },
        { id: 'v_helmet', name: 'Visor Helmet', color: CYAN, rarity: RARITY.RARE },
        { id: 'mohawk', name: 'Mohawk', color: GREEN, rarity: RARITY.LEGENDARY },
    ],
    clothes: [
        { id: null, name: 'None', color: null, rarity: null },
        { id: 'tshirt', name: 'T-Shirt', color: WHITE, rarity: RARITY.COMMON },
        { id: 'suit', name: 'Suit', color: NAVY, rarity: RARITY.RARE },
        { id: 'armor', name: 'Armor', color: GRAY, rarity: RARITY.RARE },
        { id: 'hoodie', name: 'Hoodie', color: DARK_GREEN, rarity: RARITY.COMMON },
        { id: 'jacket', name: 'Jacket', color: BROWN, rarity: RARITY.COMMON },
        { id: 'vest', name: 'Vest', color: ORANGE, rarity: RARITY.COMMON },
        { id: 'robe', name: 'Robe', color: PURPLE, rarity: RARITY.RARE },
        { id: 'punk_vest', name: 'Punk Vest', color: BLACK, rarity: RARITY.RARE },
        { id: 'ninja', name: 'Ninja Gear', color: DARK_GRAY, rarity: RARITY.LEGENDARY },
        { id: 'captain', name: 'Captain Coat', color: MAROON, rarity: RARITY.EPIC },
        { id: 'sweater', name: 'Sweater', color: CYAN, rarity: RARITY.COMMON },
        { id: 'tuxedo', name: 'Tuxedo', color: BLACK, rarity: RARITY.LEGENDARY },
        { id: 'battle_armor', name: 'Battle Armor', color: DARK_GRAY, rarity: RARITY.EPIC },
        { id: 'royal', name: 'Royal Garb', color: TEAL, rarity: RARITY.LEGENDARY },
        { id: 'hawaiian', name: 'Hawaiian Shirt', color: GREEN, rarity: RARITY.COMMON },
        { id: 'labcoat', name: 'Lab Coat', color: WHITE, rarity: RARITY.RARE },
        { id: 'trench', name: 'Trench Coat', color: BROWN, rarity: RARITY.RARE },
        { id: 'track', name: 'Track Suit', color: BLUE, rarity: RARITY.COMMON },
        { id: 'pirate', name: 'Pirate Coat', color: BLACK, rarity: RARITY.EPIC },
        { id: 'winter', name: 'Winter Jacket', color: CYAN, rarity: RARITY.EPIC },
        { id: 'knight', name: 'Knight Armor', color: GRAY, rarity: RARITY.LEGENDARY },
        { id: 'mage', name: 'Mage Robe', color: PURPLE, rarity: RARITY.LEGENDARY },
        { id: 'scout', name: 'Scout Uniform', color: GREEN, rarity: RARITY.RARE },
        { id: 'sheriff', name: 'Sheriff Coat', color: BROWN, rarity: RARITY.EPIC },
        { id: 'cyber', name: 'Cyber Suit', color: CYAN, rarity: RARITY.MYTHIC },
        { id: 'butler', name: 'Butler Suit', color: BLACK, rarity: RARITY.RARE },
        { id: 'jungle', name: 'Jungle Gear', color: DARK_GREEN, rarity: RARITY.EPIC },
        { id: 'sailor_suit', name: 'Sailor Suit', color: WHITE, rarity: RARITY.RARE },
        { id: 'dragon', name: 'Dragon Armor', color: RED, rarity: RARITY.MYTHIC },
    ]
};

function drawCharacter(ctx, x, y, scale, hatId, clothesId, hatColor, clothesColor, dir, frame) {
    const s = scale;
    const cx = x, cy = y;

    if (dir === 'left' || dir === 'right') {
        drawSide(ctx, cx, cy, s, hatId, clothesId, hatColor, clothesColor, dir === 'right', frame || 0);
    } else {
        drawFrontBack(ctx, cx, cy, s, hatId, clothesId, hatColor, clothesColor, dir === 'up', frame || 0);
    }
}

function drawFrontBack(ctx, cx, cy, s, hatId, clothesId, hatColor, clothesColor, isBack, frame) {
    const bodyColor = (clothesId === 'ninja') ? DARK_GRAY : SKIN;
    const neckY = cy - 30 * s;
    const headR = 22 * s;
    const headY = neckY - headR;
    const bodyTop = neckY;
    const bodyBottom = neckY + 50 * s;
    const bodyW = 30 * s;
    const shoulderY = neckY + 5 * s;
    const legTop = bodyBottom;

    const f = frame % 2;
    const legSwing = f === 0 ? 1 : -1;
    const bobY = Math.sin(frame * Math.PI * 0.5) * 2 * s;
    const tilt = Math.sin(frame * Math.PI * 0.5) * 0.05;

    ctx.save();
    ctx.translate(cx, cy + bobY);

    if (!isBack) {
        if (clothesId) {
            drawClothes(ctx, 0, bodyTop - cy, bodyBottom - cy, bodyW, shoulderY - cy, 35 * s, s, clothesId, clothesColor);
        } else {
            ctx.fillStyle = bodyColor;
            ctx.strokeStyle = BLACK;
            ctx.lineWidth = 2;
            ctx.fillRect(-bodyW / 2, bodyTop - cy, bodyW, bodyBottom - bodyTop);
            ctx.strokeRect(-bodyW / 2, bodyTop - cy, bodyW, bodyBottom - bodyTop);
        }
    }

    ctx.beginPath();
    ctx.arc(0, headY - cy, headR, 0, Math.PI * 2);
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.strokeStyle = BLACK;
    ctx.lineWidth = 2;
    ctx.stroke();

    if (!isBack) {
        const eyeOff = 8 * s;
        const eyeY = headY - cy - 2 * s;
        ctx.fillStyle = BLACK;
        ctx.beginPath();
        ctx.arc(-eyeOff, eyeY, 3 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeOff, eyeY, 3 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, eyeY + 7 * s + 2 * s, 6 * s, 0, Math.PI);
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    const armSway = legSwing * 4 * s;
    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = 6 * s;
    ctx.beginPath();
    ctx.moveTo(-bodyW / 2 - 3 * s, shoulderY - cy + armSway);
    ctx.lineTo(-bodyW / 2 - 3 * s - 12 * s, shoulderY - cy + 35 * s + armSway);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bodyW / 2 + 3 * s, shoulderY - cy + armSway);
    ctx.lineTo(bodyW / 2 + 3 * s + 12 * s, shoulderY - cy + 35 * s + armSway);
    ctx.stroke();

    ctx.strokeStyle = isBack && clothesId === 'ninja' ? DARK_GRAY : bodyColor;
    ctx.lineWidth = 7 * s;
    ctx.beginPath();
    ctx.moveTo(-5 * s, legTop - cy);
    ctx.lineTo(-12 * s + legSwing * 6 * s, legTop - cy + 35 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(5 * s, legTop - cy);
    ctx.lineTo(12 * s - legSwing * 6 * s, legTop - cy + 35 * s);
    ctx.stroke();

    ctx.fillStyle = BLACK;
    ctx.beginPath();
    ctx.arc(-12 * s + legSwing * 6 * s, legTop - cy + 35 * s, 5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(12 * s - legSwing * 6 * s, legTop - cy + 35 * s, 5 * s, 0, Math.PI * 2);
    ctx.fill();

    if (isBack) {
        if (clothesId) {
            drawClothes(ctx, 0, bodyTop - cy, bodyBottom - cy, bodyW, shoulderY - cy, 35 * s, s, clothesId, clothesColor);
        } else {
            ctx.fillStyle = bodyColor;
            ctx.strokeStyle = BLACK;
            ctx.lineWidth = 2;
            ctx.fillRect(-bodyW / 2, bodyTop - cy, bodyW, bodyBottom - bodyTop);
            ctx.strokeRect(-bodyW / 2, bodyTop - cy, bodyW, bodyBottom - bodyTop);
        }
    }

    if (hatId) {
        drawHat(ctx, 0, headY - cy, headR, s, hatId, hatColor);
    }

    ctx.restore();
}

function drawSide(ctx, cx, cy, s, hatId, clothesId, hatColor, clothesColor, facingRight, frame) {
    const dir = facingRight ? 1 : -1;
    const bodyColor = (clothesId === 'ninja') ? DARK_GRAY : SKIN;
    const neckY = cy - 28 * s;
    const headR = 22 * s;
    const headY = neckY - headR;
    const bodyTop = neckY;
    const bodyBottom = neckY + 45 * s;
    const bodyW = 28 * s;
    const legTop = bodyBottom;

    const f = frame % 2;
    const stride = f === 0 ? 1 : -1;
    const bobY = Math.sin(frame * Math.PI * 0.5) * 2 * s;

    ctx.save();
    ctx.translate(cx, cy + bobY);

    const tiltAngle = 0.12 * dir;

    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(tiltAngle);
    if (clothesId) {
        drawClothesSide(ctx, 0, bodyTop - cy, bodyBottom - cy, bodyW, s, clothesId, clothesColor, dir);
    } else {
        ctx.fillStyle = bodyColor;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.fillRect(-bodyW / 2 + dir * 3 * s, bodyTop - cy, bodyW, bodyBottom - bodyTop);
        ctx.strokeRect(-bodyW / 2 + dir * 3 * s, bodyTop - cy, bodyW, bodyBottom - bodyTop);
    }
    ctx.restore();

    ctx.save();
    ctx.translate(dir * 3 * s, -4 * s);
    ctx.beginPath();
    ctx.arc(0, headY - cy, headR, 0, Math.PI * 2);
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.strokeStyle = BLACK;
    ctx.lineWidth = 2;
    ctx.stroke();

    const eyeX = dir * 7 * s;
    const eyeY = headY - cy - 2 * s;
    ctx.fillStyle = BLACK;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 3 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, eyeY + 7 * s + 1 * s, 3 * s, 0, Math.PI);
    ctx.strokeStyle = BLACK;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.rotate(tiltAngle);

    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = 6 * s;
    const armSwing = stride * 6 * s;
    ctx.beginPath();
    ctx.moveTo(dir * 8 * s, bodyTop - cy + 2 * s + armSwing);
    ctx.lineTo(dir * 18 * s, bodyTop - cy + 25 * s + armSwing);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-dir * 6 * s, bodyTop - cy + 2 * s - armSwing);
    ctx.lineTo(-dir * 14 * s, bodyTop - cy + 25 * s - armSwing);
    ctx.stroke();

    ctx.strokeStyle = BLACK;
    ctx.lineWidth = 7 * s;
    const legSwing = stride * 7 * s;
    ctx.beginPath();
    ctx.moveTo(dir * 4 * s, legTop - cy);
    ctx.lineTo(dir * 10 * s + legSwing, legTop - cy + 32 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-dir * 4 * s, legTop - cy);
    ctx.lineTo(-dir * 10 * s - legSwing, legTop - cy + 32 * s);
    ctx.stroke();

    ctx.fillStyle = BLACK;
    ctx.beginPath();
    ctx.arc(dir * 10 * s + legSwing, legTop - cy + 32 * s, 5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-dir * 10 * s - legSwing, legTop - cy + 32 * s, 5 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    if (hatId) {
        ctx.save();
        ctx.translate(dir * 3 * s, -4 * s + bobY);
        drawHatSide(ctx, 0, headY - cy, headR, s, hatId, hatColor, dir);
        ctx.restore();
    }

    ctx.restore();
}

function drawHatSide(ctx, cx, headY, headR, s, hatId, color, dir) {
    if (hatId === 'baseball_cap') {
        ctx.fillStyle = color || RED;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx + dir * 3 * s, headY - headR * 1.2, headR * 0.8, headR * 0.4, 0.2 * dir, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx + dir * headR * 0.6, headY - headR * 0.15, headR * 0.6, headR * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    } else if (hatId === 'crown' || hatId === 'crown_gold') {
        const h = headR * 1.5;
        ctx.fillStyle = color || GOLD;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - headR * 0.8, headY - headR * 0.2);
        ctx.lineTo(cx - headR * 0.8, headY - h);
        ctx.lineTo(cx - headR * 0.3, headY - h + 5 * s);
        ctx.lineTo(cx + dir * 2 * s, headY - h);
        ctx.lineTo(cx + headR * 0.3, headY - h + 5 * s);
        ctx.lineTo(cx + headR * 0.8, headY - h);
        ctx.lineTo(cx + headR * 0.8, headY - headR * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    } else if (hatId === 'beanie') {
        ctx.fillStyle = color || BLUE;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx + dir * 2 * s, headY - headR * 0.8, headR * 0.9, headR * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    } else if (hatId === 'top_hat') {
        const w = headR * 1.2, h = headR * 2;
        ctx.fillStyle = color || BLACK;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - w / 2, headY - h - 5 * s, w, h);
        ctx.strokeRect(cx - w / 2, headY - h - 5 * s, w, h);
        ctx.fillRect(cx - w / 2 - 5 * s, headY - 8 * s, w + 10 * s, 10 * s);
        ctx.strokeRect(cx - w / 2 - 5 * s, headY - 8 * s, w + 10 * s, 10 * s);
    } else if (hatId === 'cowboy') {
        ctx.fillStyle = color || BROWN;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - headR * 1.5, headY - 5 * s);
        ctx.lineTo(cx - headR, headY - headR * 1.2);
        ctx.lineTo(cx + dir * 2 * s, headY - headR * 1.5);
        ctx.lineTo(cx + headR, headY - headR * 1.2);
        ctx.lineTo(cx + headR * 1.5, headY - 5 * s);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    } else if (hatId === 'wizard') {
        const h = headR * 2.5;
        ctx.fillStyle = color || PURPLE;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - headR * 0.5, headY - 5 * s);
        ctx.lineTo(cx + dir * headR * 0.3, headY - h);
        ctx.lineTo(cx + headR * 0.8, headY - 5 * s);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    } else if (hatId === 'santa') {
        const h = headR * 1.4;
        ctx.fillStyle = color || RED;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - headR, headY - 5 * s);
        ctx.lineTo(cx - headR, headY - h);
        ctx.lineTo(cx + headR, headY - h);
        ctx.lineTo(cx + headR, headY - 5 * s);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = WHITE;
        ctx.beginPath();
        ctx.arc(cx + dir * 2 * s, headY - h, 5 * s, 0, Math.PI * 2);
        ctx.fill();
    } else if (hatId === 'headband') {
        ctx.fillStyle = color || RED;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - headR * 0.9, headY - headR * 0.6, headR * 1.8, 7 * s);
        ctx.strokeRect(cx - headR * 0.9, headY - headR * 0.6, headR * 1.8, 7 * s);
        ctx.strokeStyle = color || RED;
        ctx.lineWidth = 4 * s;
        ctx.beginPath();
        ctx.moveTo(cx + headR * 0.7, headY - headR * 0.4);
        ctx.lineTo(cx + headR * 1.2, headY - headR * 0.1);
        ctx.stroke();
    } else if (hatId === 'helmet') {
        ctx.fillStyle = color || GRAY;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx + dir * 2 * s, headY - headR * 0.7, headR, headR * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = DARK_GRAY;
        ctx.fillRect(cx - 2 * s, headY + headR * 0.2, 4 * s, headR * 0.6);
    } else {
        drawHat(ctx, cx, headY, headR, s, hatId, color);
    }
}

function drawClothesSide(ctx, cx, bodyTop, bodyBottom, bodyW, s, clothesId, color, dir) {
    const c = color || WHITE;
    ctx.fillStyle = c;
    ctx.strokeStyle = BLACK;
    ctx.lineWidth = 2;
    const tw = bodyW * 0.8;
    const th = bodyBottom - bodyTop;
    ctx.fillRect(cx - tw / 2 + dir * 3 * s, bodyTop, tw, th);
    ctx.strokeRect(cx - tw / 2 + dir * 3 * s, bodyTop, tw, th);

    if (clothesId === 'armor' || clothesId === 'battle_armor' || clothesId === 'knight') {
        ctx.strokeStyle = RED;
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            const yy = bodyTop + 10 * s + i * 10 * s;
            ctx.beginPath();
            ctx.moveTo(cx - tw / 3 + dir * 3 * s, yy);
            ctx.lineTo(cx + tw / 3 + dir * 3 * s, yy);
            ctx.stroke();
        }
    } else if (clothesId === 'ninja' || clothesId === 'dragon') {
        ctx.fillStyle = clothesId === 'dragon' ? RED : DARK_GRAY;
        ctx.fillRect(cx - tw * 0.4 + dir * 3 * s, bodyTop - 5 * s, tw * 0.8, th + 5 * s);
    } else if (clothesId === 'labcoat' || clothesId === 'trench' || clothesId === 'mage' || clothesId === 'sheriff') {
        ctx.fillRect(cx - tw * 0.5 + dir * 3 * s, bodyTop, tw, th + 10 * s);
        ctx.strokeRect(cx - tw * 0.5 + dir * 3 * s, bodyTop, tw, th + 10 * s);
    } else if (clothesId === 'hawaiian' || clothesId === 'scout') {
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = i % 2 === 0 ? c : (c === GREEN ? YELLOW : RED);
            const yy = bodyTop + i * 10 * s + 5 * s;
            ctx.fillRect(cx - tw / 2 + dir * 3 * s, yy, tw, 5 * s);
        }
    } else if (clothesId === 'track') {
        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - tw / 2 + dir * 3 * s, bodyTop + 5 * s);
        ctx.lineTo(cx + tw / 2 + dir * 3 * s, bodyTop + 5 * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - tw / 2 + dir * 3 * s, bodyBottom - 5 * s);
        ctx.lineTo(cx + tw / 2 + dir * 3 * s, bodyBottom - 5 * s);
        ctx.stroke();
    } else if (clothesId === 'cyber') {
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(cx - tw / 2 + dir * 3 * s, bodyTop + 3 * s, tw, 5 * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.rect(cx - tw / 2 + dir * 3 * s, bodyBottom - 8 * s, tw, 5 * s);
        ctx.stroke();
    }
}

function drawHat(ctx, cx, headY, headR, s, hatId, color) {
    const c = color || RED;

    if (hatId === 'baseball_cap') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, headY - headR * 1.3, headR * 1.2, headR * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx, headY - headR * 0.2, headR * 1.4, headR * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    } else if (hatId === 'beanie') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, headY - headR * 0.9, headR * 1.2, headR * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, headY - headR * 2.1, 5 * s, 0, Math.PI * 2);
        ctx.fill();
    } else if (hatId === 'crown' || hatId === 'crown_gold') {
        const h = headR * 1.6;
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - headR * 1.1, headY - headR * 0.2);
        ctx.lineTo(cx - headR * 1.1, headY - h);
        ctx.lineTo(cx - headR * 0.6, headY - h + 6 * s);
        ctx.lineTo(cx, headY - h);
        ctx.lineTo(cx + headR * 0.6, headY - h + 6 * s);
        ctx.lineTo(cx + headR * 1.1, headY - h);
        ctx.lineTo(cx + headR * 1.1, headY - headR * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = RED;
        [-0.6, 0, 0.6].forEach(i => {
            ctx.beginPath();
            ctx.arc(cx + i * headR, headY - h + 3 * s, 3 * s, 0, Math.PI * 2);
            ctx.fill();
        });
    } else if (hatId === 'top_hat') {
        const w = headR * 1.6, h = headR * 2;
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - w / 2, headY - h - 5 * s, w, h);
        ctx.strokeRect(cx - w / 2, headY - h - 5 * s, w, h);
        ctx.fillRect(cx - w / 2 - 10 * s, headY - 8 * s, w + 20 * s, 12 * s);
        ctx.strokeRect(cx - w / 2 - 10 * s, headY - 8 * s, w + 20 * s, 12 * s);
    } else if (hatId === 'cowboy') {
        const w = headR * 3, h = headR * 1.2;
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - w / 2, headY - 5 * s);
        ctx.lineTo(cx - w / 3, headY - h - 10 * s);
        ctx.lineTo(cx, headY - h - 15 * s);
        ctx.lineTo(cx + w / 3, headY - h - 10 * s);
        ctx.lineTo(cx + w / 2, headY - 5 * s);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx, headY - s, w / 2, 7 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    } else if (hatId === 'wizard') {
        const h = headR * 2.5;
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - headR * 0.3, headY - 5 * s);
        ctx.lineTo(cx - headR * 1.4, headY - h);
        ctx.lineTo(cx + headR * 0.3, headY - 5 * s);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = GOLD;
        ctx.beginPath();
        ctx.arc(cx - headR * 0.8, headY - h + 10 * s, 5 * s, 0, Math.PI * 2);
        ctx.fill();
    } else if (hatId === 'santa') {
        const h = headR * 1.5;
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - headR * 1.2, headY - 5 * s);
        ctx.lineTo(cx - headR * 1.2, headY - h);
        ctx.lineTo(cx + headR * 1.2, headY - h);
        ctx.lineTo(cx + headR * 1.2, headY - 5 * s);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = WHITE;
        ctx.beginPath();
        ctx.arc(cx, headY - h, 6 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(cx - headR * 1.2, headY - 8 * s, headR * 2.4, 10 * s);
    } else if (hatId === 'fedora') {
        const w = headR * 2.6;
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, headY - headR * 0.8, w / 2, headR * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx, headY - 2 * s, w / 2 + 5 * s, 6 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = BLACK;
        ctx.fillRect(cx - 2 * s, headY - headR * 1.4, 4 * s, headR * 0.8);
    } else if (hatId === 'headband') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - headR * 1.2, headY - headR * 0.7, headR * 2.4, 8 * s);
        ctx.strokeRect(cx - headR * 1.2, headY - headR * 0.7, headR * 2.4, 8 * s);
        ctx.strokeStyle = c;
        ctx.lineWidth = 4 * s;
        ctx.beginPath();
        ctx.moveTo(cx + headR * 1.0, headY - headR * 0.5);
        ctx.lineTo(cx + headR * 1.5, headY - headR * 0.2);
        ctx.stroke();
    } else if (hatId === 'helmet') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, headY - headR * 0.8, headR * 1.3, headR * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = DARK_GRAY;
        ctx.fillRect(cx - headR * 0.1, headY + headR * 0.1, headR * 0.2, headR * 0.8);
    } else if (hatId === 'beret') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, headY - headR * 0.9, headR * 1.4, headR * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    } else if (hatId === 'cap_visor') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, headY - headR * 0.8, headR * 1.1, headR * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx, headY - headR * 0.05, headR * 1.3, headR * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    } else if (hatId === 'party_hat') {
        const h = headR * 1.8;
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - headR * 1.1, headY - 5 * s);
        ctx.lineTo(cx, headY - h);
        ctx.lineTo(cx + headR * 1.1, headY - 5 * s);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        [RED, BLUE, YELLOW].forEach((clr, i) => {
            ctx.fillStyle = clr;
            ctx.beginPath();
            ctx.arc(cx, headY - h + 8 * s + i * 10 * s, 3 * s, 0, Math.PI * 2);
            ctx.fill();
        });
    } else if (hatId === 'samurai') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, headY - headR * 1.1, headR * 1.2, headR * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = GOLD;
        ctx.beginPath();
        ctx.ellipse(cx - headR * 0.3, headY - headR * 1.8, 3 * s, 6 * s, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + headR * 0.3, headY - headR * 1.8, 3 * s, 6 * s, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = RED;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(cx - 5 * s, headY - headR * 0.3, 10 * s, 5 * s);
        ctx.stroke();
    } else if (hatId === 'pirate_hat') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, headY - 3 * s, headR * 1.6, 8 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - headR * 1.1, headY - 8 * s);
        ctx.lineTo(cx, headY - headR * 2);
        ctx.lineTo(cx + headR * 1.1, headY - 8 * s);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = WHITE;
        ctx.beginPath();
        ctx.arc(cx, headY - headR * 1.6, 5 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, headY - headR * 1.6, 3 * s, 0, Math.PI * 2);
        ctx.fillStyle = RED;
        ctx.fill();
    } else if (hatId === 'viking') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, headY - headR * 0.9, headR * 1.3, headR * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = GOLD;
        ctx.beginPath();
        ctx.moveTo(cx - headR * 0.2, headY - headR * 1.7);
        ctx.lineTo(cx, headY - headR * 2.5);
        ctx.lineTo(cx + headR * 0.2, headY - headR * 1.7);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = BLACK;
        ctx.stroke();
        ctx.strokeStyle = GRAY;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - headR * 0.9, headY - 5 * s);
        ctx.lineTo(cx - headR * 1.5, headY + 5 * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + headR * 0.9, headY - 5 * s);
        ctx.lineTo(cx + headR * 1.5, headY + 5 * s);
        ctx.stroke();
    } else if (hatId === 'cat_ears') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - headR * 0.7, headY - headR * 0.3);
        ctx.lineTo(cx - headR * 1.2, headY - headR * 1.8);
        ctx.lineTo(cx - headR * 0.1, headY - headR * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + headR * 0.7, headY - headR * 0.3);
        ctx.lineTo(cx + headR * 1.2, headY - headR * 1.8);
        ctx.lineTo(cx + headR * 0.1, headY - headR * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = PINK;
        ctx.beginPath();
        ctx.moveTo(cx - headR * 0.5, headY - headR * 0.3);
        ctx.lineTo(cx - headR * 0.9, headY - headR * 1.3);
        ctx.lineTo(cx - headR * 0.2, headY - headR * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + headR * 0.5, headY - headR * 0.3);
        ctx.lineTo(cx + headR * 0.9, headY - headR * 1.3);
        ctx.lineTo(cx + headR * 0.2, headY - headR * 0.3);
        ctx.closePath();
        ctx.fill();
    } else if (hatId === 'halo') {
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 4 * s;
        ctx.beginPath();
        ctx.ellipse(cx, headY - headR * 2.2, headR * 0.8, headR * 0.3, 0, Math.PI, 0);
        ctx.stroke();
        ctx.fillStyle = GOLD;
        ctx.beginPath();
        ctx.arc(cx, headY - headR * 2.2, 5 * s, 0, Math.PI * 2);
        ctx.fill();
    } else if (hatId === 'chef') {
        ctx.fillStyle = WHITE;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        const ch = headR * 1.8;
        ctx.fillRect(cx - headR * 0.8, headY - ch, headR * 1.6, ch);
        ctx.strokeRect(cx - headR * 0.8, headY - ch, headR * 1.6, ch);
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(cx, headY - ch - 2 * s, headR * 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.arc(cx + i * headR * 0.5, headY - ch + 5 * s, 4 * s, 0, Math.PI * 2);
            ctx.fillStyle = c;
            ctx.fill();
            ctx.stroke();
        }
    } else if (hatId === 'knight_helm') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, headY - headR * 0.7, headR * 1.2, headR * 1.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = DARK_GRAY;
        ctx.fillRect(cx - 6 * s, headY - 2 * s, 12 * s, 4 * s);
        ctx.fillRect(cx - 5 * s, headY + 3 * s, 10 * s, 3 * s);
        ctx.fillStyle = GOLD;
        ctx.beginPath();
        ctx.arc(cx, headY - headR * 1.5, 4 * s, 0, Math.PI * 2);
        ctx.fill();
    } else if (hatId === 'witch') {
        const h = headR * 2.5;
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - headR * 0.8, headY - 5 * s);
        ctx.lineTo(cx, headY - h);
        ctx.lineTo(cx + headR * 0.8, headY - 5 * s);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillRect(cx - headR * 0.7, headY - h - 8 * s, headR * 1.4, 10 * s);
        ctx.strokeRect(cx - headR * 0.7, headY - h - 8 * s, headR * 1.4, 10 * s);
        ctx.fillStyle = BLACK;
        ctx.fillRect(cx - headR * 1.3, headY - 7 * s, headR * 2.6, 8 * s);
        ctx.strokeRect(cx - headR * 1.3, headY - 7 * s, headR * 2.6, 8 * s);
    } else if (hatId === 'sailor') {
        ctx.fillStyle = WHITE;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, headY - headR * 0.7, headR * 1.2, headR * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillRect(cx - headR * 1.1, headY - headR * 0.8, headR * 2.2, 4 * s);
        ctx.strokeStyle = BLUE;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, headY - headR * 0.2, 3 * s, 0, Math.PI * 2);
        ctx.stroke();
    } else if (hatId === 'propeller') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, headY - headR * 0.8, headR * 1.2, headR * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = RED;
        ctx.beginPath();
        ctx.arc(cx, headY - headR * 1.5, 4 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - headR * 0.8, headY - headR * 1.5);
        ctx.lineTo(cx + headR * 0.8, headY - headR * 1.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, headY - headR * 1.5 - headR * 0.4);
        ctx.lineTo(cx, headY - headR * 1.5 + headR * 0.4);
        ctx.stroke();
    } else if (hatId === 'bandana') {
        ctx.fillStyle = c;
        ctx.fillRect(cx - headR * 1.2, headY - headR * 0.7, headR * 2.4, 10 * s);
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - headR * 1.2, headY - headR * 0.7, headR * 2.4, 10 * s);
        ctx.strokeStyle = c;
        ctx.lineWidth = 4 * s;
        ctx.beginPath();
        ctx.moveTo(cx - headR * 0.8, headY - headR * 0.7);
        ctx.lineTo(cx - headR * 1.1, headY - headR * 0.3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + headR * 0.8, headY - headR * 0.7);
        ctx.lineTo(cx + headR * 1.1, headY - headR * 0.3);
        ctx.stroke();
        ctx.fillStyle = WHITE;
        ctx.beginPath();
        ctx.arc(cx, headY - headR * 0.2, 2 * s, 0, Math.PI * 2);
        ctx.fill();
    } else if (hatId === 'sombrero') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, headY - headR * 0.3, headR * 2, 10 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = DARK_GRAY;
        ctx.beginPath();
        ctx.ellipse(cx, headY - headR * 1.2, headR * 1.1, headR * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = GREEN;
        ctx.beginPath();
        ctx.ellipse(cx - headR * 0.5, headY - headR * 1.1, 3 * s, 2 * s, 0.3, 0, Math.PI * 2);
        ctx.fill();
    } else if (hatId === 'crown_thorns') {
        ctx.strokeStyle = c;
        ctx.lineWidth = 3;
        for (let i = -2; i <= 2; i++) {
            const ang = i * 0.5;
            ctx.beginPath();
            ctx.moveTo(cx + ang * headR * 0.4, headY - headR * 0.3);
            ctx.lineTo(cx + ang * headR * 0.5, headY - headR * 1.3);
            ctx.lineTo(cx + ang * headR * 0.6 + 2 * s, headY - headR * 0.3);
            ctx.stroke();
        }
    } else if (hatId === 'v_helmet') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, headY - headR * 0.8, headR * 1.2, headR * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = DARK_GRAY;
        ctx.fillRect(cx - headR * 0.1, headY + headR * 0.1, headR * 0.2, headR * 0.8);
        ctx.fillStyle = GOLD;
        ctx.beginPath();
        ctx.ellipse(cx, headY - headR * 0.4, 3 * s, 5 * s, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (hatId === 'mohawk') {
        ctx.fillStyle = RED;
        ctx.fillRect(cx - 5 * s, headY - headR * 0.7, 10 * s, 10 * s);
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = i % 2 === 0 ? RED : ORANGE;
            ctx.beginPath();
            ctx.arc(cx, headY - headR * 0.7 - i * 7 * s, 5 * s, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(cx, headY - headR * 0.7 - i * 7 * s, 5 * s, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

function drawClothes(ctx, cx, bodyTop, bodyBottom, bodyW, shoulderY, armLen, s, clothesId, color) {
    const c = color || WHITE;

    if (clothesId === 'tshirt') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 2 * s, bodyTop, bodyW + 4 * s, bodyBottom - bodyTop);
        ctx.strokeRect(cx - bodyW / 2 - 2 * s, bodyTop, bodyW + 4 * s, bodyBottom - bodyTop);
        ctx.fillStyle = SKIN;
        ctx.fillRect(cx - 5 * s, bodyTop, 10 * s, 8 * s);
    } else if (clothesId === 'suit') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 3 * s, bodyTop, bodyW + 6 * s, bodyBottom - bodyTop);
        ctx.strokeRect(cx - bodyW / 2 - 3 * s, bodyTop, bodyW + 6 * s, bodyBottom - bodyTop);
        ctx.beginPath();
        ctx.moveTo(cx, bodyTop + 5 * s);
        ctx.lineTo(cx, bodyBottom - 5 * s);
        ctx.stroke();
        ctx.fillStyle = WHITE;
        ctx.fillRect(cx - 5 * s, bodyTop, 10 * s, 15 * s);
    } else if (clothesId === 'armor') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 4 * s, bodyTop, bodyW + 8 * s, bodyBottom - bodyTop);
        ctx.strokeRect(cx - bodyW / 2 - 4 * s, bodyTop, bodyW + 8 * s, bodyBottom - bodyTop);
        ctx.fillStyle = DARK_GRAY;
        for (let i = 0; i < 4; i++) {
            const yy = bodyTop + 8 * s + i * 9 * s;
            ctx.fillRect(cx - bodyW / 2 + 2 * s, yy, bodyW - 4 * s, 4 * s);
        }
    } else if (clothesId === 'hoodie') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 3 * s, bodyTop, bodyW + 6 * s, bodyBottom - bodyTop);
        ctx.strokeRect(cx - bodyW / 2 - 3 * s, bodyTop, bodyW + 6 * s, bodyBottom - bodyTop);
        ctx.strokeRect(cx - bodyW / 3, bodyTop + bodyW * 0.8, bodyW * 0.66, 12 * s);
        ctx.beginPath();
        ctx.ellipse(cx, bodyTop - 2 * s, bodyW / 2 + 2 * s, 10 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    } else if (clothesId === 'jacket') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 3 * s, bodyTop, bodyW + 6 * s, bodyBottom - bodyTop);
        ctx.strokeRect(cx - bodyW / 2 - 3 * s, bodyTop, bodyW + 6 * s, bodyBottom - bodyTop);
        ctx.beginPath();
        ctx.moveTo(cx, bodyTop + 5 * s);
        ctx.lineTo(cx, bodyBottom - 5 * s);
        ctx.stroke();
        ctx.fillStyle = BLACK;
        for (let i = 0; i < 3; i++) {
            const yy = bodyTop + 12 * s + i * 10 * s;
            ctx.beginPath();
            ctx.arc(cx, yy, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (clothesId === 'vest') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 2 * s, bodyTop, bodyW * 0.45 + 2 * s, bodyBottom - bodyTop);
        ctx.fillRect(cx + 2 * s, bodyTop, bodyW * 0.45 + 2 * s, bodyBottom - bodyTop);
        ctx.strokeRect(cx - bodyW / 2 - 2 * s, bodyTop, bodyW * 0.45 + 2 * s, bodyBottom - bodyTop);
        ctx.strokeRect(cx + 2 * s, bodyTop, bodyW * 0.45 + 2 * s, bodyBottom - bodyTop);
    } else if (clothesId === 'robe') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 5 * s, bodyTop, bodyW + 10 * s, bodyBottom - bodyTop + 20 * s);
        ctx.strokeRect(cx - bodyW / 2 - 5 * s, bodyTop, bodyW + 10 * s, bodyBottom - bodyTop + 20 * s);
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, bodyTop + 5 * s);
        ctx.lineTo(cx, bodyTop + 20 * s);
        ctx.stroke();
    } else if (clothesId === 'punk_vest') {
        ctx.fillStyle = c;
        ctx.strokeStyle = RED;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 2 * s, bodyTop, bodyW * 0.5, bodyBottom - bodyTop);
        ctx.fillRect(cx + 2 * s, bodyTop, bodyW * 0.5, bodyBottom - bodyTop);
        ctx.strokeRect(cx - bodyW / 2 - 2 * s, bodyTop, bodyW * 0.5, bodyBottom - bodyTop);
        ctx.strokeRect(cx + 2 * s, bodyTop, bodyW * 0.5, bodyBottom - bodyTop);
        ctx.fillStyle = GRAY;
        for (let i = 0; i < 3; i++) {
            const sy = bodyTop + 8 * s + i * 12 * s;
            ctx.beginPath();
            ctx.moveTo(cx - bodyW * 0.3, sy);
            ctx.lineTo(cx - bodyW * 0.25, sy - 6 * s);
            ctx.lineTo(cx - bodyW * 0.2, sy);
            ctx.closePath();
            ctx.fill();
        }
    } else if (clothesId === 'ninja') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 3 * s, bodyTop - 5 * s, bodyW + 6 * s, bodyBottom - bodyTop + 10 * s);
        ctx.strokeRect(cx - bodyW / 2 - 3 * s, bodyTop - 5 * s, bodyW + 6 * s, bodyBottom - bodyTop + 10 * s);
        const hr = 22 * s, hy = bodyTop - 30 * s;
        ctx.beginPath();
        ctx.ellipse(cx, hy - hr, hr + 2 * s, hr / 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = WHITE;
        ctx.beginPath();
        ctx.arc(cx - 8 * s, hy - 2 * s, 4 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 8 * s, hy - 2 * s, 4 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = BLACK;
        ctx.beginPath();
        ctx.arc(cx - 8 * s, hy - 2 * s, 2 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 8 * s, hy - 2 * s, 2 * s, 0, Math.PI * 2);
        ctx.fill();
    } else if (clothesId === 'captain') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 4 * s, bodyTop, bodyW + 8 * s, bodyBottom - bodyTop + 10 * s);
        ctx.strokeRect(cx - bodyW / 2 - 4 * s, bodyTop, bodyW + 8 * s, bodyBottom - bodyTop + 10 * s);
        ctx.fillStyle = GOLD;
        for (let i = 0; i < 2; i++) {
            const yy = bodyTop + 15 * s + i * 18 * s;
            ctx.beginPath();
            ctx.arc(cx, yy, 4 * s, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.beginPath();
        ctx.ellipse(cx - bodyW / 2 - 5 * s, shoulderY, 8 * s, 5 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + bodyW / 2 + 5 * s, shoulderY, 8 * s, 5 * s, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (clothesId === 'sweater') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 3 * s, bodyTop, bodyW + 6 * s, bodyBottom - bodyTop);
        ctx.strokeRect(cx - bodyW / 2 - 3 * s, bodyTop, bodyW + 6 * s, bodyBottom - bodyTop);
        const pc = c === CYAN ? WHITE : BLACK;
        ctx.strokeStyle = pc;
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const yy = bodyTop + 6 * s + i * 8 * s;
            ctx.beginPath();
            ctx.moveTo(cx - bodyW / 3, yy);
            ctx.lineTo(cx + bodyW / 3, yy);
            ctx.stroke();
        }
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, bodyTop - 2 * s, 6 * s, 6 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    } else if (clothesId === 'tuxedo') {
        const c2 = c;
        ctx.fillStyle = c2;
        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 2 * s, bodyTop, bodyW * 0.5 + 2 * s, bodyBottom - bodyTop);
        ctx.fillRect(cx + 2 * s, bodyTop, bodyW * 0.5 + 2 * s, bodyBottom - bodyTop);
        ctx.strokeRect(cx - bodyW / 2 - 2 * s, bodyTop, bodyW * 0.5 + 2 * s, bodyBottom - bodyTop);
        ctx.strokeRect(cx + 2 * s, bodyTop, bodyW * 0.5 + 2 * s, bodyBottom - bodyTop);
        ctx.fillStyle = WHITE;
        ctx.beginPath();
        ctx.ellipse(cx, bodyTop + 9 * s, 8 * s, 4 * s, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (clothesId === 'battle_armor') {
        ctx.fillStyle = c;
        ctx.strokeStyle = RED;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 4 * s, bodyTop, bodyW + 8 * s, bodyBottom - bodyTop);
        ctx.strokeRect(cx - bodyW / 2 - 4 * s, bodyTop, bodyW + 8 * s, bodyBottom - bodyTop);
        ctx.fillStyle = RED;
        for (let i = 0; i < 3; i++) {
            const yy = bodyTop + 12 * s + i * 12 * s;
            ctx.fillRect(cx - 8 * s, yy, 16 * s, 5 * s);
        }
        ctx.fillStyle = c;
        ctx.strokeStyle = RED;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx - bodyW / 2 - 12 * s, shoulderY, 12 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + bodyW / 2 + 12 * s, shoulderY, 12 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    } else if (clothesId === 'royal') {
        ctx.fillStyle = c;
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 5 * s, bodyTop, bodyW + 10 * s, bodyBottom - bodyTop + 15 * s);
        ctx.strokeRect(cx - bodyW / 2 - 5 * s, bodyTop, bodyW + 10 * s, bodyBottom - bodyTop + 15 * s);
        ctx.beginPath();
        ctx.moveTo(cx - bodyW * 0.7, bodyTop);
        ctx.lineTo(cx - bodyW * 0.7 - 15 * s, bodyBottom + 20 * s);
        ctx.lineTo(cx, bodyBottom + 30 * s);
        ctx.lineTo(cx + bodyW * 0.7 + 15 * s, bodyBottom + 20 * s);
        ctx.lineTo(cx + bodyW * 0.7, bodyTop);
        ctx.stroke();
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, bodyTop + 5 * s);
        ctx.lineTo(cx, bodyTop + 25 * s);
        ctx.stroke();
    } else if (clothesId === 'hawaiian') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 3 * s, bodyTop, bodyW + 6 * s, bodyBottom - bodyTop);
        ctx.strokeRect(cx - bodyW / 2 - 3 * s, bodyTop, bodyW + 6 * s, bodyBottom - bodyTop);
        ctx.fillStyle = YELLOW;
        const fp = [1, 3, 5, 7, 9];
        fp.forEach(i => {
            ctx.beginPath();
            ctx.arc(cx - 6 * s, bodyTop + i * 4 * s, 3 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx + 8 * s, bodyTop + i * 4 * s + 4 * s, 3 * s, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.fillStyle = RED;
        ctx.beginPath();
        ctx.arc(cx, bodyTop + 5 * s, 3 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, bodyTop + 15 * s, 3 * s, 0, Math.PI * 2);
        ctx.fill();
    } else if (clothesId === 'labcoat') {
        ctx.fillStyle = WHITE;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 4 * s, bodyTop, bodyW + 8 * s, bodyBottom - bodyTop + 15 * s);
        ctx.strokeRect(cx - bodyW / 2 - 4 * s, bodyTop, bodyW + 8 * s, bodyBottom - bodyTop + 15 * s);
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, bodyTop + 5 * s);
        ctx.lineTo(cx, bodyBottom + 10 * s);
        ctx.stroke();
        ctx.fillStyle = BLUE;
        ctx.beginPath();
        ctx.arc(cx, bodyTop + 3 * s, 3 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(cx - bodyW / 2 + 2 * s, bodyTop + 20 * s, bodyW * 0.4, 2 * s);
        ctx.fillRect(cx - bodyW / 2 + 2 * s, bodyTop + 28 * s, bodyW * 0.4, 2 * s);
    } else if (clothesId === 'trench') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 5 * s, bodyTop, bodyW + 10 * s, bodyBottom - bodyTop + 18 * s);
        ctx.strokeRect(cx - bodyW / 2 - 5 * s, bodyTop, bodyW + 10 * s, bodyBottom - bodyTop + 18 * s);
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, bodyTop + 5 * s);
        ctx.lineTo(cx, bodyBottom + 15 * s);
        ctx.stroke();
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(cx, bodyTop + 12 * s + i * 10 * s, 2 * s, 0, Math.PI * 2);
            ctx.fillStyle = BLACK;
            ctx.fill();
        }
    } else if (clothesId === 'track') {
        ctx.fillStyle = c;
        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 3 * s, bodyTop, bodyW + 6 * s, bodyBottom - bodyTop);
        ctx.strokeRect(cx - bodyW / 2 - 3 * s, bodyTop, bodyW + 6 * s, bodyBottom - bodyTop);
        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - bodyW / 2 - 3 * s, bodyTop + 10 * s);
        ctx.lineTo(cx + bodyW / 2 + 3 * s, bodyTop + 10 * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - bodyW / 2 - 3 * s, bodyTop + 30 * s);
        ctx.lineTo(cx + bodyW / 2 + 3 * s, bodyTop + 30 * s);
        ctx.stroke();
    } else if (clothesId === 'pirate') {
        ctx.fillStyle = c;
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 4 * s, bodyTop, bodyW + 8 * s, bodyBottom - bodyTop + 12 * s);
        ctx.strokeRect(cx - bodyW / 2 - 4 * s, bodyTop, bodyW + 8 * s, bodyBottom - bodyTop + 12 * s);
        ctx.fillStyle = GOLD;
        ctx.beginPath();
        ctx.arc(cx - bodyW / 2 - 5 * s, shoulderY, 5 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + bodyW / 2 + 5 * s, shoulderY, 5 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = WHITE;
        ctx.beginPath();
        ctx.arc(cx, bodyTop + 8 * s, 4 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, bodyTop + 5 * s);
        ctx.lineTo(cx, bodyBottom + 5 * s);
        ctx.stroke();
    } else if (clothesId === 'winter') {
        ctx.fillStyle = c;
        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 4 * s, bodyTop, bodyW + 8 * s, bodyBottom - bodyTop);
        ctx.strokeRect(cx - bodyW / 2 - 4 * s, bodyTop, bodyW + 8 * s, bodyBottom - bodyTop);
        ctx.fillStyle = WHITE;
        ctx.beginPath();
        ctx.arc(cx, bodyTop - 3 * s, 5 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillRect(cx - bodyW / 2 - 4 * s, bodyTop, bodyW + 8 * s, 6 * s);
        ctx.fillRect(cx - bodyW / 2 - 3 * s, bodyBottom - 4 * s, bodyW + 6 * s, 6 * s);
    } else if (clothesId === 'knight') {
        ctx.fillStyle = GRAY;
        ctx.strokeStyle = RED;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 4 * s, bodyTop, bodyW + 8 * s, bodyBottom - bodyTop + 5 * s);
        ctx.strokeRect(cx - bodyW / 2 - 4 * s, bodyTop, bodyW + 8 * s, bodyBottom - bodyTop + 5 * s);
        ctx.fillStyle = RED;
        for (let i = 0; i < 4; i++) {
            const yy = bodyTop + 8 * s + i * 9 * s;
            ctx.fillRect(cx - bodyW / 2 + 2 * s, yy, bodyW - 4 * s, 3 * s);
        }
        ctx.fillStyle = GOLD;
        ctx.beginPath();
        ctx.arc(cx, bodyTop + 5 * s, 5 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx - bodyW / 2 - 8 * s, shoulderY, 10 * s, 0, Math.PI * 2);
        ctx.fillStyle = GRAY;
        ctx.fill();
        ctx.strokeStyle = RED;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + bodyW / 2 + 8 * s, shoulderY, 10 * s, 0, Math.PI * 2);
        ctx.fillStyle = GRAY;
        ctx.fill();
        ctx.strokeStyle = RED;
        ctx.stroke();
    } else if (clothesId === 'mage') {
        ctx.fillStyle = c;
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 5 * s, bodyTop, bodyW + 10 * s, bodyBottom - bodyTop + 20 * s);
        ctx.strokeRect(cx - bodyW / 2 - 5 * s, bodyTop, bodyW + 10 * s, bodyBottom - bodyTop + 20 * s);
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            const yy = bodyTop + 10 * s + i * 12 * s;
            ctx.beginPath();
            ctx.arc(cx - bodyW / 2 - 3 * s, yy, 3 * s, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(cx + bodyW / 2 + 3 * s, yy, 3 * s, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(cx, bodyTop + 8 * s, 5 * s, 0, Math.PI * 2);
        ctx.fillStyle = GOLD;
        ctx.fill();
        ctx.stroke();
    } else if (clothesId === 'scout') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 2 * s, bodyTop, bodyW + 4 * s, bodyBottom - bodyTop);
        ctx.strokeRect(cx - bodyW / 2 - 2 * s, bodyTop, bodyW + 4 * s, bodyBottom - bodyTop);
        ctx.fillStyle = RED;
        ctx.fillRect(cx - bodyW / 2 - 2 * s, bodyTop + 5 * s, bodyW + 4 * s, 3 * s);
        ctx.fillRect(cx - bodyW / 2 - 2 * s, bodyTop + 10 * s, bodyW + 4 * s, 3 * s);
        ctx.fillRect(cx - bodyW / 2 - 2 * s, bodyTop + 15 * s, bodyW + 4 * s, 3 * s);
        ctx.fillStyle = GOLD;
        ctx.beginPath();
        ctx.arc(cx, bodyTop + 5 * s, 3 * s, 0, Math.PI * 2);
        ctx.fill();
    } else if (clothesId === 'sheriff') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 4 * s, bodyTop, bodyW + 8 * s, bodyBottom - bodyTop + 10 * s);
        ctx.strokeRect(cx - bodyW / 2 - 4 * s, bodyTop, bodyW + 8 * s, bodyBottom - bodyTop + 10 * s);
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, bodyTop + 5 * s);
        ctx.lineTo(cx, bodyBottom + 5 * s);
        ctx.stroke();
        ctx.fillStyle = GOLD;
        ctx.beginPath();
        ctx.arc(cx, bodyTop + 5 * s, 4 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, bodyTop + 5 * s, 4 * s, 0, Math.PI * 2);
        ctx.stroke();
    } else if (clothesId === 'cyber') {
        ctx.fillStyle = c;
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 3 * s, bodyTop, bodyW + 6 * s, bodyBottom - bodyTop);
        ctx.strokeRect(cx - bodyW / 2 - 3 * s, bodyTop, bodyW + 6 * s, bodyBottom - bodyTop);
        ctx.fillStyle = GOLD;
        ctx.fillRect(cx - bodyW / 2 - 2 * s, bodyTop + 3 * s, bodyW + 4 * s, 4 * s);
        ctx.fillRect(cx - bodyW / 2 - 2 * s, bodyTop + 35 * s, bodyW + 4 * s, 4 * s);
        ctx.fillStyle = CYAN;
        ctx.beginPath();
        ctx.arc(cx, bodyTop + 15 * s, 5 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, bodyTop + 15 * s, 5 * s, 0, Math.PI * 2);
        ctx.stroke();
    } else if (clothesId === 'butler') {
        ctx.fillStyle = BLACK;
        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 2 * s, bodyTop, bodyW * 0.5 + 2 * s, bodyBottom - bodyTop);
        ctx.strokeRect(cx - bodyW / 2 - 2 * s, bodyTop, bodyW * 0.5 + 2 * s, bodyBottom - bodyTop);
        ctx.fillRect(cx + 2 * s, bodyTop, bodyW * 0.5 + 2 * s, bodyBottom - bodyTop);
        ctx.strokeRect(cx + 2 * s, bodyTop, bodyW * 0.5 + 2 * s, bodyBottom - bodyTop);
        ctx.fillStyle = WHITE;
        ctx.beginPath();
        ctx.ellipse(cx, bodyTop + 8 * s, 6 * s, 3 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(cx - 3 * s, bodyTop + 12 * s, 6 * s, 10 * s);
        ctx.stroke();
    } else if (clothesId === 'jungle') {
        ctx.fillStyle = c;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 3 * s, bodyTop, bodyW + 6 * s, bodyBottom - bodyTop + 5 * s);
        ctx.strokeRect(cx - bodyW / 2 - 3 * s, bodyTop, bodyW + 6 * s, bodyBottom - bodyTop + 5 * s);
        ctx.fillStyle = YELLOW;
        ctx.fillRect(cx - 5 * s, bodyTop + 10 * s, 10 * s, 20 * s);
        ctx.strokeStyle = YELLOW;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(cx - 5 * s, bodyTop + 10 * s, 10 * s, 20 * s);
        ctx.stroke();
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = GREEN;
            ctx.fillRect(cx - bodyW / 2 - 3 * s, bodyTop + 5 * s + i * 12 * s, bodyW + 6 * s, 4 * s);
        }
    } else if (clothesId === 'sailor_suit') {
        ctx.fillStyle = WHITE;
        ctx.strokeStyle = BLUE;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 3 * s, bodyTop, bodyW + 6 * s, bodyBottom - bodyTop);
        ctx.strokeRect(cx - bodyW / 2 - 3 * s, bodyTop, bodyW + 6 * s, bodyBottom - bodyTop);
        ctx.fillStyle = BLUE;
        ctx.fillRect(cx - bodyW / 2 - 3 * s, bodyTop, bodyW + 6 * s, 10 * s);
        ctx.beginPath();
        ctx.moveTo(cx - bodyW / 2 - 3 * s, bodyTop + 10 * s);
        ctx.lineTo(cx, bodyTop + 20 * s);
        ctx.lineTo(cx + bodyW / 2 + 3 * s, bodyTop + 10 * s);
        ctx.closePath();
        ctx.fillStyle = BLUE;
        ctx.fill();
        ctx.strokeStyle = BLUE;
        ctx.stroke();
        ctx.fillStyle = RED;
        ctx.beginPath();
        ctx.arc(cx, bodyTop + 6 * s, 3 * s, 0, Math.PI * 2);
        ctx.fill();
    } else if (clothesId === 'dragon') {
        ctx.fillStyle = RED;
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - bodyW / 2 - 4 * s, bodyTop, bodyW + 8 * s, bodyBottom - bodyTop + 5 * s);
        ctx.strokeRect(cx - bodyW / 2 - 4 * s, bodyTop, bodyW + 8 * s, bodyBottom - bodyTop + 5 * s);
        ctx.fillStyle = GOLD;
        for (let i = 0; i < 3; i++) {
            const yy = bodyTop + 10 * s + i * 11 * s;
            ctx.beginPath();
            ctx.arc(cx - 6 * s, yy, 3 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx + 6 * s, yy, 3 * s, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx - bodyW / 2 - 10 * s, shoulderY, 10 * s, 0, Math.PI * 2);
        ctx.fillStyle = RED;
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + bodyW / 2 + 10 * s, shoulderY, 10 * s, 0, Math.PI * 2);
        ctx.fillStyle = RED;
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = ORANGE;
        ctx.beginPath();
        ctx.arc(cx, bodyTop + 5 * s, 5 * s, 0, Math.PI * 2);
        ctx.fill();
    }
}