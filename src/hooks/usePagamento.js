import { useState, useEffect, useRef } from 'react'
import { api } from '../utils/api.js'

export function usePagamentoTaxa() {
  const [status,  setStatus]  = useState(null)  // { servico, order, pago }
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const pollRef = useRef(null)

  async function load() {
    try {
      setLoading(true)
      const data = await api.get('/api/pagamento/taxa')
      setStatus(data)
      if (data.order?.status === 'pendente') iniciarPolling(data.order.id)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  function iniciarPolling(orderId) {
    if (pollRef.current) return
    pollRef.current = setInterval(async () => {
      try {
        const data = await api.get(`/api/pagamento/${orderId}/status`)
        if (data.order.status === 'pago') {
          setStatus(prev => ({ ...prev, order: data.order, pago: true }))
          clearInterval(pollRef.current)
          pollRef.current = null
        }
      } catch { /* silencia erros de polling */ }
    }, 5000) // verifica a cada 5s
  }

  useEffect(() => {
    load()
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  async function gerarCobranca() {
    const data = await api.post('/api/pagamento/taxa')
    setStatus(prev => ({ ...prev, order: data.order }))
    if (data.order.status === 'pendente') iniciarPolling(data.order.id)
    return data.order
  }

  async function simularPagamento(orderId) {
    await api.post(`/api/pagamento/${orderId}/simular-pagamento`)
    await load()
  }

  return { status, loading, error, gerarCobranca, simularPagamento, reload: load }
}
