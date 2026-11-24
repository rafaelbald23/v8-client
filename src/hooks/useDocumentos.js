import { useState, useEffect } from 'react'

const BASE = import.meta.env.VITE_API_URL || '/api'

function getToken() {
  return localStorage.getItem('v8_token')
}

export function useDocumentos() {
  const [documentos, setDocumentos] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  async function load() {
    try {
      setLoading(true)
      const r = await fetch(`${BASE}/api/tomador/documentos`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error)
      setDocumentos(data.documentos)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function enviar(tipo, arquivo) {
    const form = new FormData()
    form.append('tipo', tipo)
    form.append('arquivo', arquivo)

    const r = await fetch(`${BASE}/api/tomador/documentos`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: form,
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error)
    setDocumentos(prev => [data.documento, ...prev])
    return data.documento
  }

  async function remover(id) {
    const r = await fetch(`${BASE}/api/tomador/documentos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    if (!r.ok) {
      const data = await r.json()
      throw new Error(data.error)
    }
    setDocumentos(prev => prev.filter(d => d.id !== id))
  }

  return { documentos, loading, error, enviar, remover, reload: load }
}
