import path from 'path'
import type { PluginOption } from 'vite'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import viteCompression from 'vite-plugin-compression'

function setupPlugins(env: ImportMetaEnv): PluginOption[] {
  return [
    vue(),
    viteCompression(),
    env.VITE_GLOB_APP_PWA === 'true' && VitePWA({
      injectRegister: 'auto',
      manifest: {
        name: 'chatGPT',
        short_name: 'chatGPT',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ]
}

export default defineConfig((env) => {
  const viteEnv = loadEnv(env.mode, process.cwd()) as unknown as ImportMetaEnv

  return {
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), 'src'),
      },
    },
    plugins: setupPlugins(viteEnv),
    server: {
      host: '0.0.0.0',
      port: 1002,
      open: false,
      proxy: {
        '/api': {
          target: viteEnv.VITE_APP_API_BASE_URL,
          changeOrigin: true, // 允许跨域
          rewrite: path => path.replace('/api/', '/'),
        },
      },
    },
    build: {
      reportCompressedSize: false,
      sourcemap: false,
      commonjsOptions: {
        ignoreTryCatch: false,
      },
      rollupOptions: {
        manualChunks: (id: string) => {
          if (id.includes('node_modules')) {
            if (id.includes('lodash-es')) {
              return 'vendor-lodash'
            }
            else if (id.includes('naive-ui')) {
              return 'vendor-naive'
            }
            else if (id.includes('crypto-js')) {
              return 'vendor-crypto'
            }
            else if (id.includes('highlight.js')) {
              const modeuleIndex: number = id.indexOf('/node_modules/highlight.js/lib/languages/')
              const indexLenngth = '/node_modules/highlight.js/lib/languages/'.length
              if (modeuleIndex > 0) {
                const startChar: string = id.substring(modeuleIndex + indexLenngth, modeuleIndex + indexLenngth + 1)
                if ('abcdefghstuvwxyz'.includes(startChar))
                  return 'vendor-highlight1'

                else if ('ijklmnopqr'.includes(startChar))
                  return 'vendor-highlight2'

                else
                  return 'vendor-highlight3'
              }
              return 'vendor-highlight00'
            }
            else if (id.includes('/node_modules/axios/')) {
              return 'vendor-axios'
            }
            else if (id.includes('/node_modules/vueuc/')) {
              return 'vendor-vueuc'
            }
            else if (id.includes('/node_modules/date-fns/')) {
              return 'vendor-date-fns'
            }
            else if (id.includes('markdown-it')) {
              return 'vendor-markdown'
            }
            return 'vendor-other'
          }
          else {
            return 'custom'
          }
        },
      },
    },
  }
})
