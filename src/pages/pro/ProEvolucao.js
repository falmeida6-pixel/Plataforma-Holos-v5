import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const SELOS = [
  { id:'Colaborador Holos', emoji:'🤝', titulo:'Colaborador Holos', desc:'Começou a contribuir', requisitos:['Perfil aprovado','1 conteúdo aprovado'], beneficio:'Selo no perfil' },
  { id:'Facilitador Holos', emoji:'⭐', titulo:'Facilitador Holos', desc:'Contribui regularmente', requisitos:['3 conteúdos aprovados','Permanência mínima de 30 dias','Participação ativa'], beneficio:'Mais confiança e visibilidade' },
  { id:'Embaixador Holos', emoji:'🏆', titulo:'Embaixador Holos', desc:'Ajuda a expandir a rede', requisitos:['5 indicações confirmadas','Atividade consistente','Conteúdos aprovados'], beneficio:'Prioridade Match + reconhecimento' },
]

export default function ProEvolucao() {
  const { user } = useAuth()
  const [pro, setPro] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { carregarPro() }, [user])

  async function carregarPro() {
    const { data } = await supabase.from('profissionais').select('*').eq('user_id', user.id).single()
    setPro(data)
    setLoading(false)
  }

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>
  if (!pro) return <div className="page-content"><p className="page-subtitle">Perfil não encontrado.</p></div>

  const seloIndex = SELOS.findIndex(s => s.id === pro.selo_evolucao)

  return (
    <div className="page-content">
      <h2 className="page-title">Evolução Holos</h2>
      <p className="page-subtitle">Sua jornada de reconhecimento e impacto.</p>

      {/* Selo atual */}
      <div className="card-gold" style={{ textAlign:'center', marginBottom:'24px' }}>
        <p style={{ fontSize:'11px', color:'var(--gold)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'10px' }}>Seu selo atual</p>
        <p style={{ fontSize:'40px', marginBottom:'8px' }}>{SELOS[seloIndex]?.emoji || '🤝'}</p>
        <p style={{ fontSize:'18px', fontWeight:'700', marginBottom:'4px' }}>{pro.selo_evolucao}</p>
        <p style={{ fontSize:'13px', color:'var(--text-muted)' }}>{SELOS[seloIndex]?.desc}</p>
      </div>

      {/* Todos os selos */}
      <p className="section-title">Jornada de selos</p>
      {SELOS.map((s, i) => {
        const atingido = i <= seloIndex
        return (
          <div key={s.id} className="card" style={{ marginBottom:'12px', opacity: atingido ? 1 : 0.6 }}>
            <div style={{ display:'flex', gap:'12px', alignItems:'flex-start' }}>
              <span style={{ fontSize:'28px' }}>{atingido ? s.emoji : '🔒'}</span>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                  <p style={{ fontWeight:'600', fontSize:'14px' }}>{s.titulo}</p>
                  {atingido && <span style={{ fontSize:'11px', color:'var(--success)' }}>✓ Conquistado</span>}
                </div>
                <p style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'8px' }}>
                  Benefício: {s.beneficio}
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:'3px' }}>
                  {s.requisitos.map((r, j) => <p key={j} style={{ fontSize:'12px', color:'var(--text-muted)' }}>· {r}</p>)}
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Indicações */}
      <p className="section-title" style={{ marginTop:'8px' }}>Programa Rede Holos</p>
      <div className="card">
        <div className="metrica-row">
          <span className="metrica-label">Indicações confirmadas</span>
          <span className="metrica-valor" style={{ color:'var(--gold)' }}>{pro.indicacoes_confirmadas}</span>
        </div>
        <div className="metrica-row">
          <span className="metrica-label">Próximo nível</span>
          <span style={{ fontSize:'13px', color:'var(--text-muted)' }}>
            {pro.indicacoes_confirmadas < 1 ? '1 indicação → destaque 7 dias' :
             pro.indicacoes_confirmadas < 3 ? '3 indicações → Facilitador' :
             pro.indicacoes_confirmadas < 5 ? '5 indicações → Embaixador' :
             pro.indicacoes_confirmadas < 10 ? '10 indicações → destaque recorrente' : '🌟 Nível máximo!'}
          </span>
        </div>
      </div>
    </div>
  )
}
