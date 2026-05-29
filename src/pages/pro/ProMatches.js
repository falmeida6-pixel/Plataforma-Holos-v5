import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export default function ProMatches() {
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [aba, setAba] = useState('Solicitado')

  useEffect(() => { carregarMatches() }, [user])

  async function carregarMatches() {
    const { data: pro } = await supabase.from('profissionais').select('id').eq('user_id', user.id).single()
    if (!pro) { setLoading(false); return }
    const { data } = await supabase.from('matches').select('*').eq('profissional_id', pro.id).order('data_match', { ascending: false })
    setMatches(data || [])
    setLoading(false)
  }

  async function atualizarStatus(id, status) {
    await supabase.from('matches').update({ status }).eq('id', id)
    carregarMatches()
  }

  const filtrados = matches.filter(m => m.status === aba)
  const abas = ['Solicitado','Aceito','Concluido','Recusado']

  return (
    <div className="page-content">
      <h2 className="page-title">Matches</h2>
      <div style={{ display:'flex', gap:'6px', marginBottom:'20px', overflowX:'auto', paddingBottom:'4px' }}>
        {abas.map(a => (
          <button key={a} className={`tab ${aba===a?'active':''}`} onClick={() => setAba(a)} style={{ flex:'0 0 auto', fontSize:'12px' }}>
            {a} ({matches.filter(m => m.status===a).length})
          </button>
        ))}
      </div>

      {loading ? <div className="loading-screen"><div className="spinner"/></div> :
        filtrados.length === 0
          ? <p style={{ textAlign:'center', color:'var(--text-muted)', padding:'40px 0' }}>Nenhum match {aba.toLowerCase()}.</p>
          : filtrados.map(m => (
            <div key={m.id} className="card" style={{ marginBottom:'12px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                <p style={{ fontWeight:'600' }}>{m.usuario_email}</p>
                <span className={`badge ${m.plano_usuario==='Premium'?'badge-premium':'badge-gratuito'}`}>{m.plano_usuario}</span>
              </div>
              <p style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'12px' }}>
                {new Date(m.data_match).toLocaleDateString('pt-BR')}
              </p>
              {m.status === 'Solicitado' && (
                <div style={{ display:'flex', gap:'8px' }}>
                  <button className="btn btn-gold btn-sm" onClick={() => atualizarStatus(m.id, 'Aceito')}>Aceitar</button>
                  <button className="btn btn-outline btn-sm" onClick={() => atualizarStatus(m.id, 'Recusado')}>Recusar</button>
                </div>
              )}
              {m.status === 'Aceito' && (
                <button className="btn btn-ghost btn-sm" onClick={() => atualizarStatus(m.id, 'Concluido')}>Marcar como concluído</button>
              )}
            </div>
          ))
      }
    </div>
  )
}
