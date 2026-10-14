import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const FALLBACK_ORDER = ['inquiries', 'users', 'firms', 'documents', 'projects']

export default function RequireAdminPermission({ perm, children }) {
  const { user, loading } = useAuth()

  if (loading) return null
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />
  if (user[`perm_${perm}`]) return children

  const fallback = FALLBACK_ORDER.find((p) => user[`perm_${p}`])
  if (fallback) return <Navigate to={`/admin/${fallback === 'users' ? 'users' : fallback}`} replace />

  return (
    <div className="rounded-panel border border-line bg-white p-8 text-center">
      <p className="text-sm text-navy-900/60">
        Your admin account doesn't have access to any sections yet. Ask another admin to grant you permissions.
      </p>
    </div>
  )
}
