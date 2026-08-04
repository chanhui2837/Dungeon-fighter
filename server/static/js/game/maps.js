const STAGES = [
    { id: 1,  name: "Green Forest",    bg: '#1a3a1a', ground: '#2d5a2d', wall: '#4a3a2a', enemy: '#3a8a3a', deco: '#5a8a3a' },
    { id: 2,  name: "Sandy Desert",    bg: '#3a3a1a', ground: '#5a4a2d', wall: '#6a5a3a', enemy: '#8a7a3a', deco: '#7a6a3a' },
    { id: 3,  name: "Dark Cave",       bg: '#0a0a0a', ground: '#1a1a2a', wall: '#2a2a3a', enemy: '#4a2a4a', deco: '#3a2a4a' },
    { id: 4,  name: "Frozen Tundra",   bg: '#1a2a3a', ground: '#2a4a5a', wall: '#4a6a7a', enemy: '#6a8a9a', deco: '#8aaa9a' },
    { id: 5,  name: "Volcanic Pass",   bg: '#2a1a0a', ground: '#3a2a1a', wall: '#5a3a1a', enemy: '#8a4a1a', deco: '#aa5a1a' },
    { id: 6,  name: "Ancient Ruins",   bg: '#1a1a2a', ground: '#3a3a4a', wall: '#5a4a3a', enemy: '#7a6a5a', deco: '#8a7a6a' },
    { id: 7,  name: "Haunted Grave",   bg: '#0a0a1a', ground: '#1a1a2a', wall: '#2a1a3a', enemy: '#5a3a6a', deco: '#6a4a8a' },
    { id: 8,  name: "Crystal Mines",   bg: '#0a1a1a', ground: '#1a3a3a', wall: '#2a5a5a', enemy: '#4a8a8a', deco: '#6acaca' },
    { id: 9,  name: "Storm Peaks",     bg: '#1a1a2a', ground: '#2a2a4a', wall: '#3a3a6a', enemy: '#5a5a8a', deco: '#7a7aaa' },
    { id: 10, name: "Abyssal Depths",  bg: '#000a1a', ground: '#001a2a', wall: '#0a2a4a', enemy: '#2a4a8a', deco: '#4a6aba' },
    { id: 11, name: "Sky Citadel",     bg: '#1a2a3a', ground: '#2a4a6a', wall: '#4a6a8a', enemy: '#6a8aaa', deco: '#8aaacc' },
    { id: 12, name: "Dragon's Lair",   bg: '#1a0a00', ground: '#3a1a00', wall: '#5a2a00', enemy: '#8a3a00', deco: '#cc5500' },
    { id: 13, name: "Shadow Realm",    bg: '#0a000a', ground: '#1a001a', wall: '#2a002a', enemy: '#5a005a', deco: '#8a008a' },
    { id: 14, name: "Celestial Gard",  bg: '#0a1a0a', ground: '#1a3a1a', wall: '#2a5a2a', enemy: '#4a8a4a', deco: '#6aba6a' },
    { id: 15, name: "Void Dimension",  bg: '#000000', ground: '#0a0a1a', wall: '#1a0a2a', enemy: '#3a0a5a', deco: '#5a0a8a' },
    { id: 16, name: "Final Frontier",  bg: '#0a0a14', ground: '#141428', wall: '#1e1e3c', enemy: '#282850', deco: '#3a3a6a' },
];

function makeRow(pattern) {
    if (typeof pattern === 'string') return pattern.split('').map(Number);
    return pattern;
}

