import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { useLocale } from './context/LocaleContext.jsx'
import RequireAdmin from './components/RequireAdmin.jsx'
import RequireAdminPermission from './components/RequireAdminPermission.jsx'
import RequireApprovedClient from './components/RequireApprovedClient.jsx'
import AppShell from './layouts/AppShell.jsx'
import PublicLayout from './layouts/PublicLayout.jsx'
import AuthPage from './pages/auth/AuthPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import DownloadCenter from './pages/partner-portal/DownloadCenter.jsx'
import TechnicalSpecs from './pages/partner-portal/TechnicalSpecs.jsx'
import ProjectTracker from './pages/partner-portal/ProjectTracker.jsx'
import ProjectDetail from './pages/partner-portal/ProjectDetail.jsx'
import Privacy from './pages/Privacy.jsx'
import NotFound from './pages/NotFound.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminUsers from './pages/admin/PendingUsers.jsx'
import AdminAccounts from './pages/admin/AdminAccounts.jsx'
import AdminFirms from './pages/admin/Firms.jsx'
import AdminDocuments from './pages/admin/AdminDocuments.jsx'
import AdminProjects from './pages/admin/AdminProjects.jsx'
import AdminProjectDetail from './pages/admin/AdminProjectDetail.jsx'
import AdminInquiries from './pages/admin/AdminInquiries.jsx'

function useClientNav() {
  const { ui } = useLocale()
  return [
    { to: '/', label: ui.nav.dashboard, icon: 'dashboard', end: true },
    { to: '/portal', label: ui.nav.projects, icon: 'projects' },
    { to: '/documents', label: ui.nav.documents, icon: 'download' },
    { to: '/specs', label: ui.nav.specs, icon: 'specs' },
  ]
}

// "/" is the ASAŞ-style entry point: the split-screen login when signed out,
// the partner dashboard (inside the app shell) once approved.
function RootGate() {
  const { user, loading } = useAuth()
  const nav = useClientNav()

  if (loading) return null
  if (user?.status === 'approved' && user.role === 'admin') return <Navigate to="/admin" replace />
  if (user?.status === 'approved') {
    return (
      <AppShell nav={nav}>
        <Dashboard />
      </AppShell>
    )
  }
  return <AuthPage initialMode="login" />
}

function ClientShell() {
  const nav = useClientNav()
  return <AppShell nav={nav} />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<RootGate />} />
        <Route path="/login" element={<AuthPage initialMode="login" />} />
        <Route path="/register" element={<AuthPage initialMode="register" />} />

        <Route element={<RequireApprovedClient><ClientShell /></RequireApprovedClient>}>
          <Route path="/documents" element={<DownloadCenter />} />
          <Route path="/specs" element={<TechnicalSpecs />} />
          <Route path="/portal" element={<ProjectTracker />} />
          <Route path="/portal/projects/:id" element={<ProjectDetail />} />
        </Route>

        <Route
          path="/admin/*"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<Navigate to="users" replace />} />
          <Route path="users" element={<RequireAdminPermission perm="users"><AdminUsers /></RequireAdminPermission>} />
          <Route path="accounts" element={<RequireAdminPermission perm="users"><AdminAccounts /></RequireAdminPermission>} />
          <Route path="firms" element={<RequireAdminPermission perm="firms"><AdminFirms /></RequireAdminPermission>} />
          <Route path="documents" element={<RequireAdminPermission perm="documents"><AdminDocuments /></RequireAdminPermission>} />
          <Route path="projects" element={<RequireAdminPermission perm="projects"><AdminProjects /></RequireAdminPermission>} />
          <Route path="projects/:id" element={<RequireAdminPermission perm="projects"><AdminProjectDetail /></RequireAdminPermission>} />
          <Route path="inquiries" element={<RequireAdminPermission perm="inquiries"><AdminInquiries /></RequireAdminPermission>} />
        </Route>

        <Route element={<PublicLayout />}>
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
