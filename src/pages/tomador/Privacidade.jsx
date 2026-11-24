import { useState } from 'react'
import { useLGPD } from '../../hooks/useLGPD.js'

const CONSENTIMENTOS = [
  {
    tipo:         'cadastro',
    label:        'Termos de uso e política de privacidade',
    descricao:    'Aceito os termos de uso da plataforma V8 Exclusive e confirmo que li e concordo com a política de privacidade.',
    obrigatorio:  true,
  },
  {
    tipo:         'analise_credito',
    label:        'Análise de crédito',
    descricao:    'Autorizo a V8 Exclusive a consultar e processar meus dados financeiros para fins de análise de crédito, incluindo consultas a bureaus de crédito.',
    obrigatorio:  true,
  },
  {
    tipo:         'open_finance',
    label:        'Open Finance',
    descricao:    'Autorizo o compartilhamento dos meus dados bancários via Open Finance para análise automatizada de extratos e movimentações.',
    obrigatorio:  false,
  },
  {
    tipo:         'comunicacao',
    label:        'Comunicações e notificações',
    descricao:    'Aceito receber comunicações sobre o andamento da minha solicitação, cobranças e ofertas da plataforma por e-mail e WhatsApp.',
    obrigatorio:  false,
  },
  {
    tipo:         'compartilhamento_dados',
    label:        'Compartilhamento com investidores',
    descricao:    'Autorizo o compartilhamento do meu dossiê financeiro (anonimizado) com investidores cadastrados na plataforma para fins de análise de investimento.',
    obrigatorio:  false,
  },
]

export default function Privacidade() {
  const { status, loading, error, registrar, revogar } = useLGPD()
  const [saving,   setSaving]   = useState(false)
  const [msg,      setMsg]      = useState('')
  const [checks,   setChecks]   = useState({})
  const [iniciado, setIniciado] = useState(false)

  // Inicializa os checks com o estado atual
  if (status && !iniciado) {
    const init = {}
    for (const c of CONSENTIMENTOS) {
      init[c.tipo] = status.consentimentos?.[c.tipo]?.aceito ?? false
    }
    setChecks(init)
    setIniciado(true)
  }

  function toggle(tipo, obrigatorio) {
    if (obrigatorio && checks[tipo]) return // obrigatório não pode desmarcar
    setChecks(prev => ({ ...prev, [tipo]: !prev[tipo] }))
  }

  async function handleSalvar() {
    // Verifica obrigatórios
    const faltam = CONSENTIMENTOS.filter(c => c.obrigatorio && !checks[c.tipo])
    if (faltam.length > 0) {
      setMsg(`Aceite os consentimentos obrigatórios: ${faltam.map(c => c.label).join(', ')}`)
      return
    }

    setSaving(true); setMsg('')
    try {
      const payload = CONSENTIMENTOS.map(c => ({ tipo: c.tipo, aceito: !!checks[c.tipo] }))
      await registrar(payload)
      setMsg('Preferências de privacidade salvas com sucesso!')
      setTimeout(() => setMsg(''), 3000)
    } catch (e) {
      setMsg(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="page"><p className="text-muted">Carregando...</p></div>

  const podeProsseguir = status?.pode_prosseguir

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Privacidade e consentimentos</h1>
        <p className="page-subtitle">Gerencie como seus dados são usados na plataforma</p>
      </div>

      {!podeProsseguir && (
        <div className="lgpd-alert">
          ⚠️ Você precisa aceitar os consentimentos obrigatórios para prosseguir com a solicitação de crédito.
        </div>
      )}

      {error && <div className="form-error">{error}</div>}

      <div className="card">
        <div className="lgpd-list">
          {CONSENTIMENTOS.map(c => {
            const aceito = !!checks[c.tipo]
            const registrado = status?.consentimentos?.[c.tipo]
            return (
              <div key={c.tipo} className={`lgpd-item${aceito ? ' lgpd-item--aceito' : ''}`}>
                <div className="lgpd-item__content">
                  <div className="lgpd-item__header">
                    <span className="lgpd-item__label">{c.label}</span>
                    {c.obrigatorio
                      ? <span className="badge badge--danger">Obrigatório</span>
                      : <span className="badge badge--info">Opcional</span>
                    }
                  </div>
                  <p className="lgpd-item__desc">{c.descricao}</p>
                  {registrado && (
                    <p className="lgpd-item__data">
                      {registrado.aceito ? '✓ Aceito' : '✗ Revogado'} em {new Date(registrado.criado_em).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                <label className="lgpd-toggle">
                  <input
                    type="checkbox"
                    checked={aceito}
                    onChange={() => toggle(c.tipo, c.obrigatorio)}
                    disabled={c.obrigatorio && aceito}
                  />
                  <span className="lgpd-toggle__slider" />
                </label>
              </div>
            )
          })}
        </div>

        {msg && (
          <div className={msg.includes('sucesso') ? 'form-success' : 'form-error'} style={{ marginTop: 16 }}>
            {msg}
          </div>
        )}

        <div className="form-actions">
          <button className="btn btn--primary" onClick={handleSalvar} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar preferências'}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 className="section-title">Seus direitos (LGPD)</h2>
        <ul className="lgpd-direitos">
          <li>✓ Você pode revogar consentimentos opcionais a qualquer momento</li>
          <li>✓ Seus dados são armazenados com criptografia</li>
          <li>✓ Nenhum dado é compartilhado sem sua autorização prévia</li>
          <li>✓ Para solicitar exclusão de dados, entre em contato: privacidade@v8exclusive.com.br</li>
        </ul>
      </div>
    </div>
  )
}
