import { NavLink } from 'react-router-dom'
import Icon from '../components/Icon.jsx'

export default function NotFound() {
  return (
    <div className="panel mx-auto max-w-xl p-10 text-center">
      <p className="eyebrow-accent">404</p>
      <h1 className="page-title mt-3">Something went wrong</h1>
      <p className="mt-3 text-[13px] text-muted">
        We couldn't find the page you were looking for - it may have moved, or the link may be out of date.
      </p>
      <NavLink to="/" className="btn-primary mt-7">
        Back to home <Icon name="arrow" className="h-4 w-4" />
      </NavLink>
    </div>
  )
}
