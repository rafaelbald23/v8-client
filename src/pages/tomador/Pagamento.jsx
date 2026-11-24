import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePagamentoTaxa } from '../../hooks/usePagamento.js'

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatExpiry(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
}

export default function Pagamento() {
  const navigate = useNavigate()
  const { status, loading, error, gerarCobranca, simularPagamento } = usePagamentoTaxa()
  const [gerando,    setGerando]    = useState(false)
  const [copiado,    setCopiado]    = useState(false)
  const [simulando,  setSimulando]  = useState(false)
  const [localError, setLocalError] = useState('')
  const isDev = import.meta.env.DEV

  async function handleGerar() {
    setLocalError(''); setGerando(true)
    try { await gerarCobranca() }
    catch (e) { setLocalError(e.message) }
    finally { setGerando(false) }
  }

  async function handleCopiar(texto) {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch { setLocalError('Não foi possível copiar. Copie manualmente.') }
  }

  async function handleSimular() {
    if (!status?.order?.id) return
    setSimulando(true)
    try {
      await simularPagamento(status.order.id)
    } catch (e) { setLocalError(e.message) }
    finally { setSimulando(false) }
  }

  if (loading) return <div className="page"><p className="text-muted">Carregando...</p></div>
  if (error)   return <div className="page"><div className="form-error">{error}</div></div>

  const { servico, order, pago } = status || {}

  // ── Já pagou ─────────────────────────────────────────────────
  if (pago) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Taxa de cadastro</h1>
        </div>
        <div className="card pix-success">
          <div className="pix-success__icon">✅</div>
          <h2>Pagamento confirmado!</h2>
          <p>Sua conta está ativa. Agora você pode fazer sua solicitação de crédito.</p>
          <button className="btn btn--primary" onClick={() => navigate('/tomador/solicitacao')}>
            Fazer solicitação →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Taxa de cadastro</h1>
        <p className="page-subtitle">Pague a taxa para ativar sua conta e solicitar crédito</p>
      </div>

      {localError && <div className="form-error">{localError}</div>}

      {/* Info do serviço */}
      {servico && (
        <div className="card pix-info-card">
          <div className="pix-info-card__header">
            <div>
              <h2 className="pix-info-card__titulo">{servico.nome}</h2>
              <p className="pix-info-card__desc">{servico.descricao}</p>
            </div>
            <div className="pix-info-card__valor">{formatCurrency(servico.valor)}</div>
          </div>
          <ul className="pix-info-card__items">
            <li>✓ Análise financeira automatizada</li>
            <li>✓ Processamento de documentos</li>
            <li>✓ Acesso completo à plataforma</li>
            <li>✓ Pagamento único — sem mensalidade</li>
          </ul>
        </div>
      )}

      {/* Sem cobrança ainda */}
      {!order && (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <p className="text-muted" style={{ marginBottom: 20 }}>
            Clique abaixo para gerar o QR Code Pix
          </p>
          <button className="btn btn--primary" onClick={handleGerar} disabled={gerando}>
            {gerando ? 'Gerando...' : 'Gerar pagamento Pix'}
          </button>
        </div>
      )}

      {/* Cobrança pendente */}
      {order && order.status === 'pendente' && (
        <div className="card pix-card">
          <div className="pix-card__header">
            <span className="badge badge--warning">Aguardando pagamento</span>
            {order.expires_at && (
              <span className="pix-card__expiry">Expira em {formatExpiry(order.expires_at)}</span>
            )}
          </div>

          {/* QR Code */}
          {order.pix_qr_code && (
            <div className="pix-qr">
              <img src={order.pix_qr_code} alt="QR Code Pix" className="pix-qr__img" />
              <p className="pix-qr__label">Escaneie com o app do seu banco</p>
            </div>
          )}

          {/* Pix Copia e Cola */}
          {order.pix_copia_cola && (
            <div className="pix-copy">
              <p className="pix-copy__label">Pix Copia e Cola</p>
              <div className="pix-copy__box">
                <code className="pix-copy__code">{order.pix_copia_cola}</code>
                <button
                  className={`btn btn--secondary ${copiado ? 'btn--success' : ''}`}
                  onClick={() => handleCopiar(order.pix_copia_cola)}
                >
                  {copiado ? '✓ Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>
          )}

          <p className="pix-card__hint">
            O pagamento é confirmado automaticamente. Esta página atualiza sozinha.
          </p>

          {/* Botão de simulação — só em dev */}
          {isDev && (
            <div className="pix-dev-hint">
              <p>🛠️ Modo desenvolvimento</p>
              <button className="btn btn--secondary" onClick={handleSimular} disabled={simulando}>
                {simulando ? 'Simulando...' : 'Simular pagamento confirmado'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Cobrança expirada */}
      {order && order.status === 'expirado' && (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <p className="text-muted" style={{ marginBottom: 16 }}>O QR Code expirou. Gere um novo.</p>
          <button className="btn btn--primary" onClick={handleGerar} disabled={gerando}>
            {gerando ? 'Gerando...' : 'Gerar novo QR Code'}
          </button>
        </div>
      )}
    </div>
  )
}
