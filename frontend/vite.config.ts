import { defineConfig, loadEnv } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath, URL } from 'url'

import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isDev = mode === 'development'

  return {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    plugins: [
      isDev && devtools(),
      viteTsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      tanstackStart(),
      nitro({
        runtimeConfig: {
          sessionSecret: env.SESSION_SECRET,
        },
      }),
      tailwindcss(),
      viteReact(),
    ].filter(Boolean),
    define: {
      'process.env.SESSION_SECRET': JSON.stringify(env.SESSION_SECRET),
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV || mode),
      'process.env.VITE_BACKEND_URL': JSON.stringify(env.VITE_BACKEND_URL),
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'router': ['@tanstack/react-router'],
            'query': ['@tanstack/react-query'],
          },
        },
      },
      minify: 'terser',
      terserOptions: {
        format: {
          comments: false,
        },
        mangle: true,
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
  }
})

export default config
