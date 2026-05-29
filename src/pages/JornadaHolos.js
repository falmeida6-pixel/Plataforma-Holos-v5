import { useNavigate } from 'react-router-dom'

const ITENS = [
  { emoji:'🧠', titulo:'Psicanálise Holos', desc:'Aprofunde seu autoconhecimento com suporte especializado.', link:'https://wa.me/55SEUNUMERO?text=Quero+saber+mais+sobre+Psicanálise+Holos' },
  { emoji:'🪞', titulo:'Holos Identidade', desc:'Descubra quem você é e qual é o seu propósito.', link:'https://wa.me/55SEUNUMERO?text=Quero+saber+mais+sobre+Holos+Identidade' },
  { emoji:'🤖', titulo:'Holos IA', desc:'Ferramenta de IA para apoiar sua jornada de autoconhecimento.', link:'https://wa.me/55SEUNUMERO?text=Quero+saber+mais+sobre+Holos+IA' },
  { emoji:'💬', titulo:'Falar comigo', desc:'Tire suas dúvidas ou solicite suporte diretamente.', link:'https://wa.me/55SEUNUMERO?text=Olá!+Gostaria+de+falar+sobre+a+Plataforma+Holos' },
]

export default function JornadaHolos() {
  return (
    <div className="page-content" style={{ paddingTop:16 }}>
      <p style={{ fontSize:10, letterSpacing:3, color:'#C99A3D', textTransform:'uppercase', marginBottom:4 }}>JORNADA HOLOS</p>
      <h2 style={{ fontFamily:'Cinzel, serif', fontSize:22, color:'#F7F1E5', marginBottom:6 }}>Caminhos para sua evolução.</h2>
      <p style={{ fontSize:13, color:'#B8AFA0', marginBottom:24 }}>Explore programas e ferramentas exclusivas da Holos.</p>

      {ITENS.map((item, i) => (
        <a key={i} href={item.link} target="_blank" rel="noreferrer"
          style={{ display:'flex', gap:16, alignItems:'flex-start', background:'linear-gradient(180deg,#111B20,#0A1013)', border:'1px solid rgba(201,154,61,0.2)', borderRadius:16, padding:18, marginBottom:12, textDecoration:'none', transition:'border-color 0.2s' }}>
          <span style={{ fontSize:32, flexShrink:0 }}>{item.emoji}</span>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:15, fontWeight:600, color:'#F7F1E5', marginBottom:4, fontFamily:'Inter, sans-serif' }}>{item.titulo}</p>
            <p style={{ fontSize:13, color:'#B8AFA0', lineHeight:1.5 }}>{item.desc}</p>
          </div>
          <span style={{ color:'#C99A3D', fontSize:18, alignSelf:'center' }}>›</span>
        </a>
      ))}
    </div>
  )
}
