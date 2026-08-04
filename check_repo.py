import io, os

REPO = r'C:\Users\user\AppData\Local\Temp\opencode\df-repo'
LOCAL = r'C:\Users\user\Downloads\Dungeon fighter'

def norm(s):
    return s.replace('\r', '')

pairs = [
    ('server/app.py', 'server/app.py'),
    ('Procfile', 'Procfile'),
    ('render.yaml', 'render.yaml'),
    ('requirements.txt', 'requirements.txt'),
]

for r, l in pairs:
    with io.open(os.path.join(REPO, r), encoding='utf-8') as f: rd = norm(f.read())
    with io.open(os.path.join(LOCAL, l), encoding='utf-8') as f: ld = norm(f.read())
    print(r, 'MATCH' if rd == ld else 'STILL DIFFERENT')
    if rd != ld:
        for i in range(min(len(rd), len(ld))):
            if rd[i] != ld[i]:
                print('   REPO :', repr(rd[max(0,i-50):i+100]))
                print('   LOCAL:', repr(ld[max(0,i-50):i+100]))
                break
