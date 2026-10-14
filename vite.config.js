import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// npm run dev       -> demo mode (fixture data, no backend needed)
// npm run dev:live  -> proxies /api to API_PROXY_TARGET (default: the live
//                      portal). Real accounts and real data - be careful.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.API_PROXY_TARGET || 'https://sesko-partners.com'
  return {
    base: env.VITE_BASE || '/',
    plugins: [react()],
    server: {
      port: 5178,
      proxy:
        mode === 'demo'
          ? undefined
          : {
              '/api': {
                target,
                changeOrigin: true,
                cookieDomainRewrite: '',
                configure: (proxy) => {
                  // The backend's check_origin() only accepts its own origin.
                  proxy.on('proxyReq', (proxyReq) => proxyReq.setHeader('origin', target))
                },
              },
            },
    },
  }
})
