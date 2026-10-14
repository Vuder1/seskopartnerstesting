// Public-folder files must respect Vite's base path (the demo is served from a
// sub-path on GitHub Pages), so never hardcode "/assets/...".
export const asset = (p) => import.meta.env.BASE_URL + p.replace(/^\//, '')
