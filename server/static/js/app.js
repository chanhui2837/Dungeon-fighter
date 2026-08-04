const api = new GameAPI();
let currentScreen = 'login';
let previewHat = null, previewClothes = null, previewHatColor = null, previewClothesColor = null;
let currentTab = 'hats';
let gameInstance = null, gameAnimId = null;
let roomCode = null;
let isHostInRoom = false;

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen-' + id);
    if (el) el.classList.add('active');
    currentScreen = id;
    if (id === 'settings') populateLanguageSelect();
    if (id !== 'multi' && _roomRefreshTimer) { clearInterval(_roomRefreshTimer); _roomRefreshTimer = null; }
}

function log(msg) {
    console.log('[DF]', msg);
}

document.addEventListener('DOMContentLoaded', () => {
    log('DOM ready');
    try {
        LANG.init();
        setupLogin();
        setupMain();
        setupStageSelect();
        setupAvatar();
        setupSettings();
        setupMulti();
        setupLobby();
        setupInventory();
        setupStore();
        applyLanguageLabels();
        setupGame();
        log('All setup complete');
    } catch (e) {
        console.error('Setup error:', e);
        document.body.innerHTML = `<div style="color:red;padding:40px;font-size:20px">
            <h1>Error</h1><pre>${e.message}\n${e.stack}</pre></div>`;
        return;
    }
    checkServer();
});

function checkServer() {
    fetch('/api/user', { credentials: 'same-origin' })
        .then(r => r.json())
        .then(data => {
            const status = document.getElementById('server-status');
            if (status) status.textContent = 'Server: Connected';
            if (!data.error) {
                api.userData = data;
                showScreen('main');
                updateMain();
                log('Session found, logged in as ' + data.username);
            }
        })
        .catch(() => {
            const status = document.getElementById('server-status');
            if (status) status.textContent = 'Server: Disconnected';
        });
}

/* ===== LOGIN ===== */
function setupLogin() {
    const u = document.getElementById('login-username');
    const p = document.getElementById('login-password');
    const e = document.getElementById('login-email');
    const msg = document.getElementById('login-message');
    const regEmailGroup = document.getElementById('reg-email-group');
    const regEmailMsg = document.getElementById('reg-email-message');
    if (!u || !p || !msg) { log('Login elements missing!'); return; }

    const loginBtn = document.getElementById('btn-login');
    const regBtn = document.getElementById('btn-register');
    const toggleBtn = document.getElementById('login-toggle-pw');
    const findBtn = document.getElementById('btn-find-account');
    const findPanel = document.getElementById('find-account-panel');

    if (loginBtn) loginBtn.onclick = async () => {
        log('Login clicked');
        if (regEmailGroup) regEmailGroup.classList.add('hidden');
        if (regEmailMsg) regEmailMsg.classList.add('hidden');
        const r = await api.login(u.value, p.value);
        if (r.ok) { showScreen('main'); updateMain(); }
        else { msg.textContent = r.data.error || 'Login failed'; msg.style.color = '#ff4444'; }
    };

    if (regBtn) regBtn.onclick = () => {
        if (p.value.length < 4) {
            msg.textContent = LANG.t('password_too_short');
            msg.style.color = '#ff4444';
            return;
        }
        if (regEmailGroup && regEmailGroup.classList.contains('hidden')) {
            regEmailGroup.classList.remove('hidden');
            const countryGroup = document.getElementById('reg-country-group');
            if (countryGroup) countryGroup.classList.remove('hidden');
            populateCountrySelect();
            if (regEmailMsg) { regEmailMsg.classList.remove('hidden'); regEmailMsg.textContent = LANG.t('register_email_prompt'); regEmailMsg.style.color = '#ffd700'; }
            if (e) e.value = '';
            return;
        }
        doRegister();
    };

    async function doRegister() {
        const emailVal = e ? e.value.trim() : '';
        if (!emailVal) {
            if (regEmailMsg) { regEmailMsg.textContent = LANG.t('enter_email'); regEmailMsg.style.color = '#ff4444'; }
            return;
        }
        const countryEl = document.getElementById('reg-country-select');
        const country = countryEl ? countryEl.value : '';
        const autoLang = country ? LANG.getCountryLang(country) : null;
        const lang = autoLang || LANG.detectBrowserLang();
        const r = await api.register(u.value, p.value, emailVal, country, lang);
        if (r.ok) {
            if (regEmailGroup) regEmailGroup.classList.add('hidden');
            const countryGroup = document.getElementById('reg-country-group');
            if (countryGroup) countryGroup.classList.add('hidden');
            if (regEmailMsg) regEmailMsg.classList.add('hidden');
            if (lang) LANG.setLanguage(lang);
            showScreen('main'); updateMain(); applyLanguageLabels();
        }
        else {
            if (regEmailMsg) { regEmailMsg.textContent = r.data.error || LANG.t('register_failed'); regEmailMsg.style.color = '#ff4444'; }
        }
    }

    if (toggleBtn) toggleBtn.onclick = () => {
        if (p.type === 'password') { p.type = 'text'; toggleBtn.textContent = 'Hide'; }
        else { p.type = 'password'; toggleBtn.textContent = 'Show'; }
    };

    if (findBtn) findBtn.onclick = () => {
        document.querySelector('#screen-login > .login-box').classList.add('hidden');
        findPanel.classList.remove('hidden');
        document.getElementById('find-step-email').classList.remove('hidden');
        document.getElementById('find-step-code').classList.add('hidden');
        document.getElementById('find-result').classList.add('hidden');
        document.getElementById('find-message').textContent = '';
        document.getElementById('btn-find-submit').textContent = 'Send Code';
    };

    let findCurrentEmail = '';
    document.getElementById('btn-find-submit').onclick = async () => {
        const findEmail = document.getElementById('find-email');
        const findMsg = document.getElementById('find-message');
        const stepEmail = document.getElementById('find-step-email');
        const stepCode = document.getElementById('find-step-code');
        const findCode = document.getElementById('find-code');
        const findResult = document.getElementById('find-result');
        const submitBtn = document.getElementById('btn-find-submit');

        if (submitBtn.textContent === 'Send Code') {
            const email = findEmail.value.trim();
            if (!email) { findMsg.textContent = 'Enter your email'; findMsg.style.color = '#ff4444'; return; }
            const r = await api.findAccount(email);
            if (r.ok) {
                findCurrentEmail = email;
                findMsg.textContent = r.data.message;
                findMsg.style.color = '#4ade80';
                stepEmail.classList.add('hidden');
                stepCode.classList.remove('hidden');
                submitBtn.textContent = 'Verify Code';
            } else {
                findMsg.textContent = r.data.error || 'No account found';
                findMsg.style.color = '#ff4444';
            }
        } else {
            const code = findCode.value.trim();
            if (!code) { findMsg.textContent = 'Enter verification code'; findMsg.style.color = '#ff4444'; return; }
            const r = await api.verifyFindAccount(findCurrentEmail, code);
            if (r.ok) {
                findMsg.textContent = '';
                findResult.textContent = 'Account: ' + r.data.username + ' | New Password: ' + r.data.new_password;
                findResult.style.color = '#4ade80';
                findResult.classList.remove('hidden');
                stepCode.classList.add('hidden');
                submitBtn.classList.add('hidden');
            } else {
                findMsg.textContent = r.data.error || 'Invalid code';
                findMsg.style.color = '#ff4444';
            }
        }
    };

    document.getElementById('btn-find-back').onclick = () => {
        document.querySelector('#screen-login > .login-box').classList.remove('hidden');
        findPanel.classList.add('hidden');
        findCurrentEmail = '';
    };

    [u, p].forEach(f => f.addEventListener('keydown', ev => {
        if (ev.key === 'Enter' && loginBtn) loginBtn.click();
    }));
}

