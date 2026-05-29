import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminRodas() {
  const [rodas, setRodas] = useState([])
  const [form, setForm] = useState({ tema:'', data:'', hora:'20:00', link_grupo_whatsapp:'', link_gravacao:'' })
  const [salvando, setSalvando] = useState(false)
  const [aba, setAba] = useState('lista')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data } = await supabase.from('rodas_holos').select('*').order('data', { ascending:false })
    setRodas(data || [])
  }

  async function criar() {
    if (!form.tema || !form.data) return
    setSalvando(true)
    await supabase.from('rodas_holos').insert({ ...form, status:'Agendada', plano:'Premium' })
    setForm({ tema:'', data:'', hora:'20:00', link_grupo_whatsapp:'', link_gravacao:'' })
    carregar(); setAba('lista'); setSalvando(false)
  }

  async function atualizar(id, campo, valor) {
    await supabase.from('rodas_holos').update({ [campo]: valor }).eq('id', id)
    carregar()
  }

  return (
    <div className="page-content" style={{ paddingTop:16 }}>
      <h2 style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:16 }}>Rodas Holos</h2>
      <div style={{ display:'flex', gap:6, marginBottom:20 }}>
        {[['lista','Lista'],['nova','+ Nova Roda']].map(([v,l]) => (
          <button key={v} onClick={() => setAba(v)} style={{ padding:'8px 16px', borderRadius:10, border: aba===v?'1px solid #C99A3D':'1px solid rgba(201,154,61,0.2)', background: aba===v?'rgba(201,154,61,0.1)':'#111B20', color: aba===v?'#C99A3D':'#B8AFA0', cursor:'pointer', fontSize:13, fontFamily:'Inter, sans-serif', fontWeight:600 }}>{l}</button>
        ))}
      </div>
      {aba === 'nova' && (
        <>
          {[['Tema','tema','text'],['Data','data','date'],['Hora','hora','time'],['Link WhatsApp','link_grupo_whatsapp','url'],['Link Gravação','link_gravacao','url']].map(([l,k,t]) => (
            <div key={k} style={{ marginBottom:10 }}>
              <p style={{ fontSize:10, color:'#B8AFA0', letterSpacing:2, textTransform:'uppercase', marginBottom:5 }}>{l}</p>
              <input type={t} value={form[k]} onChange={e => setForm(p => ({...p,[k]:e.target.value}))} style={{ width:'100%', height:42, borderRadius:10, padding:'0 13px', background:'#111B20', border:'1px solid rgba(201,154,61,0.2)', color:'#F7F1E5', fontSize:14, fontFamily:'Inter, sans-serif', outline:'none' }}/>
            </div>
          ))}
          <button onClick={criar} disabled={salvando} style={{ width:'100%', height:46, borderRadius:12, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:14, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer', marginTop:8 }}>
            {salvando ? 'Salvando...' : '+ Criar Roda'}
          </button>
        </>
      )}
      {aba === 'lista' && (
        rodas.length === 0 ? <p style={{ textAlign:'center', color:'#B8AFA0', padding:'40px 0' }}>Nenhuma roda cadastrada.</p> :
        rodas.map(r => (
          <div key={r.id} style={{ background:'linear-gradient(180deg,#111B20,#0A1013)', border:'1px solid rgba(201,154,61,0.15)', borderRadius:14, padding:14, marginBottom:10 }}>
            <p style={{ fontSize:14, fontWeight:600, color:'#F7F1E5', marginBottom:4 }}>{r.tema}</p>
            <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:8 }}>{r.data} · {r.hora} · <span style={{ color: r.status==='Agendada'?'#D7A23D':r.status==='Realizada'?'#5AC878':'#D85C4A' }}>{r.status}</span></p>
            {r.link_grupo_whatsapp && <a href={r.link_grupo_whatsapp} target="_blank" rel="noreferrer" style={{ fontSize:12, color:'#5AC878', display:'block', marginBottom:4 }}>💬 Grupo WhatsApp</a>}
            <div style={{ display:'flex', gap:6, marginTop:8 }}>
              {r.status === 'Agendada' && <button onClick={() => atualizar(r.id,'status','Realizada')} style={{ padding:'4px 10px', borderRadius:8, border:'1px solid #5AC878', background:'rgba(90,200,120,0.1)', color:'#5AC878', cursor:'pointer', fontSize:11, fontFamily:'Inter, sans-serif' }}>Marcar realizada</button>}
              {r.status === 'Agendada' && <button onClick={() => atualizar(r.id,'status','Cancelada')} style={{ padding:'4px 10px', borderRadius:8, border:'1px solid #D85C4A', background:'rgba(216,92,74,0.1)', color:'#D85C4A', cursor:'pointer', fontSize:11, fontFamily:'Inter, sans-serif' }}>Cancelar</button>}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
