import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

const TOKEN_KEY    = 'v8_token'
const USER_KEY     = 'v8_user'
const ONBOARD_KEY  = 'v8_onboarding'

function loadSession() {
  try {
    const token     = localStorage.getItem(TOKEN_KEY)
    const user      = JSON.parse(localStorage.getItem(USER_KEY)     || 'null')
    const onboarding = JSON.parse(localStorage.getItem(ONBOARD_KEY) || 'null')
    return token && user ? { token, user, onboarding } : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadSession())

  const login = useCallback((token, user, onboarding = null) => {
    localStorage.setItem(TOKEN_KEY,   token)
    localStorage.setItem(USER_KEY,    JSON.stringify(user))
    localStorage.setItem(ONBOARD_KEY, JSON.stringify(onboarding))
    setSession({ token, user, onboarding })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(ONBOARD_KEY)
    setSession(null)
  }, [])

  // Atualiza apenas o onboarding (chamado ap├│s pagamento confirmado)
  const updateOnboarding = useCallback((onboarding) => {
    localStorage.setItem(ONBOARD_KEY, JSON.stringify(onboarding))
    setSession(prev => prev ? { ...prev, onboarding } : prev)
  }, [])

  return (
    <AuthContext.Provider value={{
      session,
      user:        session?.user       ?? null,
      token:       session?.token      ?? null,
      onboarding:  session?.onboarding ?? null,
      login,
      logout,
      updateOnboarding,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
