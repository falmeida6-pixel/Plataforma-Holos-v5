import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Biblioteca() {
  const [itens, setItens] = useState([])
  const [aba, setAba] = useState('Livros')
  const [loading, setLoading] = useState(true)

  useEffect(() => { carregarItens() }, [aba])

  async function carregarItens() {
    setLoading(true)
    const { data } = await supabase
      .from('conteudos')
      .select('*')
      .eq('status', 'Aprovado')
      .in('categoria', ['Biblioteca'])
      .ilike('formato', aba === 'Livros' ? '%Livro%' : aba === 'Filmes' ? '%Filme%' : '%Documentário%')
    setItens(data || [])
    setLoading(false)
  }

  return (
    <div className="page-content">
      <h2 className="page-title">Biblioteca</h2>
      <p className="page-subtitle">Conteúdos selecionados para ampliar sua consciência.</p>

      <div className="tabs">
        {['Livros', 'Filmes', 'Documentários'].map(t => (
          <button key={t} className={`tab ${aba === t ? 'active' : ''}`} onClick={() => setAba(t)}>{t}</button>
        ))}
      </div>

      {loading ? <div className="loading-screen"><div className="spinner" /></div> : (
        itens.length === 0
          ? <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>Em breve novos conteúdos.</p>
          : itens.map(item => (
            <div key={item.id} className="card">
              {item.link_imagem && (
                <img src={item.link_imagem} alt={item.titulo}
                  style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px' }} />
              )}
              <p style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>{item.titulo}</p>
              {item.descricao && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: '1.4' }}>{item.descricao}</p>}
              {item.link_midia && (
                <a href={item.link_midia} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ width: 'auto', textDecoration: 'none' }}>
                  Acessar →
                </a>
              )}
            </div>
          ))
      )}
    </div>
  )
}
