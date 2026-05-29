import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { hojeLocal } from '../lib/dataLocal'
import NavActions from '../components/NavActions'

const DIMS = [
  { key:'corpo', label:'VITÓRIA FÍSICA', emoji:'❤️', cor:'#B94A3E', placeholder:'Ex: caminhei 30min, fiz exercício...' },
  { key:'mente', label:'VITÓRIA MENTAL', emoji:'🧠', cor:'#3D9ED8', placeholder:'Ex: li, estudei, organizei pensamentos...' },
  { key:'consciencia', label:'VITÓRIA DE CONSCIÊNCIA', emoji:'✨', cor:'#7A4FB8', placeholder:'Ex: meditei, orei, pratiquei presença...' },
]

export default function Checkin() {
  const { user, perfil } = useAuth()
  const navigate = useNavigate()
  const [marcados, setMarcados] = useState({ corpo:false, mente:false, consciencia:false })
  const [textos, setTextos] = useState({ corpo:'', mente:'', consciencia:'' })
  const [checkinId, setCheckinId] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [loading, setLoading] = useState(true)

  const hj = hojeLocal()
  const dataFormatada = new Date(hj + 'T12:00:00').toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long' })
  const total = Object.values(marcados).filter(Boolean).length
  const completo = total === 3

  useEffect(() => { if (user) carregarHoje() }, [user])

  async function carregarHoje() {
    const { data } = await supabase.from('checkins').select('*').eq('user_id', user.id).eq('data', hj).maybeSingle()
    if (data) {
      setCheckinId(data.id)
      setMarcados({ corpo:!!data.vitoria_corpo, mente:!!data.vitoria_mente, consciencia:!!data.vitoria_consciencia })
      setTextos({ corpo:data.vitoria_corpo || '', mente:data.vitoria_mente || '', consciencia:data.vitoria_consciencia || '' })
    }
    setLoading(false)
  }

  function toggle(key) {
    setMarcados(prev => {
      const novo = !prev[key]
      if (!novo) setTextos(t => ({ ...t, [key]:'' }))
      return { ...prev, [key]: novo }
    })
    setSalvo(false)
  }

  async function salvar() {
    if (total === 0) return
    setSalvando(true)
    const statusDia = total === 3 ? 'Completo' : 'Parcial'
    const payload = {
      user_id: user.id,
      email_usuario: user.email,
      data: hj,
      vitoria_corpo: marcados.corpo ? (textos.corpo || 'Concluído') : null,
      vitoria_mente: marcados.mente ? (textos.mente || 'Concluído') : null,
      vitoria_consciencia: marcados.consciencia ? (textos.consciencia || 'Concluído') : null,
      status_dia: statusDia,
    }
    if (checkinId) {
      await supabase.from('checkins').update(payload).eq('id', checkinId)
    } else {
      const { data } = await supabase.from('checkins').insert(payload).select().single()
      if (data) setCheckinId(data.id)
      if (perfil?.id) {
        await supabase.from('perfis').update({
          checkins_realizados: (perfil?.checkins_realizados || 0) + 1,
          dias_ativos: (perfil?.dias_ativos || 0) + 1,
        }).eq('id', perfil.id)
      }
    }
    setSalvando(false)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2500)
  }

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>

  return (
    <>
      <NavActions/>
      <div style={{ padding:'12px 16px', paddingBottom:'calc(120px + env(safe-area-inset-bottom,16px))', overflowY:'auto' }}>
        <p style={{ fontSize:11, color:'#B8AFA0', marginBottom:4, textTransform:'capitalize' }}>{dataFormatada}</p>
        <p style={{ fontSize:10, letterSpacing:3, color:'#C99A3D', textTransform:'uppercase', marginBottom:2 }}>CHECK-IN DIÁRIO</p>
        <h2 style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:4 }}>Suas Vitórias de Hoje</h2>
        <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:16 }}>Registre uma conquista em cada dimensão.</p>

        {completo && (
          <div style={{ background:'linear-gradient(145deg,#0D1008,#161200)', border:'1px solid rgba(201,154,61,0.4)', borderRadius:16, padding:16, textAlign:'center', marginBottom:14 }}>
            <p style={{ fontFamily:'Cinzel, serif', fontSize:16, color:'#C99A3D', marginBottom:6 }}>Check-in completo hoje.</p>
            <p style={{ fontSize:12, color:'#B8AFA0', lineHeight:1.6 }}>Você ainda pode ajustar seus registros até o fim do dia.</p>
          </div>
        )}

        {salvo && (
          <div style={{ background:'rgba(201,154,61,0.08)', border:'1px solid rgba(201,154,61,0.3)', borderRadius:12, padding:12, marginBottom:14, textAlign:'center', color:'#C99A3D', fontSize:13, fontWeight:600 }}>
            ✅ Check-in salvo.
          </div>
        )}

        {DIMS.map(dim => {
          const marcado = marcados[dim.key]
          const bgAlpha = dim.cor === '#B94A3E' ? '185,74,62' : dim.cor === '#3D9ED8' ? '61,158,216' : '122,79,184'
          return (
            <div key={dim.key} onClick={() => toggle(dim.key)} style={{ display:'flex', alignItems:'flex-start', gap:12, background: marcado?`rgba(${bgAlpha},0.08)`:'linear-gradient(180deg,#111B20,#0A1013)', border:`1px solid ${marcado?dim.cor:'rgba(201,154,61,0.18)'}`, borderRadius:14, padding:14, marginBottom:10, cursor:'pointer', transition:'all 0.2s', WebkitTapHighlightColor:'transparent' }}>
              <div style={{ width:24, height:24, borderRadius:7, flexShrink:0, marginTop:1, border: marcado?`2px solid ${dim.cor}`:'2px solid rgba(201,154,61,0.2)', background: marcado?dim.cor:'transparent', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}>
                {marcado && <span style={{ color:'#fff', fontSize:13, fontWeight:700 }}>✓</span>}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                  <span style={{ fontSize:18 }}>{dim.emoji}</span>
                  <p style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, color: marcado?dim.cor:'#B8AFA0', fontFamily:'Inter, sans-serif' }}>{dim.label}</p>
                </div>
                {!marcado && <p style={{ fontSize:12, color:'#B8AFA0', lineHeight:1.4 }}>{dim.placeholder}</p>}
                {marcado && (
                  <div onClick={e => e.stopPropagation()}>
                    <input value={textos[dim.key]} maxLength={120} onChange={e => setTextos(t => ({ ...t, [dim.key]: e.target.value }))} placeholder={dim.placeholder} style={{ width:'100%', height:36, borderRadius:8, padding:'0 10px', background:'rgba(0,0,0,0.25)', border:`1px solid ${dim.cor}50`, color:'#F7F1E5', fontSize:12, fontFamily:'Inter, sans-serif', outline:'none', marginTop:4 }}/>
                  </div>
                )}
              </div>
              {marcado && <span style={{ fontSize:16, flexShrink:0 }}>⭐</span>}
            </div>
          )
        })}

        {total > 0 && (
          <div style={{ marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
              <p style={{ fontSize:12, color:'#B8AFA0' }}>Progresso de hoje</p>
              <p style={{ fontSize:12, color:'#C99A3D', fontWeight:600 }}>{total}/3</p>
            </div>
            <div style={{ background:'rgba(201,154,61,0.08)', borderRadius:8, height:6, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${(total/3)*100}%`, background:'linear-gradient(90deg,#8A6424,#F0C76A)', borderRadius:8, transition:'width 0.4s' }}/>
            </div>
          </div>
        )}

        <button onClick={salvar} disabled={salvando || total === 0} style={{ width:'100%', height:50, borderRadius:13, background: total===0?'rgba(201,154,61,0.08)':'linear-gradient(135deg,#B7832F,#F0C76A)', color: total===0?'#B8AFA0':'#080808', fontSize:15, fontWeight:700, fontFamily:'Inter, sans-serif', border: total===0?'1px solid rgba(201,154,61,0.15)':'none', cursor: total===0?'not-allowed':'pointer', marginBottom:10 }}>
          {salvando ? 'Salvando...' : checkinId ? '✓ Atualizar check-in' : total===0 ? 'Marque ao menos 1 vitória' : 'Salvar check-in'}
        </button>

        <button onClick={() => navigate('/dor')} style={{ width:'100%', height:44, borderRadius:12, background:'rgba(201,154,61,0.08)', border:'1px solid rgba(201,154,61,0.25)', color:'#C99A3D', fontSize:13, fontFamily:'Inter, sans-serif', fontWeight:600, cursor:'pointer', marginBottom:10, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>🎯 Autoavaliação Holos</button>
        <button onClick={() => navigate('/calendario')} style={{ width:'100%', height:44, borderRadius:12, background:'transparent', border:'1px solid rgba(201,154,61,0.15)', color:'#B8AFA0', fontSize:13, fontFamily:'Inter, sans-serif', cursor:'pointer' }}>📅 Ver calendário de desempenho</button>
      </div>
    </>
  )
}
