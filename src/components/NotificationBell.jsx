import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Icon from './Icon.jsx'

export default function NotificationBell() {
  const { csrfToken, unreadCount, refreshUnreadCount } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function toggle() {
    const next = !open
    setOpen(next)
    if (next) {
      setLoading(true)
      const res = await fetch('/api/notifications.php')
      const data = await res.json()
      setItems(data.notifications || [])
      setLoading(false)
    }
  }

  async function handleClick(item) {
    if (!item.is_read) {
      const body = new FormData()
      body.append('action', 'mark_read')
      body.append('id', item.id)
      await fetch('/api/notifications.php', {
        method: 'POST',
        body,
        headers: { 'X-CSRF-Token': csrfToken || '' },
      })
      refreshUnreadCount()
    }
    setOpen(false)
    navigate(item.link_path)
  }

  async function markAllRead() {
    const body = new FormData()
    body.append('action', 'mark_read')
    body.append('id', 'all')
    await fetch('/api/notifications.php', {
      method: 'POST',
      body,
      headers: { 'X-CSRF-Token': csrfToken || '' },
    })
    setItems((prev) => prev.map((i) => ({ ...i, is_read: true })))
    refreshUnreadCount()
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        className="relative grid h-10 w-10 place-items-center rounded-[10px] border border-line bg-white text-navy transition-colors hover:bg-navy-soft"
        aria-label="Notifications"
      >
        <Icon name="bell" className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-accent-500 px-1 text-[9px] font-extrabold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-panel border border-line bg-white shadow-pop">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-[13px] font-extrabold text-navy">Notifications</p>
            {items.some((i) => !i.is_read) && (
              <button onClick={markAllRead} className="text-[11px] font-bold text-accent-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-center text-sm text-muted">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted">No notifications yet.</p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleClick(item)}
                  className={`block w-full border-b border-line px-4 py-3 text-left text-[13px] last:border-b-0 hover:bg-surface-soft ${
                    item.is_read ? 'text-muted' : 'font-semibold text-navy-900'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!item.is_read && <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-accent-500" />}
                    <div className={item.is_read ? 'pl-3.5' : ''}>
                      <p>{item.message}</p>
                      <p className="mt-0.5 text-[11px] font-normal text-muted-2">{new Date(item.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
