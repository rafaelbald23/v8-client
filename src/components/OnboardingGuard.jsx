import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

// Rotas liberadas para tomador pendente (antes de pagar a taxa)
const ROTAS_PERMITIDAS_PENDENTE = [
  '/tomador/pagamento',
  '/tomador/cadastro',
  '/tomador/privacidade',
]

/**
 * Intercepta o tomador pendente e redireciona para a tela de pagamento.
 * Tomadores ativos e outros roles passam sem restri├º├úo.
 */
export default function OnboardingGuard({ children }) {
  const { user, onboarding } = useAuth()
  const location = useLocation()

  // S├│ aplica para tomadores
  if (user?.role !== 'tomador') return children

  // Tomador ativo ÔÇö passa livre
  if (onboarding?.ativo) return children

  // Tomador pendente ÔÇö s├│ pode acessar rotas permitidas
  const permitida = ROTAS_PERMITIDAS_PENDENTE.some(r => location.pathname.startsWith(r))
  if (!permitida) {
    return <Navigate to="/tomador/pagamento" replace />
  }

  return children
}
