import urllib.request, urllib.parse, json, time, re, sys

BASE = 'https://dungeon-fighter-6kil.onrender.com'

def req(url, data=None):
    r = urllib.request.Request(url, method='POST' if data is not None else 'GET')
    if data is not None:
        r.data = data.encode()
    try:
        with urllib.request.urlopen(r, timeout=30) as resp:
            return resp.status, resp.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

st, body = req(BASE + '/socket.io/?EIO=4&transport=polling&t=%d' % int(time.time()*1000))
print('handshake:', st, body[:150])
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
    if '40' in body and '4' in body[:3]:
        ack = True
    time.sleep(1.2)
print('NAMESPACE CONNECT ACK:', ack)