const MAP_LAYOUTS = [
    // Stage 1 - Green Forest: dense woodland with winding paths
    [[],[],[],[], makeRow('0110000110000110'),
                   makeRow('0000000000000000'),
                   makeRow('1001001001001001'),
                   makeRow('0000000000000000'),
                   makeRow('0110011001100110'),
                   makeRow('0000000000000000'),
                   makeRow('1001001001001001'),
                   makeRow('0000000000000000'),
                   makeRow('0110000110000110'),
                   makeRow('0000000000000000')],
    // Stage 2 - Sandy Desert: pyramid patterns with open dunes
    [[],[],[],[], makeRow('0010001000100010'),
                   makeRow('0000000000000000'),
                   makeRow('0101010101010101'),
                   makeRow('0000000000000000'),
                   makeRow('1000100010001000'),
                   makeRow('0000000000000000'),
                   makeRow('0101010101010101'),
                   makeRow('0000000000000000'),
                   makeRow('0010001000100010'),
                   makeRow('0000000000000000')],
    // Stage 3 - Dark Cave: cavern maze with rooms
    [[],[],[],[], makeRow('1110111011101110'),
                   makeRow('0000000000000000'),
                   makeRow('1001100110011001'),
                   makeRow('0000000000000000'),
                   makeRow('1110111011101110'),
                   makeRow('0000000000000000'),
                   makeRow('1001100110011001'),
                   makeRow('0000000000000000'),
                   makeRow('1110111011101110'),
                   makeRow('0000000000000000')],
    // Stage 4 - Frozen Tundra: fortress blocks with narrow gaps
    [[],[],[],[], makeRow('0111011101110111'),
                   makeRow('0000000000000000'),
                   makeRow('1110111011101110'),
                   makeRow('0000000000000000'),
                   makeRow('0111011101110111'),
                   makeRow('0000000000000000'),
                   makeRow('1110111011101110'),
                   makeRow('0000000000000000'),
                   makeRow('0111011101110111'),
                   makeRow('0000000000000000')],
    // Stage 5 - Volcanic Pass: zigzag lava channels
    [[],[],[],[], makeRow('1000010000100001'),
                   makeRow('0000000000000000'),
                   makeRow('0110001111000110'),
                   makeRow('0000000000000000'),
                   makeRow('0001100001100000'),
                   makeRow('0000000000000000'),
                   makeRow('0110001111000110'),
                   makeRow('0000000000000000'),
                   makeRow('1000010000100001'),
                   makeRow('0000000000000000')],
    // Stage 6 - Ancient Ruins: column grid with corridors
    [[],[],[],[], makeRow('1010101010101010'),
                   makeRow('0000000000000000'),
                   makeRow('0101010101010101'),
                   makeRow('0000000000000000'),
                   makeRow('1010101010101010'),
                   makeRow('0000000000000000'),
                   makeRow('0101010101010101'),
                   makeRow('0000000000000000'),
                   makeRow('1010101010101010'),
                   makeRow('0000000000000000')],
    // Stage 7 - Haunted Grave: cross patterns
    [[],[],[],[], makeRow('1001000100010010'),
                   makeRow('0000000000000000'),
                   makeRow('0010111011101000'),
                   makeRow('0000000000000000'),
                   makeRow('1001000100010010'),
                   makeRow('0000000000000000'),
                   makeRow('0010111011101000'),
                   makeRow('0000000000000000'),
                   makeRow('1001000100010010'),
                   makeRow('0000000000000000')],
    // Stage 8 - Crystal Mines: diamond geometric formations
    [[],[],[],[], makeRow('1001011010010110'),
                   makeRow('0000000000000000'),
                   makeRow('0110011001100110'),
                   makeRow('0000000000000000'),
                   makeRow('1001011010010110'),
                   makeRow('0000000000000000'),
                   makeRow('0110011001100110'),
                   makeRow('0000000000000000'),
                   makeRow('1001011010010110'),
                   makeRow('0000000000000000')],
    // Stage 9 - Storm Peaks: lightning-shaped corridors
    [[],[],[],[], makeRow('0010001000100010'),
                   makeRow('0000000000000000'),
                   makeRow('1110101110111011'),
                   makeRow('0000000000000000'),
                   makeRow('0010001000100010'),
                   makeRow('0000000000000000'),
                   makeRow('1101110111011101'),
                   makeRow('0000000000000000'),
                   makeRow('0010001000100010'),
                   makeRow('0000000000000000')],
    // Stage 10 - Abyssal Depths: sunken pillar maze
    [[],[],[],[], makeRow('1010101010101010'),
                   makeRow('0001000100010001'),
                   makeRow('1010000000000101'),
                   makeRow('0000000000000000'),
                   makeRow('1011010010011011'),
                   makeRow('0000000000000000'),
                   makeRow('1010000000000101'),
                   makeRow('0001000100010001'),
                   makeRow('1010101010101010'),
                   makeRow('0000000000000000')],
    // Stage 11 - Sky Citadel: floating platform sections
    [[],[],[],[], makeRow('0010001000100100'),
                   makeRow('0000000000000000'),
                   makeRow('0001110000011100'),
                   makeRow('0000000000000000'),
                   makeRow('0100111001110010'),
                   makeRow('0000000000000000'),
                   makeRow('0011100000011100'),
                   makeRow('0000000000000000'),
                   makeRow('0100010001000100'),
                   makeRow('0000000000000000')],
    // Stage 12 - Dragon's Lair: winding lair passages
    [[],[],[],[], makeRow('0110011001100110'),
                   makeRow('0000000000000000'),
                   makeRow('1001100110011001'),
                   makeRow('0000000000000000'),
                   makeRow('0110011001100110'),
                   makeRow('0000000000000000'),
                   makeRow('1001100110011001'),
                   makeRow('0000000000000000'),
                   makeRow('0110011001100110'),
                   makeRow('0000000000000000')],
    // Stage 13 - Shadow Realm: dense dark labyrinth
    [[],[],[],[], makeRow('1110101110101110'),
                   makeRow('0000000000000000'),
                   makeRow('1011101011101011'),
                   makeRow('0000000000000000'),
                   makeRow('1110101110101110'),
                   makeRow('0000000000000000'),
                   makeRow('1011101011101011'),
                   makeRow('0000000000000000'),
                   makeRow('1110101110101110'),
                   makeRow('0000000000000000')],
    // Stage 14 - Celestial Garden: symmetric garden paths
    [[],[],[],[], makeRow('0101101001011010'),
                   makeRow('0000000000000000'),
                   makeRow('1010010110100101'),
                   makeRow('0000000000000000'),
                   makeRow('0101101001011010'),
                   makeRow('0000000000000000'),
                   makeRow('1010010110100101'),
                   makeRow('0000000000000000'),
                   makeRow('0101101001011010'),
                   makeRow('0000000000000000')],
    // Stage 15 - Void Dimension: chaotic sparse void
    [[],[],[],[], makeRow('1001001001001001'),
                   makeRow('0000000000000000'),
                   makeRow('0100100100100100'),
                   makeRow('0000000000000000'),
                   makeRow('0010010010010010'),
                   makeRow('0000000000000000'),
                   makeRow('0100100100100100'),
                   makeRow('0000000000000000'),
                   makeRow('1001001001001001'),
                   makeRow('0000000000000000')],
    // Stage 16 - Final Frontier: epic final arena
    [[],[],[],[], makeRow('1010010110100101'),
                   makeRow('0000000000000000'),
                   makeRow('0101101001011010'),
                   makeRow('0000000000000000'),
                   makeRow('1000010101000010'),
                   makeRow('0000000000000000'),
                   makeRow('0101101001011010'),
                   makeRow('0000000000000000'),
                   makeRow('1010010110100101'),
                   makeRow('0000000000000000')],
];

