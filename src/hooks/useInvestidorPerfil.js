import { useState, useEffect } from 'react'
import { api } from '../utils/api.js'

export function useInvestidorPerfil() {
  const [perfil,  setPerfil]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  async function load() {
    try {
      setLoading(true)
      const data = await api.get('/api/investidor/perfil')
      setPerfil(data.perfil)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function salvar(dados) {
    const data = await api.put('/api/investidor/perfil', dados)
    setPerfil(data.perfil)
    return data.perfil
  }

  return { perfil, loading, error, salvar, reload: load }
}
