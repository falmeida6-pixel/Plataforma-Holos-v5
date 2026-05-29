import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import NavActions from '../components/NavActions'

export default function Calendario() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [checkins, setCheckins] = useState([])
  const [diarios, setDiarios] = useState([])
  const [gratidoes, setGratidoes] = useState([])
  const [loading, setLoading] = useState(true)

  const hoje = new Date().toISOString().split('T')[0]

  useEffect(() => { if (user) carregar() }, [user])

  async function carregar() {
    const [c, d, g] = await Promise.all([
      supabase.from('checkins').select('data,status_dia').eq('user_id', user.id).order('data', { ascending:false }).limit(90),
      supabase.from('checkins').select('data,observacao').eq('user_id', user.id).not('observacao','is',null).order('data', { ascending:false }).limit(90),
      supabase.from('gratidao').select('data,item1,item2,item3').eq('user_id', user.id).order('data', { ascending:false }).limit(90),
    ])
    setCheckins(c.data || [])
    setDiarios(d.data || [])
    setGratidoes(g.data || [])
    setLoading(false)
  }

  const completos = checkins.filter(c => c.status_dia === 'Completo').length
  const parciais = checkins.filter(c => c.status_dia === 'Parcial').length
  const totalDiarios = diarios.length
  const totalGratidoes = gratidoes.length

  function getMensagem() {
    const total = checkins.length
    if (total === 0) return { msg:'Poucos registros ainda. Que tal começar hoje? 🌱', cor:'#D85C4A' }
    if (completos >= 5 && completos > parciais) return { msg:`${completos} dias de vitórias completas — continue celebrando! 🎉`, cor:'#5AC878' }
    if (parciais > completos) return { msg:'Conquistas parciais — sempre dá pra melhorar! 💪', cor:'#D7A23D' }
    return { msg:'Cada registro conta — você está no caminho certo. 🌿', cor:'#C99A3D' }
  }

  function getDiasDoMes() {
    const agora = new Date()
    const ano = agora.getFullYear(); const mes = agora.getMonth()
    const primeiroDia = new Date(ano, mes, 1).getDay()
    const totalDias = new Date(ano, mes + 1, 0).getDate()
    const dias = []
    for (let i = 0; i < primeiroDia; i++) dias.push(null)
    for (let d = 1; d <= totalDias; d++) {
      const str = `${ano}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      const c = checkins.find(x => x.data === str)
      const g = gratidoes.find(x => x.data === str)
      const di = diarios.find(x => x.data === str)
      dias.push({ d, str, checkin: c?.status_dia, temGratidao: !!g, temDiario: !!(di?.observacao) })
    }
    return dias
  }

  const { msg, cor } = getMensagem()
  const nomeMes = new Date().toLocaleDateString('pt-BR', { month:'long', year:'numeric' })

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>

  return (
    <>
      <NavActions/>
      <div style={{ padding:'12px 16px', paddingBottom:'calc(120px + env(safe-area-inset-bottom,16px))', overflowY:'auto' }}>
        <p style={{ fontSize:10, letterSpacing:3, color:'#C99A3D', textTransform:'uppercase', marginBottom:4 }}>CALENDÁRIO HOLOS</p>
        <h2 style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:16 }}>Sua Consistência</h2>

        {/* Métricas */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
          {[
            [completos,'✅ Completos','#5AC878'],
            [parciais,'◐ Parciais','#D7A23D'],
            [totalDiarios,'📓 Diários','#3D9ED8'],
            [totalGratidoes,'🙏 Gratidões','#C99A3D'],
          ].map(([v,l,c]) => (
            <div key={l} className="card" style={{ textAlign:'center', marginBottom:0, padding:12 }}>
              <p style={{ fontSize:20, fontWeight:700, color:c, fontFamily:'Cinzel, serif' }}>{v}</p>
              <p style={{ fontSize:10, color:'#B8AFA0', marginTop:2 }}>{l}</p>
            </div>
          ))}
        </div>

        {/* Mensagem motivacional */}
        <div style={{ background:`rgba(${cor==='#5AC878'?'90,200,120':cor==='#D7A23D'?'215,162,61':cor==='#D85C4A'?'216,92,74':'201,154,61'},0.08)`, border:`1px solid ${cor}35`, borderRadius:12, padding:12, marginBottom:14 }}>
          <p style={{ fontSize:13, color:cor, fontWeight:500, textAlign:'center' }}>{msg}</p>
        </div>

        {/* Calendário integrado */}
        <div className="card" style={{ marginBottom:14 }}>
          <p style={{ fontFamily:'Cinzel, serif', fontSize:14, color:'#C99A3D', textAlign:'center', marginBottom:12, textTransform:'capitalize' }}>{nomeMes}</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:8 }}>
            {['D','S','T','Q','Q','S','S'].map((d,i) => (
              <div key={i} style={{ textAlign:'center', fontSize:10, color:'#B8AFA0', padding:'2px 0', fontWeight:600 }}>{d}</div>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
            {getDiasDoMes().map((dia, i) => {
              if (!dia) return <div key={i}/>
              const isHoje = dia.str === hoje
              const bg = dia.checkin === 'Completo' ? 'rgba(90,200,120,0.2)'
                : dia.checkin === 'Parcial' ? 'rgba(215,162,61,0.2)'
                : 'rgba(255,255,255,0.03)'
              return (
                <div key={i} style={{ aspectRatio:1, borderRadius:8, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:bg, boxShadow: isHoje?'0 0 0 2px #C99A3D':'none', padding:1 }}>
                  <span style={{ fontSize:9, color: isHoje?'#C99A3D':'#B8AFA0', fontWeight:isHoje?700:400, lineHeight:1 }}>{dia.d}</span>
                  <div style={{ display:'flex', gap:1, marginTop:1 }}>
                    {dia.checkin === 'Completo' && <span style={{ fontSize:6 }}>✅</span>}
                    {dia.checkin === 'Parcial' && <span style={{ fontSize:6 }}>◐</span>}
                    {dia.temGratidao && <span style={{ fontSize:6 }}>✨</span>}
                    {dia.temDiario && <span style={{ fontSize:6 }}>📓</span>}
                  </div>
                </div>
              )
            })}
          </div>
          {/* Legenda */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:12, justifyContent:'center' }}>
            {[['✅','Completo'],['◐','Parcial'],['✨','Gratidão'],['📓','Diário']].map(([s,l]) => (
              <span key={l} style={{ fontSize:10, color:'#B8AFA0' }}>{s} {l}</span>
            ))}
          </div>
        </div>

        {/* Botões */}
        <button onClick={() => navigate('/mapa')}
          style={{ width:'100%', height:46, borderRadius:12, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:14, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer', marginBottom:10 }}>
          🗺️ Mapa Holos
        </button>
        <button onClick={() => navigate('/gratidao')}
          style={{ width:'100%', height:44, borderRadius:12, background:'rgba(201,154,61,0.08)', border:'1px solid rgba(201,154,61,0.25)', color:'#C99A3D', fontSize:13, fontFamily:'Inter, sans-serif', cursor:'pointer' }}>
          🙏 Diário de Gratidão
        </button>
      </div>
    </>
  )
}