/* ===== MAIN MENU ===== */
function setupMain() {
    const btnSingle = document.getElementById('btn-game-start');
    const btnMulti = document.getElementById('btn-multi');
    const btnAvatar = document.getElementById('btn-avatar');
    const btnSettings = document.getElementById('btn-settings');
    const btnLogout = document.getElementById('btn-logout');

    if (btnSingle) btnSingle.onclick = () => {
        log('Single Play');
        showScreen('stage-select');
        renderStageGrid();
    };

    if (btnMulti) btnMulti.onclick = () => {
        log('Multi Play');
        showScreen('multi');
        refreshRooms();
        renderStageOptions();
    };

    if (btnAvatar) btnAvatar.onclick = () => {
        if (api.userData) {
            const c = api.userData.character || {};
            previewHat = c.hat; previewClothes = c.clothes;
            previewHatColor = c.hat_color; previewClothesColor = c.clothes_color;
        }
        showScreen('avatar');
        renderItemList();
        renderAvatarEdit();
    };

    if (btnSettings) btnSettings.onclick = () => {
        showScreen('settings');
        updateSettings();
    };

    if (btnLogout) btnLogout.onclick = async () => {
        stopGame();
        await api.logout();
        showScreen('login');
    };

    log('Main buttons setup: ' +
        ['btnSingle', 'btnMulti', 'btnAvatar', 'btnSettings', 'btnLogout']
        .map(n => n + '=' + !!eval(n)).join(', '));
}

function updateMain() {
    if (!api.userData) return;
    const d = api.userData;
    const setName = id => {
        const el = document.getElementById(id);
        if (el) return el;
        return null;
    };
    const setText = (id, text) => { const el = setName(id); if (el) el.textContent = text; };
    setText('player-name', d.username);
    setText('player-level', 'Lv.' + d.level);
    setText('player-exp', 'EXP: ' + d.exp + '/' + d.exp_to_next);
    setText('player-coins', 'Coins: ' + d.coins);

    const canvas = document.getElementById('avatar-canvas-main');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const c = d.character || {};
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawCharacter(ctx, 100, 200, 1.2, c.hat, c.clothes, c.hat_color, c.clothes_color);
    }
}

/* ===== STAGE SELECT ===== */
function setupStageSelect() {
    const back = document.getElementById('btn-stage-back');
    if (back) back.onclick = () => showScreen('main');
}

function renderStageGrid() {
    const grid = document.getElementById('stage-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const unlocked = api.userData ? api.userData.unlocked_stages : 1;
    STAGES.forEach(s => {
        const card = document.createElement('div');
        card.className = 'stage-card' + (s.id > unlocked ? ' locked' : '');
        card.style.background = s.bg;
        if (s.id <= unlocked) card.style.borderColor = s.enemy;
        card.innerHTML = `
            <div class="s-num">Stage ${s.id}</div>
            <div class="s-name">${s.name}</div>
            ${s.id <= unlocked
                ? '<div class="s-best">Best: Wave ' + (api.userData ? api.userData.highest_wave || 0 : 0) + '</div>'
                : '<div class="s-best">Locked</div>'}
        `;
        if (s.id <= unlocked) {
            card.onclick = () => {
                log('Starting Stage ' + s.id);
                startGame(s.id);
            };
        }
        grid.appendChild(card);
    });
}

/* ===== GAME ENGINE ===== */
function setupGame() {
    const canvas = document.getElementById('game-canvas');
    const pauseBtn = document.getElementById('btn-game-pause');
    const quitBtn = document.getElementById('btn-game-quit');

    if (pauseBtn) pauseBtn.onclick = () => {
        if (gameInstance) {
            gameInstance.paused = !gameInstance.paused;
            pauseBtn.textContent = gameInstance.paused ? 'Resume' : 'Pause';
        }
    };

    if (quitBtn) quitBtn.onclick = () => {
        stopGame();
        showScreen('main');
    };

    if (canvas) {
        canvas.addEventListener('mousedown', e => {
            if (!gameInstance) return;
            const rect = canvas.getBoundingClientRect();
            const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
            const my = (e.clientY - rect.top) * (canvas.height / rect.height);
            gameInstance.mouseX = mx;
            gameInstance.mouseY = my;
            gameInstance.mouseHeld = true;
            if (gameInstance.stageComplete || gameInstance.gameOver) {
                handleGameEnd();
                return;
            }
            gameInstance.handleClick(mx, my);
        });
        canvas.addEventListener('mousemove', e => {
            if (!gameInstance) return;
            const rect = canvas.getBoundingClientRect();
            gameInstance.mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
            gameInstance.mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
        });
        document.addEventListener('mouseup', () => {
            if (gameInstance) gameInstance.mouseHeld = false;
        });
        canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            if (!gameInstance) return;
            const rect = canvas.getBoundingClientRect();
            const t = e.touches[0];
            const mx = (t.clientX - rect.left) * (canvas.width / rect.width);
            const my = (t.clientY - rect.top) * (canvas.height / rect.height);
            gameInstance.mouseX = mx;
            gameInstance.mouseY = my;
            gameInstance.mouseHeld = true;
            if (gameInstance.stageComplete || gameInstance.gameOver) {
                handleGameEnd();
                return;
            }
            gameInstance.handleClick(mx, my);
        }, {passive: false});
        canvas.addEventListener('touchmove', e => {
            e.preventDefault();
            if (!gameInstance) return;
            const rect = canvas.getBoundingClientRect();
            const t = e.touches[0];
            gameInstance.mouseX = (t.clientX - rect.left) * (canvas.width / rect.width);
            gameInstance.mouseY = (t.clientY - rect.top) * (canvas.height / rect.height);
        }, {passive: false});
        canvas.addEventListener('touchend', e => {
            e.preventDefault();
            if (gameInstance) gameInstance.mouseHeld = false;
        }, {passive: false});
    }

    document.addEventListener('keydown', e => {
        if (gameInstance && gameInstance.player && gameInstance.player.keys) {
            try { gameInstance.player.keys[e.key.toLowerCase()] = true; } catch(ex) {}
        }
    });
    document.addEventListener('keyup', e => {
        if (gameInstance && gameInstance.player && gameInstance.player.keys) {
            try { gameInstance.player.keys[e.key.toLowerCase()] = false; } catch(ex) {}
        }
    });

    setupMobileControls();
}

