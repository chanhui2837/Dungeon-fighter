class GameAPI {
    constructor() {
        this.userData = null;
    }

    async request(method, path, body) {
        const opts = {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin'
        };
        if (body) opts.body = JSON.stringify(body);
        const resp = await fetch(path, opts);
        const data = await resp.json();
        return { ok: resp.ok, status: resp.status, data };
    }

    async register(username, password, email, country, language) {
        const r = await this.request('POST', '/api/register', { username, password, email, country, language });
        if (r.ok) this.userData = r.data;
        return r;
    }

    async login(username, password) {
        const r = await this.request('POST', '/api/login', { username, password });
        if (r.ok) this.userData = r.data;
        return r;
    }

    async findAccount(email) { return this.request('POST', '/api/find-account', { email }); }
    async verifyFindAccount(email, code) { return this.request('POST', '/api/verify-find-account', { email, code }); }
    async sendVerification(email, excludeSelf) { return this.request('POST', '/api/send-verification', { email, exclude_self: excludeSelf }); }
    async verifyEmailLink(email, code) { return this.request('POST', '/api/verify-email-link', { email, code }); }

    async logout() {
        await this.request('POST', '/api/logout');
        this.userData = null;
    }

    async getUser() {
        const r = await this.request('GET', '/api/user');
        if (r.ok) this.userData = r.data;
        return r;
    }

    async updateUser(data) {
        const r = await this.request('PUT', '/api/user/update', data);
        if (r.ok) this.userData = r.data;
        return r;
    }

    async deleteAccount() {
        const r = await this.request('DELETE', '/api/user/delete');
        if (r.ok) this.userData = null;
        return r;
    }

    async storeBuy(category, itemId) { return this.request('POST', '/api/store/buy', { category, item_id: itemId }); }
    async permUpgrade(itemId) { return this.request('POST', '/api/item/perm-upgrade', { item_id: itemId }); }
    async permDowngrade(itemId) { return this.request('POST', '/api/item/perm-downgrade', { item_id: itemId }); }

    async completeStage(stage, wave, exp, tokens, coins, cleared) {
        return this.request('POST', '/api/stage/complete', { stage, wave, exp, tokens, coins, cleared });
    }

    async listRooms() { return this.request('GET', '/api/multiplayer/rooms'); }
    async createRoom(stage, maxPlayers, levelLimit, secretCode) {
        return this.request('POST', '/api/multiplayer/create', { stage, max_players: maxPlayers, level_limit: levelLimit, secret_code: secretCode });
    }
    async joinRoom(code, secret) { return this.request('POST', '/api/multiplayer/join', { code, secret }); }
    async leaveRoom(code) { return this.request('POST', '/api/multiplayer/leave', { code }); }
    async startRoom(code) { return this.request('POST', '/api/multiplayer/start', { code }); }
    async getRoom(code) { return this.request('GET', '/api/multiplayer/room/' + code); }

    isLoggedIn() { return this.userData !== null; }
}
