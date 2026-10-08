import { useEffect, useState } from 'react'
import { getMe, MeResponse } from '../api/client'

export default function DashboardPage() {
  const [me,      setMe]      = useState<MeResponse | null>(null)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMe()
      .then(r => setMe(r.data))
      .catch(e => setError(e.response?.data?.error ?? 'Erro ao carregar dados.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageShell><Spinner /></PageShell>
  if (error)   return <PageShell><ErrorBox msg={error} /></PageShell>
  if (!me)     return null

  const roleLabel: Record<string, string> = {
    Member:    'Membro',
    Officer:   'Oficial',
    SubLeader: 'Sub-Líder',
    Leader:    'Líder',
  }

  return (
    <PageShell>
      <h2 style={titleStyle}>Painel do Personagem</h2>

      <div style={gridStyle}>
        {/* Card: Personagem */}
        <Card title="Personagem">
          <Row label="Nome"   value={me.name} />
          <Row label="Status" value={me.online ? '🟢 Online' : '⚫ Offline'} />
        </Card>

        {/* Card: Facção */}
        <Card title="Facção">
          {me.factionId > 0 ? (
            <>
              <Row label="Facção" value={me.factionName} />
              <Row label="Cargo"  value={roleLabel[me.factionRole] ?? me.factionRole} />
            </>
          ) : (
            <p style={{ color: '#7a6a4a', fontSize: 13 }}>Sem facção</p>
          )}
        </Card>

        {/* Card: Moedas */}
        <Card title="Tesouro">
          <div style={{ display: 'flex', gap: 24, marginTop: 4 }}>
            <CoinBadge amount={me.coins.gold}   label="Ouro"  color="#c8a84b" />
            <CoinBadge amount={me.coins.silver} label="Prata" color="#b0b8c8" />
            <CoinBadge amount={me.coins.copper} label="Cobre" color="#c87850" />
          </div>
          <p style={{ color: '#5a4a2a', fontSize: 11, marginTop: 12 }}>
            Total: {me.coins.totalCopper.toLocaleString('pt-BR')} cobre
          </p>
        </Card>
      </div>
    </PageShell>
  )
}

// ── Sub-componentes ───────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto' }}>
      {children}
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#12100c',
      border: '1px solid #3a2e18',
      borderRadius: 6,
      padding: 20,
    }}>
      <h3 style={{ color: '#c8a84b', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ color: '#7a6a4a', fontSize: 13 }}>{label}</span>
      <span style={{ color: '#d4c5a9', fontSize: 13 }}>{value}</span>
    </div>
  )
}

function CoinBadge({ amount, label, color }: { amount: number; label: string; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ color, fontSize: 22, fontWeight: 'bold' }}>{amount}</div>
      <div style={{ color: '#7a6a4a', fontSize: 11 }}>{label}</div>
    </div>
  )
}

function Spinner() {
  return <p style={{ color: '#7a6a4a' }}>Carregando...</p>
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div style={{
      background: 'rgba(180,40,40,0.1)',
      border: '1px solid #8b2020',
      borderRadius: 4,
      padding: 12,
      color: '#e07070',
    }}>
      {msg}
    </div>
  )
}

const titleStyle: React.CSSProperties = {
  color: '#c8a84b',
  fontSize: 18,
  letterSpacing: 2,
  marginBottom: 24,
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  gap: 16,
}
