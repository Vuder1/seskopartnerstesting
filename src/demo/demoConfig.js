// Demo mode swaps /api/* for in-browser fixtures (see mockApi.js) so the
// re-skinned portal can be explored without touching the live backend.
export const DEMO_ENABLED = import.meta.env.VITE_DEMO === '1'

export const DEMO_ACCOUNTS = [
  { label: 'Internal team', email: 'admin@demo.sesko', password: 'demo-admin-1', icon: 'shield', role: 'admin' },
  { label: 'Partner (Demo Glazing Co.)', email: 'partner@demo.sesko', password: 'demo-partner-1', icon: 'building', role: 'client' },
]

// File links point at the PHP backend, which a static demo does not have.
export function blockInDemo(e) {
  if (!DEMO_ENABLED) return
  e.preventDefault()
  window.alert('This is a design preview with sample data - downloads are disabled.')
}
