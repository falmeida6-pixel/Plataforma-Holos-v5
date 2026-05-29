import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import NavActions from '../components/NavActions'
import { getUserMetrics } from '../lib/userMetricsService'
import { APP_URL, APP_NAME } from '../lib/config'

export default function Perfil() {
  const { user, perfil, sair, atualizarPerfil } = useAuth()
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [nomeEdit, setNomeEdit] = useState(perfil?.nome || '')
  const [salvandoEdit, setSalvandoEdit] = useState(false)
  const [dadosAbertos, setDadosAbertos] = useState(false)

  useEffect(() => { if (user) carregar() }, [user])

  async function carregar() {
    setLoading(true)
    const dados = await getUserMetrics(user.id, { dias: 7 })
    setMetrics(dados)
    setLoading(false)
  }

  async function salvarNome() {
    if (!nomeEdit.trim()) return
    setSalvandoEdit(true)
    await atualizarPerfil({ nome: nomeEdit.trim() })
    setSalvandoEdit(false)
    setEditando(false)
  }

  function compartilharApp() {
    const msg = `Conheça a ${APP_NAME} 🌳\n${APP_URL}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const iniciais = perfil?.nome?.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() || 'HO'
  const match = metrics?.matches?.[0] || null
  const ultimaGratidao = metrics?.ultimaGratidao
  const ultimaGratidaoTexto = ultimaGratidao ? [ultimaGratidao.item1, ultimaGratidao.item2, ultimaGratidao.item3].filter(Boolean)[0] : null

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>

  return (
    <>
      <NavActions/>
      <div style={{ padding:'12px 16px', paddingBottom:'calc(120px + env(safe-area-inset-bottom,16px))', overflowY:'auto' }}>
        <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom:20 }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(201,154,61,0.12)', border:'2px solid #C99A3D', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ fontFamily:'Cinzel, serif', fontSize:22, fontWeight:700, color:'#C99A3D' }}>{iniciais}</span>
          </div>
          <div style={{ minWidth:0 }}>
            <p style={{ fontFamily:'Cinzel, serif', fontSize:18, color:'#F7F1E5', marginBottom:4 }}>{perfil?.nome}</p>
            {perfil?.plano === 'Premium'
              ? <span className="badge-premium">👑 Plano Premium</span>
              : <span className="badge-gratuito">Plano Gratuito</span>}
          </div>
        </div>

        <div style={{ background:'linear-gradient(145deg,#0D1008,#161200)', border:'1px solid rgba(201,154,61,0.3)', borderRadius:14, padding:14, marginBottom:16 }}>
          <p style={{ fontSize:12, color:'#C99A3D', fontStyle:'italic', textAlign:'center', lineHeight:1.6 }}>
            “{metrics?.fraseSemana || 'Pequenos registros também constroem caminho.'}”
          </p>
        </div>

        <p style={{ fontSize:10, letterSpacing:2, color:'#C99A3D', textTransform:'uppercase', marginBottom:10 }}>RESUMO DA SUA JORNADA</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
          {[
            ['✅', metrics?.completos || 0, 'Vitórias completas', '#5AC878'],
            ['◐', metrics?.parciais || 0, 'Vitórias parciais', '#D7A23D'],
            ['📓', metrics?.diariosTotal || 0, 'Diários preenchidos', '#3D9ED8'],
            ['🙏', metrics?.gratidoesTotal || 0, 'Gratidões registradas', '#C99A3D'],
            ['💙', metrics?.curtidasTotal || 0, 'Isso me ajudou', '#7A4FB8'],
            ['🌿', metrics?.dimMais || '—', 'Área mais presente na sua jornada', '#B94A3E'],
          ].map(([e, v, l, c]) => (
            <div key={l} className="card" style={{ textAlign:'center', marginBottom:0, padding:12 }}>
              <p style={{ fontSize:18, marginBottom:2 }}>{e}</p>
              <p style={{ fontSize: typeof v === 'string' && v.length > 4 ? 15 : 20, fontWeight:700, color:c, fontFamily:'Cinzel, serif', lineHeight:1.15 }}>{v}</p>
              <p style={{ fontSize:10, color:'#B8AFA0', marginTop:4, lineHeight:1.3 }}>{l}</p>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginBottom:16 }}>
          <p style={{ fontSize:10, letterSpacing:2, color:'#C99A3D', textTransform:'uppercase', marginBottom:10 }}>REGISTROS RECENTES</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', gap:12 }}>
              <span style={{ fontSize:12, color:'#B8AFA0' }}>Última gratidão</span>
              <span style={{ fontSize:12, color:'#F7F1E5', textAlign:'right', maxWidth:'55%' }}>{ultimaGratidaoTexto || 'Ainda sem registro'}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', gap:12 }}>
              <span style={{ fontSize:12, color:'#B8AFA0' }}>Último conteúdo que ajudou</span>
              <span style={{ fontSize:12, color:'#F7F1E5', textAlign:'right', maxWidth:'55%' }}>{metrics?.ultimoConteudo?.titulo || 'Ainda sem marcação'}</span>
            </div>
          </div>
        </div>

        <p style={{ fontSize:10, letterSpacing:2, color:'#C99A3D', textTransform:'uppercase', marginBottom:10 }}>MEU MATCH</p>
        <div className="card" style={{ marginBottom:16 }}>
          {match ? (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
              <div>
                <p style={{ fontSize:13, color:'#B8AFA0', marginBottom:4 }}>Match realizado: <strong style={{ color:'#5AC878' }}>Sim</strong></p>
                <p style={{ fontSize:14, fontWeight:600, color:'#F7F1E5' }}>{match.profissionais?.nome || 'Profissional Holos'}</p>
              </div>
              <button onClick={() => navigate('/profissionais')} style={{ padding:'6px 12px', borderRadius:8, background:'rgba(201,154,61,0.08)', border:'1px solid rgba(201,154,61,0.2)', color:'#C99A3D', fontSize:12, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>Ver perfil</button>
            </div>
          ) : (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
              <p style={{ fontSize:13, color:'#B8AFA0' }}>Match realizado: <strong style={{ color:'#D7A23D' }}>Não</strong></p>
              <button onClick={() => navigate('/profissionais')} style={{ padding:'7px 12px', borderRadius:8, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:12, fontWeight:700, border:'none', cursor:'pointer', fontFamily:'Inter, sans-serif' }}>Solicitar</button>
            </div>
          )}
        </div>

        <p style={{ fontSize:10, letterSpacing:2, color:'#C99A3D', textTransform:'uppercase', marginBottom:10 }}>MEUS DADOS</p>
        <div className="card" style={{ marginBottom:16 }}>
          {!dadosAbertos ? (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
              <div>
                <p style={{ fontSize:13, color:'#F7F1E5', fontWeight:600 }}>Dados pessoais protegidos</p>
                <p style={{ fontSize:12, color:'#B8AFA0', marginTop:4 }}>Abra apenas quando quiser visualizar ou editar.</p>
              </div>
              <button onClick={() => setDadosAbertos(true)} style={{ padding:'7px 12px', borderRadius:8, background:'rgba(201,154,61,0.08)', border:'1px solid rgba(201,154,61,0.2)', color:'#C99A3D', fontSize:12, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>Meus Dados</button>
            </div>
          ) : !editando ? (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', gap:12, alignItems:'flex-start', marginBottom:12 }}>
                <div>
                  <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:4 }}>Nome</p>
                  <p style={{ fontSize:14, color:'#F7F1E5' }}>{perfil?.nome}</p>
                </div>
                <button onClick={() => setEditando(true)} style={{ padding:'6px 12px', borderRadius:8, background:'rgba(201,154,61,0.08)', border:'1px solid rgba(201,154,61,0.2)', color:'#C99A3D', fontSize:12, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>Editar</button>
              </div>
              <div style={{ paddingTop:12, borderTop:'1px solid rgba(201,154,61,0.1)' }}>
                <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:2 }}>Email</p>
                <p style={{ fontSize:13, color:'#F7F1E5', wordBreak:'break-word' }}>{user?.email}</p>
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:8 }}>Nome</p>
              <input value={nomeEdit} onChange={e => setNomeEdit(e.target.value)} style={{ width:'100%', height:42, borderRadius:10, padding:'0 12px', background:'rgba(0,0,0,0.2)', border:'1px solid rgba(201,154,61,0.3)', color:'#F7F1E5', fontSize:14, fontFamily:'Inter, sans-serif', outline:'none', marginBottom:10 }}/>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={salvarNome} disabled={salvandoEdit} style={{ flex:1, height:38, borderRadius:10, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:13, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer' }}>{salvandoEdit ? 'Salvando...' : 'Salvar'}</button>
                <button onClick={() => { setEditando(false); setNomeEdit(perfil?.nome || '') }} style={{ flex:1, height:38, borderRadius:10, background:'transparent', border:'1px solid rgba(201,154,61,0.2)', color:'#B8AFA0', fontSize:13, fontFamily:'Inter, sans-serif', cursor:'pointer' }}>Cancelar</button>
              </div>
            </>
          )}
        </div>

        <p style={{ fontSize:10, letterSpacing:2, color:'#C99A3D', textTransform:'uppercase', marginBottom:10 }}>MAIS OPÇÕES</p>
        {[
          { emoji:'👑', label:'Assinatura', action:() => navigate('/premium') },
          { emoji:'❓', label:'Central de ajuda', action:() => navigate('/jornada') },
          { emoji:'🤝', label:'Indicar amigos', action: compartilharApp },
        ].map(item => (
          <button key={item.label} onClick={item.action} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, background:'linear-gradient(180deg,#111B20,#0A1013)', border:'1px solid rgba(201,154,61,0.12)', borderRadius:12, padding:'14px 16px', cursor:'pointer', marginBottom:8, color:'#F7F1E5', fontFamily:'Inter, sans-serif', fontSize:14 }}>
            <span style={{ fontSize:18 }}>{item.emoji}</span>
            {item.label}
            <span style={{ marginLeft:'auto', color:'#B8AFA0' }}>›</span>
          </button>
        ))}

        <button onClick={async () => { await sair(); navigate('/login') }} style={{ width:'100%', height:46, borderRadius:12, background:'transparent', border:'1px solid rgba(216,92,74,0.25)', color:'#D85C4A', fontSize:14, fontFamily:'Inter, sans-serif', cursor:'pointer', marginTop:8 }}>Sair da conta</button>
      </div>
    </>
  )
}
