import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function RequireApprovedClient({ children }) {
  const { user, loading } = useAuth()

  if (loading) return null
  if (!user || user.status !== 'approved') return <Navigate to="/" replace />
  return children
}
