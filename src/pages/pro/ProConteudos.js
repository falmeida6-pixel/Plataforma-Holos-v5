import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const DORES = ['Ansiedade','Burnout','Relacionamentos','Autoestima','Propósito','Solidão','Luto','Outra']
const INSTANCIAS = ['Corpo','Mente','Consciencia']
const TIPOS = ['Conteúdo','Aula','Palestra']
const FORMATOS = ['Áudio','Vídeo','Texto','PDF','E-book']

export default function ProConteudos() {
  const { user } = useAuth()
  const [conteudos, setConteudos] = useState([])
  const [aba, setAba] = useState('lista')
  const [form, setForm] = useState({ titulo:'', dor:'Ansiedade', instancia:'Mente', tipo:'Conteúdo', formato:'Áudio', descricao:'', link_midia:'', link_imagem:'' })
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { carregarConteudos() }, [user])

  async function carregarConteudos() {
    const { data: pro } = await supabase.from('profissionais').select('email_contato').eq('user_id', user.id).single()
    if (!pro) { setLoading(false); return }
    const { data } = await supabase.from('conteudos').select('*').eq('profissional_origem', pro.email_contato).order('data_envio', { ascending: false })
    setConteudos(data || [])
    setLoading(false)
  }

  async function enviarConteudo() {
    if (!form.titulo) return
    setSalvando(true)
    const { data: pro } = await supabase.from('profissionais').select('email_contato').eq('user_id', user.id).single()
    const { error } = await supabase.from('conteudos').insert({ ...form, profissional_origem: pro.email_contato, status: 'Pendente', categoria: 'Áudio Holos' })
    if (!error) {
      setSucesso(true)
      setForm({ titulo:'', dor:'Ansiedade', instancia:'Mente', tipo:'Conteúdo', formato:'Áudio', descricao:'', link_midia:'', link_imagem:'' })
      carregarConteudos()
      setAba('lista')
      setTimeout(() => setSucesso(false), 3000)
    }
    setSalvando(false)
  }

  const statusCor = { Aprovado:'var(--success)', Pendente:'var(--warning)', Rejeitado:'var(--danger)', Ajuste:'#9B6DFF' }

  return (
    <div className="page-content">
      <h2 className="page-title">Meus Conteúdos</h2>
      <div className="tabs">
        <button className={`tab ${aba==='lista'?'active':''}`} onClick={() => setAba('lista')}>Lista</button>
        <button className={`tab ${aba==='enviar'?'active':''}`} onClick={() => setAba('enviar')}>+ Enviar</button>
      </div>

      {sucesso && <div style={{ background:'#0A1A0A', border:'1px solid var(--success)', borderRadius:'10px', padding:'12px', marginBottom:'16px', color:'var(--success)', textAlign:'center' }}>✓ Conteúdo enviado para revisão!</div>}

      {aba === 'lista' && (
        loading ? <div className="loading-screen"><div className="spinner"/></div> :
        conteudos.length === 0
          ? <p style={{ textAlign:'center', color:'var(--text-muted)', padding:'40px 0' }}>Nenhum conteúdo enviado ainda.</p>
          : conteudos.map(c => (
            <div key={c.id} className="card" style={{ marginBottom:'12px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'6px' }}>
                <p style={{ fontWeight:'600', fontSize:'14px', flex:1 }}>{c.titulo}</p>
                <span style={{ fontSize:'12px', color: statusCor[c.status] || 'var(--text-muted)', marginLeft:'8px', flexShrink:0 }}>● {c.status}</span>
              </div>
              <p style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'4px' }}>{c.dor} · {c.instancia} · {c.formato}</p>
              {c.observacao_admin && <p style={{ fontSize:'12px', color:'#9B6DFF', marginTop:'6px' }}>Admin: {c.observacao_admin}</p>}
            </div>
          ))
      )}

      {aba === 'enviar' && (
        <>
          <div className="input-group">
            <label className="input-label">Título</label>
            <input className="input" placeholder="Nome do conteúdo" value={form.titulo} onChange={e => setForm(p => ({...p, titulo: e.target.value}))} />
          </div>
          <div className="input-group">
            <label className="input-label">Dor</label>
            <select className="input" value={form.dor} onChange={e => setForm(p => ({...p, dor: e.target.value}))}>
              {DORES.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Instância</label>
            <select className="input" value={form.instancia} onChange={e => setForm(p => ({...p, instancia: e.target.value}))}>
              {INSTANCIAS.map(i => <option key={i}>{i}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Formato</label>
            <select className="input" value={form.formato} onChange={e => setForm(p => ({...p, formato: e.target.value}))}>
              {FORMATOS.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Descrição</label>
            <textarea className="input" rows={3} placeholder="Descreva o conteúdo..." value={form.descricao} onChange={e => setForm(p => ({...p, descricao: e.target.value}))} style={{ resize:'none' }} />
          </div>
          <div className="input-group">
            <label className="input-label">Link do conteúdo</label>
            <input className="input" placeholder="https://..." value={form.link_midia} onChange={e => setForm(p => ({...p, link_midia: e.target.value}))} />
          </div>
          <button className="btn btn-gold" onClick={enviarConteudo} disabled={salvando || !form.titulo}>
            {salvando ? 'Enviando...' : 'Enviar para revisão'}
          </button>
        </>
      )}
    </div>
  )
}
