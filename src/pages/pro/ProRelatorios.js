import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function ProRelatorios() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [pro, setPro] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { carregarPro() }, [user])

  async function carregarPro() {
    const { data } = await supabase.from('profissionais').select('*').eq('user_id', user.id).single()
    setPro(data); setLoading(false)
  }

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>
  if (!pro) return null

  const isPremium = pro.plano === 'Premium'

  if (!isPremium) return (
    <div className="page-content" style={{ textAlign:'center' }}>
      <div style={{ fontSize:'48px', marginBottom:'16px' }}>📊</div>
      <h2 className="page-title">Relatórios</h2>
      <div className="locked-card">
        <div style={{ fontSize:'32px', marginBottom:'12px' }}>🔒</div>
        <p style={{ fontWeight:'600', marginBottom:'6px' }}>Exclusivo para Premium</p>
        {/* Exemplo do relatório bloqueado */}
        <div style={{ background:'var(--bg-input)', borderRadius:'12px', padding:'16px', marginBottom:'16px', filter:'blur(3px)', pointerEvents:'none' }}>
          <p style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'8px' }}>Este mês · Maio 2025</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            {['18','12','7','4,8★'].map((v,i) => (
              <div key={i} style={{ background:'var(--bg-card)', borderRadius:'8px', padding:'8px', textAlign:'center' }}>
                <p style={{ fontSize:'18px', fontWeight:'700', color:'var(--gold)' }}>{v}</p>
                <p style={{ fontSize:'10px', color:'var(--text-muted)' }}>—</p>
              </div>
            ))}
          </div>
        </div>
        <button className="btn btn-gold" onClick={() => navigate('/pro/premium')}>Quero ser Premium</button>
      </div>
    </div>
  )

  const mes = new Date().toLocaleDateString('pt-BR', { month:'long', year:'numeric' })

  return (
    <div className="page-content">
      <h2 className="page-title">Relatório Mensal</h2>
      <p className="page-subtitle">Visão do seu impacto em {mes}.</p>

      <div className="card-gold" style={{ marginBottom:'20px' }}>
        <p style={{ fontSize:'11px', color:'var(--gold)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'14px' }}>✦ Seu Impacto</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
          <MetricaBox valor={pro.conteudos_aprovados} label="Conteúdos publicados"/>
          <MetricaBox valor={pro.matches_solicitados} label="Solicitações de Match"/>
          <MetricaBox valor={pro.matches_aceitos} label="Matches aceitos"/>
          <MetricaBox valor={pro.avaliacao_media > 0 ? `${pro.avaliacao_media}★` : '—'} label="Avaliação média" destaque/>
        </div>
      </div>

      <p className="section-title">Análise</p>
      <div className="card" style={{ marginBottom:'12px' }}>
        <p style={{ fontSize:'14px', lineHeight:'1.6', fontFamily:'Playfair Display, serif' }}>
          {gerarAnalise(pro)}
        </p>
      </div>

      <div className="card" style={{ marginBottom:'12px' }}>
        <div className="metrica-row">
          <span className="metrica-label">Taxa de aceitação</span>
          <span className="metrica-valor">
            {pro.matches_solicitados > 0 ? Math.round((pro.matches_aceitos / pro.matches_solicitados) * 100) + '%' : '—'}
          </span>
        </div>
        <div className="metrica-row">
          <span className="metrica-label">Conteúdos pendentes</span>
          <span className="metrica-valor">{pro.conteudos_enviados - pro.conteudos_aprovados}</span>
        </div>
        <div className="metrica-row">
          <span className="metrica-label">Indicações confirmadas</span>
          <span className="metrica-valor" style={{ color:'var(--gold)' }}>{pro.indicacoes_confirmadas}</span>
        </div>
      </div>

      {pro.profissional_em_destaque && (
        <div className="card-gold">
          <p style={{ fontSize:'13px', lineHeight:'1.5' }}>
            ⭐ Você está em <strong>destaque</strong> na plataforma
            {pro.data_destaque_ate ? ` até ${new Date(pro.data_destaque_ate).toLocaleDateString('pt-BR')}` : ''}.
          </p>
        </div>
      )}
    </div>
  )
}

function MetricaBox({ valor, label, destaque }) {
  return (
    <div style={{ background:'rgba(0,0,0,0.2)', borderRadius:'10px', padding:'12px', textAlign:'center' }}>
      <p style={{ fontSize:'22px', fontWeight:'700', color: destaque ? 'var(--gold)' : 'var(--text-white)', marginBottom:'4px' }}>{valor}</p>
      <p style={{ fontSize:'11px', color:'var(--text-muted)' }}>{label}</p>
    </div>
  )
}

function gerarAnalise(pro) {
  if (pro.conteudos_aprovados === 0) return 'Envie seu primeiro conteúdo para começar a construir seu impacto na plataforma.'
  if (pro.matches_aceitos === 0) return `Você já tem ${pro.conteudos_aprovados} conteúdo(s) aprovado(s). Aceite os próximos matches para começar a conectar com usuários.`
  if (pro.avaliacao_media >= 4.5) return `Excelente trabalho! Sua avaliação média de ${pro.avaliacao_media}★ reflete o cuidado que você coloca em cada conexão.`
  return `Você está construindo uma presença sólida na plataforma com ${pro.conteudos_aprovados} conteúdo(s) e ${pro.matches_aceitos} match(es) aceito(s). Continue assim.`
}
