import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useDashboardTomador } from '../../hooks/useDashboardTomador.js'

function formatCurrency(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

const STATUS_SOLICITACAO = {
  aguardando_analise:  { label: 'Aguardando análise', cls: 'badge badge--warning' },
  em_analise:          { label: 'Em análise',          cls: 'badge badge--info'    },
  aprovada:            { label: 'Aprovada',             cls: 'badge badge--success' },
  recusada:            { label: 'Recusada',             cls: 'badge badge--danger'  },
  aguardando_contrato: { label: 'Aguardando contrato',  cls: 'badge badge--warning' },
  contrato_assinado:   { label: 'Contrato assinado',    cls: 'badge badge--info'    },
  desembolsada:        { label: 'Desembolsada',         cls: 'badge badge--success' },
  cancelada:           { label: 'Cancelada',            cls: 'badge badge--danger'  },
}

function StepItem({ step }) {
  return (
    <Link to={step.href} className={`onboard-step ${step.completo ? 'onboard-step--done' : 'onboard-step--pending'}`}>
      <div className="onboard-step__icon">
        {step.completo ? '✓' : '○'}
      </div>
      <span className="onboard-step__label">{step.label}</span>
      {!step.completo && <span className="onboard-step__cta">Completar →</span>}
    </Link>
  )
}

export default function TomadorDashboard() {
  const { user } = useAuth()
  const { data, loading, error } = useDashboardTomador()

  if (loading) return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Olá, {user?.name?.split(' ')[0]} 👋</h1>
      </div>
      <p className="text-muted">Carregando...</p>
    </div>
  )

  if (error) return (
    <div className="page">
      <div className="form-error">{error}</div>
    </div>
  )

  const { onboarding, resumo, solicitacoes, taxa } = data

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Olá, {data.user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">
            {onboarding.pode_solicitar
              ? 'Sua conta está pronta. Faça sua solicitação de crédito.'
              : 'Complete as etapas abaixo para solicitar crédito.'}
          </p>
        </div>
        {onboarding.pode_solicitar && (
          <Link to="/tomador/solicitacao" className="btn btn--primary">
            Nova solicitação →
          </Link>
        )}
      </div>

      {/* Progresso do onboarding */}
      <div className="card">
        <div className="dash-progress-header">
          <h2 className="section-title" style={{ margin: 0 }}>
            Preparação da conta
          </h2>
          <span className="dash-progress-pct">{onboarding.percentual}%</span>
        </div>

        <div className="dash-progress-bar">
          <div className="dash-progress-bar__fill" style={{ width: `${onboarding.percentual}%` }} />
        </div>

        <div className="onboard-steps">
          {onboarding.steps.map(step => (
            <StepItem key={step.id} step={step} />
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="dash-kpis">
        <div className="dash-kpi">
          <div className="dash-kpi__value">{resumo.docs_enviados}</div>
          <div className="dash-kpi__label">Docs enviados</div>
        </div>
        <div className="dash-kpi">
          <div className="dash-kpi__value">{resumo.docs_aprovados}</div>
          <div className="dash-kpi__label">Docs aprovados</div>
        </div>
        <div className="dash-kpi">
          <div className="dash-kpi__value">{resumo.contatos}</div>
          <div className="dash-kpi__label">Contatos cadastrados</div>
        </div>
        <div className="dash-kpi">
          <div className="dash-kpi__value">
            {taxa?.status === 'pago'
              ? <span style={{ color: 'var(--success)' }}>✓ Paga</span>
              : <span style={{ color: 'var(--warning)' }}>Pendente</span>}
          </div>
          <div className="dash-kpi__label">Taxa de acesso</div>
        </div>
      </div>

      {/* Solicitações recentes */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className="section-title" style={{ margin: 0 }}>Minhas solicitações</h2>
          {onboarding.pode_solicitar && (
            <Link to="/tomador/solicitacao" className="btn btn--secondary" style={{ fontSize: 13, padding: '6px 14px' }}>
              + Nova
            </Link>
          )}
        </div>

        {solicitacoes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <p className="text-muted">Nenhuma solicitação ainda.</p>
            {onboarding.pode_solicitar && (
              <Link to="/tomador/solicitacao" className="btn btn--primary" style={{ marginTop: 16, display: 'inline-flex' }}>
                Fazer primeira solicitação
              </Link>
            )}
          </div>
        ) : (
          <div className="solicitacoes-list">
            {solicitacoes.map(sol => {
              const cfg = STATUS_SOLICITACAO[sol.status] || { label: sol.status, cls: 'badge badge--info' }
              return (
                <div key={sol.id} className="solicitacao-item">
                  <div className="solicitacao-item__info">
                    <span className="solicitacao-item__valor">{formatCurrency(sol.valor_solicitado)}</span>
                    <span className="solicitacao-item__prazo">{sol.prazo_meses} meses · {formatDate(sol.criado_em)}</span>
                  </div>
                  <span className={cfg.cls}>{cfg.label}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
