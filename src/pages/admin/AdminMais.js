import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminMais() {
  const { sair } = useAuth()
  const navigate = useNavigate()
  const [rodas, setRodas] = useState([])
  const [form, setForm] = useState({ tema:'', data:'', hora:'20:00', link_grupo_whatsapp:'' })
  const [salvando, setSalvando] = useState(false)
  const [aba, setAba] = useState('rodas')

  useEffect(() => { carregarRodas() }, [])

  async function carregarRodas() {
    const { data } = await supabase.from('rodas_holos').select('*').order('data', { ascending:false }).limit(10)
    setRodas(data || [])
  }

  async function criarRoda() {
    if (!form.tema || !form.data) return
    setSalvando(true)
    await supabase.from('rodas_holos').insert({ ...form, status:'Agendada', plano:'Premium', participantes:'Premium' })
    setForm({ tema:'', data:'', hora:'20:00', link_grupo_whatsapp:'' })
    carregarRodas()
    setSalvando(false)
  }

  async function gerarConvites(tipo, plano, qtd) {
    const { data } = await supabase.rpc('gerar_convites', { quantidade:qtd, p_tipo_perfil:tipo, p_plano:plano })
    if (data) alert(`Códigos gerados:\n${data.join('\n')}`)
  }

  return (
    <div className="page-content" style={{ paddingTop:'16px' }}>
      <h2 style={{ fontFamily:'Cinzel, serif', fontSize:'20px', color:'#F7F1E5', marginBottom:'16px' }}>Mais opções</h2>

      <div style={{ display:'flex', gap:'6px', marginBottom:'20px', flexWrap:'wrap' }}>
        {[['rodas','🌀 Rodas'],['convites','🔑 Convites'],['conta','👤 Conta']].map(([v,l]) => (
          <button key={v} onClick={() => setAba(v)}
            style={{ padding:'8px 14px', borderRadius:'10px', border:aba===v?'1px solid #C99A3D':'1px solid rgba(201,154,61,0.2)', background:aba===v?'rgba(201,154,61,0.1)':'#111B20', color:aba===v?'#C99A3D':'#B8AFA0', cursor:'pointer', fontSize:'13px', fontFamily:'Inter, sans-serif', fontWeight:'600' }}>
            {l}
          </button>
        ))}
      </div>

      {aba === 'rodas' && (
        <>
          <p style={{ fontSize:'11px', color:'#C99A3D', letterSpacing:'2px', marginBottom:'12px' }}>CRIAR NOVA RODA</p>
          {[['Tema','tema','text','Ex: Ansiedade e Caminhos'],['Data','data','date',''],['Hora','hora','time',''],['Link WhatsApp','link_grupo_whatsapp','url','https://chat.whatsapp.com/...']].map(([l,k,t,p]) => (
            <div key={k} style={{ marginBottom:'10px' }}>
              <p style={{ fontSize:'10px', color:'#B8AFA0', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'5px' }}>{l}</p>
              <input type={t} placeholder={p} value={form[k]} onChange={e => setForm(prev => ({...prev,[k]:e.target.value}))}
                style={{ width:'100%', height:'42px', borderRadius:'10px', padding:'0 13px', background:'#111B20', border:'1px solid rgba(201,154,61,0.2)', color:'#F7F1E5', fontSize:'14px', fontFamily:'Inter, sans-serif', outline:'none' }}/>
            </div>
          ))}
          <button onClick={criarRoda} disabled={salvando} style={{ width:'100%', height:'46px', borderRadius:'12px', background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:'14px', fontWeight:'700', fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer', marginBottom:'20px' }}>
            {salvando ? 'Salvando...' : '+ Criar Roda'}
          </button>
          <p style={{ fontSize:'11px', color:'#C99A3D', letterSpacing:'2px', marginBottom:'12px' }}>RODAS RECENTES</p>
          {rodas.map(r => (
            <div key={r.id} style={{ background:'linear-gradient(180deg,#111B20,#0A1013)', border:'1px solid rgba(201,154,61,0.15)', borderRadius:'12px', padding:'12px', marginBottom:'8px' }}>
              <p style={{ fontSize:'13px', fontWeight:'600', color:'#F7F1E5' }}>{r.tema}</p>
              <p style={{ fontSize:'11px', color:'#B8AFA0' }}>{r.data} · {r.hora} · {r.status}</p>
            </div>
          ))}
        </>
      )}

      {aba === 'convites' && (
        <>
          <p style={{ fontSize:'13px', color:'#B8AFA0', marginBottom:'16px', lineHeight:'1.6' }}>
            Gere códigos de convite para novos usuários. Os códigos aparecem em uma caixa de alerta — copie e envie para os compradores.
          </p>
          {[
            { label:'5 convites — Usuário Gratuito', tipo:'Usuario', plano:'Gratuito', qtd:5 },
            { label:'5 convites — Usuário Premium', tipo:'Usuario', plano:'Premium', qtd:5 },
            { label:'3 convites — Profissional Gratuito', tipo:'Profissional', plano:'Gratuito', qtd:3 },
            { label:'3 convites — Profissional Premium', tipo:'Profissional', plano:'Premium', qtd:3 },
          ].map(b => (
            <button key={b.label} onClick={() => gerarConvites(b.tipo, b.plano, b.qtd)}
              style={{ width:'100%', height:'46px', borderRadius:'12px', background:'linear-gradient(180deg,#111B20,#0A1013)', border:'1px solid rgba(201,154,61,0.25)', color:'#F7F1E5', fontSize:'13px', fontFamily:'Inter, sans-serif', cursor:'pointer', marginBottom:'8px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px' }}>
              <span>🔑 {b.label}</span>
              <span style={{ color:'#C99A3D' }}>Gerar →</span>
            </button>
          ))}
        </>
      )}

      {aba === 'conta' && (
        <button onClick={async () => { await sair(); window.location.href='/login' }}
          style={{ width:'100%', height:'46px', borderRadius:'12px', background:'transparent', border:'1px solid rgba(216,92,74,0.3)', color:'#D85C4A', fontSize:'14px', fontFamily:'Inter, sans-serif', cursor:'pointer' }}>
          Sair da conta Admin
        </button>
      )}
    </div>
  )
}
