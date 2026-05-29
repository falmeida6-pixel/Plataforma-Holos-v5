import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function ProPerfil() {
  const { user, sair } = useAuth()
  const navigate = useNavigate()
  const [pro, setPro] = useState(null)
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({})
  const [salvando, setSalvando] = useState(false)

  useEffect(() => { carregarPro() }, [user])

  async function carregarPro() {
    const { data } = await supabase.from('profissionais').select('*').eq('user_id', user.id).single()
    setPro(data); setForm(data || {})
  }

  async function salvarPerfil() {
    setSalvando(true)
    await supabase.from('profissionais').update({ nome: form.nome, bio: form.bio, especialidades: form.especialidades, whatsapp: form.whatsapp }).eq('user_id', user.id)
    setPro(prev => ({...prev, ...form}))
    setEditando(false); setSalvando(false)
  }

  if (!pro) return <div className="loading-screen"><div className="spinner"/></div>

  return (
    <div className="page-content">
      <div style={{ display:'flex', gap:'16px', alignItems:'center', marginBottom:'24px' }}>
        <div className="avatar" style={{ width:'64px', height:'64px', fontSize:'24px' }}>
          {pro.foto_url ? <img src={pro.foto_url} alt={pro.nome} style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }}/> : pro.nome?.charAt(0)}
        </div>
        <div>
          <h2 style={{ fontSize:'18px', fontWeight:'700', marginBottom:'4px' }}>{pro.nome}</h2>
          <p style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'4px' }}>{pro.especialidades}</p>
          <span style={{ fontSize:'12px', color:'var(--gold)' }}>✦ {pro.selo_evolucao}</span>
        </div>
      </div>

      {!editando ? (
        <>
          <div className="card" style={{ marginBottom:'16px' }}>
            <p style={{ fontSize:'13px', color:'var(--text-muted)', lineHeight:'1.5' }}>{pro.bio || 'Sem bio cadastrada.'}</p>
          </div>
          <button className="btn btn-outline" onClick={() => setEditando(true)} style={{ marginBottom:'10px' }}>Editar perfil</button>
        </>
      ) : (
        <>
          <div className="input-group">
            <label className="input-label">Nome</label>
            <input className="input" value={form.nome || ''} onChange={e => setForm(p => ({...p, nome: e.target.value}))} />
          </div>
          <div className="input-group">
            <label className="input-label">Especialidades</label>
            <input className="input" placeholder="Ex: Ansiedade; Relacionamentos" value={form.especialidades || ''} onChange={e => setForm(p => ({...p, especialidades: e.target.value}))} />
          </div>
          <div className="input-group">
            <label className="input-label">Bio</label>
            <textarea className="input" rows={4} value={form.bio || ''} onChange={e => setForm(p => ({...p, bio: e.target.value}))} style={{ resize:'none' }} />
          </div>
          <div className="input-group">
            <label className="input-label">WhatsApp (com DDD)</label>
            <input className="input" placeholder="5511999999999" value={form.whatsapp || ''} onChange={e => setForm(p => ({...p, whatsapp: e.target.value}))} />
          </div>
          <div style={{ display:'flex', gap:'10px', marginBottom:'16px' }}>
            <button className="btn btn-gold" onClick={salvarPerfil} disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar'}</button>
            <button className="btn btn-ghost" onClick={() => setEditando(false)}>Cancelar</button>
          </div>
        </>
      )}

      <div className="divider"/>
      <button className="btn btn-outline" onClick={async () => { await sair(); navigate('/login') }} style={{ color:'var(--danger)', borderColor:'var(--danger)' }}>
        Sair da conta
      </button>
    </div>
  )
}
