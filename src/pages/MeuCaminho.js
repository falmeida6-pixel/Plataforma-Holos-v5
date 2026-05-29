import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import NavActions from '../components/NavActions'

const ABAS = [
  { id:'resumo', label:'Resumo' },
  { id:'hoje', label:'Hoje' },
  { id:'vitórias', label:'Vitórias' },
  { id:'gratidão', label:'Gratidão' },
  { id:'materiais', label:'Materiais' },
  { id:'mapa', label:'Mapa' },
]

export default function MeuCaminho() {
  const { user, perfil } = useAuth()
  const navigate = useNavigate()
  const [aba, setAba] = useState('resumo')
  const [loading, setLoading] = useState(true)
  const [checkins, setCheckins] = useState([])
  const [gratidoes, setGratidoes] = useState([])
  const [curtidas, setCurtidas] = useState([])

  const hoje = new Date().toISOString().split('T')[0]
  const inicioSemana = (() => { const d=new Date(); d.setDate(d.getDate()-6); return d.toISOString().split('T')[0] })()

  useEffect(() => { if (user) carregar() }, [user])

  async function carregar() {
    const [c, g, cu] = await Promise.all([
      supabase.from('checkins').select('*').eq('user_id', user.id).order('data', { ascending:false }).limit(60),
      supabase.from('gratidao').select('*').eq('user_id', user.id).order('data', { ascending:false }).limit(30),
      supabase.from('curtidas').select('*,conteudos(titulo,instancia,link_midia)').eq('user_id', user.id).order('created_at', { ascending:false }).limit(20),
    ])
    setCheckins(c.data || [])
    setGratidoes(g.data || [])
    setCurtidas(cu.data || [])
    setLoading(false)
  }

  const semana = checkins.filter(c => c.data >= inicioSemana)
  const completos = checkins.filter(c => c.status_dia === 'Completo').length
  const parciais = checkins.filter(c => c.status_dia === 'Parcial').length
  const semRegistro = Math.max(0, 30 - checkins.filter(c => { const d=new Date(); d.setDate(d.getDate()-29); return c.data >= d.toISOString().split('T')[0] }).length)

  // Dimensão predominante
  const dimScore = { Corpo:0, Mente:0, Consciencia:0 }
  checkins.slice(0,30).forEach(c => {
    if (c.vitoria_corpo) dimScore.Corpo++
    if (c.vitoria_mente) dimScore.Mente++
    if (c.vitoria_consciencia) dimScore.Consciencia++
  })
  curtidas.forEach(c => { const d=c.conteudos?.instancia; if (d && dimScore[d]!==undefined) dimScore[d]+=2 })
  const maxScore = Math.max(...Object.values(dimScore))
  const dimPredom = maxScore===0 ? null : Object.entries(dimScore).filter(([,v])=>v===maxScore).length>1 ? 'equilibrada' : Object.entries(dimScore).find(([,v])=>v===maxScore)?.[0]

  // Frase semana
  const completosSem = semana.filter(c=>c.status_dia==='Completo').length
  let fraseSemana = 'Continue registrando. Cada passo conta.'
  if (completosSem>=5) fraseSemana = `Você completou ${completosSem} dias de vitórias nesta semana. Celebre!`
  else if (semana.filter(c=>c.status_dia==='Parcial').length > completosSem) fraseSemana = 'Você manteve presença mesmo em dias parciais. Isso também é consistência.'
  else if (semana.length===0) fraseSemana = 'Que tal recomeçar hoje? Cada registro importa.'
  if (gratidoes.filter(g=>g.data>=inicioSemana).length>0) fraseSemana += ' Você também registrou gratidão esta semana.'

  // Próximo passo
  const checkinHoje = checkins.find(c=>c.data===hoje)
  const gratidaoHoje = gratidoes.find(g=>g.data===hoje)
  const proximoPasso = !checkinHoje ? { label:'Fazer Check-in', path:'/checkin', emoji:'✅' }
    : !gratidaoHoje ? { label:'Registrar Gratidão', path:'/gratidao', emoji:'🙏' }
    : { label:'Ver Mapa Holos', path:'/mapa', emoji:'🗺️' }

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>

  return (
    <>
      <NavActions/>
      <div style={{ padding:'12px 16px', paddingBottom:'calc(120px + env(safe-area-inset-bottom,16px))', overflowY:'auto' }}>

        <p style={{ fontSize:10, letterSpacing:3, color:'#C99A3D', textTransform:'uppercase', marginBottom:2 }}>MEU CAMINHO HOLOS</p>
        <h2 style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:4 }}>Sua Trajetória</h2>
        <p style={{ fontSize:13, color:'#B8AFA0', marginBottom:16, fontStyle:'italic', lineHeight:1.5 }}>
          {checkins.length===0 ? 'Sua jornada está começando. O primeiro passo pode ser pequeno.'
            : completosSem>=5 ? `Você completou ${completosSem} dias de vitórias nesta semana.`
            : checkins.length>=3 ? 'Pequenos registros também constroem caminho.'
            : 'Sua jornada continua. Cada dia é uma nova oportunidade.'}
        </p>

        {/* Abas com scroll suave */}
        <div style={{ display:'flex', gap:6, overflowX:'auto', marginBottom:20, paddingBottom:2, WebkitOverflowScrolling:'touch', scrollbarWidth:'none', msOverflowStyle:'none' }}>
          {ABAS.map(a => (
            <button key={a.id} onClick={() => setAba(a.id)}
              style={{ padding:'7px 16px', borderRadius:20, fontSize:12, fontWeight:600, fontFamily:'Inter, sans-serif', border: aba===a.id?'1px solid #C99A3D':'1px solid rgba(201,154,61,0.2)', background: aba===a.id?'rgba(201,154,61,0.12)':'#111B20', color: aba===a.id?'#C99A3D':'#B8AFA0', cursor:'pointer', whiteSpace:'nowrap', flexShrink:0, transition:'all 0.15s' }}>
              {a.label}
            </button>
          ))}
        </div>

        {/* RESUMO */}
        {aba === 'resumo' && (
          <>
            <div style={{ background:'linear-gradient(145deg,#0D1008,#161200)', border:'1px solid rgba(201,154,61,0.25)', borderRadius:16, padding:16, marginBottom:14 }}>
              <p style={{ fontSize:10, color:'#C99A3D', letterSpacing:2, textTransform:'uppercase', marginBottom:8 }}>✦ LEITURA DA SEMANA</p>
              <p style={{ fontSize:13, color:'#F7F1E5', lineHeight:1.7, fontStyle:'italic' }}>"{fraseSemana}"</p>
            </div>
            <p style={{ fontSize:13, color:'#F7F1E5', lineHeight:1.7, marginBottom:14 }}>
              Você teve <strong style={{ color:'#5AC878' }}>{completos} vitórias completas</strong>, <strong style={{ color:'#D7A23D' }}>{parciais} parciais</strong> e {semRegistro} dias sem registro nos últimos 30 dias.
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
              {[
                ['🙏', gratidoes.length, 'Gratidões', '#C99A3D'],
                ['💙', curtidas.length, '"Isso me ajudou"', '#7A4FB8'],
                ['🌿', dimPredom?(dimPredom==='equilibrada'?'Eq.':dimPredom):'—', 'Área mais presente', '#B94A3E'],
              ].map(([e,v,l,c]) => (
                <div key={l} className="card" style={{ textAlign:'center', marginBottom:0, padding:12 }}>
                  <p style={{ fontSize:18, marginBottom:2 }}>{e}</p>
                  <p style={{ fontSize:20, fontWeight:700, color:c, fontFamily:'Cinzel, serif', lineHeight:1 }}>{v}</p>
                  <p style={{ fontSize:10, color:'#B8AFA0', marginTop:4, lineHeight:1.3 }}>{l}</p>
                </div>
              ))}
            </div>
            {curtidas.length>0 && curtidas[0].conteudos && (
              <div style={{ background:'linear-gradient(180deg,#111B20,#0A1013)', border:'1px solid rgba(122,79,184,0.25)', borderRadius:14, padding:14 }}>
                <p style={{ fontSize:10, color:'#7A4FB8', letterSpacing:2, textTransform:'uppercase', marginBottom:8 }}>💙 AJUDOU RECENTEMENTE</p>
                <p style={{ fontSize:13, fontWeight:600, color:'#F7F1E5' }}>{curtidas[0].conteudos.titulo}</p>
                <p style={{ fontSize:11, color:'#B8AFA0', marginTop:2 }}>{curtidas[0].conteudos.instancia}</p>
              </div>
            )}
          </>
        )}

        {/* HOJE */}
        {aba === 'hoje' && (
          <>
            <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:14 }}>
              {new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long' }).replace(/^\w/, c=>c.toUpperCase())}
            </p>
            <div className="card" style={{ marginBottom:14 }}>
              <p style={{ fontSize:11, color:'#C99A3D', letterSpacing:1, textTransform:'uppercase', marginBottom:12 }}>Hoje você já registrou:</p>
              {[
                { feito:!!checkinHoje, label: checkinHoje?.status_dia==='Completo'?'Check-in completo':checkinHoje?'Check-in parcial':'Check-in pendente' },
                { feito:!!gratidaoHoje, label: gratidaoHoje?'Gratidão registrada':'Gratidão pendente' },
              ].map(item => (
                <div key={item.label} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <div style={{ width:18, height:18, borderRadius:'50%', background: item.feito?'rgba(90,200,120,0.2)':'rgba(255,255,255,0.04)', border:`1px solid ${item.feito?'#5AC878':'rgba(201,154,61,0.2)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {item.feito && <span style={{ fontSize:9, color:'#5AC878' }}>✓</span>}
                  </div>
                  <p style={{ fontSize:13, color: item.feito?'#F7F1E5':'#B8AFA0' }}>{item.label}</p>
                </div>
              ))}
            </div>
            <div style={{ background:'linear-gradient(145deg,#0D1008,#161200)', border:'1px solid rgba(201,154,61,0.3)', borderRadius:16, padding:16 }}>
              <p style={{ fontSize:10, color:'#C99A3D', letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>✦ PRÓXIMO PASSO</p>
              <button onClick={() => navigate(proximoPasso.path)}
                style={{ width:'100%', height:46, borderRadius:12, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:14, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                <span style={{ fontSize:18 }}>{proximoPasso.emoji}</span> {proximoPasso.label}
              </button>
            </div>
          </>
        )}

        {/* VITÓRIAS */}
        {aba === 'vitórias' && (
          checkins.length===0
            ? <Vazio msg="Nenhum check-in ainda." btn="Fazer Check-in" onClick={() => navigate('/checkin')}/>
            : checkins.slice(0,15).map(c => (
              <div key={c.id} className="card" style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:'#F7F1E5' }}>
                    {new Date(c.data+'T12:00:00').toLocaleDateString('pt-BR', { weekday:'short', day:'numeric', month:'short' })}
                  </p>
                  <span style={{ fontSize:11, padding:'2px 8px', borderRadius:10, background: c.status_dia==='Completo'?'rgba(90,200,120,0.15)':'rgba(215,162,61,0.15)', color: c.status_dia==='Completo'?'#5AC878':'#D7A23D', border:'1px solid currentColor' }}>{c.status_dia}</span>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  {[['❤️',c.vitoria_corpo,'#B94A3E'],['🧠',c.vitoria_mente,'#3D9ED8'],['✨',c.vitoria_consciencia,'#7A4FB8']].map(([e,v,cor]) => v && v!=='Concluído' ? (
                    <div key={e} style={{ flex:1, background:`${cor}10`, borderRadius:8, padding:'5px 6px' }}>
                      <span style={{ fontSize:12 }}>{e}</span>
                      <p style={{ fontSize:10, color:'#B8AFA0', marginTop:1, lineHeight:1.3 }}>{v.slice(0,24)}</p>
                    </div>
                  ) : v ? (
                    <div key={e} style={{ width:28, height:28, borderRadius:8, background:`${cor}15`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <span style={{ fontSize:14 }}>{e}</span>
                    </div>
                  ) : null)}
                </div>
              </div>
            ))
        )}

        {/* GRATIDÃO */}
        {aba === 'gratidão' && (
          gratidoes.length===0
            ? <Vazio msg="Você ainda não registrou gratidão." btn="Registrar Gratidão" onClick={() => navigate('/gratidao')}/>
            : <>
              <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:14, fontStyle:'italic' }}>"Gratidão registrada não apaga o peso do dia, mas ajuda a perceber o que ainda sustenta você."</p>
              {gratidoes.slice(0,8).map((g,i) => (
                <div key={i} className="card" style={{ marginBottom:10 }}>
                  <p style={{ fontSize:12, color:'#C99A3D', fontWeight:600, marginBottom:8 }}>
                    {new Date(g.data+'T12:00:00').toLocaleDateString('pt-BR', { weekday:'short', day:'numeric', month:'short' })}
                  </p>
                  {[g.item1,g.item2,g.item3].filter(Boolean).map((item,j) => (
                    <div key={j} style={{ display:'flex', gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:12 }}>🙏</span>
                      <p style={{ fontSize:12, color:'#B8AFA0', lineHeight:1.5 }}>{item}</p>
                    </div>
                  ))}
                </div>
              ))}
              <button onClick={() => navigate('/gratidao')} style={{ width:'100%', height:44, borderRadius:12, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:13, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer' }}>
                🙏 Registrar Gratidão
              </button>
            </>
        )}

        {/* MATERIAIS */}
        {aba === 'materiais' && (
          curtidas.length===0
            ? <Vazio msg='Quando um conteúdo tocar você, marque "Isso me ajudou" para encontrá-lo aqui.' btn="Explorar conteúdos" onClick={() => navigate('/dor')}/>
            : <>
              <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:14, fontStyle:'italic' }}>"Estes conteúdos foram marcados por você como úteis na sua jornada."</p>
              {['Corpo','Mente','Consciencia'].map(dim => {
                const items = curtidas.filter(c=>c.conteudos?.instancia===dim)
                if (!items.length) return null
                const cor=dim==='Corpo'?'#B94A3E':dim==='Mente'?'#3D9ED8':'#7A4FB8'
                const emoji=dim==='Corpo'?'❤️':dim==='Mente'?'🧠':'✨'
                return (
                  <div key={dim} style={{ marginBottom:16 }}>
                    <p style={{ fontSize:10, color:cor, letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>{emoji} {dim==='Consciencia'?'Consciência':dim}</p>
                    {items.map((c,i) => (
                      <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:10, background:'linear-gradient(180deg,#111B20,#0A1013)', border:`1px solid ${cor}20`, borderRadius:12, padding:'10px 14px', marginBottom:8 }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:13, color:'#F7F1E5', fontWeight:500 }}>{c.conteudos?.titulo}</p>
                          <p style={{ fontSize:10, color:'#B8AFA0', marginTop:2 }}>{new Date(c.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                        {c.conteudos?.link_midia && (
                          <a href={c.conteudos.link_midia} target="_blank" rel="noreferrer" style={{ padding:'5px 10px', borderRadius:8, background:`${cor}15`, border:`1px solid ${cor}40`, color:cor, fontSize:11, textDecoration:'none', fontFamily:'Inter, sans-serif', flexShrink:0 }}>Abrir</a>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })}
            </>
        )}

        {/* MAPA */}
        {aba === 'mapa' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {dimPredom && (
              <div style={{ background:'rgba(201,154,61,0.04)', border:'1px solid rgba(201,154,61,0.15)', borderRadius:12, padding:14, marginBottom:4 }}>
                <p style={{ fontSize:13, color:'#F7F1E5', lineHeight:1.6, fontStyle:'italic' }}>
                  "{dimPredom==='equilibrada'?'Sua jornada esteve distribuída entre Corpo, Mente e Consciência.'
                    :dimPredom==='Corpo'?'O Corpo pediu mais cuidado nos seus registros recentes.'
                    :dimPredom==='Mente'?'A Mente apareceu com mais frequência nos seus registros.'
                    :'A Consciência apareceu como ponto de direção nesta jornada.'}"
                </p>
              </div>
            )}
            <button onClick={() => navigate('/mapa')} style={{ width:'100%', height:60, borderRadius:14, background:'linear-gradient(145deg,#0D1008,#161200)', border:'1px solid rgba(201,154,61,0.35)', color:'#F7F1E5', fontSize:15, fontWeight:600, fontFamily:'Inter, sans-serif', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:12 }}>
              <span style={{ fontSize:22 }}>🗺️</span> Mapa Holos
            </button>
            <button onClick={() => navigate('/avaliacao')} style={{ width:'100%', height:60, borderRadius:14, background:'linear-gradient(180deg,#111B20,#0A1013)', border:'1px solid rgba(201,154,61,0.2)', color:'#F7F1E5', fontSize:15, fontWeight:600, fontFamily:'Inter, sans-serif', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:12 }}>
              <span style={{ fontSize:22 }}>📊</span> Avaliação Evolutiva
            </button>
          </div>
        )}
      </div>
    </>
  )
}

function Vazio({ msg, btn, onClick }) {
  return (
    <div style={{ textAlign:'center', padding:'32px 16px' }}>
      <p style={{ fontSize:13, color:'#B8AFA0', marginBottom:20, lineHeight:1.7 }}>{msg}</p>
      <button onClick={onClick} style={{ padding:'10px 24px', borderRadius:12, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:13, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer' }}>{btn}</button>
    </div>
  )
}
