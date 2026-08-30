import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  // Render 배포 시 client가 서버와 동일 오리진이면 VITE_SERVER_URL을 비워두어도 동작
  // 별도 도메인 배포 시 VITE_SERVER_URL을 서버 URL로 설정
});
