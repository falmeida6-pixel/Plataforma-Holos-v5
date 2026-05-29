import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [metricas, setMetricas] = useState({ usuarios:0, profissionais:0, matches:0, conteudos:0, premium:0, pendentes:0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { carregarMetricas() }, [])

  async function carregarMetricas() {
    const [u, p, m, c, prem, pend] = await Promise.all([
      supabase.from('perfis').select('*', { count:'exact', head:true }).eq('perfil','Usuario'),
      supabase.from('profissionais').select('*', { count:'exact', head:true }),
      supabase.from('matches').select('*', { count:'exact', head:true }),
      supabase.from('conteudos').select('*', { count:'exact', head:true }).eq('status','Aprovado'),
      supabase.from('perfis').select('*', { count:'exact', head:true }).eq('plano','Premium'),
      supabase.from('conteudos').select('*', { count:'exact', head:true }).eq('status','Pendente'),
    ])
    setMetricas({ usuarios:u.count||0, profissionais:p.count||0, matches:m.count||0, conteudos:c.count||0, premium:prem.count||0, pendentes:pend.count||0 })
    setLoading(false)
  }

  const cards = [
    { label:'Usuários', valor:metricas.usuarios, emoji:'👥', rota:'/admin/usuarios', cor:'#3D9ED8' },
    { label:'Profissionais', valor:metricas.profissionais, emoji:'🩺', rota:'/admin/usuarios', cor:'#7A4FB8' },
    { label:'Premium', valor:metricas.premium, emoji:'👑', rota:'/admin/usuarios', cor:'#C99A3D' },
    { label:'Conteúdos', valor:metricas.conteudos, emoji:'📝', rota:'/admin/conteudos', cor:'#5AC878' },
    { label:'Pendentes', valor:metricas.pendentes, emoji:'⏳', rota:'/admin/conteudos', cor:'#D85C4A' },
    { label:'Matches', valor:metricas.matches, emoji:'🤝', rota:'/admin/matches', cor:'#C99A3D' },
  ]

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>

  return (
    <div className="page-content" style={{ paddingTop:'16px' }}>
      <p style={{ fontSize:'10px', letterSpacing:'3px', color:'#C99A3D', textTransform:'uppercase', marginBottom:'4px' }}>ADMIN</p>
      <h2 style={{ fontFamily:'Cinzel, serif', fontSize:'22px', color:'#F7F1E5', marginBottom:'20px' }}>Dashboard Geral</h2>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'20px' }}>
        {cards.map(c => (
          <div key={c.label} onClick={() => navigate(c.rota)}
            style={{ background:'linear-gradient(180deg,#111B20,#0A1013)', border:`1px solid ${c.cor}40`, borderRadius:'16px', padding:'16px', cursor:'pointer' }}>
            <p style={{ fontSize:'24px', marginBottom:'6px' }}>{c.emoji}</p>
            <p style={{ fontSize:'28px', fontWeight:'700', color:c.cor, fontFamily:'Cinzel, serif' }}>{c.valor}</p>
            <p style={{ fontSize:'12px', color:'#B8AFA0' }}>{c.label}</p>
          </div>
        ))}
      </div>

      <p style={{ fontSize:'10px', letterSpacing:'2px', color:'#C99A3D', textTransform:'uppercase', marginBottom:'12px' }}>ACESSO RÁPIDO</p>
      {[
        { emoji:'👥', label:'Gerenciar Usuários', rota:'/admin/usuarios' },
        { emoji:'📝', label:'Moderar Conteúdos', rota:'/admin/conteudos' },
        { emoji:'🤝', label:'Aprovar Matches', rota:'/admin/matches' },
        { emoji:'⚙️', label:'Mais opções', rota:'/admin/mais' },
      ].map(i => (
        <button key={i.rota} onClick={() => navigate(i.rota)}
          style={{ width:'100%', display:'flex', alignItems:'center', gap:'12px', background:'linear-gradient(180deg,#111B20,#0A1013)', border:'1px solid rgba(201,154,61,0.2)', borderRadius:'14px', padding:'14px 16px', cursor:'pointer', marginBottom:'8px', color:'#F7F1E5', fontFamily:'Inter, sans-serif', fontSize:'14px', fontWeight:'500' }}>
          <span style={{ fontSize:'20px' }}>{i.emoji}</span>
          {i.label}
          <span style={{ marginLeft:'auto', color:'#B8AFA0' }}>›</span>
        </button>
      ))}
    </div>
  )
}
