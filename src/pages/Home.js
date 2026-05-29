import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const BLOCOS = [
  {
    titulo:'HOJE', cor:'#C99A3D',
    itens:[
      { path:'/checkin', emoji:'✅', label:'Check-in Diário', desc:'Suas 3 vitórias', destaque:true },
      { path:'/analise', emoji:'📓', label:'Diário Holos', desc:'Expresse seu dia' },
      { path:'/gratidao', emoji:'🙏', label:'Gratidão', desc:'3 coisas pelo quê sou grata' },
    ]
  },
  {
    titulo:'CUIDADO', cor:'#3D9ED8',
    itens:[
      { path:'/dor', emoji:'🎯', label:'Auto Avaliação', desc:'O que pede mais atenção hoje?' },
      { path:'/biblioteca', emoji:'📚', label:'Biblioteca', desc:'Livros, filmes e docs' },
    ]
  },
  {
    titulo:'EVOLUÇÃO', cor:'#7A4FB8',
    itens:[
      { path:'/calendario', emoji:'📅', label:'Calendário', desc:'Sua consistência' },
      { path:'/mapa', emoji:'🗺️', label:'Mapa Holos', desc:'Equilíbrio das dimensões', premium:true },
      { path:'/avaliacao', emoji:'📊', label:'Avaliação Evolutiva', desc:'Análise do perfil', premium:true },
      { path:'/caminho', emoji:'🌱', label:'Meu Caminho', desc:'Sua memória emocional' },
    ]
  },
  {
    titulo:'COMUNIDADE', cor:'#5AC878',
    itens:[
      { path:'/rodas', emoji:'🌀', label:'Rodas Holos', desc:'Encontros ao vivo', premium:true },
      { path:'/clube', emoji:'📖', label:'Clube Holos', desc:'Clube de leitura', premium:true },
      { path:'/profissionais', emoji:'🤝', label:'Profissionais', desc:'Solicitar match' },
    ]
  },
  {
    titulo:'CONTA', cor:'#B8AFA0',
    itens:[
      { path:'/premium', emoji:'👑', label:'Premium', desc:'Plano e benefícios' },
      { path:'/perfil', emoji:'👤', label:'Perfil', desc:'Seus dados e evolução' },
    ]
  },
  {
    titulo:'FERRAMENTAS', cor:'#8A6424',
    itens:[
      { path:'/store', emoji:'🛍️', label:'Holos Store', desc:'Produtos curados para sua jornada' },
      { path:'/jornada', emoji:'🧠', label:'Jornada Holos', desc:'Programas e contato' },
    ]
  },
]

export default function Home() {
  const { perfil } = useAuth()
  const navigate = useNavigate()
  const isPremium = perfil?.plano === 'Premium'
  const checkins = perfil?.checkins_realizados || 0

  let mensagem = 'Bem-vinda! Sua jornada começa aqui. 🌱'
  if (checkins >= 21) mensagem = `${checkins} registros — você está construindo algo sólido! 🏆`
  else if (checkins >= 7) mensagem = `${checkins} check-ins feitos — a consistência é o caminho. ✨`
  else if (checkins >= 1) mensagem = `${checkins} check-in${checkins>1?'s':''} realizado${checkins>1?'s':''} — cada dia conta. 💪`

  return (
    <div style={{ padding:'12px 16px', paddingBottom:'calc(100px + env(safe-area-inset-bottom,16px))', overflowY:'auto' }}>
      <h2 style={{ fontFamily:'Cinzel, serif', fontSize:22, color:'#F7F1E5', marginBottom:4 }}>
        Olá, {perfil?.nome?.split(' ')[0] || 'bem-vinda'} 👋
      </h2>
      <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:20, lineHeight:1.5 }}>{mensagem}</p>

      {BLOCOS.map(bloco => (
        <div key={bloco.titulo} style={{ marginBottom:20 }}>
          <p style={{ fontSize:9, letterSpacing:3, color:bloco.cor, textTransform:'uppercase', fontWeight:700, marginBottom:10 }}>
            {bloco.titulo}
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {bloco.itens.map(item => (
              <button key={item.path} onClick={() => navigate(item.path)}
                style={{
                  display:'flex', flexDirection:'column', alignItems:'flex-start',
                  background: item.destaque?'linear-gradient(145deg,#0D1008,#161200)':'linear-gradient(180deg,#111B20,#0A1013)',
                  border: item.destaque?'1px solid rgba(201,154,61,0.45)':`1px solid ${bloco.cor}20`,
                  borderRadius:14, padding:12, cursor:'pointer', textAlign:'left',
                  WebkitTapHighlightColor:'transparent',
                }}>
                <div style={{ display:'flex', justifyContent:'space-between', width:'100%', marginBottom:6 }}>
                  <span style={{ fontSize:22 }}>{item.emoji}</span>
                  {item.premium && !isPremium && (
                    <span style={{ fontSize:9, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', borderRadius:4, padding:'2px 5px', fontWeight:700 }}>PRO</span>
                  )}
                </div>
                <p style={{ fontSize:13, fontWeight:600, color:'#F7F1E5', fontFamily:'Inter, sans-serif', marginBottom:2, lineHeight:1.3 }}>{item.label}</p>
                <p style={{ fontSize:11, color:'#B8AFA0', fontFamily:'Inter, sans-serif', lineHeight:1.3 }}>{item.desc}</p>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
