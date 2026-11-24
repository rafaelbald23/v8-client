import { useState, useEffect } from 'react'
import { api } from '../utils/api.js'

export function useLGPD() {
  const [status,  setStatus]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  async function load() {
    try {
      setLoading(true)
      const data = await api.get('/api/lgpd/status')
      setStatus(data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function registrar(consentimentos) {
    const data = await api.post('/api/lgpd', { consentimentos })
    await load()
    return data
  }

  async function revogar(tipo) {
    const data = await api.delete(`/api/lgpd/${tipo}`)
    await load()
    return data
  }

  return { status, loading, error, registrar, revogar, reload: load }
}
