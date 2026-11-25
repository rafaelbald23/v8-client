import { useAuth } from '../../contexts/AuthContext.jsx'

export default function AdminDashboard() {
  const { user } = useAuth()
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Painel Admin</h1>
        <p className="page-subtitle">{user?.email}</p>
      </div>
      <div className="placeholder-card">
        <p>🚧 Sprint 10 — Admin V8 em construção</p>
      </div>
    </div>
  )
}
