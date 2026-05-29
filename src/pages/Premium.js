import { useAuth } from '../context/AuthContext'

const BENEFICIOS = [
  { emoji: '🧠', titulo: 'Corpo, Mente e Consciência', desc: 'Acesso completo às três dimensões da sua jornada.' },
  { emoji: '🗺️', titulo: 'Mapa Holos', desc: 'Visualize seu equilíbrio em Corpo, Mente e Consciência.' },
  { emoji: '📊', titulo: 'Avaliação Evolutiva', desc: 'Análise personalizada gerada após 30 dias de registros.' },
  { emoji: '🌀', titulo: 'Rodas Holos', desc: 'Encontros exclusivos para membros Premium.' },
  { emoji: '📚', titulo: 'Clube Holos', desc: 'Clube de leitura com grupo exclusivo.' },
  { emoji: '🤝', titulo: 'Match Ampliado', desc: 'Mais conexões com profissionais da plataforma.' },
  { emoji: '🔑', titulo: 'Conteúdos Exclusivos', desc: 'Ferramentas e conteúdos apenas para Premium.' },
]

export default function Premium() {
  const { perfil } = useAuth()

  if (perfil?.plano === 'Premium') return (
    <div className="page-content" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>👑</div>
      <h2 className="page-title">Você é Premium!</h2>
      <p className="page-subtitle">Todos os recursos da plataforma estão disponíveis para você.</p>
    </div>
  )

  return (
    <div className="page-content">
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>👑</div>
        <h2 className="page-title">Plano Premium</h2>
        <p className="page-subtitle">Desbloqueie sua jornada completa em Corpo, Mente e Consciência.</p>
      </div>

      {/* Benefícios */}
      <p className="section-title">O que você desbloqueia</p>
      <div className="card" style={{ marginBottom: '20px' }}>
        {BENEFICIOS.map((b, i) => (
          <div key={i} style={{
            display: 'flex', gap: '12px', alignItems: 'flex-start',
            paddingBottom: i < BENEFICIOS.length - 1 ? '14px' : '0',
            marginBottom: i < BENEFICIOS.length - 1 ? '14px' : '0',
            borderBottom: i < BENEFICIOS.length - 1 ? '1px solid var(--border)' : 'none'
          }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>{b.emoji}</span>
            <div>
              <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>{b.titulo}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="card-gold" style={{ textAlign: 'center', marginBottom: '16px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Investimento mensal</p>
        <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', color: 'var(--gold)', marginBottom: '4px' }}>
          Premium
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Pequenas escolhas diárias constroem grandes transformações.
        </p>
        <a
          href="https://wa.me/55SEUNUMERO?text=Olá!%20Quero%20assinar%20o%20Plano%20Premium%20da%20Plataforma%20Holos."
          target="_blank" rel="noreferrer"
          className="btn btn-gold"
          style={{ textDecoration: 'none' }}
        >
          Quero ser Premium
        </a>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
        Após a confirmação do pagamento, seu acesso Premium é ativado em até 24h.
      </p>
    </div>
  )
}
