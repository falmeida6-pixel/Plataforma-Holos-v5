import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminContatos() {
  const [lista, setLista] = useState([])
  const [tipo, setTipo] = useState('usuarios')
  const [loading, setLoading] = useState(true)

  useEffect(() => { carregar() }, [tipo])

  async function carregar() {
    setLoading(true)
    if (tipo === 'usuarios') {
      const { data } = await supabase.from('perfis').select('id,nome,email,whatsapp,plano,perfil').neq('perfil','Admin')
      setLista(data || [])
    } else {
      const { data } = await supabase.from('profissionais').select('id,nome,email_contato,whatsapp,plano,status')
      setLista(data || [])
    }
    setLoading(false)
  }

  return (
    <div className="page-content" style={{ paddingTop:16 }}>
      <h2 style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:16 }}>Contatos</h2>
      <div style={{ display:'flex', gap:6, marginBottom:16 }}>
        {[['usuarios','👥 Usuários'],['profissionais','🩺 Profissionais']].map(([v,l]) => (
          <button key={v} onClick={() => setTipo(v)} style={{ flex:1, padding:'8px', borderRadius:10, border: tipo===v?'1px solid #C99A3D':'1px solid rgba(201,154,61,0.2)', background: tipo===v?'rgba(201,154,61,0.1)':'#111B20', color: tipo===v?'#C99A3D':'#B8AFA0', cursor:'pointer', fontSize:13, fontFamily:'Inter, sans-serif', fontWeight:600 }}>{l}</button>
        ))}
      </div>
      {loading ? <div className="loading-screen"><div className="spinner"/></div> :
        lista.map(item => (
          <div key={item.id} style={{ background:'linear-gradient(180deg,#111B20,#0A1013)', border:'1px solid rgba(201,154,61,0.15)', borderRadius:14, padding:14, marginBottom:10 }}>
            <p style={{ fontSize:14, fontWeight:600, color:'#F7F1E5', marginBottom:2 }}>{item.nome}</p>
            <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:8 }}>{item.email || item.email_contato}</p>
            <div style={{ display:'flex', gap:8 }}>
              {(item.email || item.email_contato) && (
                <a href={`mailto:${item.email || item.email_contato}`} style={{ padding:'5px 12px', borderRadius:8, border:'1px solid rgba(201,154,61,0.3)', background:'transparent', color:'#C99A3D', fontSize:12, textDecoration:'none', fontFamily:'Inter, sans-serif' }}>✉️ Email</a>
              )}
              {item.whatsapp && (
                <a href={`https://wa.me/${item.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{ padding:'5px 12px', borderRadius:8, border:'1px solid rgba(90,200,120,0.4)', background:'transparent', color:'#5AC878', fontSize:12, textDecoration:'none', fontFamily:'Inter, sans-serif' }}>💬 WhatsApp</a>
              )}
            </div>
          </div>
        ))
      }
    </div>
  )
}
