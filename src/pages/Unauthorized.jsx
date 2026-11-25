import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Unauthorized() {
  const { user } = useAuth()
  const home = user?.role === 'admin' ? '/admin' : user?.role === 'investidor' ? '/investidor' : '/tomador'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16 }}>
      <h1 style={{ fontSize: 48, fontWeight: 700 }}>403</h1>
      <p style={{ opacity: 0.6 }}>Você não tem permissão para acessar esta página.</p>
      <Link to={home} style={{ color: '#6366f1', textDecoration: 'none' }}>← Voltar ao início</Link>
    </div>
  )
}
