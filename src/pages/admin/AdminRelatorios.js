import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminRelatorios() {
  const [dados, setDados] = useState({ usuarios:0, profissionais:0, matches:0, conteudos:0, premium:0, checkins:0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const [u,p,m,c,prem,ch] = await Promise.all([
      supabase.from('perfis').select('*',{count:'exact',head:true}).eq('perfil','Usuario'),
      supabase.from('profissionais').select('*',{count:'exact',head:true}).eq('status','Ativo'),
      supabase.from('matches').select('*',{count:'exact',head:true}),
      supabase.from('conteudos').select('*',{count:'exact',head:true}).eq('status','Aprovado'),
      supabase.from('perfis').select('*',{count:'exact',head:true}).eq('plano','Premium'),
      supabase.from('checkins').select('*',{count:'exact',head:true}),
    ])
    setDados({ usuarios:u.count||0, profissionais:p.count||0, matches:m.count||0, conteudos:c.count||0, premium:prem.count||0, checkins:ch.count||0 })
    setLoading(false)
  }

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>

  return (
    <div className="page-content" style={{ paddingTop:16 }}>
      <h2 style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:20 }}>Relatórios Gerais</h2>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {[['👥','Usuários',dados.usuarios,'#3D9ED8'],['🩺','Profissionais Ativos',dados.profissionais,'#7A4FB8'],['👑','Assinantes Premium',dados.premium,'#C99A3D'],['🤝','Total Matches',dados.matches,'#5AC878'],['📝','Conteúdos Aprovados',dados.conteudos,'#D7A23D'],['✅','Total Check-ins',dados.checkins,'#B94A3E']].map(([e,l,v,c]) => (
          <div key={l} style={{ background:'linear-gradient(180deg,#111B20,#0A1013)', border:`1px solid ${c}25`, borderRadius:16, padding:16, textAlign:'center' }}>
            <p style={{ fontSize:24, marginBottom:6 }}>{e}</p>
            <p style={{ fontSize:28, fontWeight:700, color:c, fontFamily:'Cinzel, serif' }}>{v}</p>
            <p style={{ fontSize:11, color:'#B8AFA0', marginTop:2 }}>{l}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
