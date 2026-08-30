# ⚔️ 던전 파이터 (Dungeon Fighter)

웹 기반 액션 RPG - Render + MongoDB + Socket.IO 기반 실시간 멀티플레이어

## 🎮 주요 기능
- 던전 탐험 & 몬스터 사냥 (개별 AI 패턴, 드랍 테이블)
- JWT 기반 계정 시스템 (bcrypt 단방향 암호화, MongoDB 영구 저장)
- Socket.IO 실시간 동기화 (<100ms, 서버 검증)
- 아바타 커스터마이징 (머리/상의/하의/무기/악세서리)
- 설정창 (그래픽/오디오/컨트롤/계정)
- 레벨업 & 스탯 분배, 인벤토리, 스킬, 던전 매칭, 채팅, 자동저장, 안티치트

## 🚀 로컬 실행
```bash
# 1. MongoDB 실행 (로컬 또는 Atlas)
# 2. 환경변수 설정
cp server/.env.example server/.env
cp client/.env.example client/.env

# 3. 의존성 설치
npm run install:all

# 4. 개발 서버 실행
npm run dev
# client: http://localhost:5173
# server: http://localhost:3000
```

## 🌐 배포 (Render + MongoDB Atlas)

### 1) MongoDB Atlas 설정
1. https://cloud.mongodb.com 에서 클러스터 생성 (Free M0)
2. Database Access → 유저 생성 (username/password 기록)
3. Network Access → IP Whitelist → `Add IP Address` → `Allow Access From Anywhere` (`0.0.0.0/0`) - Render는 동적 IP
4. Database → Connect → Drivers → Connection String 복사
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/dungeon_fighter?retryWrites=true&w=majority
   ```
   `<password>`를 실제 비밀번호로 교체 (특수문자 `!@#`는 URL 인코딩 필요)

### 2) Render 배포 (통합 배포 권장 - 1개 서비스)
- `render.yaml` Blueprint가 이미 통합 배포로 설정됨
- Render 대시보드 → New → Blueprint → 이 레포 연결 → `render.yaml` 자동 인식
- 환경변수 설정 (Render가 `JWT_SECRET`은 자동 생성, `MONGODB_URI`는 수동 입력 필수)
  - `MONGODB_URI` = 위 Atlas URI
  - `NODE_ENV` = `production` (자동 설정됨)
  - `CLIENT_URL` = 비워둠 (통합 배포는 동일 오리진)
- Deploy 후 `https://your-app.onrender.com/api/health` 로 헬스체크
- 첫 요청은 Cold Start로 30-50초 소요 (Free 플랜 특성)

### 분리 배포 (선택)
- `render.yaml`에서 B 섹션 주석 해제, A 섹션 주석 처리
- 서버 `MONGODB_URI`, `CLIENT_URL=https://your-client.onrender.com` 설정
- 클라이언트 `VITE_SERVER_URL=https://your-server.onrender.com` 설정

### 트러블슈팅
- `Mongo connection failed` → Atlas IP whitelist `0.0.0.0/0` 확인
- `CORS error` → 서버 `CLIENT_URL`이 클라이언트 도메인과 일치하는지 확인
- `JWT invalid` → `JWT_SECRET`이 배포마다 재생성되면 기존 토큰 무효화 → 고정 값으로 변경하려면 Render env에서 `generateValue` 대신 `sync:false`로 직접 입력

## 🧪 부하 테스트
```bash
npm run loadtest
# 20명 동시 접속 시뮬레이션, 평균 지연/동기화 정확도 리포트
```

## 📁 구조
```
client/ - Vite + Canvas 게임 엔진
server/ - Express + Socket.IO + Mongoose
```
