import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminIndicacoes() {
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data } = await supabase.from('indicacoes').select('*, profissionais!profissional_indicador_id(nome)').order('created_at', { ascending:false })
    setLista(data || [])
    setLoading(false)
  }

  async function confirmar(id, proId) {
    await supabase.from('indicacoes').update({ status:'confirmada', data_confirmacao:new Date().toISOString() }).eq('id', id)
    // Incrementa indicacoes_confirmadas
    const { data:pro } = await supabase.from('profissionais').select('indicacoes_confirmadas').eq('id', proId).single()
    await supabase.from('profissionais').update({ indicacoes_confirmadas:(pro?.indicacoes_confirmadas||0)+1 }).eq('id', proId)
    carregar()
  }

  return (
    <div className="page-content" style={{ paddingTop:16 }}>
      <h2 style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:16 }}>Indicações</h2>
      {loading ? <div className="loading-screen"><div className="spinner"/></div> :
        lista.length === 0 ? <p style={{ textAlign:'center', color:'#B8AFA0', padding:'40px 0' }}>Nenhuma indicação registrada.</p> :
        lista.map(i => (
          <div key={i.id} style={{ background:'linear-gradient(180deg,#111B20,#0A1013)', border:'1px solid rgba(201,154,61,0.15)', borderRadius:14, padding:14, marginBottom:10 }}>
            <p style={{ fontSize:14, fontWeight:600, color:'#F7F1E5', marginBottom:2 }}>{i.profissionais?.nome || i.profissional_indicador_id}</p>
            <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:2 }}>Indicou: {i.profissional_indicado_email}</p>
            <p style={{ fontSize:11, color: i.status==='confirmada'?'#5AC878':'#D7A23D', marginBottom:8 }}>● {i.status}</p>
            {i.status !== 'confirmada' && (
              <button onClick={() => confirmar(i.id, i.profissional_indicador_id)} style={{ padding:'5px 14px', borderRadius:8, border:'1px solid #5AC878', background:'rgba(90,200,120,0.1)', color:'#5AC878', cursor:'pointer', fontSize:12, fontFamily:'Inter, sans-serif', fontWeight:600 }}>
                ✓ Confirmar indicação
              </button>
            )}
          </div>
        ))
      }
    </div>
  )
}
