const BASE = import.meta.env.VITE_API_URL || '/api'

function getToken() {
  return localStorage.getItem('v8_token')
}

async function request(method, path, body) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })

  if (res.status === 401) {
    // Token expirado — limpa sessão e recarrega
    localStorage.removeItem('v8_token')
    localStorage.removeItem('v8_user')
    window.location.href = '/login'
    return
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`)
  return data
}

export const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  put:    (path, body)  => request('PUT',    path, body),
  patch:  (path, body)  => request('PATCH',  path, body),
  delete: (path)        => request('DELETE', path),
}

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  register: (data)   => api.post('/api/auth/register', data),
  login:    (data)   => api.post('/api/auth/login',    data),
  me:       ()       => api.get('/api/auth/me'),
  logout:   ()       => api.post('/api/auth/logout'),
}
