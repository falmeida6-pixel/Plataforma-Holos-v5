import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { login, cadastrar, sessaoBloqueada } = useAuth()
  const navigate = useNavigate()
  const [modo, setModo] = useState('inicio')
  const [form, setForm] = useState({ nome:'', email:'', senha:'', codigo:'' })
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const att = (c, v) => setForm(p => ({ ...p, [c]: v }))

  async function handleLogin(e) {
    e.preventDefault(); setErro(''); setLoading(true)
    const { error } = await login(form.email, form.senha)
    setLoading(false)
    if (error) setErro('Email ou senha incorretos.')
    else navigate('/')
  }

  async function handleCadastro(tipo) {
    setErro(''); setLoading(true)
    if (!form.nome || !form.email || !form.senha || !form.codigo) {
      setErro('Preencha todos os campos.'); setLoading(false); return
    }
    if (form.senha.length < 6) {
      setErro('Senha com mínimo 6 caracteres.'); setLoading(false); return
    }
    const { error } = await cadastrar(form.nome, form.email, form.senha, tipo, form.codigo)
    setLoading(false)
    if (error) setErro(error.message || 'Erro ao criar conta.')
    else navigate('/')
  }

  if (sessaoBloqueada) return (
    <Tela>
      <Logo/>
      <p style={{ fontSize:15, fontWeight:600, color:'#F7F1E5', marginBottom:10, textAlign:'center' }}>Sessão encerrada</p>
      <p style={{ fontSize:13, color:'#B8AFA0', lineHeight:1.7, marginBottom:28, textAlign:'center' }}>Sua conta foi acessada em outro dispositivo.</p>
      <BtnGold label="Fazer login novamente" onClick={() => window.location.reload()}/>
    </Tela>
  )

  return (
    <Tela>
      <Logo/>

      {modo === 'inicio' && (
        <div style={{ width:'100%', display:'flex', flexDirection:'column', alignItems:'center' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:10, width:260, marginBottom:20 }}>
            <BtnGold label="Entrar como Usuário" onClick={() => setModo('login-usuario')}/>
            <BtnEscuro label="Entrar como Profissional" onClick={() => setModo('login-profissional')}/>
          </div>
          <button onClick={() => setModo('cadastro-usuario')}
            style={{ background:'none', border:'none', color:'#C99A3D', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'Inter, sans-serif', textDecoration:'underline', textUnderlineOffset:3 }}>
            Criar conta
          </button>
        </div>
      )}

      {(modo === 'login-usuario' || modo === 'login-profissional') && (
        <div style={{ width:'100%', maxWidth:320 }}>
          <p style={{ fontSize:13, color:'#B8AFA0', textAlign:'center', marginBottom:20 }}>
            {modo === 'login-usuario' ? 'Acesse sua conta' : 'Acesse sua conta profissional'}
          </p>
          {erro && <Err msg={erro}/>}
          <form onSubmit={handleLogin}>
            <Campo label="Email" type="email" placeholder="seu@email.com" value={form.email} onChange={e => att('email', e.target.value)}/>
            <Campo label="Senha" type="password" placeholder="••••••••" value={form.senha} onChange={e => att('senha', e.target.value)} mb={20}/>
            <BtnGold label={loading ? 'Entrando...' : 'Entrar'} type="submit" disabled={loading} mb={10}/>
          </form>
          <BtnVoltar onClick={() => { setModo('inicio'); setErro('') }}/>
        </div>
      )}

      {(modo === 'cadastro-usuario' || modo === 'cadastro-profissional') && (
        <div style={{ width:'100%', maxWidth:320 }}>
          <p style={{ fontSize:13, color:'#B8AFA0', textAlign:'center', marginBottom:20 }}>
            {modo === 'cadastro-usuario' ? 'Crie sua conta' : 'Cadastre-se como profissional'}
          </p>
          {erro && <Err msg={erro}/>}
          <Campo label="Código de convite" placeholder="HOLOS-XXXX-XXXX"
            value={form.codigo} onChange={e => att('codigo', e.target.value.toUpperCase())}
            extra={{ letterSpacing:2, fontWeight:600 }}/>
          <Campo label="Nome completo" placeholder="Seu nome" value={form.nome} onChange={e => att('nome', e.target.value)}/>
          <Campo label="Email" type="email" placeholder="seu@email.com" value={form.email} onChange={e => att('email', e.target.value)}/>
          <Campo label="Senha" type="password" placeholder="Mínimo 6 caracteres" value={form.senha} onChange={e => att('senha', e.target.value)} mb={14}/>
          <p style={{ fontSize:12, color:'#B8AFA0', textAlign:'center', marginBottom:18 }}>
            {modo === 'cadastro-usuario' ? 'É profissional? ' : 'É usuário? '}
            <button onClick={() => setModo(modo === 'cadastro-usuario' ? 'cadastro-profissional' : 'cadastro-usuario')}
              style={{ background:'none', border:'none', color:'#C99A3D', fontSize:12, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
              Cadastre-se aqui
            </button>
          </p>
          <BtnGold label={loading ? 'Criando...' : 'Criar minha conta'} disabled={loading} mb={10}
            onClick={() => handleCadastro(modo === 'cadastro-usuario' ? 'Usuario' : 'Profissional')}/>
          <BtnVoltar onClick={() => { setModo('inicio'); setErro('') }}/>
        </div>
      )}
    </Tela>
  )
}

function Tela({ children }) {
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 24px', background:'radial-gradient(ellipse at top, rgba(201,154,61,0.18) 0%, transparent 60%), linear-gradient(180deg,#05090B,#081013)' }}>
      {children}
    </div>
  )
}
function Logo() {
  return (
    <div style={{ textAlign:'center', marginBottom:36 }}>
      <img src="/arvore.png" alt="Holos" style={{ width:80, marginBottom:14, filter:'drop-shadow(0 0 16px rgba(201,154,61,0.35))' }}/>
      <p style={{ fontFamily:'Inter', fontSize:9, letterSpacing:5, color:'#B8AFA0', textTransform:'uppercase', marginBottom:2 }}>PLATAFORMA</p>
      <p style={{ fontFamily:'Cinzel, serif', fontSize:34, fontWeight:600, color:'#C99A3D', letterSpacing:6, lineHeight:1, marginBottom:8 }}>HOLOS</p>
      <p style={{ fontSize:12, letterSpacing:1, color:'#B8AFA0', fontStyle:'italic' }}>A direção é para dentro.</p>
    </div>
  )
}
function BtnGold({ label, onClick, type='button', disabled=false, mb=0 }) {
  return <button type={type} onClick={onClick} disabled={disabled} style={{ width:'100%', height:42, borderRadius:10, background:'linear-gradient(135deg,#B7832F,#F0C76A)', color:'#080808', fontSize:13, fontWeight:700, fontFamily:'Inter, sans-serif', border:'none', cursor:'pointer', opacity:disabled?0.5:1, marginBottom:mb }}>{label}</button>
}
function BtnEscuro({ label, onClick }) {
  return <button onClick={onClick} style={{ width:'100%', height:42, borderRadius:10, background:'#111B20', border:'1px solid rgba(201,154,61,0.35)', color:'#F7F1E5', fontSize:13, fontWeight:600, fontFamily:'Inter, sans-serif', cursor:'pointer' }}>{label}</button>
}
function BtnVoltar({ onClick }) {
  return <button onClick={onClick} style={{ width:'100%', height:40, borderRadius:10, background:'none', border:'1px solid rgba(201,154,61,0.15)', color:'#B8AFA0', fontSize:13, fontFamily:'Inter, sans-serif', cursor:'pointer' }}>Voltar</button>
}
function Campo({ label, type='text', placeholder, value, onChange, mb=12, extra={} }) {
  return (
    <div style={{ marginBottom:mb }}>
      <p style={{ fontSize:10, color:'#B8AFA0', letterSpacing:2, textTransform:'uppercase', marginBottom:5 }}>{label}</p>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} style={{ width:'100%', height:42, borderRadius:10, padding:'0 13px', background:'#111B20', border:'1px solid rgba(201,154,61,0.2)', color:'#F7F1E5', fontSize:14, fontFamily:'Inter, sans-serif', outline:'none', ...extra }}/>
    </div>
  )
}
function Err({ msg }) {
  return <div style={{ background:'rgba(216,92,74,0.1)', border:'1px solid rgba(216,92,74,0.3)', borderRadius:8, padding:'9px 13px', fontSize:13, color:'#D85C4A', marginBottom:12 }}>{msg}</div>
}
