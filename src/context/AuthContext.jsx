import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const AuthContext = createContext(null)

const POLL_INTERVAL_MS = 45000

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [csrfToken, setCsrfToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const userRef = useRef(null)
  userRef.current = user

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/me.php')
      const data = await res.json()
      setUser(data.user ?? null)
      setCsrfToken(data.csrfToken ?? null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshUnreadCount = useCallback(async () => {
    if (!userRef.current) return
    try {
      const res = await fetch('/api/notifications.php?count_only=1')
      const data = await res.json()
      setUnreadCount(data.unread ?? 0)
    } catch {
      // ignore — next poll will retry
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Poll for unread notifications while logged in. Paused when the tab isn't
  // visible; fires one immediate check on refocus. No cross-tab coordination
  // — not worth it at this account scale.
  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      return
    }

    refreshUnreadCount()
    let interval = null

    function startPolling() {
      if (interval) return
      interval = setInterval(refreshUnreadCount, POLL_INTERVAL_MS)
    }
    function stopPolling() {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
    }
    function handleVisibility() {
      if (document.hidden) {
        stopPolling()
      } else {
        refreshUnreadCount()
        startPolling()
      }
    }

    startPolling()
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', refreshUnreadCount)

    return () => {
      stopPolling()
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', refreshUnreadCount)
    }
  }, [user, refreshUnreadCount])

  async function login(email, password) {
    const body = new FormData()
    body.append('email', email)
    body.append('password', password)
    try {
      const res = await fetch('/api/login.php', { method: 'POST', body })
      const data = await res.json()
      if (res.ok) {
        setUser(data.user)
        setCsrfToken(data.csrfToken)
        return { success: true, user: data.user }
      }
      return { success: false, error: data.error || 'Login failed.' }
    } catch {
      return { success: false, error: 'Could not reach the server. Please try again.' }
    }
  }

  async function logout() {
    const body = new FormData()
    try {
      await fetch('/api/logout.php', {
        method: 'POST',
        body,
        headers: { 'X-CSRF-Token': csrfToken || '' },
      })
    } catch {
      // ignore — clear local state regardless
    }
    setUser(null)
    await refresh()
  }

  return (
    <AuthContext.Provider value={{ user, csrfToken, loading, login, logout, refresh, unreadCount, refreshUnreadCount }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
