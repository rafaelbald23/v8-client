import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'

import Login          from './pages/Login.jsx'
import Unauthorized   from './pages/Unauthorized.jsx'
import AuthCallback   from './components/AuthCallback.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import TomadorLayout    from './pages/tomador/TomadorLayout.jsx'
import TomadorDashboard from './pages/tomador/TomadorDashboard.jsx'
import CadastroPerfil   from './pages/tomador/CadastroPerfil.jsx'

import InvestidorLayout    from './pages/investidor/InvestidorLayout.jsx'
import InvestidorDashboard from './pages/investidor/InvestidorDashboard.jsx'

import AdminLayout    from './pages/admin/AdminLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'

function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin')      return <Navigate to="/admin"      replace />
  if (user.role === 'investidor') return <Navigate to="/investidor" replace />
  return <Navigate to="/tomador" replace />
}

function Router() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login"           element={<Login />} />
      <Route path="/auth/callback"   element={<AuthCallback />} />
      <Route path="/unauthorized"    element={<Unauthorized />} />

      {/* Redirect raiz */}
      <Route path="/" element={<RootRedirect />} />

      {/* Tomador */}
      <Route path="/tomador" element={
        <ProtectedRoute roles={['tomador']}>
          <TomadorLayout />
        </ProtectedRoute>
      }>
        <Route index element={<TomadorDashboard />} />
        <Route path="cadastro"    element={<CadastroPerfil />} />
        {/* Sprint 2+ */}
        <Route path="solicitacao" element={<div className="page"><p>🚧 Solicitação — Sprint 2</p></div>} />
        <Route path="documentos"  element={<div className="page"><p>🚧 Documentos — Sprint 2</p></div>} />
        <Route path="status"      element={<div className="page"><p>🚧 Status — Sprint 2</p></div>} />
      </Route>

      {/* Investidor */}
      <Route path="/investidor" element={
        <ProtectedRoute roles={['investidor']}>
          <InvestidorLayout />
        </ProtectedRoute>
      }>
        <Route index element={<InvestidorDashboard />} />
        {/* Sprint 3+ */}
        <Route path="solicitacoes" element={<div className="page"><p>🚧 Solicitações — Sprint 5</p></div>} />
        <Route path="cobrancas"    element={<div className="page"><p>🚧 Cobranças — Sprint 9</p></div>} />
        <Route path="agenda"       element={<div className="page"><p>🚧 Agenda — Sprint 9</p></div>} />
        <Route path="clientes"     element={<div className="page"><p>🚧 Clientes — Sprint 8</p></div>} />
        <Route path="calculadora"  element={<div className="page"><p>🚧 Calculadora — Sprint 3</p></div>} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        {/* Sprint 10+ */}
        <Route path="usuarios"   element={<div className="page"><p>🚧 Usuários — Sprint 10</p></div>} />
        <Route path="servicos"   element={<div className="page"><p>🚧 Serviços — Sprint 10</p></div>} />
        <Route path="financeiro" element={<div className="page"><p>🚧 Financeiro — Sprint 10</p></div>} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  )
}
