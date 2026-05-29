import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { hojeLocal } from '../lib/dataLocal'
import NavActions from '../components/NavActions'

export default function Gratidao() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [itens, setItens] = useState(['','',''])
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [jaFezHoje, setJaFezHoje] = useState(false)
  const [completo, setCompleto] = useState(false)
  const [regHoje, setRegHoje] = useState(null)

  const hj = hojeLocal()
  const dataFormatada = new Date(hj + 'T12:00:00').toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long' })

  useEffect(() => { if (user) carregar() }, [user])

  async function carregar() {
    const { data } = await supabase
      .from('gratidao').select('*').eq('user_id', user.id).eq('data', hj).single()
    if (data) {
      setJaFezHoje(true)
      setRegHoje(data)
      const vals = [data.item1||'', data.item2||'', data.item3||'']
      setItens(vals)
      if (vals.filter(i => i.trim()).length === 3) setCompleto(true)
    }
  }

  async function salvar() {
    if (itens.filter(i => i.trim()).length === 0) return
    setSalvando(true)
    const payload = { user_id:user.id, data:hj, item1:itens[0], item2:itens[1], item3:itens[2] }
    if (jaFezHoje && regHoje) {
      await supabase.from('gratidao').update(payload).eq('id', regHoje.id)
    } else {
      const { data } = await supabase.from('gratidao').insert(payload).select().single()
      if (data) setRegHoje(data)
    }
    setSalvando(false)
    setSalvo(true)
    setJaFezHoje(true)
    if (itens.filter(i => i.trim()).length === 3) setCompleto(true)
    setTimeout(() => setSalvo(false), 2500)
  }

  return (
    <>
      <NavActions/>
      <div style={{ padding:'12px 16px', paddingBottom:'calc(120px + env(safe-area-inset-bottom,16px))', overflowY:'auto' }}>

        <p style={{ fontSize:11, color:'#B8AFA0', marginBottom:4, textTransform:'capitalize' }}>{dataFormatada}</p>
        <p style={{ fontSize:10, letterSpacing:3, color:'#C99A3D', textTransform:'uppercase', marginBottom:4 }}>DIÁRIO DE GRATIDÃO</p>
        <h2 style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:6 }}>3 Coisas pelo quê sou grata</h2>
        <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:20, lineHeight:1.5 }}>
          Pequenas anotações diárias revelam padrões de alegria e progresso na sua jornada.
        </p>

        {/* Autorização discreta */}
        <div style={{ background:'rgba(201,154,61,0.04)', border:'1px solid rgba(201,154,61,0.12)', borderRadius:12, padding:12, marginBottom:16 }}>
          <p style={{ fontSize:11, color:'#B8AFA0', lineHeight:1.6 }}>
            🔒 Seus registros são privados e usados apenas para acompanhar sua jornada dentro da Plataforma Holos.
          </p>
        </div>

        {/* Já registrou as 3 hoje */}
        {completo && (
          <div style={{ background:'linear-gradient(145deg,#0D1008,#161200)', border:'1px solid rgba(201,154,61,0.4)', borderRadius:16, padding:20, textAlign:'center', marginBottom:16 }}>
            <p style={{ fontSize:28, marginBottom:10 }}>🙏</p>
            <p style={{ fontFamily:'Cinzel, serif', fontSize:16, color:'#C99A3D', marginBottom:8 }}>
              Gratidão completa hoje!
            </p>
            <p style={{ fontSize:13, color:'#B8AFA0', lineHeight:1.6, marginBottom:4 }}>
              Você já registrou suas 3 gratidões de hoje.
            </p>
            <p style={{ fontSize:12, color:'#B8AFA0' }}>Volte amanhã para continuar. 🌱</p>
            <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:8 }}>
              {itens.filter(Boolean).map((item,i) => (
                <div key={i} style={{ display:'flex', gap:8, alignItems:'center', background:'rgba(201,154,61,0.06)', borderRadius:10, padding:'8px 12px', textAlign:'left' }}>
                  <span style={{ fontSize:14 }}>🙏</span>
                  <p style={{ fontSize:12, color:'#B8AFA0' }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulário — sempre visível para editar */}
        {!completo && (
          <>
            {salvo && (
              <div style={{ background:'rgba(201,154,61,0.08)', border:'1px solid rgba(201,154,61,0.3)', borderRadius:12, padding:12, marginBottom:14, textAlign:'center', color:'#C99A3D', fontSize:13, fontWeight:600 }}>
                🙏 Gratidão registrada!
              </div>
            )}

            {[0,1,2].map(i => (
              <div key={i} style={{ marginBottom:12 }}>
                <p style={{ fontSize:10, color:'#C99A3D', letterSpacing:2, textTransform:'uppercase', marginBottom:6 }}>
                  {i===0?'1ª Gratidão':i===1?'2ª Gratidão':'3ª Gratidão'}
                </p>
                <div style={{ display:'flex', alignItems:'center', gap:10, background:'linear-gradient(180deg,#111B20,#0A1013)', border:`1px solid ${itens[i]?'rgba(201,154,61,0.35)':'rgba(201,154,61,0.15)'}`, borderRadius:12, padding:'10px 14px' }}>
                  <span style={{ fontSize:20, flexShrink:0 }}>🙏</span>
                  <input
                    value={itens[i]}
                    onChange={e => { const n=[...itens]; n[i]=e.target.value; setItens(n) }}
                    placeholder={`Escreva sua ${i+1}ª gratidão...`}
                    style={{ flex:1, background:'none', border:'none', outline:'none', color:'#F7F1E5', fontSize:14, fontFamily:'Inter, sans-serif' }}
                  />
                </div>
              </div>
            ))}

            <button onClick={salvar} disabled={salvando || itens.filter(i=>i.trim()).length===0}
              style={{ width:'100%', height:50, borderRadius:13, background: itens.filter(i=>i.trim()).length>0?'linear-gradient(135deg,#B7832F,#F0C76A)':'rgba(201,154,61,0.08)', color: itens.filter(i=>i.trim()).length>0?'#080808':'#B8AFA0', fontSize:15, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer', marginBottom:12 }}>
              {salvando ? 'Salvando...' : jaFezHoje ? '✓ Atualizar gratidão' : '🙏 Registrar gratidão'}
            </button>
          </>
        )}

        <button onClick={() => navigate('/calendario')}
          style={{ width:'100%', height:44, borderRadius:12, background:'transparent', border:'1px solid rgba(201,154,61,0.15)', color:'#B8AFA0', fontSize:13, fontFamily:'Inter, sans-serif', cursor:'pointer' }}>
          📅 Ver calendário de desempenho
        </button>
      </div>
    </>
  )
}
