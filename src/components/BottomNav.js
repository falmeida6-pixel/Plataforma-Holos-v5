import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const NAV_USUARIO = [
  { path:'/', label:'Reflexão', emoji:'🌅' },
  { path:'/home', label:'Home', emoji:'⊞' },
  { path:'/checkin', label:'Check-in', emoji:'✅' },
  { path:'/dor', label:'Hoje', emoji:'🌿' },
  { path:'/perfil', label:'Perfil', emoji:'👤' },
]

const NAV_PRO = [
  { path:'/pro', label:'Dashboard', emoji:'🏠' },
  { path:'/pro/conteudo', label:'Conteúdo', emoji:'📝' },
  { path:'/pro/matches', label:'Matches', emoji:'🤝' },
  { path:'/pro/rede', label:'Rede', emoji:'🌐' },
  { path:'/pro/perfil', label:'Perfil', emoji:'👤' },
]

const NAV_ADMIN = [
  { path:'/admin', label:'Dashboard', emoji:'📊' },
  { path:'/admin/usuarios', label:'Usuários', emoji:'👥' },
  { path:'/admin/profissionais', label:'Profissionais', emoji:'🩺' },
  { path:'/admin/conteudos', label:'Conteúdos', emoji:'📝' },
  { path:'#mais', label:'Mais', emoji:'☰' },
]

const MAIS_ADMIN = [
  { path:'/admin/matches', label:'Matches', emoji:'🤝' },
  { path:'/admin/rodas', label:'Rodas', emoji:'🌀' },
  { path:'/admin/comunicacoes', label:'Comunicações', emoji:'📢' },
  { path:'/admin/indicacoes', label:'Indicações', emoji:'🎯' },
  { path:'/admin/planos', label:'Planos', emoji:'💎' },
  { path:'/admin/relatorios', label:'Relatórios', emoji:'📈' },
  { path:'/admin/contatos', label:'Contatos', emoji:'📞' },
  { path:'/admin/suporte', label:'Suporte', emoji:'🆘' },
  { path:'/admin/configuracoes', label:'Configurações', emoji:'⚙️' },
  { path:'/admin/seguranca', label:'Segurança', emoji:'🔐' },
]

export default function BottomNav({ tipoPerfil }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuAberto, setMenuAberto] = useState(false)

  const navItens = tipoPerfil === 'Admin' ? NAV_ADMIN
    : tipoPerfil === 'Profissional' ? NAV_PRO
    : NAV_USUARIO

  function handleNav(path) {
    if (path === '#mais') { setMenuAberto(v => !v); return }
    setMenuAberto(false)
    navigate(path)
  }

  const isActive = (path) => {
    if (path === '#mais') return menuAberto
    if (path === '/') return location.pathname === '/' || location.pathname === '/reflexao'
    if (path === '/dor') return location.pathname === '/dor' || location.pathname === '/dores'
    return location.pathname === path
  }

  return (
    <>
      {menuAberto && tipoPerfil === 'Admin' && (
        <>
          <div onClick={() => setMenuAberto(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:200, backdropFilter:'blur(4px)' }}/>
          <div style={{ position:'fixed', bottom:68, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:480, zIndex:201, background:'linear-gradient(180deg,#0D1417,#05090B)', border:'1px solid rgba(201,154,61,0.25)', borderRadius:'20px 20px 0 0', padding:'16px 16px 20px', maxHeight:'60vh', overflowY:'auto' }}>
            <div style={{ width:32, height:3, background:'rgba(201,154,61,0.3)', borderRadius:2, margin:'0 auto 16px' }}/>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {MAIS_ADMIN.map(item => (
                <button key={item.path} onClick={() => handleNav(item.path)}
                  style={{ display:'flex', alignItems:'center', gap:8, background: location.pathname===item.path?'rgba(201,154,61,0.1)':'rgba(255,255,255,0.03)', border: location.pathname===item.path?'1px solid rgba(201,154,61,0.4)':'1px solid rgba(201,154,61,0.1)', borderRadius:12, padding:'10px 12px', cursor:'pointer' }}>
                  <span style={{ fontSize:18 }}>{item.emoji}</span>
                  <p style={{ fontSize:12, fontWeight:600, color:'#F7F1E5', fontFamily:'Inter, sans-serif' }}>{item.label}</p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      <nav className="bottom-nav">
        {navItens.map(item => (
          <button key={item.path} className={`nav-item ${isActive(item.path)?'active':''}`} onClick={() => handleNav(item.path)}>
            <span style={{ fontSize: item.emoji==='⊞'?22:20 }}>{item.emoji}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </>
  )
}
