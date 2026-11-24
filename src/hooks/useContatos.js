import { useState, useEffect } from 'react'
import { api } from '../utils/api.js'

export function useContatos() {
  const [contatos, setContatos] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  async function load() {
    try {
      setLoading(true)
      const data = await api.get('/api/tomador/contatos')
      setContatos(data.contatos)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function criar(dados) {
    const data = await api.post('/api/tomador/contatos', dados)
    setContatos(prev => [...prev, data.contato])
    return data.contato
  }

  async function atualizar(id, dados) {
    const data = await api.put(`/api/tomador/contatos/${id}`, dados)
    setContatos(prev => prev.map(c => c.id === id ? data.contato : c))
    return data.contato
  }

  async function remover(id) {
    await api.delete(`/api/tomador/contatos/${id}`)
    setContatos(prev => prev.filter(c => c.id !== id))
  }

  return { contatos, loading, error, criar, atualizar, remover, reload: load }
}
