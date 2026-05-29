import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function ClubeHolos() {
  const { perfil } = useAuth()
  const navigate = useNavigate()
  const [clube, setClube] = useState(null)
  const [loading, setLoading] = useState(true)
  const isPremium = perfil?.plano === 'Premium'

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data } = await supabase.from('clube_holos').select('*')
      .eq('status','ativo').order('mes', { ascending:false }).limit(1).single()
    setClube(data)
    setLoading(false)
  }

  if (!isPremium) return (
    <div className="page-content" style={{ paddingTop:16 }}>
      <p style={{ fontSize:10, letterSpacing:3, color:'#C99A3D', textTransform:'uppercase', marginBottom:4 }}>CLUBE HOLOS</p>
      <h2 style={{ fontFamily:'Cinzel, serif', fontSize:22, color:'#F7F1E5', marginBottom:20 }}>Clube de Leitura</h2>
      <div style={{ background:'linear-gradient(180deg,#111B20,#0A1013)', border:'1px solid rgba(201,154,61,0.35)', borderRadius:20, padding:28, textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:14 }}>📚</div>
        <p style={{ fontFamily:'Cinzel, serif', fontSize:16, color:'#C99A3D', marginBottom:12 }}>Clube Holos Premium</p>
        <p style={{ fontSize:13, color:'#B8AFA0', lineHeight:1.7, marginBottom:20 }}>
          Um mês livro secular, outro mês livro bíblico. Acesse o grupo exclusivo e leia junto com a comunidade Holos.
        </p>
        <button onClick={() => navigate('/premium')} style={{ width:'100%', height:46, borderRadius:12, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:14, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer' }}>
          Conhecer o Premium
        </button>
      </div>
    </div>
  )

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>

  return (
    <div className="page-content" style={{ paddingTop:16 }}>
      <p style={{ fontSize:10, letterSpacing:3, color:'#C99A3D', textTransform:'uppercase', marginBottom:4 }}>CLUBE HOLOS</p>
      <h2 style={{ fontFamily:'Cinzel, serif', fontSize:22, color:'#F7F1E5', marginBottom:6 }}>Leitura que transforma.</h2>
      <p style={{ fontSize:13, color:'#B8AFA0', marginBottom:24 }}>Um mês livro secular, outro mês livro bíblico.</p>

      {clube ? (
        <div style={{ background:'linear-gradient(145deg,#0D1008,#161200)', border:'1px solid rgba(201,154,61,0.4)', borderRadius:20, padding:24, marginBottom:16 }}>
          <p style={{ fontSize:10, color:'#C99A3D', letterSpacing:2, marginBottom:12 }}>📖 LIVRO DO MÊS</p>
          <p style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:6 }}>{clube.livro}</p>
          <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:4 }}>
            {clube.tipo_livro === 'secular' ? '📘 Livro secular' : '✝️ Livro bíblico'}
          </p>
          <p style={{ fontSize:12, color:'#B8AFA0', marginBottom:20 }}>
            Data: {clube.data_prevista ? new Date(clube.data_prevista).toLocaleDateString('pt-BR') : 'À confirmar'}
          </p>
          {clube.link_grupo_whatsapp ? (
            <a href={clube.link_grupo_whatsapp} target="_blank" rel="noreferrer"
              style={{ display:'block', width:'100%', height:46, borderRadius:12, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:14, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer', textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
              💬 Entrar no grupo
            </a>
          ) : (
            <div style={{ background:'rgba(201,154,61,0.06)', borderRadius:12, padding:14, textAlign:'center' }}>
              <p style={{ fontSize:13, color:'#B8AFA0' }}>Link do grupo em breve.</p>
            </div>
          )}
        </div>
      ) : (
        <div style={{ background:'linear-gradient(180deg,#111B20,#0A1013)', border:'1px solid rgba(201,154,61,0.2)', borderRadius:16, padding:24, textAlign:'center' }}>
          <p style={{ fontSize:13, color:'#B8AFA0', lineHeight:1.6 }}>Nenhum clube ativo no momento. Em breve novidades!</p>
        </div>
      )}

      <div style={{ background:'linear-gradient(180deg,#111B20,#0A1013)', border:'1px solid rgba(201,154,61,0.15)', borderRadius:16, padding:16 }}>
        <p style={{ fontSize:12, color:'#B8AFA0', lineHeight:1.7 }}>
          🌿 <strong style={{ color:'#F7F1E5' }}>Como funciona:</strong> A cada mês um novo livro é escolhido pela curadoria Holos — alternando entre títulos seculares e bíblicos. Membros Premium acessam o grupo WhatsApp exclusivo para discussão e encontros ao vivo.
        </p>
      </div>
    </div>
  )
}
