import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function RodasHolos() {
  const { perfil } = useAuth()
  const navigate = useNavigate()
  const [rodas, setRodas] = useState([])
  const [loading, setLoading] = useState(true)
  const [aba, setAba] = useState('proximas')

  const isPremium = perfil?.plano === 'Premium'

  useEffect(() => { carregarRodas() }, [])

  async function carregarRodas() {
    const hoje = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('rodas_holos')
      .select('*')
      .order('data', { ascending: true })
    setRodas(data || [])
    setLoading(false)
  }

  if (!isPremium) return (
    <div className="page-content" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌀</div>
      <h2 className="page-title">Rodas Holos</h2>
      <p className="page-subtitle">Encontros que transformam.</p>
      <div className="locked-card">
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔒</div>
        <p style={{ fontWeight: '600', marginBottom: '6px' }}>Exclusivo para Premium</p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
          Participe de encontros online ao vivo com temas que tocam sua jornada. Acesso ao grupo WhatsApp com o link da transmissão.
        </p>
        <button className="btn btn-gold" onClick={() => navigate('/premium')}>
          Conhecer o Premium
        </button>
      </div>
    </div>
  )

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  const hoje = new Date().toISOString().split('T')[0]
  const proximas = rodas.filter(r => r.data >= hoje && r.status !== 'Cancelada')
  const anteriores = rodas.filter(r => r.data < hoje || r.status === 'Realizada')

  return (
    <div className="page-content">
      <h2 className="page-title">Rodas Holos</h2>
      <p className="page-subtitle">Encontros que transformam. Ao vivo, com presença.</p>

      <div className="tabs">
        <button className={`tab ${aba === 'proximas' ? 'active' : ''}`} onClick={() => setAba('proximas')}>
          Próximas {proximas.length > 0 && `(${proximas.length})`}
        </button>
        <button className={`tab ${aba === 'anteriores' ? 'active' : ''}`} onClick={() => setAba('anteriores')}>
          Anteriores
        </button>
      </div>

      {aba === 'proximas' && (
        proximas.length === 0
          ? <EmptyState texto="Nenhuma roda agendada no momento. Em breve novos encontros." />
          : proximas.map(r => <CardRoda key={r.id} roda={r} proxima />)
      )}

      {aba === 'anteriores' && (
        anteriores.length === 0
          ? <EmptyState texto="Nenhuma roda anterior ainda." />
          : anteriores.map(r => <CardRoda key={r.id} roda={r} proxima={false} />)
      )}
    </div>
  )
}

function CardRoda({ roda, proxima }) {
  const data = new Date(roda.data + 'T12:00:00')
  const dataFormatada = data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div className={proxima ? 'card-gold' : 'card'} style={{ marginBottom: '16px' }}>
      {proxima && (
        <span style={{ fontSize: '11px', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '10px' }}>
          ✦ Próxima Roda
        </span>
      )}

      <h3 style={{ fontSize: '18px', fontFamily: 'Playfair Display, serif', marginBottom: '8px' }}>
        {roda.tema}
      </h3>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '14px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>📅 {dataFormatada}</span>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>🕗 {roda.hora}</span>
      </div>

      {roda.facilitador && (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
          👤 Facilitado por: {roda.facilitador}
        </p>
      )}

      {proxima && roda.link_grupo_whatsapp && (
        <a
          href={roda.link_grupo_whatsapp}
          target="_blank" rel="noreferrer"
          className="btn btn-gold"
          style={{ textDecoration: 'none' }}
        >
          💬 Entrar no grupo WhatsApp
        </a>
      )}

      {!proxima && roda.link_transmissao && (
        <a
          href={roda.link_transmissao}
          target="_blank" rel="noreferrer"
          className="btn btn-outline"
          style={{ textDecoration: 'none', width: 'auto' }}
        >
          ▶️ Ver gravação
        </a>
      )}

      {!proxima && !roda.link_transmissao && (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Gravação em breve.</p>
      )}
    </div>
  )
}

function EmptyState({ texto }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>{texto}</p>
    </div>
  )
}
