import { Outlet, useLocation } from 'react-router-dom'
import AppShell from '../../layouts/AppShell.jsx'
import PageHeader from '../../components/PageHeader.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLocale } from '../../context/LocaleContext.jsx'

const HEADERS = {
  inquiries: ['Inquiry center', 'Inquiries', "Submissions from the Contact forms on seskostudio.com and seskoarchitecture.com land here. Convert a new inquiry into a tracked project, or archive it if it doesn't need one."],
  users: ['User management', 'Users', 'Review partner registrations and manage approved accounts.'],
  accounts: ['Team', 'Admin accounts', 'Create staff accounts and choose which sections each one can access.'],
  firms: ['Directory', 'Firms', 'Partner firms their accounts and projects belong to.'],
  documents: ['Document center', 'Documents', 'Upload brochures and technical specifications and control which partners can see them.'],
  projects: ['Project center', 'Projects', 'Create projects, review AI-drafted requests and follow every stage.'],
}

export default function AdminLayout() {
  const { user } = useAuth()
  const { ui } = useLocale()
  const { pathname } = useLocation()

  const navItems = [
    { to: '/admin/inquiries', label: ui.nav.inquiries, icon: 'inbox', perm: 'inquiries' },
    { to: '/admin/users', label: ui.nav.users, icon: 'users', perm: 'users' },
    { to: '/admin/accounts', label: ui.nav.admins, icon: 'shield', perm: 'users' },
    { to: '/admin/firms', label: ui.nav.firms, icon: 'firm', perm: 'firms' },
    { to: '/admin/documents', label: ui.nav.adminDocs, icon: 'file', perm: 'documents' },
    { to: '/admin/projects', label: ui.nav.projects, icon: 'projects', perm: 'projects' },
  ].filter((item) => user?.[`perm_${item.perm}`])

  const parts = pathname.split('/').filter(Boolean)
  const section = parts[1] || ''
  const isDetail = section === 'projects' && parts.length > 2
  const [eyebrow, title, subtitle] = isDetail ? ['Project center', 'Project details', ''] : HEADERS[section] || ['Admin', 'Admin', '']

  return (
    <AppShell nav={navItems}>
      <PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <Outlet />
    </AppShell>
  )
}
