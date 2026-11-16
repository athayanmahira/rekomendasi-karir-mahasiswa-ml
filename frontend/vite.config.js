import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Konfigurasi Vite untuk Frontend Rekomendasi Bidang Karir Mahasiswa
// Catatan: Proxy /api disiapkan sebagai struktur masa depan, namun belum digunakan
// pada tahap pengembangan antarmuka mandiri saat ini.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
