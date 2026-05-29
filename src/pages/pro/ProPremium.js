import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const BENEFICIOS = [
  { emoji:'🎯', titulo:'Prioridade no Match', desc:'Seu perfil aparece primeiro nas recomendações para usuários.' },
  { emoji:'⭐', titulo:'Profissional em Destaque', desc:'Ganhe mais visibilidade e gere mais confiança na plataforma.' },
  { emoji:'👑', titulo:'Selo Premium Holos', desc:'Mostre seu compromisso com a excelência e o cuidado.' },
  { emoji:'📊', titulo:'Relatórios Mensais', desc:'Acompanhe conteúdos publicados, matches e avaliação média.' },
  { emoji:'🌀', titulo:'Prioridade em Rodas Holos', desc:'Acesso antecipado para participar como facilitador.' },
]

export default function ProPremium() {
  const { perfil } = useAuth()
  const navigate = useNavigate()

  // Busca o profissional pelo contexto
  // Se já for premium mostra tela de confirmação
  return (
    <div className="page-content">
      <div style={{ textAlign:'center', marginBottom:'28px' }}>
        <div style={{ fontSize:'40px', marginBottom:'12px' }}>👑</div>
        <h2 className="page-title">Premium Profissional</h2>
        <p className="page-subtitle">Impulsione seu impacto e alcance mais pessoas.</p>
      </div>

      <p className="section-title">O que você desbloqueia</p>
      <div className="card" style={{ marginBottom:'20px' }}>
        {BENEFICIOS.map((b, i) => (
          <div key={i} style={{
            display:'flex', gap:'12px', alignItems:'flex-start',
            paddingBottom: i < BENEFICIOS.length-1 ? '14px' : '0',
            marginBottom: i < BENEFICIOS.length-1 ? '14px' : '0',
            borderBottom: i < BENEFICIOS.length-1 ? '1px solid var(--border)' : 'none'
          }}>
            <span style={{ fontSize:'20px', flexShrink:0 }}>{b.emoji}</span>
            <div>
              <p style={{ fontWeight:'600', fontSize:'14px', marginBottom:'2px' }}>{b.titulo}</p>
              <p style={{ fontSize:'12px', color:'var(--text-muted)' }}>{b.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comparativo */}
      <p className="section-title">Comparativo</p>
      <div className="card" style={{ marginBottom:'20px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0' }}>
          <div style={{ padding:'10px', borderRight:'1px solid var(--border)' }}>
            <p style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'10px', fontWeight:'600' }}>GRATUITO</p>
            {['Perfil profissional','Enviar conteúdos','Acompanhar matches','Selos de evolução','Indicações e rede'].map((i,j) => (
              <p key={j} style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'6px' }}>✓ {i}</p>
            ))}
          </div>
          <div style={{ padding:'10px' }}>
            <p style={{ fontSize:'12px', color:'var(--gold)', marginBottom:'10px', fontWeight:'600' }}>PREMIUM 👑</p>
            {['Tudo do gratuito','Prioridade no Match','Profissional em destaque','Selo Premium','Relatórios mensais'].map((i,j) => (
              <p key={j} style={{ fontSize:'12px', color:'var(--text-light)', marginBottom:'6px' }}>✓ {i}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="card-gold" style={{ textAlign:'center', marginBottom:'16px' }}>
        <p style={{ fontSize:'13px', color:'var(--text-muted)', marginBottom:'16px', lineHeight:'1.5' }}>
          Pequenas contribuições transformam grandes jornadas. Você transforma. A Holos conecta.
        </p>
        <a
          href="https://wa.me/55SEUNUMERO?text=Olá!%20Quero%20assinar%20o%20Premium%20Profissional%20da%20Plataforma%20Holos."
          target="_blank" rel="noreferrer"
          className="btn btn-gold"
          style={{ textDecoration:'none' }}
        >
          Quero ser Premium
        </a>
      </div>

      <p style={{ fontSize:'12px', color:'var(--text-muted)', textAlign:'center' }}>
        Após a confirmação, seu acesso Premium é ativado em até 24h.
      </p>
    </div>
  )
}