const DECORATION_MAPS = [
    // Stage 1 - bushes/flowers
    [[],[],[],[], makeRow('0020000000000000'),
                   makeRow('0000002000000002'),
                   makeRow('0002000002000000'),
                   makeRow('0000000000020000'),
                   makeRow('0000000200000000'),
                   makeRow('0020000000000200'),
                   makeRow('0000020000000000'),
                   makeRow('0000000002000000'),
                   makeRow('0002000000000002'),
                   makeRow('0000000000000000')],
    // Stage 2 - cacti/rocks
    [[],[],[],[], makeRow('0002000200020002'),
                   makeRow('0000000000000000'),
                   makeRow('0200000000000020'),
                   makeRow('0000000000000000'),
                   makeRow('0002000000002000'),
                   makeRow('0000200000020000'),
                   makeRow('0000000000000000'),
                   makeRow('0020000000000200'),
                   makeRow('0000000000000000'),
                   makeRow('0200020002000200')],
    // Stage 3 - stalactites
    [[],[],[],[], makeRow('2020202020202020'),
                   makeRow('0000000000000000'),
                   makeRow('2002000020000200'),
                   makeRow('0000000000000000'),
                   makeRow('2020020202020020'),
                   makeRow('0000000000000000'),
                   makeRow('2002000020000200'),
                   makeRow('0000000000000000'),
                   makeRow('2000020000200002'),
                   makeRow('0202020202020202')],
    // Stage 4 - snow piles
    [[],[],[],[], makeRow('0020002000200020'),
                   makeRow('0222002220222022'),
                   makeRow('0020000000200000'),
                   makeRow('0000000000000000'),
                   makeRow('0200200000200200'),
                   makeRow('0200200000200200'),
                   makeRow('0000000000000000'),
                   makeRow('0020000000200000'),
                   makeRow('0222002220222022'),
                   makeRow('0020002000200020')],
    // Stage 5 - embers
    [[],[],[],[], makeRow('0200020002000200'),
                   makeRow('0000000000000000'),
                   makeRow('2020000000000202'),
                   makeRow('0000000000000000'),
                   makeRow('0200002002000020'),
                   makeRow('0020000000000200'),
                   makeRow('0000000000000000'),
                   makeRow('2002000000002002'),
                   makeRow('0000000000000000'),
                   makeRow('0020002000200020')],
    // Stage 6 - rubble
    [[],[],[],[], makeRow('0202002020020202'),
                   makeRow('2000000000000002'),
                   makeRow('0000000000000000'),
                   makeRow('2000000000000002'),
                   makeRow('0200002222000020'),
                   makeRow('0020000000000400'),
                   makeRow('0000000000000000'),
                   makeRow('0200000000000020'),
                   makeRow('2002000000002002'),
                   makeRow('0020202002020020')],
    // Stage 7 - grave markers
    [[],[],[],[], makeRow('0020002000200020'),
                   makeRow('0000000000000000'),
                   makeRow('2002000200020020'),
                   makeRow('0000000000000000'),
                   makeRow('0020000000000200'),
                   makeRow('0200000000000020'),
                   makeRow('0000000000000000'),
                   makeRow('2002000200020020'),
                   makeRow('0000000000000000'),
                   makeRow('0020002000200020')],
    // Stage 8 - crystal shards
    [[],[],[],[], makeRow('2002020020200202'),
                   makeRow('0000000000000000'),
                   makeRow('0020000000000200'),
                   makeRow('0200000000000020'),
                   makeRow('0000022220000000'),
                   makeRow('0000022220000000'),
                   makeRow('0200000000000020'),
                   makeRow('0020000000000200'),
                   makeRow('0000000000000000'),
                   makeRow('2002020020200202')],
    // Stage 9 - lightning sparks
    [[],[],[],[], makeRow('0020002000200020'),
                   makeRow('0000000000000000'),
                   makeRow('2220202220222022'),
                   makeRow('0000000000000000'),
                   makeRow('0020002000200020'),
                   makeRow('0000000000000000'),
                   makeRow('2202220222022202'),
                   makeRow('0000000000000000'),
                   makeRow('0020002000200020'),
                   makeRow('0000000000000000')],
    // Stage 10 - deep sea kelp
    [[],[],[],[], makeRow('2020202020202020'),
                   makeRow('0002000200020002'),
                   makeRow('2020000000000202'),
                   makeRow('0000000000000000'),
                   makeRow('2022020020022022'),
                   makeRow('0000000000000000'),
                   makeRow('2020000000000202'),
                   makeRow('0002000200020002'),
                   makeRow('2020202020202020'),
                   makeRow('0000000000000000')],
    // Stage 11 - cloud wisps
    [[],[],[],[], makeRow('0020002000200200'),
                   makeRow('0000000000000000'),
                   makeRow('0002220000022200'),
                   makeRow('0000000000000000'),
                   makeRow('0200222002220020'),
                   makeRow('0000000000000000'),
                   makeRow('0022200000022200'),
                   makeRow('0000000000000000'),
                   makeRow('0200020002000200'),
                   makeRow('0000000000000000')],
    // Stage 12 - dragon embers
    [[],[],[],[], makeRow('0220022002200220'),
                   makeRow('0000000000000000'),
                   makeRow('2002200220022002'),
                   makeRow('0000000000000000'),
                   makeRow('0220022002200220'),
                   makeRow('0000000000000000'),
                   makeRow('2002200220022002'),
                   makeRow('0000000000000000'),
                   makeRow('0220022002200220'),
                   makeRow('0000000000000000')],
    // Stage 13 - shadow wisps
    [[],[],[],[], makeRow('2220202220202220'),
                   makeRow('0000000000000000'),
                   makeRow('2022202022202022'),
                   makeRow('0000000000000000'),
                   makeRow('2220202220202220'),
                   makeRow('0000000000000000'),
                   makeRow('2022202022202022'),
                   makeRow('0000000000000000'),
                   makeRow('2220202220202220'),
                   makeRow('0000000000000000')],
    // Stage 14 - celestial flowers
    [[],[],[],[], makeRow('0202202002022020'),
                   makeRow('0000000000000000'),
                   makeRow('2020020220200202'),
                   makeRow('0000000000000000'),
                   makeRow('0202202002022020'),
                   makeRow('0000000000000000'),
                   makeRow('2020020220200202'),
                   makeRow('0000000000000000'),
                   makeRow('0202202002022020'),
                   makeRow('0000000000000000')],
    // Stage 15 - void particles
    [[],[],[],[], makeRow('2002002002002002'),
                   makeRow('0000000000000000'),
                   makeRow('0200200200200200'),
                   makeRow('0000000000000000'),
                   makeRow('0020020020020020'),
                   makeRow('0000000000000000'),
                   makeRow('0200200200200200'),
                   makeRow('0000000000000000'),
                   makeRow('2002002002002002'),
                   makeRow('0000000000000000')],
    // Stage 16 - final stars
    [[],[],[],[], makeRow('2020020220200202'),
                   makeRow('0000000000000000'),
                   makeRow('0202202002022020'),
                   makeRow('0000000000000000'),
                   makeRow('2000020202000020'),
                   makeRow('0000000000000000'),
                   makeRow('0202202002022020'),
                   makeRow('0000000000000000'),
                   makeRow('2020020220200202'),
                   makeRow('0000000000000000')],
];

