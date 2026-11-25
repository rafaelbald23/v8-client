import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useInvestidorPerfil } from '../../hooks/useInvestidorPerfil.js'
import { maskCPFCNPJ, maskPhone, maskCEP, onlyDigits } from '../../utils/masks.js'

export default function InvestidorPerfil() {
  const { user } = useAuth()
  const { perfil, loading, salvar } = useInvestidorPerfil()
  const [form, setForm]     = useState({
    name: '', cpf_cnpj: '', tipo_pessoa: 'pf',
    telefone: '', whatsapp: '', cep: '', cidade: '', estado: '',
  })
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState('')
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (perfil) {
      setForm(f => ({
        ...f,
        name:        perfil.name        || user?.name || '',
        cpf_cnpj:    perfil.cpf_cnpj    || '',
        tipo_pessoa: perfil.tipo_pessoa || 'pf',
        telefone:    perfil.telefone    || '',
        whatsapp:    perfil.whatsapp    || '',
        cep:         perfil.cep         || '',
        cidade:      perfil.cidade      || '',
        estado:      perfil.estado      || '',
      }))
    }
  }, [perfil, user])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSalvar(e) {
    e.preventDefault()
    setError(''); setMsg(''); setSaving(true)
    try {
      await salvar({
        ...form,
        cpf_cnpj: onlyDigits(form.cpf_cnpj),
        telefone: onlyDigits(form.telefone),
        whatsapp: onlyDigits(form.whatsapp),
        cep:      onlyDigits(form.cep),
      })
      setMsg('Perfil atualizado com sucesso!')
      setTimeout(() => setMsg(''), 3000)
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
        <h1 className="page-title">Meu perfil</h1>
        <p className="page-subtitle">{user?.email}</p>
      </div>

      <form onSubmit={handleSalvar}>
        <div className="card">
          <h2 className="section-title">Dados pessoais</h2>
          <div className="form-grid">
            <label className="form-label form-label--full">
              Nome completo
              <input className="form-input" value={form.name}
                onChange={e => set('name', e.target.value)} />
            </label>

            <label className="form-label">
              Tipo de pessoa
              <select className="form-input" value={form.tipo_pessoa}
                onChange={e => set('tipo_pessoa', e.target.value)}>
                <option value="pf">Pessoa física</option>
                <option value="pj">Pessoa jurídica</option>
              </select>
            </label>

            <label className="form-label">
              {form.tipo_pessoa === 'pf' ? 'CPF' : 'CNPJ'}
              <input className="form-input"
                value={maskCPFCNPJ(form.cpf_cnpj)}
                onChange={e => set('cpf_cnpj', e.target.value)}
                placeholder={form.tipo_pessoa === 'pf' ? '000.000.000-00' : '00.000.000/0001-00'} />
            </label>

            <label className="form-label">
              Telefone
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
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h2 className="section-title">Localização</h2>
          <div className="form-grid">
            <label className="form-label">
              CEP
              <input className="form-input"
                value={maskCEP(form.cep)}
                onChange={e => set('cep', e.target.value)}
                placeholder="00000-000" />
            </label>
            <label className="form-label">
              Cidade
              <input className="form-input" value={form.cidade}
                onChange={e => set('cidade', e.target.value)} />
            </label>
            <label className="form-label">
              Estado
              <select className="form-input" value={form.estado}
                onChange={e => set('estado', e.target.value)}>
                <option value="">Selecione</option>
                {['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
                  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']
                  .map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </label>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}
        {msg   && <div className="form-success">{msg}</div>}

        <div className="form-actions" style={{ marginTop: 16 }}>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar perfil'}
          </button>
        </div>
      </form>
    </div>
  )
}
