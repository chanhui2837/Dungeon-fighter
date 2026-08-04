import urllib.request, urllib.parse, re, time, threading

BASE = 'https://dungeon-fighter-6kil.onrender.com'

def req(url, data=None, timeout=35):
    r = urllib.request.Request(url, method='POST' if data is not None else 'GET')
    if data is not None:
        r.data = data.encode()
    with urllib.request.urlopen(r, timeout=timeout) as resp:
        return resp.status, resp.read().decode()

st, body = req(BASE + '/socket.io/?EIO=4&transport=polling&t=%d' % int(time.time()*1000))
sid = re.search(r'"sid":"([^"]+)"', body).group(1)
base = BASE + '/socket.io/?EIO=4&transport=polling&sid=%s' % urllib.parse.quote(sid)

req(base + '&t=%d' % int(time.time()*1000), data='40')
print('connected, now: long-poll in thread A, timing thread B')

t0 = time.time()
result = {}
def long_poll():
    try:
        s, b = req(base + '&t=%d' % int(time.time()*1000), timeout=35)
        result['longpoll'] = '%.1fs %s %r' % (time.time()-t0, s, b[:60])
    except Exception as e:
        result['longpoll'] = 'ERR %s' % e

a = threading.Thread(target=long_poll)
a.start()
time.sleep(2)
t1 = time.time()
try:
    s, b = req(base + '&t=%d' % int(time.time()*1000), timeout=35)
    result['second'] = '%.1fs %s %r' % (time.time()-t1, s, b[:60])
except Exception as e:
    result['second'] = 'ERR %s' % e
a.join(timeout=40)
print('B(long-poll holding):', result.get('longpoll'))
print('B(2nd request):      ', result.get('second'))
print('=> if 2nd request took >10s: old sync worker (gevent app not processed concurrently)')
print('=> if fast: new threading/gthread or gevent worker (concurrent OK)')
