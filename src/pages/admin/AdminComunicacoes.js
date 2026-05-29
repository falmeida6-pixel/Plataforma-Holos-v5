import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminComunicacoes() {
  const [lista, setLista] = useState([])
  const [form, setForm] = useState({ titulo:'', mensagem:'', publico:'todos' })
  const [aba, setAba] = useState('lista')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data } = await supabase.from('comunicacoes').select('*').order('created_at', { ascending:false })
    setLista(data || [])
  }

  async function criar() {
    if (!form.titulo || !form.mensagem) return
    setSalvando(true)
    await supabase.from('comunicacoes').insert({ ...form, status:'enviado' })
    setForm({ titulo:'', mensagem:'', publico:'todos' })
    carregar(); setAba('lista'); setSalvando(false)
  }

  return (
    <div className="page-content" style={{ paddingTop:16 }}>
      <h2 style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:16 }}>Comunicações</h2>
      <div style={{ display:'flex', gap:6, marginBottom:20 }}>
        {[['lista','Lista'],['nova','+ Nova']].map(([v,l]) => (
          <button key={v} onClick={() => setAba(v)} style={{ padding:'8px 16px', borderRadius:10, border: aba===v?'1px solid #C99A3D':'1px solid rgba(201,154,61,0.2)', background: aba===v?'rgba(201,154,61,0.1)':'#111B20', color: aba===v?'#C99A3D':'#B8AFA0', cursor:'pointer', fontSize:13, fontFamily:'Inter, sans-serif', fontWeight:600 }}>{l}</button>
        ))}
      </div>
      {aba === 'nova' && (
        <>
          <div style={{ marginBottom:10 }}>
            <p style={{ fontSize:10, color:'#B8AFA0', letterSpacing:2, textTransform:'uppercase', marginBottom:5 }}>Título</p>
            <input value={form.titulo} onChange={e => setForm(p => ({...p, titulo:e.target.value}))} style={{ width:'100%', height:42, borderRadius:10, padding:'0 13px', background:'#111B20', border:'1px solid rgba(201,154,61,0.2)', color:'#F7F1E5', fontSize:14, fontFamily:'Inter, sans-serif', outline:'none' }}/>
          </div>
          <div style={{ marginBottom:10 }}>
            <p style={{ fontSize:10, color:'#B8AFA0', letterSpacing:2, textTransform:'uppercase', marginBottom:5 }}>Mensagem</p>
            <textarea value={form.mensagem} onChange={e => setForm(p => ({...p, mensagem:e.target.value}))} rows={4} style={{ width:'100%', borderRadius:10, padding:'12px 13px', background:'#111B20', border:'1px solid rgba(201,154,61,0.2)', color:'#F7F1E5', fontSize:14, fontFamily:'Inter, sans-serif', outline:'none', resize:'none' }}/>
          </div>
          <div style={{ marginBottom:16 }}>
            <p style={{ fontSize:10, color:'#B8AFA0', letterSpacing:2, textTransform:'uppercase', marginBottom:5 }}>Público</p>
            <select value={form.publico} onChange={e => setForm(p => ({...p, publico:e.target.value}))} style={{ width:'100%', height:42, borderRadius:10, padding:'0 13px', background:'#111B20', border:'1px solid rgba(201,154,61,0.2)', color:'#F7F1E5', fontSize:14, fontFamily:'Inter, sans-serif', outline:'none' }}>
              <option value="todos">Todos</option>
              <option value="usuarios">Apenas Usuários</option>
              <option value="profissionais">Apenas Profissionais</option>
            </select>
          </div>
          <button onClick={criar} disabled={salvando} style={{ width:'100%', height:46, borderRadius:12, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:14, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer' }}>
            {salvando ? 'Enviando...' : 'Criar comunicação'}
          </button>
        </>
      )}
      {aba === 'lista' && (
        lista.length === 0 ? <p style={{ textAlign:'center', color:'#B8AFA0', padding:'40px 0' }}>Nenhuma comunicação enviada.</p> :
        lista.map(c => (
          <div key={c.id} style={{ background:'linear-gradient(180deg,#111B20,#0A1013)', border:'1px solid rgba(201,154,61,0.15)', borderRadius:14, padding:14, marginBottom:10 }}>
            <p style={{ fontSize:14, fontWeight:600, color:'#F7F1E5', marginBottom:4 }}>{c.titulo}</p>
            <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:6, lineHeight:1.5 }}>{c.mensagem}</p>
            <p style={{ fontSize:11, color:'#C99A3D' }}>Para: {c.publico} · {new Date(c.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
        ))
      )}
    </div>
  )
}
