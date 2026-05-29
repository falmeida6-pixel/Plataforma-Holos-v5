import NavActions from '../components/NavActions'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function MapaHolos() {
  const { user, perfil } = useAuth()
  const navigate = useNavigate()
  const [dados, setDados] = useState({ corpo:0, mente:0, consciencia:0 })
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const isPremium = perfil?.plano === 'Premium'

  useEffect(() => {
    if (isPremium) { calcular() } else { setLoading(false) }
  }, [user])

  async function calcular() {
    const { data } = await supabase
      .from('checkins').select('vitoria_corpo,vitoria_mente,vitoria_consciencia')
      .eq('user_id', user.id).order('data', { ascending:false }).limit(30)
    if (!data || data.length === 0) { setLoading(false); return }
    const n = data.length
    setDados({
      corpo: Math.round((data.filter(c => c.vitoria_corpo).length / n) * 100),
      mente: Math.round((data.filter(c => c.vitoria_mente).length / n) * 100),
      consciencia: Math.round((data.filter(c => c.vitoria_consciencia).length / n) * 100),
    })
    setTotal(n)
    setLoading(false)
  }

  if (!isPremium) return (
    <>
      <NavActions/>
      <div style={{ padding:'12px 16px', paddingBottom:'calc(120px + env(safe-area-inset-bottom,16px))' }}>
        <p style={{ fontSize:10, letterSpacing:3, color:'#C99A3D', textTransform:'uppercase', marginBottom:4 }}>MAPA HOLOS</p>
        <h2 style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:20 }}>Sua Evolução nas 3 Dimensões</h2>
        <div style={{ background:'linear-gradient(145deg,#0D1008,#161200)', border:'1px solid rgba(201,154,61,0.35)', borderRadius:20, padding:32, textAlign:'center' }}>
          <div style={{ fontSize:42, marginBottom:14 }}>🔒</div>
          <p style={{ fontFamily:'Cinzel, serif', fontSize:16, color:'#C99A3D', marginBottom:12 }}>Recurso Premium</p>
          <p style={{ fontSize:13, color:'#B8AFA0', lineHeight:1.6, marginBottom:20 }}>
            O Mapa Holos visualiza seu equilíbrio em Corpo, Mente e Consciência com base nos últimos 30 dias de check-in.
          </p>
          <button onClick={() => navigate('/premium')}
            style={{ width:'100%', height:46, borderRadius:12, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:14, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer' }}>
            Conhecer o Premium
          </button>
        </div>
      </div>
    </>
  )

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>

  const equilibrio = Math.round((dados.corpo + dados.mente + dados.consciencia) / 3)
  const cx=140, cy=130, r=95
  const angulos = { mente:-90, corpo:150, consciencia:30 }
  function pt(dim, pct) {
    const a = angulos[dim] * (Math.PI/180), d = r*(pct/100)
    return { x: cx+d*Math.cos(a), y: cy+d*Math.sin(a) }
  }
  function ptBase(dim) {
    const a = angulos[dim] * (Math.PI/180)
    return { x: cx+r*Math.cos(a), y: cy+r*Math.sin(a) }
  }
  const pm=pt('mente',dados.mente), pc=pt('corpo',dados.corpo), pco=pt('consciencia',dados.consciencia)
  const bm=ptBase('mente'), bc=ptBase('corpo'), bco=ptBase('consciencia')

  return (
    <>
      <NavActions/>
      <div style={{ padding:'12px 16px', paddingBottom:'calc(120px + env(safe-area-inset-bottom,16px))', overflowY:'auto' }}>
        <p style={{ fontSize:10, letterSpacing:3, color:'#C99A3D', textTransform:'uppercase', marginBottom:4 }}>MAPA HOLOS</p>
        <h2 style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:6 }}>Sua Evolução nas 3 Dimensões</h2>
        <p style={{ fontSize:13, color:'#B8AFA0', marginBottom:16 }}>Baseado nos últimos {total} check-ins.</p>

        <div style={{ background:'linear-gradient(145deg,#0D1008,#161200)', border:'1px solid rgba(201,154,61,0.3)', borderRadius:20, padding:20, marginBottom:16 }}>
          <svg width="100%" viewBox="0 0 280 260" style={{ display:'block', maxWidth:280, margin:'0 auto' }}>
            <polygon points={`${bm.x},${bm.y} ${bc.x},${bc.y} ${bco.x},${bco.y}`} fill="rgba(201,154,61,0.04)" stroke="rgba(201,154,61,0.2)" strokeWidth="1" strokeDasharray="4,4"/>
            {[0.25,0.5,0.75].map(f => {
              const p1=pt('mente',f*100),p2=pt('corpo',f*100),p3=pt('consciencia',f*100)
              return <polygon key={f} points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`} fill="none" stroke="rgba(201,154,61,0.08)" strokeWidth="1"/>
            })}
            <line x1={cx} y1={cy} x2={bm.x} y2={bm.y} stroke="rgba(201,154,61,0.15)" strokeWidth="1"/>
            <line x1={cx} y1={cy} x2={bc.x} y2={bc.y} stroke="rgba(201,154,61,0.15)" strokeWidth="1"/>
            <line x1={cx} y1={cy} x2={bco.x} y2={bco.y} stroke="rgba(201,154,61,0.15)" strokeWidth="1"/>
            <polygon points={`${pm.x},${pm.y} ${pc.x},${pc.y} ${pco.x},${pco.y}`} fill="rgba(201,154,61,0.18)" stroke="rgba(201,154,61,0.7)" strokeWidth="2"/>
            <circle cx={pm.x} cy={pm.y} r="5" fill="#3D9ED8"/>
            <circle cx={pc.x} cy={pc.y} r="5" fill="#B94A3E"/>
            <circle cx={pco.x} cy={pco.y} r="5" fill="#7A4FB8"/>
            <text x={bm.x} y={bm.y-10} textAnchor="middle" fill="#3D9ED8" fontSize="11" fontFamily="Inter">MENTE</text>
            <text x={bm.x} y={bm.y+4} textAnchor="middle" fill="#3D9ED8" fontSize="13" fontFamily="Inter" fontWeight="700">{dados.mente}%</text>
            <text x={bc.x+6} y={bc.y+4} textAnchor="start" fill="#B94A3E" fontSize="11" fontFamily="Inter">CORPO</text>
            <text x={bc.x+6} y={bc.y+18} textAnchor="start" fill="#B94A3E" fontSize="13" fontFamily="Inter" fontWeight="700">{dados.corpo}%</text>
            <text x={bco.x-6} y={bco.y+4} textAnchor="end" fill="#7A4FB8" fontSize="11" fontFamily="Inter">CONSCIÊNCIA</text>
            <text x={bco.x-6} y={bco.y+18} textAnchor="end" fill="#7A4FB8" fontSize="13" fontFamily="Inter" fontWeight="700">{dados.consciencia}%</text>
            <circle cx={cx} cy={cy} r="3" fill="rgba(201,154,61,0.5)"/>
          </svg>
          <div style={{ textAlign:'center', marginTop:8 }}>
            <p style={{ fontSize:12, color:'#B8AFA0' }}>Equilíbrio geral</p>
            <p style={{ fontFamily:'Cinzel, serif', fontSize:30, color:'#C99A3D', fontWeight:600 }}>{equilibrio}%</p>
            <p style={{ fontSize:13, color:'#B8AFA0' }}>
              {equilibrio>=80?'🌟 Excelente equilíbrio!':equilibrio>=60?'✨ Você está evoluindo.':equilibrio>=40?'🌱 Continue construindo.':'💙 Cada passo conta.'}
            </p>
          </div>
        </div>

        {[['💪 Corpo',dados.corpo,'#B94A3E'],['🧠 Mente',dados.mente,'#3D9ED8'],['✨ Consciência',dados.consciencia,'#7A4FB8']].map(([l,v,c]) => (
          <div key={l} style={{ marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
              <p style={{ fontSize:13, color:'#F7F1E5' }}>{l}</p>
              <p style={{ fontSize:13, fontWeight:600, color:c }}>{v}%</p>
            </div>
            <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:6, height:7, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${v}%`, background:c, borderRadius:6, transition:'width 1s ease', opacity:0.8 }}/>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
