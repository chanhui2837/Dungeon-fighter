import urllib.request, urllib.parse, json, time, http.cookiejar

BASE = 'https://dungeon-fighter-6kil.onrender.com'

jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
opener.addheaders = [('User-Agent', 'probe/1.0')]

def post(path, body):
    r = urllib.request.Request(BASE + path, data=json.dumps(body).encode(),
                               headers={'Content-Type': 'application/json'})
    with opener.open(r, timeout=30) as resp:
        return resp.status, json.loads(resp.read())

def get(path):
    with opener.open(BASE + path, timeout=30) as resp:
        return resp.status, json.loads(resp.read())

u = 'lvprobe%d' % int(time.time())
st, d = post('/api/register', {'username': u, 'password': 'test1234'})
print('register:', st, d.get('username'), 'level=', d.get('level'))

# Send stage complete with a huge exp
st, d = post('/api/stage/complete', {'stage': 1, 'wave': 5, 'exp': 5000, 'tokens': 100, 'coins': 50, 'cleared': True})
print('after stage complete:', st, 'level=', d.get('level'), 'exp=', d.get('exp'))

st, d = get('/api/user')
print('re-fetch /api/user:', st, 'level=', d.get('level'), 'exp=', d.get('exp'))
print('=> if re-fetch level differs from stage complete, persistence is broken')
