import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminMatches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [aba, setAba] = useState('Solicitado')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data } = await supabase.from('matches').select('*, profissionais(nome, whatsapp)').order('data_match', { ascending:false })
    setMatches(data || [])
    setLoading(false)
  }

  async function liberarContato(match) {
    const whatsapp = match.profissionais?.whatsapp || ''
    await supabase.from('matches').update({ status:'Aceito', liberar_contato:true, whatsapp_liberado:whatsapp, data_liberacao:new Date().toISOString() }).eq('id', match.id)
    carregar()
  }

  async function recusar(id) {
    await supabase.from('matches').update({ status:'Recusado' }).eq('id', id)
    carregar()
  }

  const filtrados = matches.filter(m => m.status === aba)
  const counts = { Solicitado:matches.filter(m=>m.status==='Solicitado').length, Aceito:matches.filter(m=>m.status==='Aceito').length, Concluido:matches.filter(m=>m.status==='Concluido').length }

  return (
    <div className="page-content" style={{ paddingTop:'16px' }}>
      <h2 style={{ fontFamily:'Cinzel, serif', fontSize:'20px', color:'#F7F1E5', marginBottom:'16px' }}>Matches</h2>
      <div style={{ display:'flex', gap:'6px', marginBottom:'16px' }}>
        {['Solicitado','Aceito','Concluido'].map(s => (
          <button key={s} onClick={() => setAba(s)}
            style={{ flex:1, padding:'8px', borderRadius:'10px', border:aba===s?'1px solid #C99A3D':'1px solid rgba(201,154,61,0.2)', background:aba===s?'rgba(201,154,61,0.1)':'#111B20', color:aba===s?'#C99A3D':'#B8AFA0', cursor:'pointer', fontSize:'12px', fontFamily:'Inter, sans-serif', fontWeight:'600' }}>
            {s} ({counts[s]||0})
          </button>
        ))}
      </div>
      {loading ? <div className="loading-screen"><div className="spinner"/></div> :
        filtrados.length === 0
          ? <p style={{ textAlign:'center', color:'#B8AFA0', padding:'40px 0' }}>Nenhum match {aba.toLowerCase()}.</p>
          : filtrados.map(m => (
            <div key={m.id} style={{ background:'linear-gradient(180deg,#111B20,#0A1013)', border:'1px solid rgba(201,154,61,0.15)', borderRadius:'14px', padding:'14px', marginBottom:'10px' }}>
              <p style={{ fontSize:'14px', fontWeight:'600', color:'#F7F1E5', marginBottom:'4px' }}>👤 {m.usuario_email}</p>
              <p style={{ fontSize:'12px', color:'#B8AFA0', marginBottom:'4px' }}>🩺 {m.profissionais?.nome || m.profissional_id}</p>
              <p style={{ fontSize:'11px', color:'#B8AFA0', marginBottom:'10px' }}>{new Date(m.data_match).toLocaleDateString('pt-BR')} · {m.plano_usuario}</p>
              {aba === 'Solicitado' && (
                <div style={{ display:'flex', gap:'8px' }}>
                  <button onClick={() => liberarContato(m)} style={{ flex:1, height:'36px', borderRadius:'8px', background:'rgba(90,200,120,0.15)', border:'1px solid #5AC878', color:'#5AC878', cursor:'pointer', fontSize:'13px', fontFamily:'Inter, sans-serif', fontWeight:'600' }}>✓ Liberar contato</button>
                  <button onClick={() => recusar(m.id)} style={{ flex:1, height:'36px', borderRadius:'8px', background:'rgba(216,92,74,0.1)', border:'1px solid #D85C4A', color:'#D85C4A', cursor:'pointer', fontSize:'13px', fontFamily:'Inter, sans-serif', fontWeight:'600' }}>✗ Recusar</button>
                </div>
              )}
              {m.liberar_contato && m.whatsapp_liberado && (
                <a href={`https://wa.me/${m.whatsapp_liberado.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{ display:'block', fontSize:'12px', color:'#5AC878', marginTop:'6px' }}>💬 {m.whatsapp_liberado}</a>
              )}
            </div>
          ))
      }
    </div>
  )
}
