import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// O "base" tem de ser igual ao nome do repositório no GitHub,
// para que os ficheiros sejam encontrados no GitHub Pages.
export default defineConfig({
  plugins: [vue()],
  base: '/Chuva_segura/',
})
