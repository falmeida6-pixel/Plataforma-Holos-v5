import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import NavActions from '../components/NavActions'
import { hojeLocal } from '../lib/dataLocal'
import { normalizarDimensao } from '../lib/userMetricsService'

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

const DIMS = [
  { key:'Corpo', emoji:'❤️', cor:'#B94A3E', desc:'Práticas para regular corpo, respiração e rotina.' },
  { key:'Mente', emoji:'🧠', cor:'#3D9ED8', desc:'Textos e exercícios para organizar pensamentos.' },
  { key:'Consciência', emoji:'✨', cor:'#7A4FB8', desc:'Direção, presença, sentido e espiritualidade.' },
]

const TEXTO_TESTE = 'A direção é para dentro. Respire, observe e escolha um pequeno gesto de cuidado para hoje.'

function normalizarConteudo(c) {
  const dim = normalizarDimensao(c.instancia || c.dimensao || c.categoria) || 'Mente'
  return { ...c, instancia: dim }
}

function conteudoTeste(dim, dor) {
  return {
    id: `teste-${dor}-${dim.key}`,
    titulo: `${dim.key}: cuidado inicial`,
    descricao: TEXTO_TESTE,
    instancia: dim.key,
    formato: 'Texto',
    isTeste: true,
  }
}

