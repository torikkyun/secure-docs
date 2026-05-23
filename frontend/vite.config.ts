import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig, loadEnv } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

type TanStackStartInputConfig = NonNullable<Parameters<typeof tanstackStart>[0]>
type SpaOptions = NonNullable<TanStackStartInputConfig['spa']>
type SpaPrerenderOptions = NonNullable<SpaOptions['prerender']>
type RegularPrerenderOptions = NonNullable<
  TanStackStartInputConfig['prerender']
>

// Set by Tauri CLI during `tauri dev` on remote devices — actual system env, fine at top level
const host: string | undefined = process.env.TAURI_DEV_HOST

const sharedPrerenderOptions: SpaPrerenderOptions & RegularPrerenderOptions = {
  enabled: true,
  autoSubfolderIndex: true,
}

// Used when USE_SSR_PRERENDER_MODE=true — web SSR deployment
// See: https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering
const regularPrerenderOptions: RegularPrerenderOptions = {
  ...sharedPrerenderOptions,
  crawlLinks: true,
  retryCount: 3,
  retryDelay: 1000,
}

// Used when USE_SSR_PRERENDER_MODE=false — Tauri SPA build
// See: https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode#prerendering-options
const spaWithPrerenderOptions: SpaOptions = {
  prerender: {
    ...sharedPrerenderOptions,
    // Output the SPA shell to /index.html so Tauri can serve it as entry point
    outputPath: '/index.html',
    crawlLinks: false,
    retryCount: 0,
  },
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // USE_SSR_PRERENDER_MODE=true  → full SSR build (web deployment)
  // USE_SSR_PRERENDER_MODE=false → SPA prerender build (Tauri desktop app) [default]
  // Must be read via `env` (loaded from .env by Vite), NOT via `process.env` at top level
  const useSsrPrerenderString: string =
    env.USE_SSR_PRERENDER_MODE?.toLowerCase() ?? 'false'
  const useSsrPrerenderMode: boolean =
    useSsrPrerenderString === 'true' || useSsrPrerenderString === '1'

  return {
    plugins: [
      devtools(),
      viteTsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      nitro({
        runtimeConfig: useSsrPrerenderMode
          ? { sessionSecret: env.SESSION_SECRET }
          : undefined,
      }),
      tailwindcss(),
      tanstackStart({
        spa: (!useSsrPrerenderMode
          ? spaWithPrerenderOptions
          : undefined) satisfies SpaOptions | undefined,
        prerender: (useSsrPrerenderMode
          ? regularPrerenderOptions
          : undefined) satisfies RegularPrerenderOptions | undefined,
      }),
      viteReact(),
    ],
    define: {
      'process.env.SESSION_SECRET': JSON.stringify(env.SESSION_SECRET),
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV || mode),
      'process.env.VITE_BACKEND_URL': JSON.stringify(env.VITE_BACKEND_URL),
    },
    // Prevent Vite from obscuring Rust errors in Tauri dev
    clearScreen: false,
    server: {
      port: 3000,
      strictPort: true,
      host: host || false,
      hmr: host
        ? {
            protocol: 'ws',
            host,
            port: 3001,
          }
        : undefined,
      watch: {
        // Tell Vite to ignore watching `src-tauri`
        ignored: ['**/src-tauri/**'],
      },
    },
  }
})
