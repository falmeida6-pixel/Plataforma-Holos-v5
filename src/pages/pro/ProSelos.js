import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const SELOS = [
  { id:'Colaborador Holos', emoji:'🤝', cor:'#5AC878', req:'Perfil aprovado + 1 conteúdo aprovado', beneficio:'Selo no perfil' },
  { id:'Facilitador Holos', emoji:'⭐', cor:'#3D9ED8', req:'3 conteúdos + 30 dias + participação ativa', beneficio:'Mais confiança e visibilidade' },
  { id:'Embaixador Holos', emoji:'🏆', cor:'#C99A3D', req:'5 indicações + atividade + conteúdos', beneficio:'Prioridade Match ampliada' },
]

export default function ProSelos() {
  const { user } = useAuth()
  const [pro, setPro] = useState(null)

  useEffect(() => { supabase.from('profissionais').select('*').eq('user_id', user.id).single().then(({data}) => setPro(data)) }, [user])

  if (!pro) return <div className="loading-screen"><div className="spinner"/></div>

  const seloIdx = SELOS.findIndex(s => s.id === pro.selo_evolucao)

  return (
    <div className="page-content" style={{ paddingTop:16 }}>
      <p style={{ fontSize:10, letterSpacing:3, color:'#C99A3D', textTransform:'uppercase', marginBottom:4 }}>EVOLUÇÃO HOLOS</p>
      <h2 style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:20 }}>Selos de Reconhecimento</h2>

      <div style={{ background:'linear-gradient(145deg,#0D1008,#161200)', border:'1px solid rgba(201,154,61,0.4)', borderRadius:18, padding:24, textAlign:'center', marginBottom:24 }}>
        <p style={{ fontSize:48, marginBottom:8 }}>{SELOS[seloIdx]?.emoji || '🤝'}</p>
        <p style={{ fontFamily:'Cinzel, serif', fontSize:18, color:'#C99A3D', marginBottom:4 }}>{pro.selo_evolucao || 'Colaborador Holos'}</p>
        <p style={{ fontSize:13, color:'#B8AFA0' }}>Seu selo atual</p>
      </div>

      {SELOS.map((s, i) => {
        const atingido = i <= seloIdx
        return (
          <div key={s.id} style={{ background:'linear-gradient(180deg,#111B20,#0A1013)', border:`1px solid ${atingido ? s.cor : 'rgba(201,154,61,0.15)'}40`, borderRadius:16, padding:16, marginBottom:12, opacity: atingido ? 1 : 0.6 }}>
            <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
              <span style={{ fontSize:28 }}>{atingido ? s.emoji : '🔒'}</span>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <p style={{ fontSize:14, fontWeight:600, color:'#F7F1E5', fontFamily:'Inter, sans-serif' }}>{s.id}</p>
                  {atingido && <span style={{ fontSize:11, color:'#5AC878' }}>✓ Conquistado</span>}
                </div>
                <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:4 }}>Requisito: {s.req}</p>
                <p style={{ fontSize:12, color: s.cor }}>Benefício: {s.beneficio}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
