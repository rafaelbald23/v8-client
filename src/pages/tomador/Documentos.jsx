import { useState, useRef } from 'react'
import { useDocumentos } from '../../hooks/useDocumentos.js'

const TIPOS = [
  { value: 'rg_frente',             label: 'RG — Frente' },
  { value: 'rg_verso',              label: 'RG — Verso' },
  { value: 'cnh_frente',            label: 'CNH — Frente' },
  { value: 'cnh_verso',             label: 'CNH — Verso' },
  { value: 'cpf',                   label: 'CPF' },
  { value: 'cnpj',                  label: 'Cartão CNPJ' },
  { value: 'comprovante_residencia', label: 'Comprovante de residência' },
  { value: 'comprovante_renda',     label: 'Comprovante de renda' },
  { value: 'extrato_bancario',      label: 'Extrato bancário' },
  { value: 'outros',                label: 'Outros' },
]

const STATUS_CONFIG = {
  pendente:  { label: 'Pendente',  cls: 'badge badge--warning' },
  aprovado:  { label: 'Aprovado',  cls: 'badge badge--success' },
  rejeitado: { label: 'Rejeitado', cls: 'badge badge--danger'  },
}

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function DropZone({ onFile }) {
  const [drag, setDrag] = useState(false)
  const inputRef = useRef()

  function handleDrop(e) {
    e.preventDefault()
    setDrag(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  return (
    <div
      className={`dropzone${drag ? ' dropzone--active' : ''}`}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files[0]) onFile(e.target.files[0]) }}
      />
      <div className="dropzone__icon">📄</div>
      <p className="dropzone__text">Arraste o arquivo ou <span>clique para selecionar</span></p>
      <p className="dropzone__hint">JPG, PNG, WEBP ou PDF — máx. 10 MB</p>
    </div>
  )
}

export default function Documentos() {
  const { documentos, loading, enviar, remover } = useDocumentos()
  const [tipo,     setTipo]     = useState('rg_frente')
  const [arquivo,  setArquivo]  = useState(null)
  const [sending,  setSending]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  async function handleEnviar() {
    if (!arquivo) return setError('Selecione um arquivo')
    setError(''); setSuccess(''); setSending(true)
    try {
      await enviar(tipo, arquivo)
      setArquivo(null)
      setSuccess('Documento enviado com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  async function handleRemover(id) {
    if (!confirm('Remover este documento?')) return
    try { await remover(id) } catch (e) { setError(e.message) }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Documentos</h1>
        <p className="page-subtitle">Envie os documentos necessários para análise</p>
      </div>

      {/* Upload */}
      <div className="card">
        <h2 className="section-title">Enviar documento</h2>

        <label className="form-label" style={{ maxWidth: 320, marginBottom: 16 }}>
          Tipo do documento
          <select className="form-input" value={tipo} onChange={e => setTipo(e.target.value)}>
            {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>

        <DropZone onFile={setArquivo} />

        {arquivo && (
          <div className="file-preview">
            <span className="file-preview__name">📎 {arquivo.name}</span>
            <span className="file-preview__size">{formatBytes(arquivo.size)}</span>
            <button className="file-preview__remove" onClick={() => setArquivo(null)}>✕</button>
          </div>
        )}

        {error   && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        <div className="form-actions">
          <button
            className="btn btn--primary"
            onClick={handleEnviar}
            disabled={sending || !arquivo}
          >
            {sending ? 'Enviando...' : 'Enviar documento'}
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="card" style={{ marginTop: 16 }}>
        <h2 className="section-title">Documentos enviados</h2>

        {loading && <p className="text-muted">Carregando...</p>}

        {!loading && documentos.length === 0 && (
          <p className="text-muted">Nenhum documento enviado ainda.</p>
        )}

        {!loading && documentos.length > 0 && (
          <div className="doc-list">
            {documentos.map(doc => {
              const cfg = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pendente
              const tipoLabel = TIPOS.find(t => t.value === doc.tipo)?.label || doc.tipo
              return (
                <div key={doc.id} className="doc-item">
                  <div className="doc-item__info">
                    <span className="doc-item__tipo">{tipoLabel}</span>
                    <span className="doc-item__nome">{doc.nome_arquivo}</span>
                    <span className="doc-item__size">{formatBytes(doc.tamanho_bytes)}</span>
                  </div>
                  <div className="doc-item__right">
                    <span className={cfg.cls}>{cfg.label}</span>
                    {doc.status === 'rejeitado' && doc.rejeitado_motivo && (
                      <span className="doc-item__motivo">"{doc.rejeitado_motivo}"</span>
                    )}
                    {doc.status !== 'aprovado' && (
                      <button className="btn-icon btn-icon--danger" onClick={() => handleRemover(doc.id)} title="Remover">✕</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