function setupMobileControls() {
    const joy = document.getElementById('mobile-joystick');
    const knob = document.getElementById('mobile-joystick-knob');
    const atkBtn = document.getElementById('mobile-attack-btn');
    const skillBtn = document.getElementById('mobile-skill-btn');
    if (!joy || !knob || !atkBtn) return;

    let joyActive = false, joyCenterX = 0, joyCenterY = 0, joyRadius = 50;
    let joyDX = 0, joyDY = 0;

    joy.addEventListener('touchstart', e => {
        e.preventDefault();
        if (!gameInstance || !gameInstance.player) return;
        const t = e.touches[0];
        const r = joy.getBoundingClientRect();
        joyCenterX = r.left + r.width / 2;
        joyCenterY = r.top + r.height / 2;
        joyRadius = r.width / 2 - 18;
        joyActive = true;
        updateKnob(t.clientX, t.clientY);
    }, {passive: false});

    joy.addEventListener('touchmove', e => {
        e.preventDefault();
        if (!joyActive || !e.touches.length) return;
        updateKnob(e.touches[0].clientX, e.touches[0].clientY);
    }, {passive: false});

    joy.addEventListener('touchend', e => {
        e.preventDefault();
        joyActive = false;
        joyDX = 0; joyDY = 0;
        knob.style.transform = 'translate(0px, 0px)';
        updatePlayerKeys();
    }, {passive: false});

    function updateKnob(cx, cy) {
        let dx = cx - joyCenterX, dy = cy - joyCenterY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > joyRadius) { dx = dx / dist * joyRadius; dy = dy / dist * joyRadius; }
        knob.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
        const deadZone = 8;
        joyDX = Math.abs(dx) > deadZone ? dx / joyRadius : 0;
        joyDY = Math.abs(dy) > deadZone ? dy / joyRadius : 0;
        updatePlayerKeys();
    }

    function updatePlayerKeys() {
        if (!gameInstance || !gameInstance.player || !gameInstance.player.keys) return;
        const k = gameInstance.player.keys;
        k['w'] = joyDY < -0.3;
        k['arrowup'] = joyDY < -0.3;
        k['s'] = joyDY > 0.3;
        k['arrowdown'] = joyDY > 0.3;
        k['a'] = joyDX < -0.3;
        k['arrowleft'] = joyDX < -0.3;
        k['d'] = joyDX > 0.3;
        k['arrowright'] = joyDX > 0.3;
    }

    let atkHeld = false;
    atkBtn.addEventListener('touchstart', e => {
        e.preventDefault();
        atkHeld = true;
        if (!gameInstance) return;
        gameInstance.mouseHeld = true;
        if (gameInstance.player && gameInstance.player.keys) {
            gameInstance.player.keys[' '] = true;
        }
    }, {passive: false});
    atkBtn.addEventListener('touchend', e => {
        e.preventDefault();
        atkHeld = false;
        if (!gameInstance) return;
        gameInstance.mouseHeld = false;
        if (gameInstance.player && gameInstance.player.keys) {
            gameInstance.player.keys[' '] = false;
        }
    }, {passive: false});

    if (skillBtn) {
        let skillHeld = false;
        skillBtn.addEventListener('touchstart', e => {
            e.preventDefault();
            if (!gameInstance || !gameInstance.player) return;
            gameInstance.fireBombs();
        }, {passive: false});
    }
}

function startGame(stageId, playerCount) {
    showScreen('game');
    document.body.classList.add('playing');
    const items = api.userData ? (api.userData.items || {}) : {};
    if (api.userData && api.userData.equipped_items) {
        items._equipped = api.userData.equipped_items;
    }
    const character = api.userData ? api.userData.character || {} : {};
    const equippedPetDb = api.userData ? (api.userData.equipped_pet || null) : null;
    const equippedPets = equippedPetDb ? [equippedPetDb] : [];
    gameInstance = new Game(stageId, items, character, null, playerCount || 1, equippedPets);
    // Multiplayer: attach socket sync if roomCode is active
    if (roomCode && typeof syncGameWithRoom === 'function') {
        const isHost = isHostInRoom;
        console.log('[DF] startGame: roomCode=' + roomCode + ', isHost=' + isHost + ', playerCount=' + playerCount);
        syncGameWithRoom(gameInstance, roomCode, isHost);
    }
    const pauseBtn = document.getElementById('btn-game-pause');
    if (pauseBtn) pauseBtn.textContent = 'Pause';
    log('Game started: Stage ' + stageId + (playerCount > 1 ? ' (' + playerCount + 'P)' : ''));
    startAutoSave();
    if (gameAnimId) cancelAnimationFrame(gameAnimId);
    gameAnimId = requestAnimationFrame(gameLoop);
}

function gameLoop() {
    if (!gameInstance) return;
    try {
        gameInstance.update();

        // 🔥 Multiplayer: sync local player state out
        if (gameInstance.roomCode && typeof emitPlayerSync === 'function') {
            emitPlayerSync(gameInstance);
        }

        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            gameInstance.render(ctx);

            // 🔥 Multiplayer: render other players on top
            if (gameInstance.roomCode && typeof renderOtherPlayers === 'function') {
                renderOtherPlayers(ctx, gameInstance);
            }
        }
    } catch (e) {
        console.error('Game loop error:', e);
    }
    gameAnimId = requestAnimationFrame(gameLoop);
}

function handleGameEnd() {
    if (!gameInstance) return;
    const r = gameInstance.getResults();
    // 자동저장 타이머 정지
    if (window._autoSaveTimer) { clearInterval(window._autoSaveTimer); window._autoSaveTimer = null; }
    stopGame();
    // tokens 자리에 0이 하드코딩돼 있던 버그 수정 → r.tokens 사용
    api.completeStage(r.stage, r.wave, r.exp, r.tokens, r.coins, r.cleared).then(() => {
        api.getUser().then(() => updateMain());
    });
    const msg = 'Stage ' + r.stage + ' ' + (r.cleared ? 'CLEAR!' : 'Failed') +
        '\nWave: ' + r.wave + '\nEXP: ' + r.exp +
        '\nTokens: ' + r.tokens + '\nCoins: ' + r.coins +
        '\nKills: ' + r.kills;
    alert(msg);
    showScreen('main');
}

// 게임 중 15초마다 진행상황 자동저장 (Render 재시작 등 예기치 않은 종료 대비)
function startAutoSave() {
    if (window._autoSaveTimer) clearInterval(window._autoSaveTimer);
    window._autoSaveTimer = setInterval(() => {
        if (!gameInstance || gameInstance.gameOver || gameInstance.stageComplete) return;
        const r = gameInstance.getResults();
        // wave, exp, tokens, coins는 누적값이므로 게임 중간에도 저장
        api.completeStage(r.stage, r.wave, r.exp, r.tokens, r.coins, false)
            .then(() => api.getUser().then(() => updateMain()))
            .catch(() => {});
    }, 15000);
}

function stopGame() {
    document.body.classList.remove('playing');
    if (gameInstance && gameInstance.roomCode && socket && socket.connected) {
        socket.emit('leave_game', { code: gameInstance.roomCode });
    }
    if (window._autoSaveTimer) { clearInterval(window._autoSaveTimer); window._autoSaveTimer = null; }
    if (gameAnimId) { cancelAnimationFrame(gameAnimId); gameAnimId = null; }
    gameInstance = null;
}

/* ===== AVATAR ===== */
function setupAvatar() {
    document.querySelectorAll('.tab-bar .tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-bar .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.dataset.tab;
            renderItemList();
        };
    });
    const back = document.getElementById('btn-av-back');
    const save = document.getElementById('btn-av-save');
    if (back) back.onclick = () => { showScreen('main'); updateMain(); };
    if (save) save.onclick = async () => {
        const r = await api.updateUser({
            character: { hat: previewHat, clothes: previewClothes, hat_color: previewHatColor, clothes_color: previewClothesColor }
        });
        if (r.ok) { showScreen('main'); updateMain(); }
        else { alert('Save failed'); }
    };
}

function renderItemList() {
    const container = document.getElementById('item-list');
    if (!container) return;
    container.innerHTML = '';
    const unlockedHats = api.userData ? (api.userData.unlocked_hats || []) : [];
    const unlockedClothes = api.userData ? (api.userData.unlocked_clothes || []) : [];
    const unlocked = currentTab === 'hats' ? unlockedHats : unlockedClothes;
    (AVATAR_ITEMS[currentTab] || []).forEach(item => {
        if (item.id !== null && !unlocked.includes(item.id)) return; // only owned
        const div = document.createElement('div');
        div.className = 'item-entry';
        const sel = currentTab === 'hats' ? item.id === previewHat : item.id === previewClothes;
        if (sel) div.classList.add('selected');
        div.innerHTML = '<span class="item-name">' + item.name + '</span>' +
            (item.color ? '<div class="color-swatch" style="background:' + item.color + '"></div>' : '');
        div.onclick = () => {
            if (currentTab === 'hats') { previewHat = item.id; previewHatColor = item.color; }
            else { previewClothes = item.id; previewClothesColor = item.color; }
            renderItemList();
            renderAvatarEdit();
        };
        container.appendChild(div);
    });
}

