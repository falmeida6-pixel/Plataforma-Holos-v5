import NavActions from '../components/NavActions'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const CATEGORIAS = ['Todos','Livros','Journals','Bem-estar','Ambiente','Canecas','Acessórios']

export default function HolosStore() {
  const [itens, setItens] = useState([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState('Todos')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data } = await supabase.from('store_itens').select('*').eq('ativo', true).order('categoria')
    setItens(data || [])
    setLoading(false)
  }

  const filtrados = cat === 'Todos' ? itens : itens.filter(i => i.categoria === cat)

  return (
    <>
      <NavActions/>
      <div style={{ padding:'12px 16px', paddingBottom:'calc(120px + env(safe-area-inset-bottom,16px))', overflowY:'auto' }}>
        <p style={{ fontSize:10, letterSpacing:3, color:'#C99A3D', textTransform:'uppercase', marginBottom:4 }}>HOLOS STORE</p>
        <h2 style={{ fontFamily:'Cinzel, serif', fontSize:20, color:'#F7F1E5', marginBottom:6 }}>Itens que inspiram.</h2>
        <p style={{ fontSize:13, color:'#B8AFA0', marginBottom:16 }}>Produtos selecionados com amor e propósito.</p>

        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:20 }}>
          {CATEGORIAS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              style={{ padding:'6px 14px', borderRadius:20, fontSize:12, border: cat===c?'1px solid #C99A3D':'1px solid rgba(201,154,61,0.2)', background: cat===c?'rgba(201,154,61,0.12)':'#111B20', color: cat===c?'#C99A3D':'#B8AFA0', cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
              {c}
            </button>
          ))}
        </div>

        {loading ? <div className="loading-screen"><div className="spinner"/></div> :
          filtrados.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0' }}>
              <p style={{ fontSize:32, marginBottom:12 }}>🛍️</p>
              <p style={{ fontSize:13, color:'#B8AFA0' }}>Em breve novos itens nesta categoria.</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {filtrados.map(item => (
                <div key={item.id} style={{ background:'linear-gradient(180deg,#111B20,#0A1013)', border:'1px solid rgba(201,154,61,0.2)', borderRadius:16, overflow:'hidden' }}>
                  {item.foto_url
                    ? <img src={item.foto_url} alt={item.nome} style={{ width:'100%', height:120, objectFit:'cover' }}/>
                    : <div style={{ width:'100%', height:120, background:'rgba(201,154,61,0.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>🛍️</div>
                  }
                  <div style={{ padding:12 }}>
                    <p style={{ fontSize:13, fontWeight:600, color:'#F7F1E5', marginBottom:2 }}>{item.nome}</p>
                    <p style={{ fontSize:11, color:'#B8AFA0', marginBottom:10 }}>{item.categoria}</p>
                    {item.link_afiliado && (
                      <a href={item.link_afiliado} target="_blank" rel="noreferrer"
                        style={{ display:'block', textAlign:'center', padding:'7px', borderRadius:8, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:12, fontWeight:700, textDecoration:'none', fontFamily:'Inter, sans-serif' }}>
                        Ver item →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </>
  )
}
