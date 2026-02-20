import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import type { IncomingMessage, ServerResponse } from 'http'

/**
 * Vite dev plugin that serves Vercel-style serverless functions from /api/*
 * so `npm run dev` works without needing `vercel dev`.
 */
function apiDevPlugin(): Plugin {
  return {
    name: 'api-dev-server',
    config(_, { mode }) {
      // Load ALL env vars (not just VITE_*) so serverless handlers can access them
      const env = loadEnv(mode, process.cwd(), '')
      for (const key of ['ANTHROPIC_API_KEY', 'WITHINGS_CLIENT_ID', 'WITHINGS_CLIENT_SECRET', 'WITHINGS_REDIRECT_URI']) {
        if (env[key]) process.env[key] = env[key]
      }
    },
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (!req.url?.startsWith('/api/')) return next()

        const urlObj = new URL(req.url, 'http://localhost')
        const route = urlObj.pathname.replace('/api/', '')

        // Parse query params (Vercel puts these on req.query)
        const query: Record<string, string> = {}
        urlObj.searchParams.forEach((v, k) => { query[k] = v })

        // Parse request body for POST
        let body: Record<string, unknown> = {}
        if (req.method === 'POST') {
          body = await new Promise((resolve) => {
            let data = ''
            req.on('data', (chunk: Buffer) => { data += chunk.toString() })
            req.on('end', () => {
              try { resolve(JSON.parse(data)) } catch { resolve({}) }
            })
          })
        }

        // Handle CORS preflight
        if (req.method === 'OPTIONS') {
          res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          })
          return res.end()
        }

        try {
          const modulePath = path.resolve(process.cwd(), `api/${route}.ts`)
          const handler = await server.ssrLoadModule(modulePath)

          // Create mock Vercel request/response
          const mockReq = { method: req.method, headers: req.headers, body, query }
          let statusCode = 200
          const mockRes = {
            status(code: number) { statusCode = code; return mockRes },
            json(data: unknown) {
              res.writeHead(statusCode, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify(data))
              return mockRes
            },
            redirect(code: number, url: string) {
              res.writeHead(code, { Location: url })
              res.end()
              return mockRes
            },
            end() { res.writeHead(statusCode); res.end(); return mockRes },
          }

          await handler.default(mockReq, mockRes)
        } catch (err) {
          console.error(`API error (${route}):`, err)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            error: err instanceof Error ? err.message : 'Internal server error',
          }))
        }
      })
    },
  }
}

export default defineConfig({
  server: {
    watch: {
      // Ignore Google Drive sync metadata to prevent spurious HMR refreshes
      ignored: ['**/.tmp.drivedownload/**', '**/.tmp.driveupload/**', '**/desktop.ini'],
    },
  },
  plugins: [
    apiDevPlugin(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'ShuktiFit',
        short_name: 'ShuktiFit',
        description: 'AI-Powered Personal Fitness Tracker',
        theme_color: '#1A1A2E',
        background_color: '#1A1A2E',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/yuhonas\/free-exercise-db/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'exercise-images',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          'exercise-data': ['./src/data/exercises.json'],
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-dexie': ['dexie', 'dexie-react-hooks'],
          'vendor-charts': ['recharts'],
        },
      },
    },
  },
})