function renderAvatarEdit() {
    const canvas = document.getElementById('avatar-canvas-edit');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCharacter(ctx, 125, 220, 1.4, previewHat, previewClothes, previewHatColor, previewClothesColor);
    let hn = 'None', cn = 'None';
    (AVATAR_ITEMS.hats || []).forEach(h => { if (h.id === previewHat) hn = h.name; });
    (AVATAR_ITEMS.clothes || []).forEach(c => { if (c.id === previewClothes) cn = c.name; });
    const cur = document.getElementById('current-items');
    if (cur) cur.innerHTML = 'Hat: ' + hn + '<br>Clothes: ' + cn;
    const stats = document.getElementById('player-stats');
    if (stats && api.userData) stats.textContent = 'Coins: ' + api.userData.coins + ' | Level: ' + api.userData.level;
}

/* ===== SETTINGS ===== */
function setupSettings() {
    const slider = document.getElementById('volume-slider');
    const label = document.getElementById('volume-label');

    // Language selector
    const langSelect = document.getElementById('settings-lang-select');
    const langSaveBtn = document.getElementById('btn-lang-save');
    const langMsg = document.getElementById('settings-lang-msg');
    populateLanguageSelect();
    if (langSaveBtn && langSelect) {
        langSaveBtn.onclick = () => {
            const lang = langSelect.value;
            LANG.setLanguage(lang);
            if (langMsg) { langMsg.textContent = 'Language saved!'; langMsg.style.color = '#4ade80'; }
            applyLanguageLabels();
            setTimeout(() => { if (langMsg) langMsg.textContent = ''; }, 2000);
        };
    }
    if (slider && label) {
        slider.oninput = () => {
            label.textContent = slider.value + '%';
            localStorage.setItem('music_volume', slider.value / 100);
        };
        const saved = localStorage.getItem('music_volume');
        if (saved) {
            slider.value = Math.round(parseFloat(saved) * 100);
            label.textContent = slider.value + '%';
        }
    }

    const emailInput = document.getElementById('settings-email-input');
    const emailDisplay = document.getElementById('settings-email-display');
    const emailSendBtn = document.getElementById('btn-email-send');
    const emailVerifyBtn = document.getElementById('btn-email-verify');
    const emailCodeRow = document.getElementById('email-code-row');
    const emailCodeInput = document.getElementById('settings-email-code');
    const emailMsg = document.getElementById('settings-email-msg');

    let pendingEmail = '';

    if (emailSendBtn && emailInput) emailSendBtn.onclick = async () => {
        const email = emailInput.value.trim();
        if (!email) {
            emailMsg.textContent = 'Enter an email address';
            emailMsg.style.color = '#ff4444';
            return;
        }
        const r = await api.sendVerification(email, true);
        if (r.ok) {
            pendingEmail = email;
            emailMsg.textContent = r.data.message || 'Code sent!';
            emailMsg.style.color = '#4ade80';
            emailCodeRow.classList.remove('hidden');
            emailSendBtn.classList.add('hidden');
            emailInput.disabled = true;
        } else {
            emailMsg.textContent = r.data.error || 'Failed to send code';
            emailMsg.style.color = '#ff4444';
        }
    };

    if (emailVerifyBtn && emailCodeInput) emailVerifyBtn.onclick = async () => {
        const code = emailCodeInput.value.trim();
        if (!code) {
            emailMsg.textContent = 'Enter verification code';
            emailMsg.style.color = '#ff4444';
            return;
        }
        const r = await api.verifyEmailLink(pendingEmail, code);
        if (r.ok) {
            api.userData = r.data;
            emailMsg.textContent = 'Email verified!';
            emailMsg.style.color = '#4ade80';
            emailCodeRow.classList.add('hidden');
            emailInput.disabled = false;
            emailSendBtn.classList.remove('hidden');
            emailCodeInput.value = '';
            pendingEmail = '';
            updateSettings();
            updateMain();
        } else {
            emailMsg.textContent = r.data.error || 'Invalid code';
            emailMsg.style.color = '#ff4444';
        }
    };

    const autoAimCheck = document.getElementById('auto-aim-check');
    if (autoAimCheck) {
        autoAimCheck.checked = localStorage.getItem('auto_aim') === 'true';
        autoAimCheck.onchange = () => {
            localStorage.setItem('auto_aim', autoAimCheck.checked);
        };
    }

    const back = document.getElementById('btn-settings-back');
    const logoutBtn = document.getElementById('btn-settings-logout');
    const deleteBtn = document.getElementById('btn-settings-delete');
    const delYes = document.getElementById('btn-delete-yes');
    const delNo = document.getElementById('btn-delete-no');

    if (back) back.onclick = () => { showScreen('main'); updateMain(); };
    if (logoutBtn) logoutBtn.onclick = async () => { await api.logout(); showScreen('login'); };
    if (deleteBtn) deleteBtn.onclick = () => {
        document.getElementById('delete-confirm').classList.remove('hidden');
    };
    if (delYes) delYes.onclick = async () => {
        const r = await api.deleteAccount();
        if (r.ok) { alert('Account deleted'); showScreen('login'); }
        else { alert(r.data.error || 'Delete failed'); }
        document.getElementById('delete-confirm').classList.add('hidden');
    };
    if (delNo) delNo.onclick = () => {
        document.getElementById('delete-confirm').classList.add('hidden');
    };
}

function updateSettings() {
    const el = document.getElementById('settings-user');
    if (el && api.userData) el.textContent = 'Logged in as: ' + api.userData.username;
    const emailDisplay = document.getElementById('settings-email-display');
    const emailInput = document.getElementById('settings-email-input');
    if (emailDisplay && api.userData) {
        emailDisplay.textContent = api.userData.email || 'No email set';
        emailDisplay.style.color = api.userData.email ? '#4ade80' : '#ff6b6b';
    }
    if (emailInput && api.userData) {
        emailInput.value = api.userData.email || '';
    }
    const emailMsg = document.getElementById('settings-email-msg');
    if (emailMsg) emailMsg.textContent = '';
}

/* ===== PETS ===== */
const PETS = [
    { id: 'dog', name: 'Dog', rarity: RARITY.RARE },
    { id: 'cat', name: 'Cat', rarity: RARITY.EPIC },
    { id: 'rabbit', name: 'Rabbit', rarity: RARITY.COMMON },
    { id: 'fox', name: 'Fox', rarity: RARITY.EPIC },
];

