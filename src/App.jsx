import { Routes, Route, Navigate } from 'react-router-dom'

// placeholder pages — serão substituídas no Sprint 2+
function Login() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>V8 Exclusive</h1>
        <p style={{ color: '#888' }}>Plataforma de crédito — em construção 🚧</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
