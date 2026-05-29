import { useNavigate } from 'react-router-dom'

export default function TelaFinal() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:40, background:'radial-gradient(ellipse at top, rgba(201,154,61,0.18) 0%, transparent 60%), linear-gradient(180deg,#05090B,#081013)', textAlign:'center' }}>
      <img src="/arvore.png" alt="Holos" style={{ width:100, marginBottom:24, filter:'drop-shadow(0 0 30px rgba(201,154,61,0.5))' }}/>
      <p style={{ fontFamily:'Inter', fontSize:10, letterSpacing:5, color:'#B8AFA0', textTransform:'uppercase', marginBottom:4 }}>PLATAFORMA</p>
      <p style={{ fontFamily:'Cinzel, serif', fontSize:42, fontWeight:600, color:'#C99A3D', letterSpacing:8, lineHeight:1, marginBottom:20 }}>HOLOS</p>
      <p style={{ fontFamily:'Cinzel, serif', fontSize:16, color:'#F7F1E5', fontStyle:'italic', marginBottom:12 }}>"A direção é para dentro."</p>
      <div style={{ display:'flex', gap:32, marginTop:32, marginBottom:40 }}>
        {[['❤️','Corpo'],['🧠','Mente'],['✨','Consciência']].map(([e,l]) => (
          <div key={l} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:28 }}>{e}</span>
            <span style={{ fontSize:11, color:'#B8AFA0', letterSpacing:1 }}>{l}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize:12, color:'#B8AFA0', fontStyle:'italic' }}>Sempre que precisar, volte para dentro.</p>
      <button onClick={() => navigate('/')} style={{ marginTop:32, height:44, padding:'0 28px', borderRadius:12, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:14, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer' }}>
        Voltar ao início
      </button>
    </div>
  )
}