/* ===== INVENTORY ===== */
const COMBAT_ITEMS = [
    { id: 'gun',     name: 'Pistol',        rarity: RARITY.COMMON, desc: 'ATK +2/lv' },
    { id: 'armor',   name: 'Armor',         rarity: RARITY.COMMON, desc: 'DEF +1/lv' },
    { id: 'drink',   name: 'Energy Drink',  rarity: RARITY.RARE,   desc: 'Max HP +5/lv' },
    { id: 'bomb',    name: 'Grenade',       rarity: RARITY.COMMON, desc: 'Bomb DMG +3/lv' },
    { id: 'shotgun',   name: 'Shotgun',     rarity: RARITY.RARE,   desc: 'ATK +4/lv, pierce' },
    { id: 'sniper',  name: 'Sniper Rifle',  rarity: RARITY.EPIC,   desc: 'ATK +6/lv, slow atk' },
    { id: 'katana',  name: 'Katana',        rarity: RARITY.EPIC,   desc: 'ATK +5/lv, fast atk' },
    { id: 'shield',  name: 'Shield',        rarity: RARITY.RARE,   desc: 'DEF +3/lv, +SHD' },
    { id: 'boots',   name: 'Swift Boots',   rarity: RARITY.RARE,   desc: 'SPD +0.3/lv' },
    { id: 'vampire', name: 'Vampire Fang',  rarity: RARITY.LEGENDARY, desc: 'Lifesteal 2%/lv' },
    { id: 'regen',   name: 'Regen Ring',    rarity: RARITY.EPIC,   desc: 'HP Regen +1%/lv' },
    { id: 'fireball',name: 'Fireball Staff', rarity: RARITY.LEGENDARY, desc: 'ATK +8/lv, burn' },
    { id: 'iceblast',name: 'Ice Blast Orb', rarity: RARITY.LEGENDARY, desc: 'ATK +7/lv, slow' },
    { id: 'excalibur',name: 'Excalibur',    rarity: RARITY.MYTHIC,  desc: 'ATK +12/lv, divine' },
];

const RARITY_ORDER = { 'Common': 0, 'Rare': 1, 'Epic': 2, 'Legendary': 3, 'Mythic': 4, 'Transcend': 5 };

function setupInventory() {
    const backBtn = document.getElementById('btn-inventory-back');
    if (backBtn) backBtn.onclick = () => showScreen('main');

    const mainBtn = document.getElementById('btn-inventory');
    if (mainBtn) mainBtn.onclick = () => showInventoryScreen();

    document.querySelectorAll('.inv-tab').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.inv-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderInventory();
        };
    });

    const sortSelect = document.getElementById('inv-sort');
    if (sortSelect) sortSelect.onchange = () => renderInventory();

    const petSlotBtn = document.getElementById('btn-buy-pet-slot');
    if (petSlotBtn) petSlotBtn.onclick = async () => {
        const r = await api.request('POST', '/api/buy-pet-slot');
        if (r.ok) { api.userData = r.data; renderInventory(); }
        else { alert(r.data && r.data.error || 'Failed'); }
    };
}

let inventoryCategory = 'items';

async function showInventoryScreen() {
    showScreen('inventory');
    const r = await api.getUser();
    if (r.ok) api.userData = r.data;
    renderInventory();
}

function renderInventory() {
    const container = document.getElementById('inventory-content');
    if (!container) return;
    const activeTab = document.querySelector('.inv-tab.active');
    const cat = activeTab ? activeTab.dataset.cat : 'all';
    inventoryCategory = cat;
    const sort = document.getElementById('inv-sort');
    const sortMode = sort ? sort.value : 'grade';

    container.innerHTML = '';
    if (cat === 'abilities') {
        container.innerHTML = '<div class="inv-empty">Abilities — Coming soon in a future update!</div>';
        return;
    }
    if (cat === 'all' || cat === 'items') renderEquipmentItems(container, sortMode);
    if (cat === 'pet') renderInventoryPets(container, sortMode);
    if (cat === 'all') {
        const sep = document.createElement('div'); sep.style.width='100%'; sep.style.height='1px';
        sep.style.background='#444'; sep.style.margin='15px 0'; container.appendChild(sep);
        renderInventoryPets(container, sortMode);
    }
}

function renderEquipmentItems(container, sortMode) {
    const rawItems = api.userData ? (api.userData.items || {}) : {};
    const coins = api.userData ? api.userData.coins : 0;
    const equipped = api.userData ? (api.userData.equipped_items || []) : [];

    let list = COMBAT_ITEMS.filter(item => {
        const data = rawItems[item.id];
        return data && (data === true || data.unlocked);
    }).map(item => {
        const data = rawItems[item.id];
        const permLv = data && typeof data === 'object' ? (data.permLv || 0) : 0;
        const eq = equipped.includes(item.id);
        return { ...item, permLv, equipped: eq };
    });

    if (sortMode === 'grade') {
        list.sort((a, b) => (RARITY_ORDER[a.rarity] || 0) - (RARITY_ORDER[b.rarity] || 0));
    } else if (sortMode === 'name') {
        list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortMode === 'level') {
        list.sort((a, b) => b.permLv - a.permLv);
    }

    if (list.length === 0) {
        container.innerHTML += '<div class="inv-empty">No equipment owned. Buy in Store!</div>';
        return;
    }

    list.forEach(item => {
        const atMax = item.permLv >= 50;
        const nextCost = atMax ? 0 : (item.permLv + 1) * 30;
        const rColor = RARITY_COLORS[item.rarity] || '#888';

        const row = document.createElement('div');
        row.className = 'inv-row';

        const iconDiv = document.createElement('div');
        iconDiv.style.flexShrink = '0';
        const iconCanvas = document.createElement('canvas');
        iconCanvas.width = 48; iconCanvas.height = 48;
        iconCanvas.style.borderRadius = '4px';
        iconDiv.appendChild(iconCanvas);
        const ictx = iconCanvas.getContext('2d');
        if (typeof ITEM_ICONS !== 'undefined' && ITEM_ICONS.drawCombatIcon) {
            ITEM_ICONS.drawCombatIcon(ictx, item.id, 8, 8, 32);
        }

        const infoDiv = document.createElement('div');
        const nameSpan = document.createElement('div');
        nameSpan.className = 'inv-item-name';
        nameSpan.innerHTML = item.name + ' <span class="inv-rarity" style="color:' + rColor + '">' + item.rarity + '</span>';

        const lvSpan = document.createElement('div');
        lvSpan.className = 'inv-item-level';
        lvSpan.textContent = 'Lv.' + item.permLv + '/50' + (atMax ? ' MAX' : ' | Next: ' + nextCost + ' coins');

        infoDiv.appendChild(nameSpan);
        infoDiv.appendChild(lvSpan);
        row.appendChild(iconDiv);
        row.appendChild(infoDiv);

        const btnDiv = document.createElement('div');
        btnDiv.className = 'inv-btn-group';

        const eqBtn = document.createElement('button');
        eqBtn.className = item.equipped ? 'btn btn-green' : 'btn btn-gray';
        eqBtn.textContent = item.equipped ? 'Unequip' : 'Equip';
        eqBtn.style.cssText = 'padding:4px 10px;font-size:12px;min-width:auto;';
        eqBtn.onclick = async () => {
            const action = item.equipped ? 'remove' : 'add';
            const r = await api.request('POST', '/api/equip', { item_id: item.id, action });
            if (r.ok) { api.userData = r.data; renderInventory(); updateMain(); }
            else { alert(r.data && r.data.error || 'Failed'); }
        };
        btnDiv.appendChild(eqBtn);

        const spacer = document.createElement('span');
        spacer.style.width = '6px';
        btnDiv.appendChild(spacer);

        if (!atMax) {
            const upBtn = document.createElement('button');
            upBtn.className = 'btn btn-green';
            upBtn.textContent = coins >= nextCost ? '+' + (item.permLv + 1) : 'Need ' + nextCost + 'c';
            upBtn.disabled = coins < nextCost;
            upBtn.style.cssText = 'padding:4px 8px;font-size:11px;min-width:auto;';
            upBtn.onclick = async () => {
                const r = await api.permUpgrade(item.id);
                if (r.ok) { api.userData = r.data; renderInventory(); updateMain(); }
                else { alert(r.data && r.data.error || 'Failed'); }
            };
            btnDiv.appendChild(upBtn);
        }

        if (item.permLv > 0) {
            const refund = item.permLv * 15;
            const downBtn = document.createElement('button');
            downBtn.className = 'btn btn-gray';
            downBtn.style.cssText = 'padding:4px 8px;font-size:11px;min-width:auto;';
            downBtn.textContent = 'Refund(' + refund + ')';
            downBtn.onclick = async () => {
                if (!confirm('Refund ' + item.name + ' level ' + item.permLv + '? Get ' + refund + ' coins back.')) return;
                const r = await api.permDowngrade(item.id);
                if (r.ok) { api.userData = r.data; renderInventory(); updateMain(); }
                else { alert(r.data && r.data.error || 'Failed'); }
            };
            btnDiv.appendChild(downBtn);
        }

        row.appendChild(btnDiv);
        container.appendChild(row);
    });
}

