// Render 통합 배포 시 VITE_SERVER_URL이 비어있으면 동일 오리진 사용 (서버가 client/dist를 함께 서빙)
// 로컬 개발 시 http://localhost:3000 폴백
const RAW_URL = import.meta.env.VITE_SERVER_URL;
// VITE_SERVER_URL이 "" 또는 "/" 이면 동일 오리진으로 간주
const SERVER_URL = (() => {
  if(RAW_URL === '' || RAW_URL === '/') return '';
  if(RAW_URL) return RAW_URL.replace(/\/$/, '');
  // production에서 별도 설정 없으면 현재 오리진 사용 (통합 배포)
  if(import.meta.env.PROD && typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:3000';
})();

export function getToken(){ return localStorage.getItem('df_token'); }
export function setToken(t){ if(t) localStorage.setItem('df_token', t); else localStorage.removeItem('df_token'); }
export function getServerUrl(){ return SERVER_URL; }

async function req(path, opts={}){
  const token = getToken();
  const headers = { 'Content-Type':'application/json', ...(opts.headers||{}) };
  if(token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${SERVER_URL}${path}`, { ...opts, headers });
  const data = await res.json().catch(()=> ({}));
  if(!res.ok) throw new Error(data.error || `요청 실패 ${res.status}`);
  return data;
}

export const api = {
  signup: (payload)=> req('/api/auth/signup',{method:'POST', body: JSON.stringify(payload)}),
  login: (payload)=> req('/api/auth/login',{method:'POST', body: JSON.stringify(payload)}),
  me: ()=> req('/api/auth/me'),
  save: (payload)=> req('/api/auth/save',{method:'PUT', body: JSON.stringify(payload)}),
  changePw: (payload)=> req('/api/auth/password',{method:'PUT', body: JSON.stringify(payload)}),
  withdraw: (payload)=> req('/api/auth/withdraw',{method:'DELETE', body: JSON.stringify(payload)}),
  leaderboard: ()=> req('/api/auth/leaderboard'),
  health: ()=> req('/api/health'),
  items: ()=> req('/api/game/items'),
  dungeons: ()=> req('/api/game/dungeons'),
};
