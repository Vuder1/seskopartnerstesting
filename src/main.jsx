import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { LocaleProvider } from './context/LocaleContext.jsx'
import { DEMO_ENABLED } from './demo/demoConfig.js'
import './index.css'

async function start() {
  // Demo mode answers /api/* in the browser so the UI runs without a backend.
  if (DEMO_ENABLED) {
    const { installMockApi } = await import('./demo/mockApi.js')
    installMockApi()
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <LocaleProvider>
          <App />
        </LocaleProvider>
      </BrowserRouter>
    </React.StrictMode>,
  )
}

start()