function renderInventoryPets(container, sortMode) {
    const unlocked = api.userData ? (api.userData.unlocked_pets || []) : [];
    const equippedPet = api.userData ? (api.userData.equipped_pet || null) : null;
    const petSlots = api.userData ? (api.userData.pet_slots || 1) : 1;
    const coins = api.userData ? api.userData.coins : 0;

    let list = PETS.filter(p => unlocked.includes(p.id));
    if (sortMode === 'grade') {
        list.sort((a, b) => (RARITY_ORDER[a.rarity] || 0) - (RARITY_ORDER[b.rarity] || 0));
    } else if (sortMode === 'name') {
        list.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (list.length === 0) {
        container.innerHTML += '<div class="inv-empty">No pets owned. Buy them in the Store!</div>';
        return;
    }

    const slotInfo = document.createElement('div');
    slotInfo.className = 'inv-row';
    slotInfo.innerHTML = '<span>Pet Slot: ' + equippedPet + (equippedPet ? ' equipped' : ' (none)');
    list.forEach(pet => {
        const rColor = RARITY_COLORS[pet.rarity] || '#888';
        const card = document.createElement('div');
        card.className = 'inv-pet-card';
        card.style.cssText = 'display:flex;align-items:center;gap:15px;';

        const iconCanvas = document.createElement('canvas');
        iconCanvas.width = 48; iconCanvas.height = 48;
        iconCanvas.style.cssText = 'border-radius:4px;flex-shrink:0;';
        const ictx = iconCanvas.getContext('2d');
        if (typeof ITEM_ICONS !== 'undefined' && ITEM_ICONS.drawPetIcon) {
            ITEM_ICONS.drawPetIcon(ictx, pet.id, 0, 0);
        }

        const infoDiv = document.createElement('div');
        infoDiv.style.flex = '1';
        infoDiv.innerHTML = '<div class="inv-item-name">' + pet.name +
            ' <span class="inv-rarity" style="color:' + rColor + '">' + pet.rarity + '</span></div>';

        const eqBtn = document.createElement('button');
        eqBtn.className = equippedPet === pet.id ? 'btn btn-green' : 'btn btn-gray';
        eqBtn.textContent = equippedPet === pet.id ? 'Unequip' : 'Equip';
        eqBtn.style.cssText = 'padding:6px 14px;font-size:13px;flex-shrink:0;';
        eqBtn.onclick = async () => {
            const action = equippedPet === pet.id ? 'remove' : 'add';
            const r = await api.request('POST', '/api/equip-pet', { pet_id: pet.id, action });
            if (r.ok) { api.userData = r.data; renderInventory(); updateMain(); }
            else { alert(r.data && r.data.error || 'Failed'); }
        };

        card.appendChild(iconCanvas);
        card.appendChild(infoDiv);
        card.appendChild(eqBtn);
        container.appendChild(card);
    });

    if (petSlots < 2) {
        const slotBtn = document.createElement('div');
        slotBtn.innerHTML = '<button class="btn btn-gold" id="btn-buy-pet-slot" style="margin-top:10px;width:100%;">Buy Extra Pet Slot (5  Coin)</button>';
        container.appendChild(slotBtn);
        setTimeout(() => {
            const btn = document.getElementById('btn-buy-pet-slot');
            if (btn) btn.onclick = async () => {
                const r = await api.request('POST', '/api/buy-pet-slot');
                if (r.ok) { api.userData = r.data; renderInventory(); } else { alert(r.data && r.data.error || 'Failed'); }
            };
        }, 50);
    }
}

/* ===== MULTIPLAYER ===== */
function setupMulti() {
    const back = document.getElementById('btn-multi-back');
    if (back) back.onclick = () => showScreen('main');

    document.querySelectorAll('.multi-tab').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.multi-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.multi-panel').forEach(p => p.classList.remove('active'));
            document.getElementById('multi-' + btn.dataset.mode).classList.add('active');
        };
    });

    const secretToggle = document.getElementById('multi-secret-toggle');
    const secretRow = document.getElementById('multi-secret-row');
    if (secretToggle && secretRow) {
        secretToggle.onchange = () => {
            secretRow.classList.toggle('hidden', !secretToggle.checked);
        };
    }

    const createBtn = document.getElementById('btn-multi-create');
    const joinBtn = document.getElementById('btn-multi-join');

    if (createBtn) createBtn.onclick = async () => {
        const sel = document.getElementById('multi-stage-select');
        if (!sel) return;
        const stage = parseInt(sel.value);
        const maxPlayers = parseInt(document.getElementById('multi-max-players').value);
        const levelLimit = parseInt(document.getElementById('multi-level-limit').value);
        const secretCode = document.getElementById('multi-secret-toggle').checked
            ? (document.getElementById('multi-secret-code').value || null) : null;
        const r = await api.createRoom(stage, maxPlayers, levelLimit, secretCode);
        if (r.ok) { roomCode = r.data.code; isHostInRoom = true; enterLobby(); }
        else { alert(r.data.error); }
    };

if (joinBtn) joinBtn.onclick = async () => {
        const codeEl = document.getElementById('multi-room-code');
        if (!codeEl) return;
        const code = codeEl.value.toUpperCase();
        if (!code) { alert('Enter room code'); return; }
        const secret = prompt('Enter room password (if any):') || '';
        const r = await api.joinRoom(code, secret);
        if (r.ok) { roomCode = code; isHostInRoom = false; enterLobby(); }
        else { alert(r.data.error); }
    };
}

async function refreshRooms() {
    const r = await api.listRooms();
    if (!r.ok) return;
    const list = document.getElementById('room-list');
    if (!list) return;
    list.innerHTML = '';
    const rooms = (r.data || []).filter(room => room.status === 'waiting');
    if (rooms.length === 0) {
        list.innerHTML = '<p style="color:#666">No rooms available</p>';
        return;
    }
    rooms.forEach(room => {
        const div = document.createElement('div');
        div.className = 'room-entry';
        const levelInfo = room.level_limit > 0 ? ' Lv' + room.level_limit + '+' : 'No limit';
        const secretInfo = room.is_secret ? ' [Secret]' : '';
        div.innerHTML = '<span><b>' + room.code + '</b> Stage ' + room.stage +
            ' (' + room.players + '/' + room.max_players + ') ' + levelInfo + secretInfo + '</span>' +
            '<button class="btn btn-blue">Join</button>';
        div.querySelector('.btn').onclick = async () => {
            const secret = room.is_secret ? (prompt('Enter room password:') || '') : '';
            const res = await api.joinRoom(room.code, secret);
            if (res.ok) { roomCode = room.code; enterLobby(); }
            else if (res.data && res.data.error && res.data.error.includes('Already in room')) {
                roomCode = room.code; enterLobby();
            }
            else { alert(res.data.error); }
        };
        list.appendChild(div);
    });

    // Auto-refresh rooms every 3 seconds while on multi screen
    clearInterval(_roomRefreshTimer);
    _roomRefreshTimer = setInterval(() => {
        if (currentScreen === 'multi') refreshRooms();
    }, 3000);
}

