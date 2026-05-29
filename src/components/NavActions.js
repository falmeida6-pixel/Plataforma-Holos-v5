import { useNavigate, useLocation } from 'react-router-dom'

export default function NavActions({ showHome = true, showBack = true }) {
  const navigate = useNavigate()
  const location = useLocation()

  const hideBack = location.pathname === '/login' || location.pathname === '/home' || location.pathname === '/'
  const hideHome = location.pathname === '/home'

  if (hideBack && hideHome) return null

  return (
    <div className="nav-actions">
      {showBack && !hideBack && (
        <button className="btn-back" onClick={() => navigate(-1)}>
          ‹ Voltar
        </button>
      )}
      {showHome && !hideHome && (
        <button className="btn-home-link" onClick={() => navigate('/home')}>
          ⌂ Home
        </button>
      )}
    </div>
  )
}
