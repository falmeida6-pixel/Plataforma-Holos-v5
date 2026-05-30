import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import NavActions from '../components/NavActions'
import { APP_URL } from '../lib/config'

function labelDimensao(dim) {
  if (!dim) return '—'
  const v = String(dim).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  if (v.includes('corpo')) return 'Corpo'
  if (v.includes('mente')) return 'Mente'
  if (v.includes('consc') || v.includes('espir')) return 'Consciência'
  return dim
}

function inicioUltimos7Dias() {
  const d = new Date()
  d.setDate(d.getDate() - 6)
  const ano = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

export default function Perfil() {
  const { user, perfil, sair, atualizarPerfil } = useAuth()
  const navigate = useNavigate()
  const [dados, setDados] = useState({ completos:0, parciais:0, semRegistro:0, diarios:0, gratidoes:0, curtidas:0, dimMais:'—', fraseSemana:'', ultimaGratidao:'', ultimoConteudo:'' })
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [mostrarDados, setMostrarDados] = useState(false)
  const [nomeEdit, setNomeEdit] = useState(perfil?.nome || '')
  const [salvandoEdit, setSalvandoEdit] = useState(false)

  useEffect(() => { if (user) carregar() }, [user])

  async function carregar() {
    const inicioSemana = inicioUltimos7Dias()
    const [checkins, diarios, grats, curts, matchData] = await Promise.all([
      supabase.from('checkins').select('*').eq('user_id', user.id).gte('data', inicioSemana),
      supabase.from('checkins').select('data,observacao').eq('user_id', user.id).not('observacao','is',null),
      supabase.from('gratidao').select('*').eq('user_id', user.id).order('data', { ascending:false }).limit(30),
      supabase.from('curtidas').select('*').eq('user_id', user.id).order('created_at', { ascending:false }).limit(30),
      supabase.from('matches').select('*,profissionais(nome)').eq('user_id', user.id).order('data_match',{ascending:false}).limit(1).single(),
    ])

    const c = checkins.data || []
    const completos = c.filter(x => x.status_dia === 'Completo').length
    const parciais = c.filter(x => x.status_dia === 'Parcial').length
    const semRegistro = Math.max(0, 7 - c.length)
    const curtsData = curts.data || []
    const dimCount = { Corpo:0, Mente:0, Consciência:0 }
    curtsData.forEach(x => { const d = labelDimensao(x.dimensao); if (dimCount[d] !== undefined) dimCount[d]++ })
    const maxD = Math.max(...Object.values(dimCount))
    const dimMais = maxD === 0 ? '—' : Object.entries(dimCount).sort((a,b)=>b[1]-a[1])[0][0]

    const ultima = (grats.data || [])[0]
    const ultimaGratidao = ultima ? [ultima.item1, ultima.item2, ultima.item3].filter(Boolean)[0] || '' : ''

    let ultimoConteudo = ''
    const ultimoConteudoId = curtsData[0]?.conteudo_id
    if (ultimoConteudoId) {
      const { data: conteudo } = await supabase.from('conteudos').select('titulo').eq('id', ultimoConteudoId).single()
      ultimoConteudo = conteudo?.titulo || ultimoConteudoId
    }

    let frase = 'Continue sua jornada diária. 🌿'
    if (completos > parciais && completos > 0) frase = `Você teve ${completos} vitórias completas nesta semana. Celebre esse movimento.`
    else if (parciais > completos) frase = 'Você manteve presença mesmo em dias parciais.'
    else if (c.length === 0) frase = 'Poucos registros por enquanto. Que tal recomeçar hoje?'
    else frase = 'Pequenos registros também constroem caminho.'

    setDados({
      completos,
      parciais,
      semRegistro,
      diarios: diarios.data?.length || 0,
      gratidoes: grats.data?.length || 0,
      curtidas: curtsData.length,
      dimMais,
      fraseSemana: frase,
      ultimaGratidao,
      ultimoConteudo,
    })
    if (matchData.data) setMatch(matchData.data)
    setLoading(false)
  }

  async function salvarNome() {
    if (!nomeEdit.trim()) return
    setSalvandoEdit(true)
    await atualizarPerfil({ nome: nomeEdit.trim() })
    setSalvandoEdit(false)
    setEditando(false)
  }

  const iniciais = perfil?.nome?.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase() || 'HO'

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>

  return (
    <>
      <NavActions/>
      <div style={{ padding:'12px 16px', paddingBottom:'calc(120px + env(safe-area-inset-bottom,16px))', overflowY:'auto' }}>
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

        <div style={{ background:'linear-gradient(145deg,#0D1008,#161200)', border:'1px solid rgba(201,154,61,0.3)', borderRadius:14, padding:14, marginBottom:16 }}>
          <p style={{ fontSize:12, color:'#C99A3D', fontStyle:'italic', textAlign:'center', lineHeight:1.6 }}>"{dados.fraseSemana}"</p>
        </div>

        <p style={{ fontSize:10, letterSpacing:2, color:'#C99A3D', textTransform:'uppercase', marginBottom:10 }}>RESUMO DA JORNADA</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
          {[
            ['✅', dados.completos, 'Vitórias completas', '#5AC878'],
            ['◐', dados.parciais, 'Vitórias parciais', '#D7A23D'],
            ['○', dados.semRegistro, 'Dias sem registro', '#D85C4A'],
            ['🙏', dados.gratidoes, 'Gratidões registradas', '#C99A3D'],
            ['💙', dados.curtidas, 'Isso me ajudou', '#7A4FB8'],
            ['🌿', dados.dimMais, 'Área mais presente na sua jornada', '#B94A3E'],
          ].map(([e,v,l,c]) => (
            <div key={l} className="card" style={{ textAlign:'center', marginBottom:0, padding:12 }}>
              <p style={{ fontSize:18, marginBottom:2 }}>{e}</p>
              <p style={{ fontSize:20, fontWeight:700, color:c, fontFamily:'Cinzel, serif', lineHeight:1 }}>{v}</p>
              <p style={{ fontSize:10, color:'#B8AFA0', marginTop:4, lineHeight:1.3 }}>{l}</p>
            </div>
          ))}
        </div>

        {(dados.ultimaGratidao || dados.ultimoConteudo) && (
          <div className="card" style={{ marginBottom:16 }}>
            {dados.ultimaGratidao && <p style={{ fontSize:12, color:'#B8AFA0', lineHeight:1.6, marginBottom:8 }}>🙏 Última gratidão: <span style={{ color:'#F7F1E5' }}>{dados.ultimaGratidao}</span></p>}
            {dados.ultimoConteudo && <p style={{ fontSize:12, color:'#B8AFA0', lineHeight:1.6 }}>💙 Conteúdo que ajudou: <span style={{ color:'#F7F1E5' }}>{dados.ultimoConteudo}</span></p>}
          </div>
        )}

        <p style={{ fontSize:10, letterSpacing:2, color:'#C99A3D', textTransform:'uppercase', marginBottom:10 }}>MEU MATCH</p>
        <div className="card" style={{ marginBottom:16 }}>
          {match ? (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <p style={{ fontSize:13, color:'#B8AFA0', marginBottom:4 }}>Match realizado: <strong style={{ color:'#5AC878' }}>Sim</strong></p>
                <p style={{ fontSize:14, fontWeight:600, color:'#F7F1E5' }}>{match.profissionais?.nome?.replace('TESTE ','') || 'Profissional Holos'}</p>
              </div>
              <button onClick={() => navigate('/profissionais')} style={{ padding:'6px 12px', borderRadius:8, background:'rgba(201,154,61,0.08)', border:'1px solid rgba(201,154,61,0.2)', color:'#C99A3D', fontSize:12, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>Ver perfil</button>
            </div>
          ) : (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <p style={{ fontSize:13, color:'#B8AFA0' }}>Match realizado: <strong style={{ color:'#D7A23D' }}>Não</strong></p>
              <button onClick={() => navigate('/profissionais')} style={{ padding:'6px 12px', borderRadius:8, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Inter, sans-serif', border:'none' }}>Buscar</button>
            </div>
          )}
        </div>

        <p style={{ fontSize:10, letterSpacing:2, color:'#C99A3D', textTransform:'uppercase', marginBottom:10 }}>MEUS DADOS</p>
        <div className="card" style={{ marginBottom:16 }}>
          {!mostrarDados ? (
            <button onClick={() => setMostrarDados(true)} style={{ width:'100%', height:42, borderRadius:10, background:'rgba(201,154,61,0.08)', border:'1px solid rgba(201,154,61,0.2)', color:'#C99A3D', fontSize:13, fontFamily:'Inter, sans-serif', cursor:'pointer' }}>
              Ver meus dados
            </button>
          ) : !editando ? (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:2 }}>Nome</p>
                  <p style={{ fontSize:14, color:'#F7F1E5' }}>{perfil?.nome}</p>
                </div>
                <button onClick={() => setEditando(true)} style={{ padding:'6px 12px', borderRadius:8, background:'rgba(201,154,61,0.08)', border:'1px solid rgba(201,154,61,0.2)', color:'#C99A3D', fontSize:12, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>Editar</button>
              </div>
              <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid rgba(201,154,61,0.1)' }}>
                <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:2 }}>Email</p>
                <p style={{ fontSize:13, color:'#F7F1E5' }}>{user?.email}</p>
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:8 }}>Nome</p>
              <input value={nomeEdit} onChange={e => setNomeEdit(e.target.value)} style={{ width:'100%', height:42, borderRadius:10, padding:'0 12px', background:'rgba(0,0,0,0.2)', border:'1px solid rgba(201,154,61,0.3)', color:'#F7F1E5', fontSize:14, fontFamily:'Inter, sans-serif', outline:'none', marginBottom:10 }}/>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={salvarNome} disabled={salvandoEdit} style={{ flex:1, height:38, borderRadius:10, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:13, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer' }}>{salvandoEdit?'Salvando...':'Salvar'}</button>
                <button onClick={() => { setEditando(false); setNomeEdit(perfil?.nome||'') }} style={{ flex:1, height:38, borderRadius:10, background:'transparent', border:'1px solid rgba(201,154,61,0.2)', color:'#B8AFA0', fontSize:13, fontFamily:'Inter, sans-serif', cursor:'pointer' }}>Cancelar</button>
              </div>
            </>
          )}
        </div>

        <p style={{ fontSize:10, letterSpacing:2, color:'#C99A3D', textTransform:'uppercase', marginBottom:10 }}>MAIS OPÇÕES</p>
        {[
          { emoji:'👑', label:'Assinatura', action:() => navigate('/premium') },
          { emoji:'❓', label:'Central de ajuda', action:() => navigate('/jornada') },
          { emoji:'🤝', label:'Indicar amigos', action:() => navigator.clipboard?.writeText(`Conheça a Plataforma Holos 🌳\n${APP_URL}`) },
        ].map(item => (
          <button key={item.label} onClick={item.action} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, background:'linear-gradient(180deg,#111B20,#0A1013)', border:'1px solid rgba(201,154,61,0.12)', borderRadius:12, padding:'14px 16px', cursor:'pointer', marginBottom:8, color:'#F7F1E5', fontFamily:'Inter, sans-serif', fontSize:14 }}>
            <span style={{ fontSize:18 }}>{item.emoji}</span>{item.label}<span style={{ marginLeft:'auto', color:'#B8AFA0' }}>›</span>
          </button>
        ))}

        <button onClick={async () => { await sair(); navigate('/login') }} style={{ width:'100%', height:46, borderRadius:12, background:'transparent', border:'1px solid rgba(216,92,74,0.25)', color:'#D85C4A', fontSize:14, fontFamily:'Inter, sans-serif', cursor:'pointer', marginTop:8 }}>Sair da conta</button>
      </div>
    </>
  )
}
