import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminSeguranca() {
  const [logs] = useState([
    { id:1, acao:'Login', usuario:'admin@holos.app', data:new Date().toISOString(), tipo:'info' },
    { id:2, acao:'Match liberado', usuario:'admin@holos.app', data:new Date().toISOString(), tipo:'success' },
    { id:3, acao:'Conteúdo aprovado', usuario:'admin@holos.app', data:new Date().toISOString(), tipo:'success' },
  ])

  return (
    <div className="page-content" style={{ paddingTop:16 }}>
      <h2 style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:20 }}>Dados e Segurança</h2>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:24 }}>
        {[['🔐','RLS Ativo','Dados protegidos','#5AC878'],['☁️','Backup','Automático Supabase','#3D9ED8'],['📊','Logs','Auditoria básica','#C99A3D'],['🔒','Sessões','Controle ativo','#7A4FB8']].map(([e,t,s,c]) => (
          <div key={t} style={{ background:'linear-gradient(180deg,#111B20,#0A1013)', border:`1px solid ${c}30`, borderRadius:14, padding:14, textAlign:'center' }}>
            <p style={{ fontSize:24, marginBottom:6 }}>{e}</p>
            <p style={{ fontSize:13, fontWeight:600, color:'#F7F1E5' }}>{t}</p>
            <p style={{ fontSize:11, color:c }}>{s}</p>
          </div>
        ))}
      </div>

      <p style={{ fontSize:11, color:'#C99A3D', letterSpacing:2, marginBottom:12 }}>LOG DE ATIVIDADES</p>
      {logs.map(l => (
        <div key={l.id} style={{ background:'linear-gradient(180deg,#111B20,#0A1013)', border:'1px solid rgba(201,154,61,0.1)', borderRadius:12, padding:12, marginBottom:8, display:'flex', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontSize:13, color:'#F7F1E5' }}>{l.acao}</p>
            <p style={{ fontSize:11, color:'#B8AFA0' }}>{l.usuario}</p>
          </div>
          <p style={{ fontSize:11, color:'#B8AFA0', alignSelf:'center' }}>{new Date(l.data).toLocaleTimeString('pt-BR')}</p>
        </div>
      ))}

      <button onClick={() => alert('Exportação disponível em versão futura.')} style={{ width:'100%', height:44, borderRadius:12, background:'transparent', border:'1px solid rgba(201,154,61,0.25)', color:'#B8AFA0', fontSize:13, fontFamily:'Inter, sans-serif', cursor:'pointer', marginTop:16 }}>
        📥 Exportar dados (em breve)
      </button>
    </div>
  )
}
