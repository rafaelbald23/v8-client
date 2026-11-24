import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { authApi } from '../../utils/api.js'

const NAV = [
  { to: '/tomador',             label: 'Início',      end: true },
  { to: '/tomador/cadastro',    label: 'Meu cadastro' },
  { to: '/tomador/solicitacao', label: 'Solicitação'  },
  { to: '/tomador/documentos',  label: 'Documentos'   },
  { to: '/tomador/status',      label: 'Meu status'   },
]

export default function TomadorLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await authApi.logout().catch(() => {})
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="layout">
      <aside className="sidebar sidebar--tomador">
        <div className="sidebar__brand">V8 Exclusive</div>
        <nav className="sidebar__nav">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__footer">
          <span className="sidebar__user">{user?.name}</span>
          <button className="sidebar__logout" onClick={handleLogout}>Sair</button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
