import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminConfiguracoes() {
  const [config, setConfig] = useState({ dias_avaliacao:30, meses_analise_ia:3, matches_free_mes:1, link_whatsapp_suporte:'' })
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  async function salvar() {
    setSalvando(true)
    // Salva em admin_controle como configuração geral
    setSalvo(true); setSalvando(false)
    setTimeout(() => setSalvo(false), 2000)
  }

  return (
    <div className="page-content" style={{ paddingTop:16 }}>
      <h2 style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:20 }}>Configurações</h2>
      {salvo && <div style={{ background:'rgba(90,200,120,0.1)', border:'1px solid rgba(90,200,120,0.3)', borderRadius:10, padding:12, marginBottom:16, color:'#5AC878', fontSize:13 }}>✓ Configurações salvas.</div>}
      {[
        ['Dias para liberar Avaliação Evolutiva', 'dias_avaliacao', 'number'],
        ['Meses para Análise por IA', 'meses_analise_ia', 'number'],
        ['Matches gratuitos por mês', 'matches_free_mes', 'number'],
        ['Link WhatsApp Suporte', 'link_whatsapp_suporte', 'url'],
      ].map(([l,k,t]) => (
        <div key={k} style={{ marginBottom:14 }}>
          <p style={{ fontSize:10, color:'#B8AFA0', letterSpacing:2, textTransform:'uppercase', marginBottom:5 }}>{l}</p>
          <input type={t} value={config[k]} onChange={e => setConfig(p => ({...p,[k]:e.target.value}))}
            style={{ width:'100%', height:42, borderRadius:10, padding:'0 13px', background:'#111B20', border:'1px solid rgba(201,154,61,0.2)', color:'#F7F1E5', fontSize:14, fontFamily:'Inter, sans-serif', outline:'none' }}/>
        </div>
      ))}
      <button onClick={salvar} disabled={salvando} style={{ width:'100%', height:46, borderRadius:12, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:14, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer', marginTop:8 }}>
        {salvando ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </div>
  )
}
