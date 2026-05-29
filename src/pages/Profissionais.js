import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import NavActions from '../components/NavActions'

const TESTE_PROS = [
  { id:'t1', nome:'TESTE Helena', especialidades:'Psicanálise • Ansiedade • Autoestima', bio:'Psicanalista com foco em autoconhecimento e desenvolvimento pessoal.', plano:'Premium' },
  { id:'t2', nome:'TESTE Rafael', especialidades:'Psicologia • Burnout • Propósito', bio:'Psicólogo com experiência em saúde mental no trabalho.', plano:'Gratuito' },
  { id:'t3', nome:'TESTE Miriam', especialidades:'Terapia Integrativa • Relacionamentos • Luto', bio:'Terapeuta especializada em transições de vida e processos emocionais.', plano:'Gratuito' },
]

export default function Profissionais() {
  const { user } = useAuth()
  const [profissionais, setProfissionais] = useState([])
  const [estrelas, setEstrelas] = useState({}) // { profissional_email: count }
  const [loading, setLoading] = useState(true)
  const [matches, setMatches] = useState(new Set())
  const [salvando, setSalvando] = useState(null)

  useEffect(() => { carregar() }, [user])

  async function carregar() {
    const [prosData, matchData] = await Promise.all([
      supabase.from('profissionais').select('id,nome,especialidades,bio,plano,status,email_contato').eq('status','Ativo').limit(20),
      supabase.from('matches').select('profissional_id').eq('user_id', user?.id),
    ])
    const lista = prosData.data?.length ? prosData.data : TESTE_PROS
    setProfissionais(lista)
    setMatches(new Set(matchData.data?.map(m => m.profissional_id) || []))

    // Calcula estrelas: curtidas em conteúdos cujo profissional_origem = email do pro
    const { data: curtidasData } = await supabase
      .from('curtidas').select('conteudo_id, conteudos(profissional_origem)')
    const contagem = {}
    ;(curtidasData || []).forEach(c => {
      const origem = c.conteudos?.profissional_origem
      if (origem) contagem[origem] = (contagem[origem] || 0) + 1
    })
    setEstrelas(contagem)
    setLoading(false)
  }

  // Converte contagem em estrelas 1-5
  function getEstrelas(email) {
    const total = estrelas[email] || 0
    if (total === 0) return 0
    if (total <= 2) return 1
    if (total <= 5) return 2
    if (total <= 10) return 3
    if (total <= 20) return 4
    return 5
  }

  async function solicitarMatch(proId) {
    if (!user || matches.has(proId)) return
    setSalvando(proId)
    await supabase.from('matches').insert({
      user_id:user.id, profissional_id:proId,
      email_usuario:user.email, plano_usuario:'Gratuito',
      status:'Solicitado', data_match:new Date().toISOString()
    })
    setMatches(prev => new Set([...prev, proId]))
    setSalvando(null)
  }

  function getIniciais(nome) {
    return nome.split(' ').filter(n => !n.startsWith('TESTE')).map(n=>n[0]).slice(0,2).join('').toUpperCase() || 'PR'
  }

  function renderEstrelas(qtd) {
    return Array.from({length:5}).map((_, i) => (
      <span key={i} style={{ fontSize:13, color: i < qtd ? '#C99A3D' : 'rgba(201,154,61,0.2)' }}>★</span>
    ))
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
          const estrelasPro = getEstrelas(pro.email_contato || pro.email)
          return (
            <div key={pro.id} style={{ background:'linear-gradient(180deg,#111B20,#0A1013)', border: pro.plano==='Premium'?'1px solid rgba(201,154,61,0.35)':'1px solid rgba(201,154,61,0.15)', borderRadius:16, padding:16, marginBottom:12 }}>
              <div style={{ display:'flex', gap:14, alignItems:'flex-start', marginBottom:10 }}>
                <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(201,154,61,0.1)', border:`2px solid ${pro.plano==='Premium'?'#C99A3D':'rgba(201,154,61,0.3)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontFamily:'Cinzel, serif', fontSize:16, fontWeight:700, color:'#C99A3D' }}>{getIniciais(pro.nome)}</span>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                    <p style={{ fontSize:15, fontWeight:700, color:'#F7F1E5', fontFamily:'Inter, sans-serif' }}>{pro.nome.replace('TESTE ','')}</p>
                    {pro.plano === 'Premium' && <span style={{ fontSize:10, padding:'2px 6px', borderRadius:10, background:'rgba(201,154,61,0.15)', color:'#C99A3D', border:'1px solid rgba(201,154,61,0.3)' }}>👑 Premium</span>}
                  </div>
                  <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:4 }}>{pro.especialidades}</p>
                  {/* Estrelas baseadas em curtidas */}
                  {estrelasPro > 0 && (
                    <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:4 }}>
                      {renderEstrelas(estrelasPro)}
                      <span style={{ fontSize:10, color:'#B8AFA0', marginLeft:4 }}>avaliação dos usuários</span>
                    </div>
                  )}
                </div>
              </div>
              {pro.bio && <p style={{ fontSize:12, color:'#B8AFA0', lineHeight:1.6, marginBottom:12 }}>{pro.bio}</p>}
              <button onClick={() => solicitarMatch(pro.id)} disabled={jaFezMatch || salvando===pro.id}
                style={{ width:'100%', height:42, borderRadius:10, background: jaFezMatch?'rgba(90,200,120,0.1)':'linear-gradient(135deg,#B7832F,#F0C76A)', color: jaFezMatch?'#5AC878':'#080808', fontSize:13, fontWeight:700, fontFamily:'Inter, sans-serif', border: jaFezMatch?'1px solid rgba(90,200,120,0.3)':'none', cursor: jaFezMatch?'default':'pointer' }}>
                {salvando===pro.id ? 'Solicitando...' : jaFezMatch ? '✓ Match solicitado' : 'Solicitar Match'}
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
