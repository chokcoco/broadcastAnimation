import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  css: {
    /* CSS 预处理器 */
    preprocessorOptions: {
      scss: {
        // additionalData: '@import "src/assets/styles/var.scss";'
      }
    }
  }
})
