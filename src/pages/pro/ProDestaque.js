import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function ProDestaque() {
  const navigate = useNavigate()
  return (
    <div className="page-content" style={{ paddingTop:16 }}>
      <p style={{ fontSize:10, letterSpacing:3, color:'#C99A3D', textTransform:'uppercase', marginBottom:4 }}>PERFIL PREMIUM</p>
      <h2 style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:20 }}>Profissional em Destaque</h2>

      <div style={{ background:'linear-gradient(145deg,#0D1008,#161200)', border:'1px solid rgba(201,154,61,0.4)', borderRadius:18, padding:24, marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(201,154,61,0.1)', border:'2px solid #C99A3D', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>👑</div>
          <div>
            <p style={{ fontSize:14, fontWeight:600, color:'#F7F1E5', fontFamily:'Inter, sans-serif' }}>Exemplo Premium</p>
            <p style={{ fontSize:12, color:'#B8AFA0' }}>Psicanalista · Terapeuta</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
          {[['👑','Selo Premium'],['⭐','Em destaque'],['🎯','Prioridade Match']].map(([e,l]) => (
            <span key={l} style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:'rgba(201,154,61,0.12)', color:'#C99A3D', border:'1px solid rgba(201,154,61,0.3)' }}>{e} {l}</span>
          ))}
        </div>
        <p style={{ fontSize:13, color:'#B8AFA0', lineHeight:1.6 }}>Com o Premium, seu perfil aparece em primeiro nas recomendações e recebe destaque na plataforma.</p>
      </div>

      <button onClick={() => navigate('/pro/premium')}
        style={{ width:'100%', height:48, borderRadius:12, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:15, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer' }}>
        Quero ser Premium →
      </button>
    </div>
  )
}
