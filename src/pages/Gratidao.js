import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import NavActions from '../components/NavActions'

export default function Gratidao() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [itens, setItens] = useState(['','',''])
  const [registros, setRegistros] = useState([])
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [jaFezHoje, setJaFezHoje] = useState(false)
  const [aba, setAba] = useState('registrar')

  const hoje = new Date()
  const hj = hoje.toISOString().split('T')[0]
  const dataFormatada = hoje.toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long' })

  useEffect(() => { if (user) carregar() }, [user])

  async function carregar() {
    const { data } = await supabase
      .from('gratidao').select('*').eq('user_id', user.id)
      .order('data', { ascending:false }).limit(60)
    if (data) {
      setRegistros(data)
      const hoje_ = data.find(r => r.data === hj)
      if (hoje_) {
        setJaFezHoje(true)
        setItens([hoje_.item1||'', hoje_.item2||'', hoje_.item3||''])
      }
    }
  }

  async function salvar() {
    if (itens.filter(i => i.trim()).length === 0) return
    setSalvando(true)
    const payload = { user_id:user.id, data:hj, item1:itens[0], item2:itens[1], item3:itens[2] }
    if (jaFezHoje) {
      const reg = registros.find(r => r.data === hj)
      if (reg) await supabase.from('gratidao').update(payload).eq('id', reg.id)
    } else {
      await supabase.from('gratidao').insert(payload)
    }
    setSalvando(false); setSalvo(true); setJaFezHoje(true)
    carregar()
    setTimeout(() => setSalvo(false), 2000)
  }

  // Calendário dos últimos 35 dias
  function renderCalendario() {
    const dias = []
    for (let i = 34; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const str = d.toISOString().split('T')[0]
      const reg = registros.find(r => r.data === str)
      const preenchido = reg && (reg.item1 || reg.item2 || reg.item3)
      const isHoje = str === hj
      dias.push(
        <div key={str} style={{
          aspectRatio:1, borderRadius:'50%', display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          background: preenchido ? 'rgba(201,154,61,0.25)' : 'rgba(255,255,255,0.03)',
          boxShadow: isHoje ? '0 0 0 2px #C99A3D' : 'none',
          fontSize:9, color: preenchido ? '#C99A3D' : '#B8AFA0', fontWeight:500,
        }}>
          {d.getDate()}
          {preenchido && <span style={{ fontSize:7 }}>🙏</span>}
        </div>
      )
    }
    return dias
  }

  const totalDias = registros.length

  return (
    <>
      <NavActions/>
      <div style={{ padding:'12px 16px', paddingBottom:'calc(120px + env(safe-area-inset-bottom,16px))', overflowY:'auto' }}>
        <p style={{ fontSize:10, letterSpacing:3, color:'#C99A3D', textTransform:'uppercase', marginBottom:2 }}>DIÁRIO DE GRATIDÃO</p>
        <h2 style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:4 }}>3 Coisas pelas quais sou grata</h2>
        <p style={{ fontSize:11, color:'#B8AFA0', marginBottom:16, textTransform:'capitalize' }}>{dataFormatada}</p>

        <div className="tabs">
          <button className={`tab ${aba==='registrar'?'active':''}`} onClick={() => setAba('registrar')}>Registrar</button>
          <button className={`tab ${aba==='calendario'?'active':''}`} onClick={() => setAba('calendario')}>Calendário</button>
        </div>

        {aba === 'registrar' && (
          <>
            {salvo && (
              <div style={{ background:'rgba(201,154,61,0.08)', border:'1px solid rgba(201,154,61,0.3)', borderRadius:12, padding:12, marginBottom:14, textAlign:'center', color:'#C99A3D', fontSize:13, fontWeight:600 }}>
                🙏 Gratidão registrada!
              </div>
            )}

            <div style={{ background:'linear-gradient(145deg,#0D1008,#161200)', border:'1px solid rgba(201,154,61,0.25)', borderRadius:16, padding:16, marginBottom:16 }}>
              <p style={{ fontSize:12, color:'#B8AFA0', lineHeight:1.6, marginBottom:0 }}>
                A prática diária da gratidão fortalece o bem-estar emocional e treina o cérebro para perceber o positivo. Pequenas anotações acumuladas ao longo do tempo revelam padrões de alegria e progresso da sua jornada.
              </p>
            </div>

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
              style={{ width:'100%', height:50, borderRadius:13, background: itens.filter(i=>i.trim()).length>0?'linear-gradient(135deg,#B7832F,#F0C76A)':'rgba(201,154,61,0.08)', color: itens.filter(i=>i.trim()).length>0?'#080808':'#B8AFA0', fontSize:15, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer', marginTop:8 }}>
              {salvando ? 'Salvando...' : jaFezHoje ? '✓ Atualizar gratidão' : '🙏 Registrar gratidão'}
            </button>
          </>
        )}

        {aba === 'calendario' && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
              <div className="card" style={{ textAlign:'center', marginBottom:0, padding:14 }}>
                <p style={{ fontSize:24, fontWeight:700, color:'#C99A3D', fontFamily:'Cinzel, serif' }}>{totalDias}</p>
                <p style={{ fontSize:11, color:'#B8AFA0' }}>Dias registrados</p>
              </div>
              <div className="card" style={{ textAlign:'center', marginBottom:0, padding:14 }}>
                <p style={{ fontSize:24, fontWeight:700, color:'#C99A3D', fontFamily:'Cinzel, serif' }}>
                  {registros.filter(r=>r.item1&&r.item2&&r.item3).length}
                </p>
                <p style={{ fontSize:11, color:'#B8AFA0' }}>Gratidões completas</p>
              </div>
            </div>

            <div className="card">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:8 }}>
                {['D','S','T','Q','Q','S','S'].map((d,i) => (
                  <div key={i} style={{ textAlign:'center', fontSize:10, color:'#B8AFA0', padding:'3px 0', fontWeight:600 }}>{d}</div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
                {renderCalendario()}
              </div>
            </div>

            {/* Mensagem acúmulo */}
            <div style={{ background:'linear-gradient(145deg,#0D1008,#161200)', border:'1px solid rgba(201,154,61,0.2)', borderRadius:14, padding:16, marginTop:8 }}>
              <p style={{ fontSize:11, color:'#C99A3D', letterSpacing:1, marginBottom:8 }}>✦ SOBRE SEUS DADOS</p>
              <p style={{ fontSize:12, color:'#B8AFA0', lineHeight:1.7 }}>
                Todos os registros de gratidão ficam salvos no banco de dados (Supabase) de forma segura e gratuita — o plano gratuito do Supabase suporta até 50.000 usuários e 500MB de armazenamento, mais que suficiente para anos de registros diários. No futuro, esses dados alimentarão relatórios personalizados da sua jornada.
              </p>
            </div>
          </>
        )}
      </div>
    </>
  )
}
