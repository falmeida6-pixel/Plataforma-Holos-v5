import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function ProHome() {
  const { user, perfil } = useAuth()
  const navigate = useNavigate()
  const [pro, setPro] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { carregarPro() }, [user])

  async function carregarPro() {
    const { data } = await supabase.from('profissionais').select('*').eq('user_id', user.id).single()
    setPro(data); setLoading(false)
  }

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>

  if (!pro || pro.status === 'Pendente') return (
    <div className="page-content" style={{ textAlign:'center' }}>
      <div style={{ fontSize:'48px', marginBottom:'16px' }}>⏳</div>
      <h2 className="page-title">Cadastro em análise</h2>
      <p className="page-subtitle">Seu perfil está sendo revisado. Em breve você receberá confirmação.</p>
    </div>
  )

  return (
    <div className="page-content">
      <div style={{ marginBottom:'20px' }}>
        <h2 className="page-title">Olá, {pro.nome.split(' ')[0]} 👋</h2>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <span style={{ fontSize:'13px', color:'var(--gold)' }}>✦ {pro.selo_evolucao}</span>
          {pro.plano === 'Premium' && <span className="badge badge-premium">👑 Premium</span>}
        </div>
      </div>

      <div className="card-gold" style={{ marginBottom:'20px' }}>
        <p style={{ fontSize:'11px', color:'var(--gold)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'14px' }}>✦ Resumo</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
          {[['Conteúdos aprovados', pro.conteudos_aprovados],['Matches aceitos', pro.matches_aceitos],['Avaliação média', pro.avaliacao_media > 0 ? `${pro.avaliacao_media}★` : '—'],['Indicações', pro.indicacoes_confirmadas]].map(([l,v]) => (
            <div key={l} style={{ background:'rgba(0,0,0,0.2)', borderRadius:'10px', padding:'10px 12px' }}>
              <p style={{ fontSize:'20px', fontWeight:'700', color:'var(--gold)' }}>{v}</p>
              <p style={{ fontSize:'11px', color:'var(--text-muted)' }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-gold" onClick={() => navigate('/pro/conteudos')} style={{ marginBottom:'10px' }}>+ Enviar novo conteúdo</button>
      <button className="btn btn-outline" onClick={() => navigate('/pro/matches')}>Ver matches pendentes</button>

      {pro.plano !== 'Premium' && (
        <div className="card-gold" style={{ marginTop:'16px' }}>
          <p style={{ fontWeight:'600', marginBottom:'6px' }}>🚀 Impulsione seu impacto</p>
          <p style={{ fontSize:'13px', color:'var(--text-muted)', marginBottom:'14px', lineHeight:'1.5' }}>Prioridade no Match, destaque no perfil e relatórios mensais.</p>
          <button className="btn btn-gold btn-sm" style={{ width:'auto' }}>Quero ser Premium</button>
        </div>
      )}
    </div>
  )
}
