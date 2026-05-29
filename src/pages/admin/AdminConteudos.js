import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminConteudos() {
  const [conteudos, setConteudos] = useState([])
  const [loading, setLoading] = useState(true)
  const [aba, setAba] = useState('Pendente')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data } = await supabase.from('conteudos').select('*').order('data_envio', { ascending:false })
    setConteudos(data || [])
    setLoading(false)
  }

  async function atualizar(id, status, obs='') {
    await supabase.from('conteudos').update({ status, observacao_admin: obs, data_aprovacao: status==='Aprovado'?new Date().toISOString():null }).eq('id', id)
    carregar()
  }

  const filtrados = conteudos.filter(c => c.status === aba)
  const counts = { Pendente: conteudos.filter(c=>c.status==='Pendente').length, Aprovado: conteudos.filter(c=>c.status==='Aprovado').length, Rejeitado: conteudos.filter(c=>c.status==='Rejeitado').length }

  return (
    <div className="page-content" style={{ paddingTop:'16px' }}>
      <h2 style={{ fontFamily:'Cinzel, serif', fontSize:'20px', color:'#F7F1E5', marginBottom:'16px' }}>Conteúdos</h2>

      <div style={{ display:'flex', gap:'6px', marginBottom:'16px' }}>
        {['Pendente','Aprovado','Rejeitado'].map(s => (
          <button key={s} onClick={() => setAba(s)}
            style={{ flex:1, padding:'8px', borderRadius:'10px', border: aba===s?'1px solid #C99A3D':'1px solid rgba(201,154,61,0.2)', background: aba===s?'rgba(201,154,61,0.1)':'#111B20', color: aba===s?'#C99A3D':'#B8AFA0', cursor:'pointer', fontSize:'12px', fontFamily:'Inter, sans-serif', fontWeight:'600' }}>
            {s} ({counts[s]})
          </button>
        ))}
      </div>

      {loading ? <div className="loading-screen"><div className="spinner"/></div> :
        filtrados.length === 0
          ? <p style={{ textAlign:'center', color:'#B8AFA0', padding:'40px 0' }}>Nenhum conteúdo {aba.toLowerCase()}.</p>
          : filtrados.map(c => (
            <div key={c.id} style={{ background:'linear-gradient(180deg,#111B20,#0A1013)', border:'1px solid rgba(201,154,61,0.15)', borderRadius:'14px', padding:'14px', marginBottom:'10px' }}>
              <p style={{ fontSize:'14px', fontWeight:'600', color:'#F7F1E5', marginBottom:'4px' }}>{c.titulo}</p>
              <p style={{ fontSize:'12px', color:'#B8AFA0', marginBottom:'6px' }}>{c.dor} · {c.instancia} · {c.formato}</p>
              <p style={{ fontSize:'12px', color:'#B8AFA0', marginBottom:'10px' }}>Por: {c.profissional_origem}</p>
              {c.link_midia && <a href={c.link_midia} target="_blank" rel="noreferrer" style={{ fontSize:'12px', color:'#C99A3D', marginBottom:'10px', display:'block' }}>🔗 Ver conteúdo</a>}
              {aba === 'Pendente' && (
                <div style={{ display:'flex', gap:'8px' }}>
                  <button onClick={() => atualizar(c.id,'Aprovado')} style={{ flex:1, height:'36px', borderRadius:'8px', background:'rgba(90,200,120,0.15)', border:'1px solid #5AC878', color:'#5AC878', cursor:'pointer', fontSize:'13px', fontFamily:'Inter, sans-serif', fontWeight:'600' }}>✓ Aprovar</button>
                  <button onClick={() => atualizar(c.id,'Rejeitado')} style={{ flex:1, height:'36px', borderRadius:'8px', background:'rgba(216,92,74,0.1)', border:'1px solid #D85C4A', color:'#D85C4A', cursor:'pointer', fontSize:'13px', fontFamily:'Inter, sans-serif', fontWeight:'600' }}>✗ Rejeitar</button>
                </div>
              )}
            </div>
          ))
      }
    </div>
  )
}
