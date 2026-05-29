import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import NavActions from '../components/NavActions'

const TESTE_PROS = [
  { id:'t1', nome:'TESTE Helena', especialidades:'Psicanálise • Ansiedade • Autoestima', bio:'Psicanalista com foco em autoconhecimento e desenvolvimento pessoal.', plano:'Premium' },
  { id:'t2', nome:'TESTE Rafael', especialidades:'Psicologia • Burnout • Propósito', bio:'Psicólogo com experiência em saúde mental no trabalho e esgotamento.', plano:'Gratuito' },
  { id:'t3', nome:'TESTE Miriam', especialidades:'Terapia Integrativa • Relacionamentos • Luto', bio:'Terapeuta especializada em transições de vida e processos emocionais.', plano:'Gratuito' },
]

export default function Profissionais() {
  const { user } = useAuth()
  const [profissionais, setProfissionais] = useState([])
  const [loading, setLoading] = useState(true)
  const [matches, setMatches] = useState(new Set())
  const [salvando, setSalvando] = useState(null)

  useEffect(() => { carregar() }, [user])

  async function carregar() {
    const { data } = await supabase.from('profissionais').select('id,nome,especialidades,bio,plano,status').eq('status','Ativo').limit(20)
    const { data: matchData } = await supabase.from('matches').select('profissional_id').eq('user_id', user?.id)
    setProfissionais(data?.length ? data : TESTE_PROS)
    setMatches(new Set(matchData?.map(m => m.profissional_id) || []))
    setLoading(false)
  }

  async function solicitarMatch(proId, proNome) {
    if (!user || matches.has(proId)) return
    setSalvando(proId)
    await supabase.from('matches').insert({ user_id:user.id, profissional_id:proId, email_usuario:user.email, plano_usuario:'Gratuito', status:'Solicitado', data_match:new Date().toISOString() })
    setMatches(prev => new Set([...prev, proId]))
    setSalvando(null)
  }

  function getIniciais(nome) {
    return nome.split(' ').filter(n => !n.startsWith('TESTE')).map(n=>n[0]).slice(0,2).join('').toUpperCase() || 'PR'
  }

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>

  return (
    <>
      <NavActions/>
      <div style={{ padding:'12px 16px', paddingBottom:'calc(120px + env(safe-area-inset-bottom,16px))', overflowY:'auto' }}>
        <p style={{ fontSize:10, letterSpacing:3, color:'#C99A3D', textTransform:'uppercase', marginBottom:4 }}>PROFISSIONAIS HOLOS</p>
        <h2 style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:6 }}>Encontre seu profissional</h2>
        <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:20, lineHeight:1.5 }}>
          Solicite um match e nossa equipe fará a conexão. O contato é liberado após aprovação.
        </p>

        {profissionais.map(pro => {
          const jaFezMatch = matches.has(pro.id)
          return (
            <div key={pro.id} style={{ background:'linear-gradient(180deg,#111B20,#0A1013)', border: pro.plano==='Premium'?'1px solid rgba(201,154,61,0.35)':'1px solid rgba(201,154,61,0.15)', borderRadius:16, padding:16, marginBottom:12 }}>
              <div style={{ display:'flex', gap:14, alignItems:'flex-start', marginBottom:12 }}>
                {/* Avatar */}
                <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(201,154,61,0.1)', border:`2px solid ${pro.plano==='Premium'?'#C99A3D':'rgba(201,154,61,0.3)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontFamily:'Cinzel, serif', fontSize:16, fontWeight:700, color:'#C99A3D' }}>{getIniciais(pro.nome)}</span>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                    <p style={{ fontSize:15, fontWeight:700, color:'#F7F1E5', fontFamily:'Inter, sans-serif' }}>{pro.nome.replace('TESTE ','')}</p>
                    {pro.plano === 'Premium' && <span style={{ fontSize:10, padding:'2px 6px', borderRadius:10, background:'rgba(201,154,61,0.15)', color:'#C99A3D', border:'1px solid rgba(201,154,61,0.3)' }}>👑 Premium</span>}
                  </div>
                  <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:4 }}>{pro.especialidades}</p>
                </div>
              </div>
              {pro.bio && <p style={{ fontSize:12, color:'#B8AFA0', lineHeight:1.6, marginBottom:12 }}>{pro.bio}</p>}
              <button onClick={() => solicitarMatch(pro.id, pro.nome)} disabled={jaFezMatch || salvando === pro.id}
                style={{ width:'100%', height:42, borderRadius:10, background: jaFezMatch?'rgba(90,200,120,0.1)':'linear-gradient(135deg,#B7832F,#F0C76A)', color: jaFezMatch?'#5AC878':'#080808', fontSize:13, fontWeight:700, fontFamily:'Inter, sans-serif', border: jaFezMatch?'1px solid rgba(90,200,120,0.3)':'none', cursor: jaFezMatch?'default':'pointer' }}>
                {salvando === pro.id ? 'Solicitando...' : jaFezMatch ? '✓ Match solicitado' : 'Solicitar Match'}
              </button>
            </div>
          )
        })}

        <p style={{ fontSize:11, color:'#B8AFA0', textAlign:'center', lineHeight:1.6, marginTop:8, fontStyle:'italic' }}>
          O contato do profissional é liberado apenas após aprovação do match pela nossa equipe.
        </p>
      </div>
    </>
  )
}
