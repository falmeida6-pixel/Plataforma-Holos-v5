import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { APP_URL, APP_NAME, APP_TAGLINE } from '../lib/config'

export default function ReflexaoDiaria() {
  const navigate = useNavigate()
  const [reflexao, setReflexao] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lendo, setLendo] = useState(false)
  const utteranceRef = useRef(null)

  const hoje = new Date()
  const dataFormatada = hoje.toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
  const dataStr = hoje.toLocaleDateString('pt-BR', { day:'numeric', month:'long', year:'numeric' })

  useEffect(() => {
    carregarReflexao()
    return () => window.speechSynthesis?.cancel()
  }, [])

  async function carregarReflexao() {
    const hj = hoje.toISOString().split('T')[0]
    const { data } = await supabase
      .from('reflexoes_dia').select('*').eq('ativa', true)
      .lte('data', hj).order('data', { ascending:false }).limit(1).single()
    setReflexao(data)
    setLoading(false)
  }

  function getMensagemCompartilhar() {
    return `📅 ${dataStr}\n\n"${reflexao?.texto_reflexao || 'A direção é para dentro.'}"\n\nEstou utilizando a ${APP_NAME} para desenvolver Corpo, Mente e Consciência.\n\nConheça:\n${APP_URL}\n\n🌳 ${APP_NAME}\n${APP_TAGLINE}`
  }

  async function compartilhar() {
    if (!reflexao) return
    const mensagem = getMensagemCompartilhar()
    // Prioridade 1: navigator.share (mobile nativo)
    if (navigator.share) {
      try {
        await navigator.share({ text: mensagem })
        return
      } catch (e) {
        // usuário cancelou ou não suportado — fallback
      }
    }
    // Prioridade 2: WhatsApp
    window.open(`https://wa.me/?text=${encodeURIComponent(mensagem)}`, '_blank')
  }

  function ouvir() {
    if (!window.speechSynthesis) return
    if (lendo) { window.speechSynthesis.cancel(); setLendo(false); return }
    const u = new SpeechSynthesisUtterance(`Reflexão do dia. ${reflexao?.texto_reflexao || ''}`)
    u.lang = 'pt-BR'; u.rate = 0.85
    const vozes = window.speechSynthesis.getVoices()
    const voz = vozes.find(v => v.lang.startsWith('pt')) || vozes[0]
    if (voz) u.voice = voz
    u.onstart = () => setLendo(true)
    u.onend = () => setLendo(false)
    u.onerror = () => setLendo(false)
    utteranceRef.current = u
    window.speechSynthesis.speak(u)
  }

  if (loading) return (
    <div className="loading-screen">
      <img src="/arvore.png" alt="" style={{ width:50, opacity:0.6 }}/>
      <div className="spinner"/>
    </div>
  )

  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      background:'radial-gradient(ellipse at 50% 20%, rgba(201,154,61,0.18) 0%, transparent 55%), linear-gradient(180deg,#05090B,#0D0D05 50%,#05090B)',
    }}>
      <div style={{
        flex:1, display:'flex', flexDirection:'column', padding:'20px 20px',
        paddingBottom:'calc(100px + env(safe-area-inset-bottom,16px))',
        overflowY:'auto', WebkitOverflowScrolling:'touch',
      }}>
        {/* Data */}
        <p style={{ fontSize:11, color:'#B8AFA0', textAlign:'center', marginBottom:16, textTransform:'capitalize' }}>
          {dataFormatada}
        </p>

        {/* Label */}
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <p style={{ fontSize:10, letterSpacing:4, textTransform:'uppercase', color:'#C99A3D', fontWeight:600, marginBottom:10 }}>REFLEXÃO DO DIA</p>
          <div style={{ width:32, height:1, background:'rgba(201,154,61,0.45)', margin:'0 auto' }}/>
        </div>

        {/* Frase */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', minHeight:120, marginBottom:24 }}>
          <p style={{ fontFamily:'Cinzel, serif', fontSize:18, lineHeight:1.9, color:'#F7F1E5', fontWeight:500, textAlign:'center' }}>
            {reflexao ? `"${reflexao.texto_reflexao}"` : '"A direção é para dentro."'}
          </p>
        </div>

        {/* Botões secundários */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
          <button onClick={compartilhar}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'linear-gradient(135deg,#B7832F,#F0C76A)', border:'none', borderRadius:12, height:46, cursor:'pointer' }}>
            <span style={{ fontSize:18 }}>💬</span>
            <span style={{ fontSize:13, color:'#080808', fontWeight:700, fontFamily:'Inter, sans-serif' }}>Compartilhar</span>
          </button>
          <button onClick={ouvir}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, background: lendo?'rgba(201,154,61,0.1)':'#111B20', border: lendo?'1px solid rgba(201,154,61,0.45)':'1px solid rgba(201,154,61,0.2)', borderRadius:12, height:46, cursor:'pointer', animation: lendo?'pulse 1.5s ease-in-out infinite':'none' }}>
            <span style={{ fontSize:18 }}>{lendo?'⏹️':'🎧'}</span>
            <span style={{ fontSize:13, color: lendo?'#C99A3D':'#B8AFA0', fontWeight:600, fontFamily:'Inter, sans-serif' }}>{lendo?'Parar':'Ouvir'}</span>
          </button>
        </div>

        <button onClick={() => navigate('/checkin')}
          style={{ width:'100%', height:50, borderRadius:13, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:15, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer', marginBottom:10 }}>
          ✅ Fazer Check-in Diário
        </button>
        <button onClick={() => navigate('/gratidao')}
          style={{ width:'100%', height:44, borderRadius:12, background:'transparent', border:'1px solid rgba(201,154,61,0.3)', color:'#C99A3D', fontSize:14, fontWeight:600, fontFamily:'Inter, sans-serif', cursor:'pointer' }}>
          🙏 Exercitar Gratidão
        </button>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  )
}