let _roomRefreshTimer = null;

function renderStageOptions() {
    const sel = document.getElementById('multi-stage-select');
    if (!sel) return;
    sel.innerHTML = '';
    const unlocked = api.userData ? api.userData.unlocked_stages : 1;
    for (let i = 1; i <= unlocked; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = 'Stage ' + i + ' - ' + STAGES[i - 1].name;
        sel.appendChild(opt);
    }
}

/* ===== LOBBY ===== */
const username = () => api.userData ? api.userData.username : '';
function setupLobby() {
    const leaveBtn = document.getElementById('btn-lobby-leave');
    const startBtn = document.getElementById('btn-lobby-start');

    if (leaveBtn) leaveBtn.onclick = async () => {
        if (roomCode) await api.leaveRoom(roomCode);
        roomCode = null;
        isHostInRoom = false;
        showScreen('multi');
        refreshRooms();
    };

    if (startBtn) startBtn.onclick = async () => {
        if (roomCode) {
            // Notify via socket first
            if (typeof socket !== 'undefined' && socket && socket.connected) {
                socket.emit('game_start', { code: roomCode });
            }
            const r = await api.startRoom(roomCode);
            if (r.ok) {
                stopGame();
                startGame(r.data.stage || 1, r.data.players ? r.data.players.length : 1);
            } else {
                alert(r.data.error || 'Cannot start game');
            }
        }
    };
}

function enterLobby() {
    if (!roomCode) { showScreen('multi'); return; }
    showScreen('room-lobby');
    const info = document.getElementById('lobby-info');
    const playersDiv = document.getElementById('lobby-players');
    const startBtn = document.getElementById('btn-lobby-start');
    const autoNote = document.getElementById('lobby-auto-note');

    window._lobbyStarted = false;

    // 실시간 이벤트 수신 시 즉시 로비 업데이트 (주기적 폴링 외)
    const updateLobbyNow = () => {
        if (currentScreen !== 'room-lobby') return;
        if (window._lobbyStarted) return;
        api.getRoom(roomCode).then(r => {
            if (!r.ok || !r.data) return;
            renderLobbyData(r.data);
        }).catch(() => {});
    };

    // Init socket and listen for game started event
    if (typeof initSocket === 'function') {
        const s = initSocket();
        // join_game은 initSocket의 connect 핸들러와 syncGameWithRoom에서 이미 호출됨
        s.off('game_started');
        s.on('game_started', (data) => {
            if (window._lobbyStarted) return;
            window._lobbyStarted = true;
            stopGame();
            // game_started에 포함된 all_players 정보를 window에 전달
            window._dfAllPlayers = data.all_players || [];
            startGame(data.stage || 1, data.players || 2);
        });
        // 실시간 로비 업데이트를 위한 이벤트 리스너
        s.off('player_joined');
        s.on('player_joined', () => {
            if (currentScreen === 'room-lobby' && !window._lobbyStarted) updateLobbyNow();
        });
        s.off('player_left');
        s.on('player_left', () => {
            if (currentScreen === 'room-lobby' && !window._lobbyStarted) updateLobbyNow();
        });
        s.off('host_changed');
        s.on('host_changed', (data) => {
            isHostInRoom = (username() === data.host);
            if (currentScreen === 'room-lobby' && !window._lobbyStarted) updateLobbyNow();
        });
    }

    const updateLobby = async () => {
        if (currentScreen !== 'room-lobby') return;
        if (window._lobbyStarted) return;
        const r = await api.getRoom(roomCode);
        if (!r.ok || !r.data) { setTimeout(updateLobby, 2000); return; }

        renderLobbyData(r.data);
        setTimeout(updateLobby, 2000);
    };
    setTimeout(updateLobby, 500);
}

function renderLobbyData(room) {
    const info = document.getElementById('lobby-info');
    const playersDiv = document.getElementById('lobby-players');
    const startBtn = document.getElementById('btn-lobby-start');
    const autoNote = document.getElementById('lobby-auto-note');

    const levelInfo = room.level_limit > 0 ? ' Min Lv' + room.level_limit + '+' : 'No level limit';
    if (info) info.textContent = 'Room: ' + roomCode + ' | Stage ' + room.stage +
        ' | ' + room.players.length + '/' + room.max_players + ' players' +
        ' | ' + levelInfo +
        (room.secret_code ? ' | [Secret Room]' : '');

    if (playersDiv) {
        playersDiv.innerHTML = '<h3>Players (' + room.players.length + '/' + room.max_players + '):</h3>';
        (room.players || []).forEach(p => {
            const div = document.createElement('div');
            div.className = 'lobby-player';
            const isHost = p.username === room.host;
            div.textContent = p.username + (isHost ? ' (Host)' : '');
            playersDiv.appendChild(div);
        });
    }

    const myName = username();
    const isHost = myName === room.host;
    isHostInRoom = isHost;

    // 🔥 Detect if game has started (by host)
    if (room.status === 'playing') {
        if (window._lobbyStarted) return;
        window._lobbyStarted = true;
        stopGame();
        startGame(room.stage || 1, (room.players || []).length);
        return;
    }

    if (startBtn) startBtn.style.display = isHost ? 'inline-block' : 'none';

    if (autoNote) {
        autoNote.textContent = room.players.length >= room.max_players
            ? 'Room is full! Host can start the game.' : '';
    }
}

/* ===== STORE ===== */
const STORE_RARITIES = [
    { key: 'Common', label: 'Common' },
    { key: 'Rare', label: 'Rare' },
    { key: 'Epic', label: 'Epic' },
    { key: 'Legendary', label: 'Legendary' },
    { key: 'Mythic', label: 'Mythic' },
    { key: 'Transcend', label: 'Transcend' },
];

function setupStore() {
    const backBtn = document.getElementById('btn-store-back');
    if (backBtn) backBtn.onclick = () => showScreen('main');

    const mainBtn = document.getElementById('btn-store');
    if (mainBtn) mainBtn.onclick = async () => {
        const r = await api.getUser();
        if (r.ok) api.userData = r.data;
        showScreen('store');
        renderStoreGrid('combat');
    };

    document.querySelectorAll('.store-tab').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.store-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderStoreGrid(btn.dataset.cat);
        };
    });
}

