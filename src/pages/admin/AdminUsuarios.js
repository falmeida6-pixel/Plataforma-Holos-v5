import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todos')
  const [busca, setBusca] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data } = await supabase.from('perfis').select('*').order('data_cadastro', { ascending:false })
    setUsuarios(data || [])
    setLoading(false)
  }

  async function toggleBloquear(id, statusAtual) {
    const novoStatus = statusAtual === 'Bloqueado' ? 'Ativo' : 'Bloqueado'
    await supabase.from('perfis').update({ status_plano: novoStatus }).eq('id', id)
    carregar()
  }

  const filtrados = usuarios.filter(u => {
    const matchFiltro = filtro === 'todos' || u.perfil === filtro || (filtro === 'premium' && u.plano === 'Premium')
    const matchBusca = !busca || u.email?.toLowerCase().includes(busca.toLowerCase()) || u.nome?.toLowerCase().includes(busca.toLowerCase())
    return matchFiltro && matchBusca
  })

  return (
    <div className="page-content" style={{ paddingTop:'16px' }}>
      <h2 style={{ fontFamily:'Cinzel, serif', fontSize:'20px', color:'#F7F1E5', marginBottom:'16px' }}>Usuários</h2>

      <input placeholder="Buscar por nome ou email..." value={busca} onChange={e => setBusca(e.target.value)}
        style={{ width:'100%', height:'42px', borderRadius:'10px', padding:'0 14px', background:'#111B20', border:'1px solid rgba(201,154,61,0.2)', color:'#F7F1E5', fontSize:'14px', fontFamily:'Inter, sans-serif', outline:'none', marginBottom:'12px' }}/>

      <div style={{ display:'flex', gap:'6px', marginBottom:'16px', flexWrap:'wrap' }}>
        {[['todos','Todos'],['Usuario','Usuários'],['Profissional','Profissionais'],['premium','Premium']].map(([v,l]) => (
          <button key={v} onClick={() => setFiltro(v)}
            style={{ padding:'6px 12px', borderRadius:'20px', fontSize:'12px', border: filtro===v ? '1px solid #C99A3D' : '1px solid rgba(201,154,61,0.2)', background: filtro===v ? 'rgba(201,154,61,0.12)' : '#111B20', color: filtro===v ? '#C99A3D' : '#B8AFA0', cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
            {l}
          </button>
        ))}
      </div>

      {loading ? <div className="loading-screen"><div className="spinner"/></div> :
        filtrados.map(u => (
          <div key={u.id} style={{ background:'linear-gradient(180deg,#111B20,#0A1013)', border:'1px solid rgba(201,154,61,0.15)', borderRadius:'14px', padding:'14px', marginBottom:'10px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <p style={{ fontSize:'14px', fontWeight:'600', color:'#F7F1E5', marginBottom:'2px' }}>{u.nome || '—'}</p>
                <p style={{ fontSize:'12px', color:'#B8AFA0', marginBottom:'4px' }}>{u.email}</p>
                <div style={{ display:'flex', gap:'6px' }}>
                  <span style={{ fontSize:'10px', padding:'2px 8px', borderRadius:'10px', background: u.perfil==='Admin'?'rgba(122,79,184,0.2)':u.perfil==='Profissional'?'rgba(61,158,216,0.2)':'rgba(90,200,120,0.1)', color: u.perfil==='Admin'?'#7A4FB8':u.perfil==='Profissional'?'#3D9ED8':'#5AC878', border:'1px solid currentColor' }}>
                    {u.perfil}
                  </span>
                  {u.plano === 'Premium' && <span style={{ fontSize:'10px', padding:'2px 8px', borderRadius:'10px', background:'rgba(201,154,61,0.15)', color:'#C99A3D', border:'1px solid rgba(201,154,61,0.3)' }}>👑 Premium</span>}
                  {u.status_plano === 'Bloqueado' && <span style={{ fontSize:'10px', padding:'2px 8px', borderRadius:'10px', background:'rgba(216,92,74,0.1)', color:'#D85C4A', border:'1px solid rgba(216,92,74,0.3)' }}>Bloqueado</span>}
                </div>
              </div>
              <button onClick={() => toggleBloquear(u.id, u.status_plano)}
                style={{ fontSize:'11px', padding:'5px 10px', borderRadius:'8px', border:'1px solid rgba(201,154,61,0.2)', background:'transparent', color: u.status_plano==='Bloqueado'?'#5AC878':'#D85C4A', cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
                {u.status_plano === 'Bloqueado' ? 'Ativar' : 'Bloquear'}
              </button>
            </div>
          </div>
        ))
      }
    </div>
  )
}
