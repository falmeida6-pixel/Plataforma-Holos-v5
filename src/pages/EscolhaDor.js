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

const DIMS = [
  { key:'Corpo', emoji:'❤️', cor:'#B94A3E', label:'Corpo' },
  { key:'Mente', emoji:'🧠', cor:'#3D9ED8', label:'Mente' },
  { key:'Consciencia', emoji:'✨', cor:'#7A4FB8', label:'Consciência' },
]

function semAcento(txt='') {
  return String(txt).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function normalizarInstancia(inst) {
  const v = semAcento(inst).toLowerCase().trim()
  if (v.includes('corpo')) return 'Corpo'
  if (v.includes('mente')) return 'Mente'
  if (v.includes('consc') || v.includes('espir')) return 'Consciencia'
  return inst || ''
}

function chaveConteudo(c) {
  const titulo = semAcento(c.titulo || '')
    .toLowerCase()
    .replace(/teste/g, '')
    .replace(/audio/g, '')
    .replace(/áudio/g, '')
    .replace(/corpo|mente|consciencia|consciência|ansiedade|solidao|solidão|para|breve|consciente/g, '')
    .replace(/[—–\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const base = titulo.split(' ').filter(Boolean).slice(0, 2).join(' ') || semAcento(c.descricao || '').toLowerCase().slice(0, 24)
  return `${normalizarInstancia(c.instancia)}|${base}`
}

function deduplicar(lista) {
  const vistosId = new Set()
  const vistosConteudo = new Set()
  const saida = []
  ;(lista || []).forEach(original => {
    const c = { ...original, instancia: normalizarInstancia(original.instancia) }
    if (!c.id || vistosId.has(c.id)) return
    vistosId.add(c.id)
    const chave = chaveConteudo(c)
    if (vistosConteudo.has(chave)) return
    vistosConteudo.add(chave)
    saida.push(c)
  })
  return saida
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
  const [mensagem, setMensagem] = useState('')

  async function buscarConteudos(dor) {
    const { data: porDor } = await supabase
      .from('conteudos')
      .select('*')
      .eq('status', 'Aprovado')
      .eq('dor', dor)
      .limit(40)

    let limpos = deduplicar(porDor)

    // Se uma dimensão estiver vazia, usa conteúdo aprovado de teste da própria dimensão como fallback visual/funcional.
    // Isso evita a quebra do tripé Corpo | Mente | Consciência enquanto o Admin ainda não existe.
    const faltantes = DIMS.filter(d => !limpos.some(c => c.instancia === d.key))
    if (faltantes.length) {
      const { data: extras } = await supabase
        .from('conteudos')
        .select('*')
        .eq('status', 'Aprovado')
        .limit(80)
      const todos = deduplicar(extras)
      faltantes.forEach(dim => {
        const extra = todos.find(c => c.instancia === dim.key && !limpos.some(x => x.id === c.id))
        if (extra) limpos.push(extra)
      })
    }

    return limpos
  }

  async function selecionarDor(dor) {
    setSelecionada(dor)
    setMensagem('')
    if (dor === 'Outra') return
    await atualizarPerfil({ dor_selecionada: dor })
    setLoadingC(true)
    setEtapa('conteudos')
    const limpos = await buscarConteudos(dor)
    setConteudos(limpos)
    setLoadingC(false)
  }

  async function confirmarOutra() {
    await atualizarPerfil({ dor_selecionada: outraTexto || 'Outra' })
    setMensagem('Em breve queremos ampliar conteúdos para situações como essa.')
  }

  async function marcarAjudou(c, dimKey) {
    if (!user || !c?.id) return
    const dimensao = normalizarInstancia(c.instancia || dimKey)
    const { error } = await supabase.from('curtidas').upsert({
      user_id: user.id,
      conteudo_id: c.id,
      dimensao,
    }, { onConflict: 'user_id,conteudo_id' })

    if (!error) {
      setCurtidas(prev => new Set([...prev, c.id]))
      setMensagem('Conteúdo marcado como “Isso me ajudou”.')
    } else {
      console.error('Erro ao salvar Isso me ajudou:', error)
      setMensagem('Não foi possível registrar agora. Tente novamente em instantes.')
    }
  }

  function ouvir(texto, id) {
    if (!window.speechSynthesis) return
    if (lendo === id) { window.speechSynthesis.cancel(); setLendo(null); return }
    const u = new SpeechSynthesisUtterance(texto || '')
    u.lang = 'pt-BR'; u.rate = 0.85
    const vozes = window.speechSynthesis.getVoices()
    const voz = vozes.find(v => v.lang.startsWith('pt')) || vozes[0]
    if (voz) u.voice = voz
    u.onend = () => setLendo(null)
    u.onerror = () => setLendo(null)
    setLendo(id)
    window.speechSynthesis.speak(u)
  }

  const algumAjudou = curtidas.size > 0

  return (
    <>
      <NavActions/>
      <div style={{ padding:'12px 16px', paddingBottom:'calc(120px + env(safe-area-inset-bottom,16px))', overflowY:'auto' }}>
        {etapa === 'escolha' && (
          <>
            <p style={{ fontSize:10, letterSpacing:3, color:'#C99A3D', textTransform:'uppercase', marginBottom:4 }}>EU HOJE</p>
            <h2 style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:6 }}>O que mais pede atenção hoje?</h2>
            <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:20, lineHeight:1.5 }}>Toque em um foco para abrir conteúdos em Corpo, Mente e Consciência.</p>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
              {DORES.map(d => (
                <button key={d.label} onClick={() => selecionarDor(d.label)}
                  style={{ minHeight:64, display:'flex', flexDirection:'column', alignItems:'flex-start', justifyContent:'center', gap:6, background: selecionada===d.label?'rgba(201,154,61,0.08)':'#111B20', border: selecionada===d.label?'1px solid #C99A3D':'1px solid rgba(201,154,61,0.2)', borderRadius:14, padding:'12px 14px', color: selecionada===d.label?'#C99A3D':'#F7F1E5', fontSize:13, fontWeight:600, cursor:'pointer', textAlign:'left', fontFamily:'Inter, sans-serif' }}>
                  <span style={{ fontSize:20 }}>{d.emoji}</span>
                  <span>{d.label}</span>
                </button>
              ))}
            </div>

            {selecionada === 'Outra' && (
              <div style={{ background:'rgba(201,154,61,0.04)', border:'1px solid rgba(201,154,61,0.2)', borderRadius:14, padding:14, marginBottom:12 }}>
                <textarea value={outraTexto} onChange={e => setOutraTexto(e.target.value)}
                  placeholder="Conte um pouco sobre o que está sentindo..."
                  style={{ width:'100%', minHeight:64, borderRadius:10, padding:'10px 12px', background:'rgba(0,0,0,0.2)', border:'1px solid rgba(201,154,61,0.2)', color:'#F7F1E5', fontSize:13, fontFamily:'Inter, sans-serif', outline:'none', resize:'none', lineHeight:1.5, marginBottom:8 }}/>
                <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:12, fontStyle:'italic' }}>Em breve queremos ampliar conteúdos para situações como essa.</p>
                <button onClick={confirmarOutra}
                  style={{ width:'100%', height:40, borderRadius:10, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:13, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer' }}>
                  Confirmar
                </button>
              </div>
            )}

            {mensagem && <p style={{ fontSize:12, color:'#C99A3D', textAlign:'center', lineHeight:1.5 }}>{mensagem}</p>}
          </>
        )}

        {etapa === 'conteudos' && (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <button onClick={() => { setEtapa('escolha'); setSelecionada(''); setConteudos([]); setCurtidas(new Set()); setMensagem('') }}
                style={{ background:'rgba(201,154,61,0.08)', border:'1px solid rgba(201,154,61,0.2)', borderRadius:8, padding:'5px 12px', color:'#B8AFA0', fontSize:12, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>‹ Trocar</button>
              <div>
                <p style={{ fontSize:10, letterSpacing:2, color:'#C99A3D', textTransform:'uppercase' }}>EU HOJE</p>
                <h2 style={{ fontFamily:'Cinzel, serif', fontSize:18, color:'#F7F1E5' }}>{selecionada}</h2>
              </div>
            </div>

            {loadingC && <div style={{ textAlign:'center', padding:40 }}><div className="spinner" style={{ margin:'0 auto' }}/></div>}

            {!loadingC && mensagem && (
              <div style={{ background:'rgba(201,154,61,0.06)', border:'1px solid rgba(201,154,61,0.18)', borderRadius:12, padding:10, marginBottom:12 }}>
                <p style={{ fontSize:12, color:'#C99A3D', textAlign:'center' }}>{mensagem}</p>
              </div>
            )}

            {!loadingC && conteudos.length === 0 && (
              <div style={{ textAlign:'center', padding:'32px 16px' }}>
                <p style={{ fontSize:32, marginBottom:12 }}>🔧</p>
                <p style={{ fontSize:13, color:'#B8AFA0', lineHeight:1.6 }}>Conteúdos para "{selecionada}" em breve.</p>
              </div>
            )}

            {!loadingC && DIMS.map(dim => {
              const items = conteudos.filter(c => c.instancia === dim.key)
              return (
                <div key={dim.key} style={{ marginBottom:20 }}>
                  <p style={{ fontSize:11, color:dim.cor, letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>
                    {dim.emoji} {dim.label}
                  </p>
                  {items.length === 0 ? (
                    <div style={{ background:'rgba(201,154,61,0.035)', border:'1px solid rgba(201,154,61,0.12)', borderRadius:12, padding:12, marginBottom:10 }}>
                      <p style={{ fontSize:12, color:'#B8AFA0', lineHeight:1.5 }}>Conteúdos desta dimensão serão ampliados em breve.</p>
                    </div>
                  ) : items.map(c => (
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
                        <button onClick={() => marcarAjudou(c, dim.key)}
                          style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8, background: curtidas.has(c.id)?'rgba(122,79,184,0.15)':'rgba(255,255,255,0.03)', border: curtidas.has(c.id)?'1px solid #7A4FB8':'1px solid rgba(201,154,61,0.25)', color: curtidas.has(c.id)?'#C99A3D':'#F7F1E5', fontSize:12, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
                          <span style={{ fontSize:14 }}>{curtidas.has(c.id)?'💙':'🤍'}</span>
                          {curtidas.has(c.id)?'Ajudou!':'Isso me ajudou'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}

            {!loadingC && algumAjudou && (
              <button onClick={() => navigate('/analise')}
                style={{ width:'100%', height:46, borderRadius:12, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:14, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer', marginBottom:10 }}>
                📓 Abrir Diário Holos
              </button>
            )}

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
