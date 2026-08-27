import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

// 部署到 GitHub Pages 项目站点时，静态资源位于 /<仓库名>/ 子路径下。
// 通过 VITE_BASE 环境变量注入（见 .github/workflows/deploy.yml），本地开发默认根路径 '/'。
const BASE = process.env.VITE_BASE ?? '/'

// https://vite.dev/config/
export default defineConfig({
  base: BASE,
  // 允许手机通过局域网 IP 访问开发服务器
  server: {
    host: true,
    port: 5180,
    strictPort: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // 开发模式下也启用 SW，方便手机端调试「添加到主屏幕」
      devOptions: { enabled: true, type: 'module' },
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      workbox: {
        // 缓存构建产物与字体，支持离线打开
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: `${BASE}index.html`,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      manifest: {
        name: '孕语 · 孕育全周期',
        short_name: '孕语',
        description: '陪伴女性从备孕到宝宝 2 岁的全生命周期智能孕育助手',
        theme_color: '#C77B5A',
        background_color: '#F5F0E8',
        display: 'standalone',
        orientation: 'portrait',
        start_url: BASE,
        scope: BASE,
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
