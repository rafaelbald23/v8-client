import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { authApi } from '../utils/api.js'

export default function AuthCallback() {
  const [params] = useSearchParams()
  const { login } = useAuth()
  const navigate  = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    if (!token) return navigate('/login?error=no_token')

    localStorage.setItem('v8_token', token)

    authApi.me()
      .then(({ user, onboarding }) => {
        login(token, user, onboarding)
        const dest = user.role === 'tomador' && !onboarding?.ativo
          ? '/tomador/pagamento'
          : dashboardByRole(user.role)
        navigate(dest, { replace: true })
      })
      .catch(() => navigate('/login?error=invalid_token'))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <p>Autenticando...</p>
    </div>
  )
}

function dashboardByRole(role) {
  if (role === 'admin')      return '/admin'
  if (role === 'investidor') return '/investidor'
  return '/tomador'
}
