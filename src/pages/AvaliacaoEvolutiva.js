import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import NavActions from '../components/NavActions'

export default function AvaliacaoEvolutiva() {
  const { user, perfil } = useAuth()
  const navigate = useNavigate()
  const [totalRegistros, setTotalRegistros] = useState(0)
  const [loading, setLoading] = useState(true)
  const isPremium = perfil?.plano === 'Premium'
  const META_DIAS = 90
  const progresso = Math.min(Math.round((totalRegistros / META_DIAS) * 100), 100)
  const liberada = isPremium && totalRegistros >= META_DIAS

  useEffect(() => { carregarTotal() }, [user])

  async function carregarTotal() {
    const { count } = await supabase
      .from('checkins').select('*', { count:'exact', head:true })
      .eq('user_id', user.id).not('nota_geral', 'is', null)
    setTotalRegistros(count || 0)
    setLoading(false)
  }

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>

  return (
    <>
      <NavActions/>
      <div style={{ padding:'12px 16px', paddingBottom:'calc(120px + env(safe-area-inset-bottom,16px))', overflowY:'auto' }}>
        <p style={{ fontSize:10, letterSpacing:3, color:'#C99A3D', textTransform:'uppercase', marginBottom:4 }}>AVALIAÇÃO EVOLUTIVA HOLOS</p>
        <h2 style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:6 }}>Análise do Seu Perfil</h2>
        <p style={{ fontSize:13, color:'#B8AFA0', marginBottom:20, lineHeight:1.6 }}>
          Receba uma análise personalizada da sua evolução nas três dimensões.
        </p>

        {!isPremium ? (
          <div style={{ background:'linear-gradient(145deg,#0D1008,#161200)', border:'1px solid rgba(201,154,61,0.4)', borderRadius:20, padding:24, marginBottom:20, textAlign:'center' }}>
            <div style={{ fontSize:44, marginBottom:14 }}>📊</div>
            <p style={{ fontFamily:'Cinzel, serif', fontSize:17, color:'#C99A3D', marginBottom:12 }}>Análise de Perfil Personalizada</p>
            <p style={{ fontSize:13, color:'#B8AFA0', lineHeight:1.7, marginBottom:20 }}>
              Com 3 meses de uso contínuo do Diário Holos, você recebe uma análise completa do seu perfil emocional enviada diretamente no seu email.
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
              {[['🎯','Padrões identificados'],['🧠','Análise das 3 dimensões'],['📈','Evolução ao longo do tempo'],['💌','Enviada por email']].map(([e,t]) => (
                <div key={t} style={{ background:'rgba(201,154,61,0.06)', border:'1px solid rgba(201,154,61,0.15)', borderRadius:12, padding:12, textAlign:'left' }}>
                  <p style={{ fontSize:18, marginBottom:6 }}>{e}</p>
                  <p style={{ fontSize:12, color:'#B8AFA0', lineHeight:1.4 }}>{t}</p>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/premium')}
              style={{ width:'100%', height:48, borderRadius:12, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:15, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer' }}>
              Quero ser Premium
            </button>
          </div>
        ) : !liberada ? (
          <div style={{ background:'linear-gradient(145deg,#0D1008,#161200)', border:'1px solid rgba(201,154,61,0.35)', borderRadius:20, padding:24, marginBottom:20, textAlign:'center' }}>
            <div style={{ fontSize:44, marginBottom:14 }}>⏳</div>
            <p style={{ fontFamily:'Cinzel, serif', fontSize:16, color:'#C99A3D', marginBottom:12 }}>Sua análise está sendo construída</p>
            <p style={{ fontSize:13, color:'#B8AFA0', lineHeight:1.6, marginBottom:20 }}>
              Continue registrando no Diário Holos. Após 3 meses, sua análise será gerada e enviada por email.
            </p>
            <div style={{ marginBottom:8, display:'flex', justifyContent:'space-between' }}>
              <p style={{ fontSize:12, color:'#B8AFA0' }}>Seu progresso</p>
              <p style={{ fontSize:12, color:'#C99A3D', fontWeight:600 }}>{totalRegistros}/{META_DIAS} dias</p>
            </div>
            <div style={{ background:'rgba(201,154,61,0.08)', borderRadius:8, height:8, overflow:'hidden', marginBottom:6 }}>
              <div style={{ height:'100%', width:`${progresso}%`, background:'linear-gradient(90deg,#8A6424,#F0C76A)', borderRadius:8, transition:'width 1s ease' }}/>
            </div>
            <p style={{ fontSize:11, color:'#B8AFA0', marginBottom:20 }}>{META_DIAS - totalRegistros} dias restantes</p>
            <button onClick={() => navigate('/analise')}
              style={{ width:'100%', height:44, borderRadius:12, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:14, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer' }}>
              Fazer registro de hoje
            </button>
          </div>
        ) : (
          <div style={{ background:'linear-gradient(145deg,#0D1008,#161200)', border:'1px solid rgba(201,154,61,0.4)', borderRadius:20, padding:24, marginBottom:20, textAlign:'center' }}>
            <div style={{ fontSize:44, marginBottom:14 }}>🎉</div>
            <p style={{ fontFamily:'Cinzel, serif', fontSize:16, color:'#C99A3D', marginBottom:12 }}>Sua análise está disponível!</p>
            <p style={{ fontSize:13, color:'#B8AFA0', lineHeight:1.6, marginBottom:20 }}>
              Parabéns! Sua análise de perfil foi gerada e enviada para <strong style={{ color:'#F7F1E5' }}>{user?.email}</strong>.
            </p>
            <button onClick={() => navigate('/mapa')}
              style={{ width:'100%', height:44, borderRadius:12, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:14, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer' }}>
              Ver Mapa Holos →
            </button>
          </div>
        )}
      </div>
    </>
  )
}
