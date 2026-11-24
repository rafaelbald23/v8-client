import { useState, useEffect } from 'react'
import { api } from '../utils/api.js'

export function useDashboardTomador() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  async function load() {
    try {
      setLoading(true)
      const res = await api.get('/api/tomador/dashboard')
      setData(res)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return { data, loading, error, reload: load }
}
