import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { authApi } from '../utils/api.js'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [params]  = useSearchParams()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState(params.get('error') || '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user } = await authApi.login(form)
      login(token, user)
      navigate(dashboardByRole(user.role), { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <h1>V8 Exclusive</h1>
          <p>Plataforma de crédito</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            />
          </label>
          <button type="submit" disabled={loading} className="btn btn--primary btn--full">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-divider">ou</div>

        <div className="auth-social">
          <a href="/api/auth/google"   className="btn btn--social">Google</a>
          <a href="/api/auth/facebook" className="btn btn--social">Facebook</a>
        </div>

        <p className="auth-footer">
          Não tem conta? <Link to="/register">Cadastrar</Link>
        </p>
      </div>
    </div>
  )
}

function dashboardByRole(role) {
  if (role === 'admin')      return '/admin'
  if (role === 'investidor') return '/investidor'
  return '/tomador'
}
