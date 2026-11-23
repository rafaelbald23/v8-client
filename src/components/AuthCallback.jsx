import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { authApi } from '../utils/api.js'

// Captura o token do redirect OAuth (/auth/callback?token=...)
export default function AuthCallback() {
  const [params] = useSearchParams()
  const { login } = useAuth()
  const navigate  = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    if (!token) return navigate('/login?error=no_token')

    localStorage.setItem('v8_token', token)

    authApi.me()
      .then(({ user }) => {
        login(token, user)
        navigate(dashboardByRole(user.role), { replace: true })
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
