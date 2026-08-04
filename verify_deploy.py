import time, urllib.request, json, os, sys

BASE = 'https://dungeon-fighter-6kil.onrender.com'
results = []
def check(name, ok, extra=''):
    results.append((name, ok, extra))
    print(('PASS' if ok else 'FAIL'), name, extra)

cookies_store = {}
def api(method, path, who=None, body=None):
    req = urllib.request.Request(BASE + path, method=method)
    ck = cookies_store.get(who, '')
    if ck: req.add_header('Cookie', ck)
    if body is not None:
        req.add_header('Content-Type', 'application/json')
        req.data = json.dumps(body).encode()
    try:
        with urllib.request.urlopen(req, timeout=40) as r:
            if who:
                sc = r.headers.get('Set-Cookie', '')
                if sc and sc.split('=')[0] == 'session':
                    cookies_store[who] = sc.split(';')[0]
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())

import socketio

def new_user(name):
    st, d = api('POST', '/api/register', name, {'username': name, 'password': 'test1234'})
    if st != 201:
        st, d = api('POST', '/api/login', name, {'username': name, 'password': 'test1234'})
    assert st in (200, 201), (st, d)
    return name

def conn(cookie, label, events):
    s = socketio.Client(reconnection=False)
    got = {e: [] for e in events}
    for e in events:
        s.on(e, lambda *a, e=e: got[e].append(a))
    s.on('connect', lambda *a: print('DBG', label, 'SOCKET CONNECTED'))
    try:
        s.connect(BASE, transports=['polling'], headers={'Cookie': cookie}, wait_timeout=20)
    except Exception as e:
        print('DBG', label, 'connect failed:', str(e)[:200])
        return None, got
    s.emit('auth')
    return s, got

host = new_user('vfyhost%d' % int(time.time()))
guest = new_user('vfyguest%d' % int(time.time()))

st, room = api('POST', '/api/multiplayer/create', host, {'stage': 1, 'max_players': 4})
code = room['code']
check('create room', st == 201)
st, _ = api('POST', '/api/multiplayer/join', guest, {'code': code})
check('join room', st == 200)

hs, hgot = conn(cookies_store[host], 'host', ['monster_killed', 'player_left', 'player_state'])
time.sleep(0.5)
gs, ggot = conn(cookies_store[guest], 'guest', ['game_started', 'player_state', 'bullet_fired', 'monster_sync', 'player_left'])
time.sleep(1.0)
if not hs or not gs:
    check('socket connect', False, 'clients failed to connect')
else:
    check('socket connect', True)
    hs.emit('join_game', {'code': code})
    gs.emit('join_game', {'code': code})
    time.sleep(1.0)
    hs.emit('game_start', {'code': code})
    time.sleep(1.5)
    check('guest got game_started', len(ggot['game_started']) == 1)

    hs.emit('player_update', {'code': code, 'x': 111, 'y': 222, 'hp': 80, 'maxHp': 100, 'dir': 'up', 'frame': 0})
    gs.emit('player_update', {'code': code, 'x': 333, 'y': 444, 'hp': 90, 'maxHp': 100, 'dir': 'down', 'frame': 0})
    time.sleep(1.5)
    ps = ggot['player_state']
    check('guest received host player_state', len(ps) == 1 and ps[0][0]['x'] == 111, str(ps)[:120])
    check('host received guest player_state', len(hgot.get('player_state') or []) == 1 and hgot['player_state'][0][0]['x'] == 333)

    hs.emit('monster_sync', {'code': code, 'monsters': [{'id': 9, 'cls': 2, 'x': 50, 'y': 60, 'hp': 42, 'speed': 1}], 'wave': 3, 'waveActive': True})
    time.sleep(1.5)
    ms = ggot['monster_sync']
    check('guest received monster_sync', len(ms) == 1 and ms[0][0]['monsters'][0]['id'] == 9, str(ms)[:120])

    gs.emit('monster_killed', {'code': code, 'id': 9})
    time.sleep(1.5)
    mk = hgot['monster_killed']
    check('host received monster_killed', len(mk) == 1 and mk[0][0]['id'] == 9)

    gs.emit('leave_game', {'code': code})
    time.sleep(1.5)
    check('host received player_left', any(p[0].get('username') == guest for p in hgot['player_left']))
    try: hs.disconnect()
    except: pass
    try: gs.disconnect()
    except: pass

fails = [r for r in results if not r[1]]
print('=' * 40)
print('TOTAL:', len(results), 'PASSED:', len(results) - len(fails), 'FAILED:', len(fails))
sys.exit(1 if fails else 0)
