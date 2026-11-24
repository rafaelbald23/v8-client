import { useState } from 'react'
import { useContatos } from '../../hooks/useContatos.js'
import { maskPhone } from '../../utils/masks.js'

const TIPOS = [
  { value: 'familiar',              label: 'Familiar',              desc: 'Mãe, pai, cônjuge, irmão...' },
  { value: 'referencia_pessoal',    label: 'Referência pessoal',    desc: 'Amigo, vizinho...' },
  { value: 'referencia_comercial',  label: 'Referência comercial',  desc: 'Sócio, cliente, fornecedor...' },
]

const TIPO_LABEL = Object.fromEntries(TIPOS.map(t => [t.value, t.label]))

const EMPTY_FORM = { tipo: 'familiar', nome: '', telefone: '', whatsapp: '', relacao: '' }

function ContatoForm({ initial = EMPTY_FORM, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="contato-form">
      <div className="form-grid">
        <label className="form-label">
          Tipo *
          <select className="form-input" value={form.tipo} onChange={e => set('tipo', e.target.value)}>
            {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>

        <label className="form-label">
          Relação
          <input className="form-input" placeholder="Ex: mãe, amigo, sócio"
            value={form.relacao} onChange={e => set('relacao', e.target.value)} />
        </label>

        <label className="form-label form-label--full">
          Nome completo *
          <input className="form-input" value={form.nome}
            onChange={e => set('nome', e.target.value)} />
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

      <div className="form-actions">
        <button className="btn btn--secondary" onClick={onCancel} disabled={saving}>Cancelar</button>
        <button className="btn btn--primary"   onClick={() => onSave(form)} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar contato'}
        </button>
      </div>
    </div>
  )
}

function ContatoCard({ contato, onEdit, onRemove }) {
  return (
    <div className="contato-card">
      <div className="contato-card__header">
        <div>
          <span className="contato-card__nome">{contato.nome}</span>
          {contato.relacao && <span className="contato-card__relacao"> · {contato.relacao}</span>}
        </div>
        <span className="badge badge--info">{TIPO_LABEL[contato.tipo]}</span>
      </div>
      <div className="contato-card__info">
        {contato.telefone && <span>📞 {maskPhone(contato.telefone)}</span>}
        {contato.whatsapp && <span>💬 {maskPhone(contato.whatsapp)}</span>}
      </div>
      <div className="contato-card__actions">
        <button className="btn-icon" onClick={() => onEdit(contato)} title="Editar">✏️</button>
        <button className="btn-icon btn-icon--danger" onClick={() => onRemove(contato.id)} title="Remover">✕</button>
      </div>
    </div>
  )
}

export default function Contatos() {
  const { contatos, loading, error, criar, atualizar, remover } = useContatos()
  const [showForm,   setShowForm]   = useState(false)
  const [editando,   setEditando]   = useState(null)
  const [saving,     setSaving]     = useState(false)
  const [formError,  setFormError]  = useState('')

  const porTipo = tipo => contatos.filter(c => c.tipo === tipo)

  async function handleSalvar(form) {
    if (!form.nome.trim()) return setFormError('Nome é obrigatório')
    if (!form.telefone)    return setFormError('Telefone é obrigatório')
    setFormError(''); setSaving(true)
    try {
      if (editando) {
        await atualizar(editando.id, form)
        setEditando(null)
      } else {
        await criar(form)
        setShowForm(false)
      }
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleRemover(id) {
    if (!confirm('Remover este contato?')) return
    try { await remover(id) } catch (e) { setFormError(e.message) }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contatos e referências</h1>
          <p className="page-subtitle">Cadastre familiares e referências pessoais e comerciais</p>
        </div>
        {!showForm && !editando && (
          <button className="btn btn--primary" onClick={() => setShowForm(true)}>+ Adicionar</button>
        )}
      </div>

      {error    && <div className="form-error">{error}</div>}
      {formError && <div className="form-error">{formError}</div>}

      {/* Formulário de novo contato */}
      {showForm && !editando && (
        <div className="card">
          <h2 className="section-title">Novo contato</h2>
          <ContatoForm
            onSave={handleSalvar}
            onCancel={() => { setShowForm(false); setFormError('') }}
            saving={saving}
          />
        </div>
      )}

      {/* Formulário de edição */}
      {editando && (
        <div className="card">
          <h2 className="section-title">Editar contato</h2>
          <ContatoForm
            initial={editando}
            onSave={handleSalvar}
            onCancel={() => { setEditando(null); setFormError('') }}
            saving={saving}
          />
        </div>
      )}

      {/* Lista por tipo */}
      {loading && <p className="text-muted" style={{ marginTop: 24 }}>Carregando...</p>}

      {!loading && TIPOS.map(tipo => {
        const lista = porTipo(tipo.value)
        return (
          <div key={tipo.value} className="card">
            <div className="contato-section-header">
              <div>
                <h2 className="section-title" style={{ margin: 0 }}>{tipo.label}</h2>
                <p className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>{tipo.desc}</p>
              </div>
              <span className="badge badge--info">{lista.length}</span>
            </div>

            {lista.length === 0
              ? <p className="text-muted" style={{ marginTop: 12, fontSize: 13 }}>Nenhum contato cadastrado.</p>
              : (
                <div className="contato-list" style={{ marginTop: 12 }}>
                  {lista.map(c => (
                    <ContatoCard
                      key={c.id}
                      contato={c}
                      onEdit={setEditando}
                      onRemove={handleRemover}
                    />
                  ))}
                </div>
              )
            }
          </div>
        )
      })}
    </div>
  )
}
