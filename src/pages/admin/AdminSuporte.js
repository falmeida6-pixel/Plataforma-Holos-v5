import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminSuporte() {
  const [chamados, setChamados] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('aberto')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data } = await supabase.from('suporte_chamados').select('*').order('data_criacao', { ascending:false })
    setChamados(data || [])
    setLoading(false)
  }

  async function atualizarStatus(id, status) {
    await supabase.from('suporte_chamados').update({ status }).eq('id', id)
    carregar()
  }

  const filtrados = chamados.filter(c => filtro === 'todos' || c.status === filtro)
  const corStatus = { aberto:'#D85C4A', em_andamento:'#D7A23D', concluido:'#5AC878' }

  return (
    <div className="page-content" style={{ paddingTop:16 }}>
      <h2 style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:16 }}>Suporte</h2>
      <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
        {[['aberto','Abertos'],['em_andamento','Em andamento'],['concluido','Concluídos'],['todos','Todos']].map(([v,l]) => (
          <button key={v} onClick={() => setFiltro(v)} style={{ padding:'6px 12px', borderRadius:20, fontSize:12, border: filtro===v?'1px solid #C99A3D':'1px solid rgba(201,154,61,0.2)', background: filtro===v?'rgba(201,154,61,0.12)':'#111B20', color: filtro===v?'#C99A3D':'#B8AFA0', cursor:'pointer', fontFamily:'Inter, sans-serif' }}>{l} ({chamados.filter(c=>v==='todos'||c.status===v).length})</button>
        ))}
      </div>
      {loading ? <div className="loading-screen"><div className="spinner"/></div> :
        filtrados.length === 0 ? <p style={{ textAlign:'center', color:'#B8AFA0', padding:'40px 0' }}>Nenhum chamado {filtro}.</p> :
        filtrados.map(c => (
          <div key={c.id} style={{ background:'linear-gradient(180deg,#111B20,#0A1013)', border:'1px solid rgba(201,154,61,0.15)', borderRadius:14, padding:14, marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <p style={{ fontSize:13, fontWeight:600, color:'#F7F1E5' }}>{c.tipo || 'Suporte'}</p>
              <span style={{ fontSize:11, color: corStatus[c.status] || '#B8AFA0' }}>● {c.status}</span>
            </div>
            <p style={{ fontSize:13, color:'#B8AFA0', marginBottom:10, lineHeight:1.5 }}>{c.mensagem}</p>
            <p style={{ fontSize:11, color:'#B8AFA0', marginBottom:8 }}>{new Date(c.data_criacao).toLocaleDateString('pt-BR')}</p>
            <div style={{ display:'flex', gap:6 }}>
              {c.status === 'aberto' && <button onClick={() => atualizarStatus(c.id,'em_andamento')} style={{ padding:'4px 10px', borderRadius:8, border:'1px solid #D7A23D', background:'rgba(215,162,61,0.1)', color:'#D7A23D', cursor:'pointer', fontSize:11, fontFamily:'Inter, sans-serif' }}>Em andamento</button>}
              {c.status !== 'concluido' && <button onClick={() => atualizarStatus(c.id,'concluido')} style={{ padding:'4px 10px', borderRadius:8, border:'1px solid #5AC878', background:'rgba(90,200,120,0.1)', color:'#5AC878', cursor:'pointer', fontSize:11, fontFamily:'Inter, sans-serif' }}>Concluir</button>}
            </div>
          </div>
        ))
      }
    </div>
  )
}
