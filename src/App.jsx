import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'

import Login           from './pages/Login.jsx'
import Unauthorized    from './pages/Unauthorized.jsx'
import AuthCallback    from './components/AuthCallback.jsx'
import ProtectedRoute  from './components/ProtectedRoute.jsx'
import OnboardingGuard from './components/OnboardingGuard.jsx'

import TomadorLayout    from './pages/tomador/TomadorLayout.jsx'
import TomadorDashboard from './pages/tomador/TomadorDashboard.jsx'
import CadastroPerfil   from './pages/tomador/CadastroPerfil.jsx'
import Documentos       from './pages/tomador/Documentos.jsx'
import Contatos         from './pages/tomador/Contatos.jsx'
import Privacidade      from './pages/tomador/Privacidade.jsx'
import Pagamento        from './pages/tomador/Pagamento.jsx'

import InvestidorLayout    from './pages/investidor/InvestidorLayout.jsx'
import InvestidorDashboard from './pages/investidor/InvestidorDashboard.jsx'

import AdminLayout    from './pages/admin/AdminLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'

function RootRedirect() {
  const { user, onboarding } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin')      return <Navigate to="/admin"      replace />
  if (user.role === 'investidor') return <Navigate to="/investidor" replace />
  // Tomador pendente vai direto para o pagamento
  if (user.role === 'tomador' && !onboarding?.ativo)
    return <Navigate to="/tomador/pagamento" replace />
  return <Navigate to="/tomador" replace />
}

function Router() {
  return (
    <Routes>
      <Route path="/login"         element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/unauthorized"  element={<Unauthorized />} />
      <Route path="/" element={<RootRedirect />} />

      {/* Tomador ÔÇö envolto no OnboardingGuard */}
      <Route path="/tomador" element={
        <ProtectedRoute roles={['tomador']}>
          <OnboardingGuard>
            <TomadorLayout />
          </OnboardingGuard>
        </ProtectedRoute>
      }>
        <Route index                element={<TomadorDashboard />} />
        <Route path="cadastro"      element={<CadastroPerfil />} />
        <Route path="documentos"    element={<Documentos />} />
        <Route path="contatos"      element={<Contatos />} />
        <Route path="privacidade"   element={<Privacidade />} />
        <Route path="pagamento"     element={<Pagamento />} />
        <Route path="solicitacao"   element={<div className="page"><p>­ƒÜº Solicita├º├úo ÔÇö Sprint 2</p></div>} />
        <Route path="status"        element={<div className="page"><p>­ƒÜº Status ÔÇö Sprint 2</p></div>} />
      </Route>

      {/* Investidor */}
      <Route path="/investidor" element={
        <ProtectedRoute roles={['investidor']}><InvestidorLayout /></ProtectedRoute>
      }>
        <Route index element={<InvestidorDashboard />} />
        <Route path="solicitacoes" element={<div className="page"><p>­ƒÜº Solicita├º├Áes ÔÇö Sprint 5</p></div>} />
        <Route path="cobrancas"    element={<div className="page"><p>­ƒÜº Cobran├ºas ÔÇö Sprint 9</p></div>} />
        <Route path="agenda"       element={<div className="page"><p>­ƒÜº Agenda ÔÇö Sprint 9</p></div>} />
        <Route path="clientes"     element={<div className="page"><p>­ƒÜº Clientes ÔÇö Sprint 8</p></div>} />
        <Route path="calculadora"  element={<div className="page"><p>­ƒÜº Calculadora ÔÇö Sprint 3</p></div>} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="usuarios"   element={<div className="page"><p>­ƒÜº Usu├írios ÔÇö Sprint 10</p></div>} />
        <Route path="servicos"   element={<div className="page"><p>­ƒÜº Servi├ºos ÔÇö Sprint 10</p></div>} />
        <Route path="financeiro" element={<div className="page"><p>­ƒÜº Financeiro ÔÇö Sprint 10</p></div>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return <AuthProvider><Router /></AuthProvider>
}
