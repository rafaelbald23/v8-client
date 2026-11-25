import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { authApi } from '../utils/api.js'

export default function Register() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]       = useState({ name: '', email: '', password: '', role: 'tomador' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user, onboarding } = await authApi.register(form)
      login(token, user, onboarding)
      // Tomador vai para pagamento; investidor vai para o dashboard
      navigate(user.role === 'investidor' ? '/investidor' : '/tomador/pagamento', { replace: true })
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
          <p>Criar conta</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Nome completo
            <input type="text" required autoComplete="name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </label>
          <label>
            Email
            <input type="email" required autoComplete="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </label>
          <label>
            Senha
            <input type="password" required autoComplete="new-password"
              placeholder="Mínimo 8 caracteres com letras e números"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </label>
          <label>
            Perfil
            <select className="form-input" value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="tomador">Tomador — quero solicitar crédito</option>
              <option value="investidor">Investidor — quero emprestar dinheiro</option>
            </select>
          </label>
          <button type="submit" disabled={loading} className="btn btn--primary btn--full">
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-footer">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
