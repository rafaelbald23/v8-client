import { useState, useEffect } from 'react'
import { api } from '../utils/api.js'

export function useTomadorPerfil() {
  const [perfil,  setPerfil]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  async function load() {
    try {
      setLoading(true)
      const data = await api.get('/api/tomador/perfil')
      setPerfil(data.perfil)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function salvar(dados) {
    const data = await api.put('/api/tomador/perfil', dados)
    setPerfil(data.perfil)
    return data.perfil
  }

  return { perfil, loading, error, salvar, reload: load }
}
