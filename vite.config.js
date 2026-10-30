import { defineConfig } from 'vite'

// base:'./' 使构建产物使用相对路径，可在任意子路径（如 GitHub Pages 项目站点）下正常加载
export default defineConfig({
  base: './'
})
