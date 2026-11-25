import { useAuth } from '../../contexts/AuthContext.jsx'

export default function InvestidorDashboard() {
  const { user } = useAuth()
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Bem-vindo, {user?.name?.split(' ')[0]}</p>
      </div>
      <div className="placeholder-card">
        <p>🚧 Sprint 3 — Dashboard financeiro em construção</p>
      </div>
    </div>
  )
}
