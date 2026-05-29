import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminProfissionais() {
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todos')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data } = await supabase.from('profissionais').select('*').order('created_at', { ascending:false })
    setLista(data || [])
    setLoading(false)
  }

  async function atualizarStatus(id, status) {
    await supabase.from('profissionais').update({ status }).eq('id', id)
    carregar()
  }

  async function atualizarPlano(id, plano) {
    await supabase.from('profissionais').update({ plano }).eq('id', id)
    carregar()
  }

  const filtrados = lista.filter(p => filtro === 'todos' || p.status === filtro || (filtro === 'premium' && p.plano === 'Premium'))

  return (
    <div className="page-content" style={{ paddingTop:16 }}>
      <h2 style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:16 }}>Profissionais</h2>
      <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
        {[['todos','Todos'],['Pendente','Pendentes'],['Ativo','Ativos'],['Suspenso','Suspensos'],['premium','Premium']].map(([v,l]) => (
          <button key={v} onClick={() => setFiltro(v)}
            style={{ padding:'6px 12px', borderRadius:20, fontSize:12, border: filtro===v?'1px solid #C99A3D':'1px solid rgba(201,154,61,0.2)', background: filtro===v?'rgba(201,154,61,0.12)':'#111B20', color: filtro===v?'#C99A3D':'#B8AFA0', cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
            {l} ({filtro===v ? filtrados.length : lista.filter(p => v==='todos'?true:v==='premium'?p.plano==='Premium':p.status===v).length})
          </button>
        ))}
      </div>
      {loading ? <div className="loading-screen"><div className="spinner"/></div> :
        filtrados.map(p => (
          <div key={p.id} style={{ background:'linear-gradient(180deg,#111B20,#0A1013)', border:'1px solid rgba(201,154,61,0.15)', borderRadius:14, padding:14, marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <div>
                <p style={{ fontSize:14, fontWeight:600, color:'#F7F1E5' }}>{p.nome}</p>
                <p style={{ fontSize:12, color:'#B8AFA0' }}>{p.email_contato || p.email}</p>
                <p style={{ fontSize:12, color:'#B8AFA0' }}>{p.especialidades}</p>
                <div style={{ display:'flex', gap:6, marginTop:4 }}>
                  <span style={{ fontSize:10, padding:'2px 8px', borderRadius:10, background: p.status==='Ativo'?'rgba(90,200,120,0.15)':p.status==='Pendente'?'rgba(215,162,61,0.15)':'rgba(216,92,74,0.15)', color: p.status==='Ativo'?'#5AC878':p.status==='Pendente'?'#D7A23D':'#D85C4A', border:'1px solid currentColor' }}>{p.status}</span>
                  {p.plano==='Premium' && <span style={{ fontSize:10, padding:'2px 8px', borderRadius:10, background:'rgba(201,154,61,0.15)', color:'#C99A3D', border:'1px solid rgba(201,154,61,0.3)' }}>👑 Premium</span>}
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {p.status === 'Pendente' && <button onClick={() => atualizarStatus(p.id,'Ativo')} style={{ padding:'5px 12px', borderRadius:8, border:'1px solid #5AC878', background:'rgba(90,200,120,0.1)', color:'#5AC878', cursor:'pointer', fontSize:12, fontFamily:'Inter, sans-serif' }}>✓ Aprovar</button>}
              {p.status === 'Ativo' && <button onClick={() => atualizarStatus(p.id,'Suspenso')} style={{ padding:'5px 12px', borderRadius:8, border:'1px solid #D85C4A', background:'rgba(216,92,74,0.1)', color:'#D85C4A', cursor:'pointer', fontSize:12, fontFamily:'Inter, sans-serif' }}>Suspender</button>}
              {p.status === 'Suspenso' && <button onClick={() => atualizarStatus(p.id,'Ativo')} style={{ padding:'5px 12px', borderRadius:8, border:'1px solid #5AC878', background:'rgba(90,200,120,0.1)', color:'#5AC878', cursor:'pointer', fontSize:12, fontFamily:'Inter, sans-serif' }}>Reativar</button>}
              {p.plano !== 'Premium' && <button onClick={() => atualizarPlano(p.id,'Premium')} style={{ padding:'5px 12px', borderRadius:8, border:'1px solid #C99A3D', background:'rgba(201,154,61,0.1)', color:'#C99A3D', cursor:'pointer', fontSize:12, fontFamily:'Inter, sans-serif' }}>👑 Ativar Premium</button>}
              {p.whatsapp && <a href={`https://wa.me/${p.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{ padding:'5px 12px', borderRadius:8, border:'1px solid rgba(201,154,61,0.3)', background:'transparent', color:'#B8AFA0', cursor:'pointer', fontSize:12, fontFamily:'Inter, sans-serif', textDecoration:'none' }}>💬 WhatsApp</a>}
            </div>
          </div>
        ))
      }
    </div>
  )
}
