import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useDashboardInvestidor } from '../../hooks/useDashboardInvestidor.js'

function fmt(v) {
  return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

function KPI({ label, value, sub, accent }) {
  return (
    <div className="dash-kpi">
      <div className="dash-kpi__value" style={accent ? { color: 'var(--accent)' } : {}}>{value}</div>
      <div className="dash-kpi__label">{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    ativo:        'badge badge--success',
    inadimplente: 'badge badge--danger',
    quitado:      'badge badge--info',
    pendente:     'badge badge--warning',
  }
  const labels = { ativo: 'Ativo', inadimplente: 'Inadimplente', quitado: 'Quitado', pendente: 'Pendente' }
  return <span className={map[status] || 'badge badge--info'}>{labels[status] || status}</span>
}

export default function InvestidorDashboard() {
  const { user } = useAuth()
  const { data, loading, error } = useDashboardInvestidor()

  if (loading) return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>
      <p className="text-muted">Carregando...</p>
    </div>
  )

  if (error) return (
    <div className="page"><div className="form-error">{error}</div></div>
  )

  const { carteira, evolucao_mensal, proximas_cobrancas, parcelas_vencidas, contratos_recentes } = data

  const temDados = Number(carteira?.contratos_total || 0) > 0

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Olá, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Visão geral da sua carteira</p>
        </div>
        <Link to="/investidor/solicitacoes" className="btn btn--primary">
          Ver solicitações →
        </Link>
      </div>

      {/* KPIs principais */}
      <div className="dash-kpis" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <KPI
          label="Valor na rua"
          value={fmt(carteira?.valor_na_rua)}
          sub={`${carteira?.contratos_ativos || 0} contrato(s) ativo(s)`}
          accent
        />
        <KPI
          label="Retorno esperado"
          value={fmt(carteira?.retorno_esperado_total)}
          sub="Total dos contratos ativos"
        />
        <KPI
          label="Já recuperado"
          value={fmt(carteira?.valor_recuperado)}
          sub={`${carteira?.contratos_quitados || 0} contrato(s) quitado(s)`}
        />
        <KPI
          label="Inadimplentes"
          value={carteira?.contratos_inadimplentes || 0}
          sub={parcelas_vencidas.length > 0 ? `${parcelas_vencidas.length} parcela(s) vencida(s)` : 'Tudo em dia ✓'}
        />
      </div>

      {/* Alertas de cobrança */}
      {(proximas_cobrancas.length > 0 || parcelas_vencidas.length > 0) && (
        <div className="dash-alertas">
          {proximas_cobrancas.filter(p => p.vencimento === new Date().toISOString().slice(0, 10)).length > 0 && (
            <div className="dash-alerta dash-alerta--warning">
              ⚠️ {proximas_cobrancas.filter(p => p.vencimento === new Date().toISOString().slice(0, 10)).length} parcela(s) vence(m) hoje
              <Link to="/investidor/cobrancas" className="dash-alerta__link">Ver cobranças →</Link>
            </div>
          )}
          {parcelas_vencidas.length > 0 && (
            <div className="dash-alerta dash-alerta--danger">
              🔴 {parcelas_vencidas.length} parcela(s) em atraso — total: {fmt(parcelas_vencidas.reduce((s, p) => s + Number(p.valor), 0))}
              <Link to="/investidor/cobrancas" className="dash-alerta__link">Ver cobranças →</Link>
            </div>
          )}
        </div>
      )}

      {/* Evolução mensal */}
      {evolucao_mensal.length > 0 && (
        <div className="card">
          <h2 className="section-title">Recebimentos — últimos 6 meses</h2>
          <div className="evol-list">
            {evolucao_mensal.map(m => {
              const [ano, mes] = m.mes.split('-')
              const label = new Date(ano, mes - 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
              return (
                <div key={m.mes} className="evol-item">
                  <span className="evol-item__mes">{label}</span>
                  <div className="evol-item__bar-wrap">
                    <div className="evol-item__bar"
                      style={{ width: `${Math.min(100, (Number(m.recebido) / Math.max(...evolucao_mensal.map(x => Number(x.recebido)))) * 100)}%` }}
                    />
                  </div>
                  <span className="evol-item__valor">{fmt(m.recebido)}</span>
                  <span className="evol-item__count">{m.parcelas_pagas} parcela(s)</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Contratos recentes */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className="section-title" style={{ margin: 0 }}>Contratos recentes</h2>
          <Link to="/investidor/clientes" className="btn btn--secondary" style={{ fontSize: 13, padding: '6px 14px' }}>
            Ver todos
          </Link>
        </div>

        {!temDados ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <p className="text-muted">Você ainda não tem contratos.</p>
            <Link to="/investidor/solicitacoes" className="btn btn--primary" style={{ marginTop: 16, display: 'inline-flex' }}>
              Ver solicitações disponíveis
            </Link>
          </div>
        ) : contratos_recentes.length === 0 ? (
          <p className="text-muted">Nenhum contrato recente.</p>
        ) : (
          <div className="solicitacoes-list">
            {contratos_recentes.map(c => (
              <div key={c.id} className="solicitacao-item">
                <div className="solicitacao-item__info">
                  <span className="solicitacao-item__valor">{fmt(c.valor)}</span>
                  <span className="solicitacao-item__prazo">
                    {c.tomador_nome} · {c.prazo_meses} meses · {(c.taxa_juros_mes * 100).toFixed(2)}% a.m. · {fmtDate(c.desembolsado_em || c.assinado_em)}
                  </span>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