export default function EscolhaDor() {
  const { user, atualizarPerfil } = useAuth()
  const navigate = useNavigate()
  const [etapa, setEtapa] = useState('escolha')
  const [selecionada, setSelecionada] = useState('')
  const [outraTexto, setOutraTexto] = useState('')
  const [conteudos, setConteudos] = useState([])
  const [loadingC, setLoadingC] = useState(false)
  const [curtidas, setCurtidas] = useState(new Set())
  const [lendo, setLendo] = useState(null)

  const dataFormatada = new Date(hojeLocal() + 'T12:00:00').toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long' })

  useEffect(() => {
    async function carregarCurtidas() {
      if (!user) return
      const { data } = await supabase.from('curtidas').select('conteudo_id').eq('user_id', user.id)
      setCurtidas(new Set((data || []).map(c => c.conteudo_id)))
    }
    carregarCurtidas()
  }, [user])

  const conteudosPorDimensao = useMemo(() => {
    const mapa = { Corpo: [], Mente: [], 'Consciência': [] }
    ;(conteudos || []).forEach(c => {
      const dim = normalizarDimensao(c.instancia || c.dimensao || c.categoria) || 'Mente'
      if (!mapa[dim]) mapa[dim] = []
      mapa[dim].push({ ...c, instancia: dim })
    })
    return mapa
  }, [conteudos])

  async function selecionarDor(dor) {
    setSelecionada(dor)
    if (dor === 'Outra') return
    await atualizarPerfil({ dor_selecionada: dor })
    await carregarConteudos(dor)
  }

  async function carregarConteudos(dor) {
    setLoadingC(true)
    setEtapa('conteudos')

    const { data } = await supabase
      .from('conteudos')
      .select('*')
      .eq('status', 'Aprovado')
      .eq('dor', dor)
      .limit(60)

    const vistos = new Set()
    const limpos = []
    ;(data || []).map(normalizarConteudo).forEach(c => {
      const chave = c.id || `${c.titulo}-${c.instancia}-${c.dor}`
      if (vistos.has(chave)) return
      vistos.add(chave)
      limpos.push(c)
    })

    const final = [...limpos]
    DIMS.forEach(dim => {
      if (!final.some(c => c.instancia === dim.key)) final.push(conteudoTeste(dim, dor))
    })

    setConteudos(final)
    setLoadingC(false)
  }

  async function confirmarOutra() {
    const texto = outraTexto.trim()
    if (!texto) return
    await atualizarPerfil({ dor_selecionada: texto })
    setSelecionada(texto)
    setEtapa('outra')
  }

  async function marcarAjudou(c) {
    if (!user || !c.id || String(c.id).startsWith('teste-') || curtidas.has(c.id)) return
    await supabase.from('curtidas').upsert({
      user_id: user.id,
      conteudo_id: c.id,
      dimensao: normalizarDimensao(c.instancia) || c.instancia,
    }, { onConflict:'user_id,conteudo_id' })
    setCurtidas(prev => new Set([...prev, c.id]))
  }

  function ouvir(texto, id) {
    if (!window.speechSynthesis || !texto) return
    if (lendo === id) { window.speechSynthesis.cancel(); setLendo(null); return }
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(texto)
    u.lang = 'pt-BR'; u.rate = 0.85
    const vozes = window.speechSynthesis.getVoices()
    const voz = vozes.find(v => v.lang.startsWith('pt')) || vozes[0]
    if (voz) u.voice = voz
    u.onend = () => setLendo(null)
    u.onerror = () => setLendo(null)
    setLendo(id)
    window.speechSynthesis.speak(u)
  }

  return (
    <>
      <NavActions/>
      <div style={{ padding:'12px 16px', paddingBottom:'calc(120px + env(safe-area-inset-bottom,16px))', overflowY:'auto' }}>
        {etapa === 'escolha' && (
          <>
            <p style={{ fontSize:11, color:'#B8AFA0', marginBottom:4, textTransform:'capitalize' }}>{dataFormatada}</p>
            <p style={{ fontSize:10, letterSpacing:3, color:'#C99A3D', textTransform:'uppercase', marginBottom:4 }}>AUTOAVALIAÇÃO HOLOS</p>
            <h2 style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:6 }}>O que mais pede cuidado hoje?</h2>
            <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:18, lineHeight:1.5 }}>Toque em uma área para acessar conteúdos em Corpo, Mente e Consciência.</p>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              {DORES.map(d => (
                <button key={d.label} onClick={() => selecionarDor(d.label)}
                  style={{ minHeight:76, display:'flex', flexDirection:'column', alignItems:'flex-start', justifyContent:'center', gap:6, background: selecionada===d.label?'rgba(201,154,61,0.08)':'#111B20', border: selecionada===d.label?'1px solid #C99A3D':'1px solid rgba(201,154,61,0.2)', borderRadius:14, padding:'12px 14px', color: selecionada===d.label?'#C99A3D':'#F7F1E5', cursor:'pointer', textAlign:'left', fontFamily:'Inter, sans-serif' }}>
                  <span style={{ fontSize:21 }}>{d.emoji}</span>
                  <span style={{ fontSize:13, fontWeight:600 }}>{d.label}</span>
                </button>
              ))}
            </div>

            {selecionada === 'Outra' && (
              <div style={{ background:'rgba(201,154,61,0.04)', border:'1px solid rgba(201,154,61,0.2)', borderRadius:14, padding:14, marginBottom:16 }}>
                <textarea value={outraTexto} onChange={e => setOutraTexto(e.target.value.slice(0, 180))}
                  placeholder="Escreva em poucas palavras o que pede cuidado hoje..."
                  style={{ width:'100%', minHeight:64, borderRadius:10, padding:'10px 12px', background:'rgba(0,0,0,0.2)', border:'1px solid rgba(201,154,61,0.2)', color:'#F7F1E5', fontSize:13, fontFamily:'Inter, sans-serif', outline:'none', resize:'none', lineHeight:1.5, marginBottom:8 }}/>
                <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:12, fontStyle:'italic' }}>
                  Em breve queremos ampliar conteúdos para situações como essa.
                </p>
                <button onClick={confirmarOutra} disabled={!outraTexto.trim()}
                  style={{ width:'100%', height:40, borderRadius:10, background: outraTexto.trim()?'linear-gradient(135deg,#B7832F,#F0C76A)':'rgba(201,154,61,0.08)', color: outraTexto.trim()?'#080808':'#B8AFA0', fontSize:13, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor: outraTexto.trim()?'pointer':'not-allowed' }}>
                  Registrar cuidado
                </button>
              </div>
            )}
          </>
        )}

        {etapa === 'outra' && (
          <div style={{ textAlign:'center', padding:'36px 8px' }}>
            <p style={{ fontSize:36, marginBottom:12 }}>🌿</p>
            <p style={{ fontFamily:'Cinzel, serif', color:'#C99A3D', fontSize:18, marginBottom:10 }}>Registro acolhido</p>
            <p style={{ fontSize:13, color:'#B8AFA0', lineHeight:1.7, marginBottom:20 }}>Em breve queremos ampliar conteúdos para situações como essa.</p>
            <button onClick={() => navigate('/home')} style={{ width:'100%', height:44, borderRadius:12, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:14, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer' }}>Voltar para Home</button>
          </div>
        )}

        {etapa === 'conteudos' && (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <button onClick={() => { window.speechSynthesis?.cancel(); setEtapa('escolha'); setSelecionada('') }}
                style={{ background:'rgba(201,154,61,0.08)', border:'1px solid rgba(201,154,61,0.2)', borderRadius:8, padding:'5px 12px', color:'#B8AFA0', fontSize:12, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>‹ Trocar</button>
              <div>
                <p style={{ fontSize:10, letterSpacing:2, color:'#C99A3D', textTransform:'uppercase' }}>AUTOAVALIAÇÃO HOLOS</p>
                <h2 style={{ fontFamily:'Cinzel, serif', fontSize:18, color:'#F7F1E5' }}>{selecionada}</h2>
              </div>
            </div>

            {loadingC && <div style={{ textAlign:'center', padding:40 }}><div className="spinner" style={{ margin:'0 auto' }}/></div>}

            {!loadingC && DIMS.map(dim => {
              const items = conteudosPorDimensao[dim.key] || []
              return (
                <div key={dim.key} style={{ marginBottom:20 }}>
                  <p style={{ fontSize:11, color:dim.cor, letterSpacing:2, textTransform:'uppercase', marginBottom:6 }}>{dim.emoji} {dim.key}</p>
                  <p style={{ fontSize:11, color:'#B8AFA0', lineHeight:1.45, marginBottom:10 }}>{dim.desc}</p>
                  {items.length === 0 ? (
                    <div style={{ background:'rgba(201,154,61,0.04)', border:'1px solid rgba(201,154,61,0.12)', borderRadius:12, padding:12, marginBottom:10 }}>
                      <p style={{ fontSize:12, color:'#B8AFA0' }}>Conteúdos dessa dimensão serão ampliados em breve.</p>
                    </div>
                  ) : items.map(c => {
                    const teste = String(c.id).startsWith('teste-')
                    return (
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
                          {(c.link_midia || c.url_externa || c.pdf_url) && (
                            <a href={c.link_midia || c.url_externa || c.pdf_url} target="_blank" rel="noreferrer"
                              style={{ padding:'6px 12px', borderRadius:8, background:'rgba(0,0,0,0.3)', border:'1px solid rgba(201,154,61,0.2)', color:'#B8AFA0', fontSize:12, textDecoration:'none', fontFamily:'Inter, sans-serif' }}>
                              {c.formato==='Áudio'?'▶️ Áudio':c.formato==='Vídeo'?'▶️ Vídeo':'📄 Acessar'}
                            </a>
                          )}
                          <button onClick={() => marcarAjudou(c)} disabled={teste}
                            style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8, background: curtidas.has(c.id)?'rgba(122,79,184,0.15)':'transparent', border: curtidas.has(c.id)?'1px solid #7A4FB8':'1px solid rgba(201,154,61,0.15)', color: teste?'rgba(184,175,160,0.45)':curtidas.has(c.id)?'#7A4FB8':'#B8AFA0', fontSize:12, cursor: teste?'default':'pointer', fontFamily:'Inter, sans-serif' }}>
                            <span style={{ fontSize:14 }}>{curtidas.has(c.id)?'💙':'🤍'}</span>
                            {curtidas.has(c.id)?'Ajudou!':'Isso me ajudou'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}

            <button onClick={() => navigate('/home')}
              style={{ width:'100%', height:42, borderRadius:12, background:'transparent', border:'1px solid rgba(201,154,61,0.15)', color:'#B8AFA0', fontSize:12, fontFamily:'Inter, sans-serif', cursor:'pointer', marginTop:4 }}>
              ⊞ Ir para Home
            </button>
          </>
        )}
      </div>
    </>
  )
}
