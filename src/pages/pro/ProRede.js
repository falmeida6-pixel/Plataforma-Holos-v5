import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export default function ProRede() {
  const { user } = useAuth()
  const [pro, setPro] = useState(null)
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { carregar() }, [user])

  async function carregar() {
    const { data } = await supabase.from('profissionais').select('*').eq('user_id', user.id).single()
    setPro(data)
  }

  async function indicar() {
    if (!email || !pro) return
    setEnviando(true)
    const { error } = await supabase.from('indicacoes').insert({ profissional_indicador_id: pro.id, profissional_indicado_email: email, status:'pendente' })
    if (!error) { setMsg('Indicação enviada com sucesso!'); setEmail('') }
    else setMsg('Erro ao enviar indicação.')
    setEnviando(false)
    setTimeout(() => setMsg(''), 3000)
  }

  const ind = pro?.indicacoes_confirmadas || 0
  const nivelInfo = ind < 1 ? { proximo:'1 indicação', beneficio:'Destaque temporário de 7 dias' }
    : ind < 3 ? { proximo:'3 indicações', beneficio:'Facilitador Holos' }
    : ind < 5 ? { proximo:'5 indicações', beneficio:'Embaixador Holos' }
    : { proximo:'10 indicações', beneficio:'Destaque recorrente' }

  return (
    <div className="page-content" style={{ paddingTop:16 }}>
      <p style={{ fontSize:10, letterSpacing:3, color:'#C99A3D', textTransform:'uppercase', marginBottom:4 }}>REDE HOLOS</p>
      <h2 style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:20 }}>Indique e cresça com a comunidade.</h2>

      <div style={{ background:'linear-gradient(145deg,#0D1008,#161200)', border:'1px solid rgba(201,154,61,0.35)', borderRadius:18, padding:20, marginBottom:20, textAlign:'center' }}>
        <p style={{ fontSize:40, fontFamily:'Cinzel, serif', color:'#C99A3D', fontWeight:700 }}>{ind}</p>
        <p style={{ fontSize:13, color:'#B8AFA0' }}>indicações confirmadas</p>
        <div style={{ height:1, background:'rgba(201,154,61,0.15)', margin:'14px 0' }}/>
        <p style={{ fontSize:12, color:'#B8AFA0' }}>Próximo: <strong style={{ color:'#F7F1E5' }}>{nivelInfo.proximo}</strong></p>
        <p style={{ fontSize:12, color:'#C99A3D' }}>→ {nivelInfo.beneficio}</p>
      </div>

      <p style={{ fontSize:11, color:'#C99A3D', letterSpacing:2, marginBottom:12 }}>CONVIDAR PROFISSIONAL</p>
      {msg && <div style={{ background:'rgba(90,200,120,0.1)', border:'1px solid rgba(90,200,120,0.3)', borderRadius:10, padding:12, marginBottom:12, color:'#5AC878', fontSize:13 }}>{msg}</div>}
      <input placeholder="Email do profissional" value={email} onChange={e => setEmail(e.target.value)}
        style={{ width:'100%', height:42, borderRadius:10, padding:'0 14px', background:'#111B20', border:'1px solid rgba(201,154,61,0.2)', color:'#F7F1E5', fontSize:14, fontFamily:'Inter, sans-serif', outline:'none', marginBottom:10 }}/>
      <button onClick={indicar} disabled={enviando || !email}
        style={{ width:'100%', height:46, borderRadius:12, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:14, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer', marginBottom:24 }}>
        {enviando ? 'Enviando...' : 'Convidar profissional'}
      </button>

      <p style={{ fontSize:11, color:'#C99A3D', letterSpacing:2, marginBottom:12 }}>COMO FUNCIONA</p>
      {[['1 indicação confirmada','Destaque temporário do perfil por 7 dias','#C99A3D'],
        ['3 indicações confirmadas','Evolução para Facilitador Holos','#3D9ED8'],
        ['5 indicações confirmadas','Evolução para Embaixador Holos','#7A4FB8'],
        ['10 indicações confirmadas','Destaque recorrente e acesso antecipado','#5AC878']
      ].map(([req, ben, cor]) => (
        <div key={req} style={{ background:'linear-gradient(180deg,#111B20,#0A1013)', border:`1px solid ${cor}30`, borderRadius:12, padding:12, marginBottom:8, display:'flex', gap:12, alignItems:'center' }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:cor, flexShrink:0 }}/>
          <div>
            <p style={{ fontSize:12, fontWeight:600, color:'#F7F1E5' }}>{req}</p>
            <p style={{ fontSize:11, color:'#B8AFA0' }}>{ben}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
