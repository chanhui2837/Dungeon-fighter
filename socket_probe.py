import urllib.request, urllib.parse, json, time, re, sys

BASE = 'https://dungeon-fighter-6kil.onrender.com'

def req(url, data=None, timeout=30):
    r = urllib.request.Request(url, method='POST' if data is not None else 'GET')
    if data is not None:
        r.data = data.encode()
    try:
        with urllib.request.urlopen(r, timeout=timeout) as resp:
            return resp.status, resp.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()
    except Exception as e:
        return -1, type(e).__name__ + ': ' + str(e)[:200]

print('=== 1) socket connect + ack test ===')
st, body = req(BASE + '/socket.io/?EIO=4&transport=polling&t=%d' % int(time.time()*1000))
print('handshake:', st, body[:120])
m = re.search(r'"sid":"([^"]+)"', body)
if not m:
    print('NO SID'); sys.exit(1)
sid = m.group(1)
st, body = req(BASE + '/socket.io/?EIO=4&transport=polling&sid=%s&t=%d' % (urllib.parse.quote(sid), int(time.time()*1000)), data='40')
print('POST 40:', st, repr(body[:100]))
ack = False
for i in range(5):
    st, body = req(BASE + '/socket.io/?EIO=4&transport=polling&sid=%s&t=%d' % (urllib.parse.quote(sid), int(time.time()*1000)))
    print('poll%d:' % i, st, repr(body[:120]))
    if body.startswith('40'):
        ack = True; break
    if st == 400:
        break
    time.sleep(1.2)
print('NAMESPACE CONNECT ACK:', ack)
