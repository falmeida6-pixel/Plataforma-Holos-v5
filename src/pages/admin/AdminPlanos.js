import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminPlanos() {
  const [usuarios, setUsuarios] = useState([])
  const [profissionais, setProfissionais] = useState([])
  const [loading, setLoading] = useState(true)
  const [aba, setAba] = useState('usuarios')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const [u, p] = await Promise.all([
      supabase.from('perfis').select('id,nome,email,plano,status_plano,data_cadastro').order('data_cadastro',{ascending:false}),
      supabase.from('profissionais').select('id,nome,email_contato,plano,status').order('created_at',{ascending:false})
    ])
    setUsuarios(u.data || [])
    setProfissionais(p.data || [])
    setLoading(false)
  }

  async function togglePlano(tabela, id, planoAtual) {
    const novoPlano = planoAtual === 'Premium' ? 'Gratuito' : 'Premium'
    await supabase.from(tabela).update({ plano: novoPlano }).eq('id', id)
    carregar()
  }

  const lista = aba === 'usuarios' ? usuarios : profissionais
  const tabela = aba === 'usuarios' ? 'perfis' : 'profissionais'

  return (
    <div className="page-content" style={{ paddingTop:16 }}>
      <h2 style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:16 }}>Planos</h2>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
        {[['👥', usuarios.filter(u=>u.plano==='Premium').length, 'Usuários Premium'],['🩺', profissionais.filter(p=>p.plano==='Premium').length, 'Profissionais Premium'],
          ['🆓', usuarios.filter(u=>u.plano!=='Premium').length, 'Usuários Gratuitos'],['🆓', profissionais.filter(p=>p.plano!=='Premium').length, 'Profissionais Gratuitos']
        ].map(([e,v,l]) => (
          <div key={l} style={{ background:'linear-gradient(180deg,#111B20,#0A1013)', border:'1px solid rgba(201,154,61,0.15)', borderRadius:14, padding:14, textAlign:'center' }}>
            <p style={{ fontSize:20, marginBottom:4 }}>{e}</p>
            <p style={{ fontSize:24, fontWeight:700, color:'#C99A3D', fontFamily:'Cinzel, serif' }}>{v}</p>
            <p style={{ fontSize:11, color:'#B8AFA0' }}>{l}</p>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:6, marginBottom:16 }}>
        {[['usuarios','Usuários'],['profissionais','Profissionais']].map(([v,l]) => (
          <button key={v} onClick={() => setAba(v)} style={{ flex:1, padding:'8px', borderRadius:10, border: aba===v?'1px solid #C99A3D':'1px solid rgba(201,154,61,0.2)', background: aba===v?'rgba(201,154,61,0.1)':'#111B20', color: aba===v?'#C99A3D':'#B8AFA0', cursor:'pointer', fontSize:13, fontFamily:'Inter, sans-serif', fontWeight:600 }}>{l}</button>
        ))}
      </div>
      {loading ? <div className="loading-screen"><div className="spinner"/></div> :
        lista.map(item => (
          <div key={item.id} style={{ background:'linear-gradient(180deg,#111B20,#0A1013)', border:'1px solid rgba(201,154,61,0.15)', borderRadius:12, padding:12, marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:'#F7F1E5' }}>{item.nome}</p>
              <p style={{ fontSize:11, color:'#B8AFA0' }}>{item.email || item.email_contato}</p>
              <span style={{ fontSize:10, padding:'2px 8px', borderRadius:10, background: item.plano==='Premium'?'rgba(201,154,61,0.15)':'rgba(255,255,255,0.05)', color: item.plano==='Premium'?'#C99A3D':'#B8AFA0', border:'1px solid currentColor' }}>{item.plano||'Gratuito'}</span>
            </div>
            <button onClick={() => togglePlano(tabela, item.id, item.plano)}
              style={{ padding:'5px 12px', borderRadius:8, border:`1px solid ${item.plano==='Premium'?'#D85C4A':'#C99A3D'}`, background:'transparent', color: item.plano==='Premium'?'#D85C4A':'#C99A3D', cursor:'pointer', fontSize:11, fontFamily:'Inter, sans-serif' }}>
              {item.plano === 'Premium' ? 'Remover' : '+ Premium'}
            </button>
          </div>
        ))
      }
    </div>
  )
}