function getMap(stageIndex) {
    if (stageIndex < MAP_LAYOUTS.length) {
        return MAP_LAYOUTS[stageIndex].slice(4);
    }
    return generateMap(stageIndex);
}

function getDecorations(stageIndex) {
    if (stageIndex < DECORATION_MAPS.length) {
        return DECORATION_MAPS[stageIndex].slice(4);
    }
    return generateDecorations(stageIndex);
}

function generateDecorations(stageIndex) {
    const map = [];
    for (let y = 0; y < 10; y++) {
        const row = [];
        for (let x = 0; x < 16; x++) {
            row.push(Math.random() < 0.08 ? 1 : 0);
        }
        map.push(row);
    }
    return map;
}

function generateMap(stageIndex) {
    const map = [];
    const density = 0.08 + stageIndex * 0.01;
    for (let y = 0; y < 10; y++) {
        const row = [];
        for (let x = 0; x < 16; x++) {
            row.push(0);
        }
        map.push(row);
    }
    for (let y = 1; y < 9; y++) {
        for (let x = 1; x < 15; x++) {
            if (Math.random() < density && !map[y][x]) {
                map[y][x] = 1;
                if (Math.random() < 0.3 && x < 14 && !map[y][x + 1]) {
                    map[y][x + 1] = 1;
                }
                if (Math.random() < 0.2 && y < 8 && !map[y + 1][x]) {
                    map[y + 1][x] = 1;
                }
            }
        }
    }
    if (map[5][7] === 1) map[5][7] = 0;
    for (let wy = 7; wy <= 9; wy++) {
        for (let wx = 6; wx <= 9; wx++) {
            if (wy < 10 && wx < 16 && map[wy][wx] === 1) map[wy][wx] = 0;
        }
    }
    return map;
}

function getStageColors(stageId) {
    return STAGES[stageId - 1] || STAGES[0];
}
