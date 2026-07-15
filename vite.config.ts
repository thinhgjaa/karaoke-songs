import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base phải trùng với tên repo GitHub để chạy đúng trên GitHub Pages
export default defineConfig({
  base: '/karaoke-songs/',
  plugins: [react(), tailwindcss()],
})