function renderStoreGrid(category) {
    const grid = document.getElementById('store-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const coins = api.userData ? api.userData.coins : 0;
    const items = api.userData ? (api.userData.items || {}) : {};
    const unlockedHats = api.userData ? (api.userData.unlocked_hats || []) : [];
    const unlockedClothes = api.userData ? (api.userData.unlocked_clothes || []) : [];

    let list = [];
    if (category === 'combat') {
        list = COMBAT_ITEMS.map(i => ({
            id: i.id, name: i.name, rarity: i.rarity,
            owned: items[i.id] && (items[i.id] === true || items[i.id].unlocked)
        }));
    } else if (category === 'costume') {
        list = [];
        AVATAR_ITEMS.hats.forEach(h => {
            if (h.id === null) return;
            list.push({ id: h.id, name: h.name + ' (Hat)', rarity: h.rarity, owned: unlockedHats.includes(h.id), type: 'hat' });
        });
        AVATAR_ITEMS.clothes.forEach(c => {
            if (c.id === null) return;
            list.push({ id: c.id, name: c.name, rarity: c.rarity, owned: unlockedClothes.includes(c.id), type: 'clothes' });
        });
    } else if (category === 'pet') {
        const unlockedPets = api.userData ? (api.userData.unlocked_pets || []) : [];
        list = PETS.map(p => ({
            id: p.id, name: p.name, rarity: p.rarity,
            owned: unlockedPets.includes(p.id)
        }));
    } else {
        grid.innerHTML = '<p class="store-empty">Coming soon!</p>';
        return;
    }

    if (list.length === 0) {
        grid.innerHTML = '<p class="store-empty">No items available.</p>';
        return;
    }

    list.forEach(item => {
        const price = RARITY_PRICES[item.rarity] || 0;
        const rColor = RARITY_COLORS[item.rarity] || '#888';
        const card = document.createElement('div');
        card.className = 'store-card' + (item.owned ? ' owned' : '');

        const iconCanvas = document.createElement('canvas');
        iconCanvas.width = 56; iconCanvas.height = 56;
        iconCanvas.style.cssText = 'border-radius:6px;background:#1a1a2e;';
        const ictx = iconCanvas.getContext('2d');
        if (category === 'combat' && typeof ITEM_ICONS !== 'undefined' && ITEM_ICONS.drawCombatIcon) {
            ITEM_ICONS.drawCombatIcon(ictx, item.id, 12, 12, 32);
        } else if (category === 'pet' && typeof ITEM_ICONS !== 'undefined' && ITEM_ICONS.drawPetIcon) {
            ITEM_ICONS.drawPetIcon(ictx, item.id, 12, 12);
        } else if (category === 'costume' && typeof ITEM_ICONS !== 'undefined' && ITEM_ICONS.drawCostumeIcon) {
            ITEM_ICONS.drawCostumeIcon(ictx, item.id, item.type || 'hat', 12, 12);
        } else {
            const labelCtx = iconCanvas.getContext('2d');
            labelCtx.fillStyle = rColor; labelCtx.font = 'bold 28px monospace'; labelCtx.textAlign = 'center';
            labelCtx.fillText(item.name[0] || '?', 28, 36);
        }

        const infoDiv = document.createElement('div');
        infoDiv.className = 'store-card-name';
        infoDiv.innerHTML = '<div class="store-card-name">' + item.name + '</div>' +
            '<div class="store-card-rarity" style="color:' + rColor + '">' + item.rarity + '</div>' +
            (item.owned ? '<div class="store-card-owned">Owned</div>' :
                '<div class="store-card-price">' + price + ' coins</div>');

        card.appendChild(iconCanvas);
        card.appendChild(infoDiv);
        if (!item.owned) {
            const buyBtn = document.createElement('button');
            buyBtn.className = 'btn ' + (coins >= price ? 'btn-gold' : 'btn-gray');
            buyBtn.textContent = coins >= price ? 'Buy' : 'Need ' + price + 'c';
            buyBtn.disabled = coins < price;
            buyBtn.onclick = async () => {
                const buyCategory = category === 'combat' ? 'combat' : category === 'pet' ? 'pet' : 'costume';
                const r = await api.storeBuy(buyCategory, item.id);
                if (r.ok) { api.userData = r.data; renderStoreGrid(category); updateMain(); }
                else { alert(r.data && r.data.error || 'Purchase failed'); }
            };
            card.appendChild(buyBtn);
        }
        grid.appendChild(card);
    });
}

/* ===== LANGUAGE / I18N ===== */
function populateCountrySelect() {
    const sel = document.getElementById('reg-country-select');
    if (!sel) return;
    sel.innerHTML = '';
    LANG.getCountryList().forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.code;
        opt.textContent = c.name;
        sel.appendChild(opt);
    });
    sel.value = '';
}

function populateLanguageSelect() {
    const sel = document.getElementById('settings-lang-select');
    if (!sel) return;
    sel.innerHTML = '';
    LANG.getLanguages().forEach(l => {
        const opt = document.createElement('option');
        opt.value = l.code;
        opt.textContent = l.name;
        if (l.code === currentLanguage) opt.selected = true;
        sel.appendChild(opt);
    });
}

function applyLanguageLabels() {
    const _ = LANG.t.bind(LANG);

    const idMap = {
        'btn-login': 'login', 'btn-register': 'register',
        'login-toggle-pw': 'show_password',
        'reg-email-label': 'email_for_recovery',
        'reg-country-label': 'country',
        'btn-find-account': 'find_account',
        'btn-find-back': 'back_to_login',
        'btn-find-submit': 'send_code',
        'btn-game-start': 'single_play', 'btn-multi': 'multi_play',
        'btn-avatar': 'avatar', 'btn-inventory': 'inventory',
        'btn-settings': 'settings', 'btn-logout': 'logout',
        'btn-game-pause': 'pause',
        'btn-av-back': 'back', 'btn-av-save': 'save',
        'btn-multi-create': 'create_room', 'btn-multi-join': 'join_room',
        'btn-multi-back': 'back', 'btn-stage-back': 'back',
        'btn-inventory-back': 'back', 'btn-store-back': 'back',
        'btn-settings-back': 'back', 'btn-settings-logout': 'logout',
        'btn-settings-delete': 'delete_account',
        'btn-delete-yes': 'delete_yes', 'btn-delete-no': 'delete_no',
        'btn-lobby-leave': 'leave', 'btn-lobby-start': 'start_game',
        'btn-lang-save': 'save_language',
    };

    for (const [id, key] of Object.entries(idMap)) {
        const el = document.getElementById(id);
        if (el) el.textContent = LANG.t(key);
    }

    // Tab buttons
    document.querySelectorAll('.tab-btn[data-tab="hats"]').forEach(b => b.textContent = LANG.t('hats'));
    document.querySelectorAll('.tab-btn[data-tab="clothes"]').forEach(b => b.textContent = LANG.t('clothes'));
    document.querySelectorAll('.store-tab[data-cat="combat"]').forEach(b => b.textContent = LANG.t('combat'));
    document.querySelectorAll('.store-tab[data-cat="costume"]').forEach(b => b.textContent = LANG.t('costume'));
    document.querySelectorAll('.store-tab[data-cat="pet"]').forEach(b => b.textContent = LANG.t('pet'));
    document.querySelectorAll('.inv-tab[data-cat="all"]').forEach(b => b.textContent = LANG.t('all'));
    document.querySelectorAll('.inv-tab[data-cat="items"]').forEach(b => b.textContent = LANG.t('items'));
    document.querySelectorAll('.inv-tab[data-cat="abilities"]').forEach(b => b.textContent = LANG.t('abilities'));
    document.querySelectorAll('.inv-tab[data-cat="pet"]').forEach(b => b.textContent = LANG.t('pet'));
    document.querySelectorAll('.multi-tab[data-mode="create"]').forEach(b => b.textContent = LANG.t('create_room'));
    document.querySelectorAll('.multi-tab[data-mode="join"]').forEach(b => b.textContent = LANG.t('join_room'));

    // Inv sort
    const invSort = document.getElementById('inv-sort');
    if (invSort) {
        const op1 = invSort.querySelector('option[value="grade"]');
        const op2 = invSort.querySelector('option[value="name"]');
        const op3 = invSort.querySelector('option[value="level"]');
        if (op1) op1.textContent = LANG.t('sort_by_grade');
        if (op2) op2.textContent = LANG.t('sort_by_name');
        if (op3) op3.textContent = LANG.t('sort_by_level');
    }

    // Update settings-specific labels
    document.querySelectorAll('#screen-settings h3').forEach(h => {
        if (h.textContent.includes('Email') || h.id === 'settings-email-title')
            h.textContent = LANG.t('email_for_recovery');
    });
}
