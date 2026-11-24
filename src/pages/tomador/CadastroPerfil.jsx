import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTomadorPerfil } from '../../hooks/useTomadorPerfil.js'
import { maskCPFCNPJ, maskPhone, maskCEP, onlyDigits } from '../../utils/masks.js'

const STEPS = ['Dados pessoais', 'Endere├ºo', 'Profiss├úo']

function StepIndicator({ current }) {
  return (
    <div className="steps">
      {STEPS.map((label, i) => (
        <div key={i} className={`steps__item ${i === current ? 'steps__item--active' : ''} ${i < current ? 'steps__item--done' : ''}`}>
          <div className="steps__circle">{i < current ? 'Ô£ô' : i + 1}</div>
          <span className="steps__label">{label}</span>
          {i < STEPS.length - 1 && <div className="steps__line" />}
        </div>
      ))}
    </div>
  )
}

export default function CadastroPerfil() {
  const navigate = useNavigate()
  const { perfil, loading, salvar } = useTomadorPerfil()
  const [step,    setStep]    = useState(0)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  const [form, setForm] = useState({
    // Passo 1 ÔÇö Dados pessoais
    name:            '',
    cpf_cnpj:        '',
    tipo_pessoa:     'pf',
    data_nascimento: '',
    telefone:        '',
    whatsapp:        '',
    // Passo 2 ÔÇö Endere├ºo
    cep:             '',
    logradouro:      '',
    numero:          '',
    complemento:     '',
    bairro:          '',
    cidade:          '',
    estado:          '',
    // Passo 3 ÔÇö Profiss├úo
    profissao:             '',
    empresa_empregadora:   '',
    renda_declarada:       '',
    tempo_emprego_meses:   '',
    finalidade_credito:    '',
  })

  // Pr├®-preenche com dados existentes
  useState(() => {
    if (perfil) setForm(f => ({ ...f, ...perfil, name: perfil.name || f.name }))
  }, [perfil])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function buscarCEP(cep) {
    const digits = onlyDigits(cep)
    if (digits.length !== 8) return
    try {
      const r = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const d = await r.json()
      if (!d.erro) {
        setForm(f => ({
          ...f,
          logradouro: d.logradouro || '',
          bairro:     d.bairro     || '',
          cidade:     d.localidade || '',
          estado:     d.uf         || '',
        }))
      }
    } catch { /* silencia ÔÇö usu├írio preenche manual */ }
  }

  async function handleSalvar() {
    setError('')
    setSaving(true)
    try {
      await salvar({
        ...form,
        cpf_cnpj:          onlyDigits(form.cpf_cnpj),
        telefone:          onlyDigits(form.telefone),
        whatsapp:          onlyDigits(form.whatsapp),
        cep:               onlyDigits(form.cep),
        renda_declarada:   form.renda_declarada ? Number(form.renda_declarada.replace(',', '.')) : null,
        tempo_emprego_meses: form.tempo_emprego_meses ? Number(form.tempo_emprego_meses) : null,
      })
      navigate('/tomador')
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="page"><p className="text-muted">Carregando...</p></div>

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Complete seu cadastro</h1>
        <p className="page-subtitle">Preencha seus dados para solicitar cr├®dito</p>
      </div>

      <StepIndicator current={step} />

      {error && <div className="form-error">{error}</div>}

      <div className="card">
        {/* ÔöÇÔöÇ Passo 1 ÔÇö Dados pessoais ÔöÇÔöÇ */}
        {step === 0 && (
          <div className="form-grid">
            <label className="form-label form-label--full">
              Nome completo *
              <input className="form-input" value={form.name}
                onChange={e => set('name', e.target.value)} />
            </label>

            <label className="form-label">
              Tipo de pessoa *
              <select className="form-input" value={form.tipo_pessoa}
                onChange={e => set('tipo_pessoa', e.target.value)}>
                <option value="pf">Pessoa f├¡sica</option>
                <option value="pj">Pessoa jur├¡dica</option>
              </select>
            </label>

            <label className="form-label">
              {form.tipo_pessoa === 'pf' ? 'CPF *' : 'CNPJ *'}
              <input className="form-input"
                value={maskCPFCNPJ(form.cpf_cnpj)}
                onChange={e => set('cpf_cnpj', e.target.value)}
                placeholder={form.tipo_pessoa === 'pf' ? '000.000.000-00' : '00.000.000/0001-00'} />
            </label>

            <label className="form-label">
              Data de nascimento
              <input className="form-input" type="date" value={form.data_nascimento}
                onChange={e => set('data_nascimento', e.target.value)} />
            </label>

            <label className="form-label">
              Telefone *
              <input className="form-input"
                value={maskPhone(form.telefone)}
                onChange={e => set('telefone', e.target.value)}
                placeholder="(00) 00000-0000" />
            </label>

            <label className="form-label">
              WhatsApp
              <input className="form-input"
                value={maskPhone(form.whatsapp)}
                onChange={e => set('whatsapp', e.target.value)}
                placeholder="(00) 00000-0000" />
            </label>
          </div>
        )}

        {/* ÔöÇÔöÇ Passo 2 ÔÇö Endere├ºo ÔöÇÔöÇ */}
        {step === 1 && (
          <div className="form-grid">
            <label className="form-label">
              CEP *
              <input className="form-input"
                value={maskCEP(form.cep)}
                onChange={e => { set('cep', e.target.value); buscarCEP(e.target.value) }}
                placeholder="00000-000" />
            </label>

            <label className="form-label form-label--full">
              Logradouro *
              <input className="form-input" value={form.logradouro}
                onChange={e => set('logradouro', e.target.value)} />
            </label>

            <label className="form-label">
              N├║mero *
              <input className="form-input" value={form.numero}
                onChange={e => set('numero', e.target.value)} />
            </label>

            <label className="form-label">
              Complemento
              <input className="form-input" value={form.complemento}
                onChange={e => set('complemento', e.target.value)} />
            </label>

            <label className="form-label">
              Bairro *
              <input className="form-input" value={form.bairro}
                onChange={e => set('bairro', e.target.value)} />
            </label>

            <label className="form-label">
              Cidade *
              <input className="form-input" value={form.cidade}
                onChange={e => set('cidade', e.target.value)} />
            </label>

            <label className="form-label">
              Estado *
              <select className="form-input" value={form.estado}
                onChange={e => set('estado', e.target.value)}>
                <option value="">Selecione</option>
                {['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
                  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']
                  .map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </label>
          </div>
        )}

        {/* ÔöÇÔöÇ Passo 3 ÔÇö Profiss├úo ÔöÇÔöÇ */}
        {step === 2 && (
          <div className="form-grid">
            <label className="form-label">
              Profiss├úo *
              <input className="form-input" value={form.profissao}
                onChange={e => set('profissao', e.target.value)} />
            </label>

            <label className="form-label">
              Empresa empregadora
              <input className="form-input" value={form.empresa_empregadora}
                onChange={e => set('empresa_empregadora', e.target.value)} />
            </label>

            <label className="form-label">
              Renda mensal (R$) *
              <input className="form-input" type="number" min="0" step="0.01"
                value={form.renda_declarada}
                onChange={e => set('renda_declarada', e.target.value)}
                placeholder="0,00" />
            </label>

            <label className="form-label">
              Tempo de emprego (meses)
              <input className="form-input" type="number" min="0"
                value={form.tempo_emprego_meses}
                onChange={e => set('tempo_emprego_meses', e.target.value)} />
            </label>

            <label className="form-label form-label--full">
              Finalidade do cr├®dito *
              <select className="form-input" value={form.finalidade_credito}
                onChange={e => set('finalidade_credito', e.target.value)}>
                <option value="">Selecione</option>
                <option value="capital_giro">Capital de giro</option>
                <option value="investimento">Investimento</option>
                <option value="quitacao_dividas">Quita├º├úo de d├¡vidas</option>
                <option value="reforma">Reforma / constru├º├úo</option>
                <option value="veiculo">Ve├¡culo</option>
                <option value="outros">Outros</option>
              </select>
            </label>
          </div>
        )}

        {/* ÔöÇÔöÇ Navega├º├úo ÔöÇÔöÇ */}
        <div className="form-actions">
          {step > 0 && (
            <button className="btn btn--secondary" onClick={() => setStep(s => s - 1)}>
              ÔåÉ Voltar
            </button>
          )}
          {step < STEPS.length - 1 && (
            <button className="btn btn--primary" onClick={() => setStep(s => s + 1)}>
              Pr├│ximo ÔåÆ
            </button>
          )}
          {step === STEPS.length - 1 && (
            <button className="btn btn--primary" onClick={handleSalvar} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar cadastro Ô£ô'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
