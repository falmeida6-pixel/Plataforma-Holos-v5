import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import NavActions from '../components/NavActions'

export default function Perfil() {
  const { user, perfil, sair, atualizarPerfil } = useAuth()
  const navigate = useNavigate()
  const [dados, setDados] = useState({ completos:0, parciais:0, diarios:0, gratidoes:0, curtidas:0, dimMais:'—', fraseSemana:'' })
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [nomeEdit, setNomeEdit] = useState(perfil?.nome || '')
  const [salvandoEdit, setSalvandoEdit] = useState(false)

  useEffect(() => { if (user) carregar() }, [user])

  async function carregar() {
    const inicioSemana = (() => { const d = new Date(); d.setDate(d.getDate()-6); return d.toISOString().split('T')[0] })()
    const [checkins, diarios, grats, curts, matchData] = await Promise.all([
      supabase.from('checkins').select('status_dia,data').eq('user_id', user.id).gte('data', inicioSemana),
      supabase.from('checkins').select('data').eq('user_id', user.id).not('nota_geral','is',null),
      supabase.from('gratidao').select('data').eq('user_id', user.id),
      supabase.from('curtidas').select('dimensao').eq('user_id', user.id),
      supabase.from('matches').select('*,profissionais(nome)').eq('user_id', user.id).order('data_match',{ascending:false}).limit(1).single(),
    ])
    const c = checkins.data || []
    const completos = c.filter(x=>x.status_dia==='Completo').length
    const parciais = c.filter(x=>x.status_dia==='Parcial').length
    const dimCount = { Corpo:0, Mente:0, Consciencia:0 }
    ;(curts.data||[]).forEach(x => { if (dimCount[x.dimensao]!==undefined) dimCount[x.dimensao]++ })
    const maxD = Math.max(...Object.values(dimCount))
    const dimMais = maxD===0?'—':Object.entries(dimCount).sort((a,b)=>b[1]-a[1])[0]?.[0]||'—'
    const total = c.length
    let frase = 'Continue sua jornada diária. 🌿'
    if (completos>=5) frase=`Você completou ${completos} dias de vitórias — celebre! 🎉`
    else if (total>=3) frase=`${total} registros feitos nesta semana — cada dia conta. ✨`
    setDados({ completos, parciais, diarios:diarios.data?.length||0, gratidoes:grats.data?.length||0, curtidas:curts.data?.length||0, dimMais, fraseSemana:frase })
    if (matchData.data) setMatch(matchData.data)
    setLoading(false)
  }

  async function salvarNome() {
    if (!nomeEdit.trim()) return
    setSalvandoEdit(true)
    await atualizarPerfil({ nome: nomeEdit.trim() })
    setSalvandoEdit(false); setEditando(false)
  }

  const iniciais = perfil?.nome?.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase() || 'HO'

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>

  return (
    <>
      <NavActions/>
      <div style={{ padding:'12px 16px', paddingBottom:'calc(120px + env(safe-area-inset-bottom,16px))', overflowY:'auto' }}>

        {/* Avatar + nome */}
        <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom:20 }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(201,154,61,0.12)', border:'2px solid #C99A3D', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ fontFamily:'Cinzel, serif', fontSize:22, fontWeight:700, color:'#C99A3D' }}>{iniciais}</span>
          </div>
          <div>
            <p style={{ fontFamily:'Cinzel, serif', fontSize:18, color:'#F7F1E5', marginBottom:4 }}>{perfil?.nome}</p>
            {perfil?.plano==='Premium'
              ? <span className="badge-premium">👑 Plano Premium</span>
              : <span className="badge-gratuito">Plano Gratuito</span>}
          </div>
        </div>

        {/* Frase */}
        <div style={{ background:'linear-gradient(145deg,#0D1008,#161200)', border:'1px solid rgba(201,154,61,0.3)', borderRadius:14, padding:14, marginBottom:16 }}>
          <p style={{ fontSize:12, color:'#C99A3D', fontStyle:'italic', textAlign:'center', lineHeight:1.6 }}>"{dados.fraseSemana}"</p>
        </div>

        {/* Desempenho */}
        <p style={{ fontSize:10, letterSpacing:2, color:'#C99A3D', textTransform:'uppercase', marginBottom:10 }}>DESEMPENHO DESTA SEMANA</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
          {[
            ['✅', dados.completos, 'Dias completos', '#5AC878'],
            ['◐', dados.parciais, 'Dias parciais', '#D7A23D'],
            ['📓', dados.diarios, 'Diários preenchidos', '#3D9ED8'],
            ['🙏', dados.gratidoes, 'Gratidões registradas', '#C99A3D'],
            ['💙', dados.curtidas, 'Conteúdos que ajudaram', '#7A4FB8'],
            ['🌿', dados.dimMais, 'Área mais presente na sua jornada', '#B94A3E'],
          ].map(([e,v,l,c]) => (
            <div key={l} className="card" style={{ textAlign:'center', marginBottom:0, padding:12 }}>
              <p style={{ fontSize:18, marginBottom:2 }}>{e}</p>
              <p style={{ fontSize:20, fontWeight:700, color:c, fontFamily:'Cinzel, serif', lineHeight:1 }}>{v}</p>
              <p style={{ fontSize:10, color:'#B8AFA0', marginTop:4, lineHeight:1.3 }}>{l}</p>
            </div>
          ))}
        </div>

        {/* Match */}
        <p style={{ fontSize:10, letterSpacing:2, color:'#C99A3D', textTransform:'uppercase', marginBottom:10 }}>MEU MATCH</p>
        <div className="card" style={{ marginBottom:16 }}>
          {match ? (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <p style={{ fontSize:13, color:'#B8AFA0', marginBottom:4 }}>Match realizado: <strong style={{ color:'#5AC878' }}>Sim</strong></p>
                <p style={{ fontSize:14, fontWeight:600, color:'#F7F1E5' }}>{match.profissionais?.nome?.replace('TESTE ','')}</p>
              </div>
              <button onClick={() => navigate('/profissionais')}
                style={{ padding:'6px 12px', borderRadius:8, background:'rgba(201,154,61,0.08)', border:'1px solid rgba(201,154,61,0.2)', color:'#C99A3D', fontSize:12, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
                Ver perfil
              </button>
            </div>
          ) : (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <p style={{ fontSize:13, color:'#B8AFA0' }}>Match realizado: <strong style={{ color:'#D7A23D' }}>Não</strong></p>
              <button onClick={() => navigate('/profissionais')}
                style={{ padding:'6px 12px', borderRadius:8, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Inter, sans-serif', border:'none' }}>
                Buscar
              </button>
            </div>
          )}
        </div>

        {/* Meus dados */}
        <p style={{ fontSize:10, letterSpacing:2, color:'#C99A3D', textTransform:'uppercase', marginBottom:10 }}>MEUS DADOS</p>
        <div className="card" style={{ marginBottom:16 }}>
          {!editando ? (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:2 }}>Nome</p>
                <p style={{ fontSize:14, color:'#F7F1E5' }}>{perfil?.nome}</p>
              </div>
              <button onClick={() => setEditando(true)} style={{ padding:'6px 12px', borderRadius:8, background:'rgba(201,154,61,0.08)', border:'1px solid rgba(201,154,61,0.2)', color:'#C99A3D', fontSize:12, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>Editar</button>
            </div>
          ) : (
            <>
              <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:8 }}>Nome</p>
              <input value={nomeEdit} onChange={e => setNomeEdit(e.target.value)}
                style={{ width:'100%', height:42, borderRadius:10, padding:'0 12px', background:'rgba(0,0,0,0.2)', border:'1px solid rgba(201,154,61,0.3)', color:'#F7F1E5', fontSize:14, fontFamily:'Inter, sans-serif', outline:'none', marginBottom:10 }}/>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={salvarNome} disabled={salvandoEdit} style={{ flex:1, height:38, borderRadius:10, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:13, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer' }}>
                  {salvandoEdit?'Salvando...':'Salvar'}
                </button>
                <button onClick={() => { setEditando(false); setNomeEdit(perfil?.nome||'') }} style={{ flex:1, height:38, borderRadius:10, background:'transparent', border:'1px solid rgba(201,154,61,0.2)', color:'#B8AFA0', fontSize:13, fontFamily:'Inter, sans-serif', cursor:'pointer' }}>
                  Cancelar
                </button>
              </div>
            </>
          )}
          <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid rgba(201,154,61,0.1)' }}>
            <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:2 }}>Email</p>
            <p style={{ fontSize:13, color:'#F7F1E5' }}>{user?.email}</p>
          </div>
        </div>

        {/* Menu */}
        <p style={{ fontSize:10, letterSpacing:2, color:'#C99A3D', textTransform:'uppercase', marginBottom:10 }}>MAIS OPÇÕES</p>
        {[
          { emoji:'👑', label:'Assinatura', action:() => navigate('/premium') },
          { emoji:'❓', label:'Central de ajuda', action:() => navigate('/jornada') },
          { emoji:'🤝', label:'Indicar amigos', action:() => { const msg='Conheça a Plataforma Holos 🌳\nhttps://plataforma-holos.vercel.app'; navigator.share?navigator.share({text:msg}):navigator.clipboard.writeText(msg) } },
        ].map(item => (
          <button key={item.label} onClick={item.action}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:12, background:'linear-gradient(180deg,#111B20,#0A1013)', border:'1px solid rgba(201,154,61,0.12)', borderRadius:12, padding:'14px 16px', cursor:'pointer', marginBottom:8, color:'#F7F1E5', fontFamily:'Inter, sans-serif', fontSize:14 }}>
            <span style={{ fontSize:18 }}>{item.emoji}</span>
            {item.label}
            <span style={{ marginLeft:'auto', color:'#B8AFA0' }}>›</span>
          </button>
        ))}

        <button onClick={async () => { await sair(); navigate('/login') }}
          style={{ width:'100%', height:46, borderRadius:12, background:'transparent', border:'1px solid rgba(216,92,74,0.25)', color:'#D85C4A', fontSize:14, fontFamily:'Inter, sans-serif', cursor:'pointer', marginTop:8 }}>
          Sair da conta
        </button>
      </div>
    </>
  )
}
