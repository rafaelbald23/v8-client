import { useState } from 'react'
import { useLGPD } from '../../hooks/useLGPD.js'

const CONSENTIMENTOS = [
  {
    tipo:         'cadastro',
    label:        'Termos de uso e pol├¡tica de privacidade',
    descricao:    'Aceito os termos de uso da plataforma V8 Exclusive e confirmo que li e concordo com a pol├¡tica de privacidade.',
    obrigatorio:  true,
  },
  {
    tipo:         'analise_credito',
    label:        'An├ílise de cr├®dito',
    descricao:    'Autorizo a V8 Exclusive a consultar e processar meus dados financeiros para fins de an├ílise de cr├®dito, incluindo consultas a bureaus de cr├®dito.',
    obrigatorio:  true,
  },
  {
    tipo:         'open_finance',
    label:        'Open Finance',
    descricao:    'Autorizo o compartilhamento dos meus dados banc├írios via Open Finance para an├ílise automatizada de extratos e movimenta├º├Áes.',
    obrigatorio:  false,
  },
  {
    tipo:         'comunicacao',
    label:        'Comunica├º├Áes e notifica├º├Áes',
    descricao:    'Aceito receber comunica├º├Áes sobre o andamento da minha solicita├º├úo, cobran├ºas e ofertas da plataforma por e-mail e WhatsApp.',
    obrigatorio:  false,
  },
  {
    tipo:         'compartilhamento_dados',
    label:        'Compartilhamento com investidores',
    descricao:    'Autorizo o compartilhamento do meu dossi├¬ financeiro (anonimizado) com investidores cadastrados na plataforma para fins de an├ílise de investimento.',
    obrigatorio:  false,
  },
]

export default function Privacidade() {
  const { status, loading, error, registrar } = useLGPD()
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
    if (obrigatorio && checks[tipo]) return // obrigat├│rio n├úo pode desmarcar
    setChecks(prev => ({ ...prev, [tipo]: !prev[tipo] }))
  }

  async function handleSalvar() {
    // Verifica obrigat├│rios
    const faltam = CONSENTIMENTOS.filter(c => c.obrigatorio && !checks[c.tipo])
    if (faltam.length > 0) {
      setMsg(`Aceite os consentimentos obrigat├│rios: ${faltam.map(c => c.label).join(', ')}`)
      return
    }

    setSaving(true); setMsg('')
    try {
      const payload = CONSENTIMENTOS.map(c => ({ tipo: c.tipo, aceito: !!checks[c.tipo] }))
      await registrar(payload)
      setMsg('Prefer├¬ncias de privacidade salvas com sucesso!')
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
        <p className="page-subtitle">Gerencie como seus dados s├úo usados na plataforma</p>
      </div>

      {!podeProsseguir && (
        <div className="lgpd-alert">
          ÔÜá´©Å Voc├¬ precisa aceitar os consentimentos obrigat├│rios para prosseguir com a solicita├º├úo de cr├®dito.
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
                      ? <span className="badge badge--danger">Obrigat├│rio</span>
                      : <span className="badge badge--info">Opcional</span>
                    }
                  </div>
                  <p className="lgpd-item__desc">{c.descricao}</p>
                  {registrado && (
                    <p className="lgpd-item__data">
                      {registrado.aceito ? 'Ô£ô Aceito' : 'Ô£ù Revogado'} em {new Date(registrado.criado_em).toLocaleDateString('pt-BR')}
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
            {saving ? 'Salvando...' : 'Salvar prefer├¬ncias'}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 className="section-title">Seus direitos (LGPD)</h2>
        <ul className="lgpd-direitos">
          <li>Ô£ô Voc├¬ pode revogar consentimentos opcionais a qualquer momento</li>
          <li>Ô£ô Seus dados s├úo armazenados com criptografia</li>
          <li>Ô£ô Nenhum dado ├® compartilhado sem sua autoriza├º├úo pr├®via</li>
          <li>Ô£ô Para solicitar exclus├úo de dados, entre em contato: privacidade@v8exclusive.com.br</li>
        </ul>
      </div>
    </div>
  )
}
