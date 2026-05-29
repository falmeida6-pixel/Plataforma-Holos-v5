import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import NavActions from '../components/NavActions'
import { hojeLocal } from '../lib/dataLocal'

const DIMS = [
  { key:'corpo', label:'Corpo', emoji:'❤️', cor:'#B94A3E' },
  { key:'mente', label:'Mente', emoji:'🧠', cor:'#3D9ED8' },
  { key:'consciencia', label:'Consciência', emoji:'✨', cor:'#7A4FB8' },
]

export default function AnaliseHolos() {
  const { user, perfil } = useAuth()
  const navigate = useNavigate()
  const [nota, setNota] = useState(null)
  const [pesou, setPesou] = useState({ key:'', texto:'' })
  const [leveza, setLeveza] = useState({ key:'', texto:'' })
  const [gostaria, setGostaria] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const isPremium = perfil?.plano === 'Premium'

  async function salvar() {
    if (nota === null) return
    setSalvando(true)
    await supabase.from('checkins').upsert({
      user_id: user.id, email_usuario: user.email,
      data: hojeLocal(),
      nota_geral: nota,
      dimensao_cuidado: pesou.key ? `${pesou.key}: ${pesou.texto}` : '',
      palavra_chave: leveza.key ? `${leveza.key}: ${leveza.texto}` : '',
      observacao: gostaria,
    }, { onConflict:'email_usuario,data' })
    setSalvando(false); setSalvo(true)
  }

  if (salvo) return (
    <>
      <NavActions/>
      <div style={{ padding:'24px 16px', paddingBottom:'calc(120px + env(safe-area-inset-bottom,16px))', textAlign:'center' }}>
        <p style={{ fontSize:48, marginBottom:16 }}>🌱</p>
        <p style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#C99A3D', marginBottom:12 }}>Registrado</p>
        <p style={{ fontSize:13, color:'#B8AFA0', lineHeight:1.7, marginBottom:28 }}>Obrigada por se olhar com cuidado hoje.</p>
        {!isPremium && (
          <div style={{ background:'linear-gradient(145deg,#0D1008,#161200)', border:'1px solid rgba(201,154,61,0.3)', borderRadius:14, padding:16, marginBottom:20, textAlign:'left' }}>
            <p style={{ fontSize:11, color:'#C99A3D', letterSpacing:1, marginBottom:8 }}>✦ AVALIAÇÃO EVOLUTIVA — PREMIUM</p>
            <p style={{ fontSize:12, color:'#B8AFA0', lineHeight:1.6 }}>Após 3 meses de registros, você recebe uma análise completa por IA enviada no seu email.</p>
          </div>
        )}
        <button onClick={() => navigate('/dor')}
          style={{ width:'100%', height:46, borderRadius:12, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:14, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer', marginBottom:10 }}>
          🎯 Ir para Auto Avaliação
        </button>
        <button onClick={() => navigate('/avaliacao')}
          style={{ width:'100%', height:44, borderRadius:12, background:'transparent', border:'1px solid rgba(201,154,61,0.25)', color:'#C99A3D', fontSize:13, fontFamily:'Inter, sans-serif', cursor:'pointer' }}>
          📊 Ver Avaliação Evolutiva
        </button>
      </div>
    </>
  )

  return (
    <>
      <NavActions/>
      <div style={{ padding:'12px 16px', paddingBottom:'calc(120px + env(safe-area-inset-bottom,16px))', overflowY:'auto' }}>
        <p style={{ fontSize:10, letterSpacing:3, color:'#C99A3D', textTransform:'uppercase', marginBottom:4 }}>DIÁRIO HOLOS</p>
        <h2 style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:4 }}>Como você está hoje?</h2>
        <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:20 }}>Seu espaço de registro e autoconhecimento.</p>

        {/* Nota geral */}
        <div className="card">
          <p style={{ fontSize:13, color:'#B8AFA0', marginBottom:14 }}>Como foi seu dia de forma geral?</p>
          <div style={{ display:'flex', justifyContent:'space-between', gap:8 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setNota(n)}
                style={{ flex:1, height:46, borderRadius:10, border: nota===n?'1px solid #C99A3D':'1px solid rgba(201,154,61,0.15)', background: nota===n?'rgba(201,154,61,0.15)':'#111B20', color: nota===n?'#C99A3D':'#B8AFA0', fontSize:16, fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* O que pesou */}
        <div className="card">
          <p style={{ fontSize:13, color:'#B8AFA0', marginBottom:12 }}>O que mais pesou hoje?</p>
          <div style={{ display:'flex', gap:8, marginBottom:10 }}>
            {DIMS.map(d => (
              <button key={d.key} onClick={() => setPesou(p => ({ ...p, key: p.key===d.key?'':d.key }))}
                style={{ flex:1, height:40, borderRadius:10, border: pesou.key===d.key?`1px solid ${d.cor}`:'1px solid rgba(201,154,61,0.15)', background: pesou.key===d.key?`rgba(${d.cor==='#B94A3E'?'185,74,62':d.cor==='#3D9ED8'?'61,158,216':'122,79,184'},0.12)`:'#111B20', color: pesou.key===d.key?d.cor:'#B8AFA0', fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:4, fontFamily:'Inter, sans-serif' }}>
                <span>{d.emoji}</span> {d.label}
              </button>
            ))}
          </div>
          {pesou.key && (
            <input value={pesou.texto} onChange={e => setPesou(p => ({...p, texto:e.target.value}))}
              placeholder={`Escreva sobre o que pesou em ${pesou.key}...`}
              style={{ width:'100%', borderRadius:10, padding:'10px 12px', background:'rgba(0,0,0,0.2)', border:'1px solid rgba(201,154,61,0.15)', color:'#F7F1E5', fontSize:13, fontFamily:'Inter, sans-serif', outline:'none' }}/>
          )}
        </div>

        {/* O que trouxe leveza */}
        <div className="card">
          <p style={{ fontSize:13, color:'#B8AFA0', marginBottom:12 }}>O que te trouxe leveza hoje?</p>
          <div style={{ display:'flex', gap:8, marginBottom:10 }}>
            {DIMS.map(d => (
              <button key={d.key} onClick={() => setLeveza(p => ({ ...p, key: p.key===d.key?'':d.key }))}
                style={{ flex:1, height:40, borderRadius:10, border: leveza.key===d.key?`1px solid ${d.cor}`:'1px solid rgba(201,154,61,0.15)', background: leveza.key===d.key?`rgba(${d.cor==='#B94A3E'?'185,74,62':d.cor==='#3D9ED8'?'61,158,216':'122,79,184'},0.12)`:'#111B20', color: leveza.key===d.key?d.cor:'#B8AFA0', fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:4, fontFamily:'Inter, sans-serif' }}>
                <span>{d.emoji}</span> {d.label}
              </button>
            ))}
          </div>
          {leveza.key && (
            <input value={leveza.texto} onChange={e => setLeveza(p => ({...p, texto:e.target.value}))}
              placeholder={`Escreva sobre a leveza em ${leveza.key}...`}
              style={{ width:'100%', borderRadius:10, padding:'10px 12px', background:'rgba(0,0,0,0.2)', border:'1px solid rgba(201,154,61,0.15)', color:'#F7F1E5', fontSize:13, fontFamily:'Inter, sans-serif', outline:'none' }}/>
          )}
        </div>

        {/* Campo livre */}
        <div className="card">
          <p style={{ fontSize:13, color:'#B8AFA0', marginBottom:10 }}>Algo que você gostaria de falar?</p>
          <p style={{ fontSize:11, color:'rgba(201,154,61,0.6)', marginBottom:8 }}>
            Seus registros são privados e usados apenas para sua evolução dentro da plataforma.
          </p>
          <textarea value={gostaria} onChange={e => setGostaria(e.target.value)}
            placeholder="Escreva livremente... Este é seu espaço."
            style={{ width:'100%', minHeight:80, borderRadius:10, padding:'10px 12px', background:'rgba(0,0,0,0.2)', border:'1px solid rgba(201,154,61,0.15)', color:'#F7F1E5', fontSize:13, fontFamily:'Inter, sans-serif', outline:'none', resize:'none', lineHeight:1.6 }}/>
        </div>

        {!isPremium && (
          <div style={{ background:'linear-gradient(145deg,#0D1008,#161200)', border:'1px solid rgba(201,154,61,0.3)', borderRadius:14, padding:14, marginBottom:16 }}>
            <p style={{ fontSize:11, color:'#C99A3D', letterSpacing:1, marginBottom:6 }}>✦ PREMIUM</p>
            <p style={{ fontSize:12, color:'#B8AFA0', lineHeight:1.6 }}>Com 3 meses de registros, você recebe análise de perfil personalizada por IA no seu email.</p>
          </div>
        )}

        <button onClick={salvar} disabled={salvando || nota===null}
          style={{ width:'100%', height:50, borderRadius:13, background: nota===null?'rgba(201,154,61,0.08)':'linear-gradient(135deg,#B7832F,#F0C76A)', color: nota===null?'#B8AFA0':'#080808', fontSize:15, fontWeight:700, fontFamily:'Inter, sans-serif', border: nota===null?'1px solid rgba(201,154,61,0.15)':'none', cursor: nota===null?'not-allowed':'pointer', marginBottom:10 }}>
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <button onClick={() => navigate('/dor')}
            style={{ height:44, borderRadius:12, background:'rgba(201,154,61,0.08)', border:'1px solid rgba(201,154,61,0.2)', color:'#C99A3D', fontSize:12, fontFamily:'Inter, sans-serif', cursor:'pointer' }}>
            🎯 Auto Avaliação
          </button>
          <button onClick={() => navigate('/avaliacao')}
            style={{ height:44, borderRadius:12, background:'transparent', border:'1px solid rgba(201,154,61,0.15)', color:'#B8AFA0', fontSize:12, fontFamily:'Inter, sans-serif', cursor:'pointer' }}>
            📊 Avaliação
          </button>
        </div>
      </div>
    </>
  )
}
