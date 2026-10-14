import { createContext, useContext, useEffect, useState } from 'react'
import { LOCALES, translations } from '../i18n/translations.js'
import { ui as uiStrings } from '../i18n/ui.js'

const LocaleContext = createContext(null)

function detectInitialLocale() {
  try {
    const stored = localStorage.getItem('sesko_locale')
    if (stored && LOCALES.includes(stored)) return stored
  } catch {}
  return 'en'
}

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(detectInitialLocale)

  useEffect(() => {
    try {
      localStorage.setItem('sesko_locale', locale)
    } catch {}
    document.documentElement.lang = locale
  }, [locale])

  const t = translations[locale]

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, ui: uiStrings[locale] || uiStrings.en }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within a LocaleProvider')
  return ctx
}
