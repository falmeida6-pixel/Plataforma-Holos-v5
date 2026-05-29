import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import NavActions from '../components/NavActions'

const DORES = [
  { label:'Ansiedade', emoji:'😰' },
  { label:'Burnout', emoji:'🔥' },
  { label:'Relacionamentos', emoji:'💔' },
  { label:'Autoestima', emoji:'🪞' },
  { label:'Propósito', emoji:'🧭' },
  { label:'Solidão', emoji:'🌑' },
  { label:'Luto', emoji:'🕊️' },
  { label:'Outra', emoji:'💭' },
]

// Consciência sempre com key padronizada
const DIMS = [
  { key:'Corpo', emoji:'❤️', cor:'#B94A3E' },
  { key:'Mente', emoji:'🧠', cor:'#3D9ED8' },
  { key:'Consciencia', emoji:'✨', cor:'#7A4FB8' },
]

export default function EscolhaDor() {
  const { user, perfil, atualizarPerfil } = useAuth()
  const navigate = useNavigate()
  const [etapa, setEtapa] = useState('escolha')
  const [selecionada, setSelecionada] = useState('')
  const [outraTexto, setOutraTexto] = useState('')
  const [conteudos, setConteudos] = useState([])
  const [loadingC, setLoadingC] = useState(false)
  const [curtidas, setCurtidas] = useState(new Set())
  const [lendo, setLendo] = useState(null)

  // Clique na dor → vai direto para conteúdos
  async function selecionarDor(dor) {
    setSelecionada(dor)
    if (dor === 'Outra') return // aguarda texto e confirmação manual
    await atualizarPerfil({ dor_selecionada: dor })
    setLoadingC(true)
    setEtapa('conteudos')
    const { data } = await supabase.from('conteudos').select('*')
      .eq('status','Aprovado').eq('dor', dor).limit(12)
    setConteudos(data || [])
    setLoadingC(false)
  }

  async function confirmarOutra() {
    await atualizarPerfil({ dor_selecionada: outraTexto || 'Outra' })
    navigate('/home')
  }

  async function marcarAjudou(c) {
    if (!user || curtidas.has(c.id)) return
    await supabase.from('curtidas').upsert({ user_id:user.id, conteudo_id:c.id, dimensao:c.instancia }, { onConflict:'user_id,conteudo_id' })
    setCurtidas(prev => new Set([...prev, c.id]))
  }

  function ouvir(texto, id) {
    if (!window.speechSynthesis) return
    if (lendo === id) { window.speechSynthesis.cancel(); setLendo(null); return }
    const u = new SpeechSynthesisUtterance(texto)
    u.lang = 'pt-BR'; u.rate = 0.85
    const vozes = window.speechSynthesis.getVoices()
    const voz = vozes.find(v => v.lang.startsWith('pt')) || vozes[0]
    if (voz) u.voice = voz
    u.onend = () => setLendo(null); u.onerror = () => setLendo(null)
    setLendo(id); window.speechSynthesis.speak(u)
  }

  return (
    <>
      <NavActions/>
      <div style={{ padding:'12px 16px', paddingBottom:'calc(120px + env(safe-area-inset-bottom,16px))', overflowY:'auto' }}>

        {/* ETAPA ESCOLHA */}
        {etapa === 'escolha' && (
          <>
            <p style={{ fontSize:10, letterSpacing:3, color:'#C99A3D', textTransform:'uppercase', marginBottom:4 }}>AUTO AVALIAÇÃO</p>
            <h2 style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:6 }}>O que mais pede atenção hoje?</h2>
            <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:20, lineHeight:1.5 }}>
              Toque em uma opção para ver conteúdos direcionados.
            </p>

            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
              {DORES.map(d => (
                <div key={d.label}>
                  <button onClick={() => selecionarDor(d.label)}
                    style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', background: selecionada===d.label?'rgba(201,154,61,0.08)':'#111B20', border: selecionada===d.label?'1px solid #C99A3D':'1px solid rgba(201,154,61,0.2)', borderRadius:14, padding:'14px 18px', color: selecionada===d.label?'#C99A3D':'#F7F1E5', fontSize:14, fontWeight:500, cursor:'pointer', textAlign:'left', fontFamily:'Inter, sans-serif', transition:'all 0.15s' }}>
                    <span style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <span style={{ fontSize:20 }}>{d.emoji}</span>{d.label}
                    </span>
                    {selecionada===d.label && d.label !== 'Outra' && <span style={{ fontSize:12 }}>→</span>}
                  </button>

                  {/* Campo "Outra" aparece inline, abaixo do botão */}
                  {d.label === 'Outra' && selecionada === 'Outra' && (
                    <div style={{ background:'rgba(201,154,61,0.04)', border:'1px solid rgba(201,154,61,0.2)', borderRadius:'0 0 14px 14px', padding:14, marginTop:-4 }}>
                      <textarea value={outraTexto} onChange={e => setOutraTexto(e.target.value)}
                        placeholder="Conte um pouco sobre o que está sentindo..."
                        style={{ width:'100%', minHeight:64, borderRadius:10, padding:'10px 12px', background:'rgba(0,0,0,0.2)', border:'1px solid rgba(201,154,61,0.2)', color:'#F7F1E5', fontSize:13, fontFamily:'Inter, sans-serif', outline:'none', resize:'none', lineHeight:1.5, marginBottom:8 }}/>
                      <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:12, lineHeight:1.6, fontStyle:'italic' }}>
                        Em breve queremos ampliar conteúdos para situações como essa. Obrigada por nos contar.
                      </p>
                      <button onClick={confirmarOutra}
                        style={{ width:'100%', height:40, borderRadius:10, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:13, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer' }}>
                        Confirmar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ETAPA CONTEÚDOS */}
        {etapa === 'conteudos' && (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <button onClick={() => { setEtapa('escolha'); setSelecionada('') }}
                style={{ background:'rgba(201,154,61,0.08)', border:'1px solid rgba(201,154,61,0.2)', borderRadius:8, padding:'5px 12px', color:'#B8AFA0', fontSize:12, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>‹ Trocar</button>
              <div>
                <p style={{ fontSize:10, letterSpacing:2, color:'#C99A3D', textTransform:'uppercase' }}>AUTO AVALIAÇÃO</p>
                <h2 style={{ fontFamily:'Cinzel, serif', fontSize:18, color:'#F7F1E5' }}>{selecionada}</h2>
              </div>
            </div>

            {loadingC && <div style={{ textAlign:'center', padding:40 }}><div className="spinner" style={{ margin:'0 auto' }}/></div>}

            {!loadingC && conteudos.length === 0 && (
              <div style={{ textAlign:'center', padding:'32px 16px' }}>
                <p style={{ fontSize:32, marginBottom:12 }}>🔧</p>
                <p style={{ fontSize:13, color:'#B8AFA0', lineHeight:1.6 }}>
                  Conteúdos para "{selecionada}" em breve. Nossos profissionais estão criando material para esta área.
                </p>
              </div>
            )}

            {/* Sempre mostra as 3 dimensões */}
            {!loadingC && DIMS.map(dim => {
              // Busca por instancia exata E variações de grafia
              const items = conteudos.filter(c =>
                c.instancia === dim.key ||
                c.instancia?.toLowerCase() === dim.key.toLowerCase() ||
                (dim.key === 'Consciencia' && (c.instancia === 'Consciência' || c.instancia === 'consciencia' || c.instancia === 'espiritual' || c.instancia === 'Espiritual'))
              )
              if (!items.length) return null
              return (
                <div key={dim.key} style={{ marginBottom:20 }}>
                  <p style={{ fontSize:11, color:dim.cor, letterSpacing:2, textTransform:'uppercase', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:16 }}>{dim.emoji}</span> {dim.key === 'Consciencia' ? 'Consciência' : dim.key}
                  </p>
                  {items.map(c => (
                    <div key={c.id} style={{ background:'linear-gradient(180deg,#111B20,#0A1013)', border:`1px solid ${curtidas.has(c.id)?dim.cor:'rgba(201,154,61,0.15)'}`, borderRadius:14, padding:14, marginBottom:10 }}>
                      <p style={{ fontSize:14, fontWeight:600, color:'#F7F1E5', marginBottom:4 }}>{c.titulo}</p>
                      {c.descricao && <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:10, lineHeight:1.5 }}>{c.descricao}</p>}
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                        {c.descricao && (
                          <button onClick={() => ouvir(c.descricao, c.id)}
                            style={{ padding:'6px 12px', borderRadius:8, background: lendo===c.id?'rgba(201,154,61,0.15)':'rgba(0,0,0,0.3)', border:'1px solid rgba(201,154,61,0.2)', color: lendo===c.id?'#C99A3D':'#B8AFA0', fontSize:12, cursor:'pointer', fontFamily:'Inter, sans-serif', display:'flex', alignItems:'center', gap:5 }}>
                            {lendo===c.id?'⏹ Parar':'🎧 Ouvir'}
                          </button>
                        )}
                        {c.link_midia && (
                          <a href={c.link_midia} target="_blank" rel="noreferrer"
                            style={{ padding:'6px 12px', borderRadius:8, background:'rgba(0,0,0,0.3)', border:'1px solid rgba(201,154,61,0.2)', color:'#B8AFA0', fontSize:12, textDecoration:'none', fontFamily:'Inter, sans-serif' }}>
                            {c.formato==='Áudio'?'▶️ Áudio':c.formato==='Vídeo'?'▶️ Vídeo':'📄 Acessar'}
                          </a>
                        )}
                        <button onClick={() => marcarAjudou(c)}
                          style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8, background: curtidas.has(c.id)?'rgba(122,79,184,0.15)':'transparent', border: curtidas.has(c.id)?'1px solid #7A4FB8':'1px solid rgba(201,154,61,0.15)', color: curtidas.has(c.id)?'#7A4FB8':'#B8AFA0', fontSize:12, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
                          <span style={{ fontSize:14 }}>{curtidas.has(c.id)?'💙':'🤍'}</span>
                          {curtidas.has(c.id)?'Ajudou!':'Isso me ajudou'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}

            {/* Botão Home discreto no final */}
            {!loadingC && (
              <button onClick={() => navigate('/home')}
                style={{ width:'100%', height:42, borderRadius:12, background:'transparent', border:'1px solid rgba(201,154,61,0.15)', color:'#B8AFA0', fontSize:12, fontFamily:'Inter, sans-serif', cursor:'pointer', marginTop:4 }}>
                ⊞ Ir para Home
              </button>
            )}
          </>
        )}
      </div>
    </>
  )
}
