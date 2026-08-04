import urllib.request, json, time, http.cookiejar

BASE = 'https://dungeon-fighter-6kil.onrender.com'

jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
opener.addheaders = [('User-Agent', 'probe/1.0')]
u = 'persist%d' % int(time.time())
def post(path, body):
    r = urllib.request.Request(BASE + path, data=json.dumps(body).encode(),
                               headers={'Content-Type': 'application/json'})
    with opener.open(r, timeout=30) as resp:
        return resp.status, json.loads(resp.read())
def get(path):
    with opener.open(BASE + path, timeout=30) as resp:
        return resp.status, json.loads(resp.read())

post('/api/register', {'username': u, 'password': 'test1234'})
post('/api/stage/complete', {'stage': 1, 'wave': 5, 'exp': 9999, 'tokens': 100, 'coins': 50, 'cleared': True})
st, d = get('/api/user')
print('A) created', u, 'level=', d.get('level'), 'exp=', d.get('exp'))
print('Wait 30s, re-fetch with fresh login (verify DB has the data)...')
time.sleep(30)
# Re-login to drop session and re-read from DB
jar2 = http.cookiejar.CookieJar()
opener2 = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar2))
opener2.addheaders = [('User-Agent', 'probe/1.0')]
r = urllib.request.Request(BASE + '/api/login', data=json.dumps({'username': u, 'password': 'test1234'}).encode(),
                           headers={'Content-Type': 'application/json'})
with opener2.open(r, timeout=30) as resp:
    json.loads(resp.read())
with opener2.open(BASE + '/api/user', timeout=30) as resp:
    d2 = json.loads(resp.read())
print('B) fresh login', u, 'level=', d2.get('level'), 'exp=', d2.get('exp'))
print('=> A and B differ? DB persistence broken.' if d.get('level') != d2.get('level') else '=> OK same (DB persists within session)')
print('Username', u, 'will be the marker - if server restarts and this user is MISSING or at level 1, sqlite is ephemeral.')
