import { useAuth } from '../../contexts/AuthContext.jsx'

export default function TomadorDashboard() {
  const { user } = useAuth()
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Olá, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Área do tomador</p>
      </div>
      <div className="placeholder-card">
        <p>🚧 Sprint 2 — Cadastro e onboarding em construção</p>
      </div>
    </div>
  )
}
