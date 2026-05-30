import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import './styles/global.css'

import Login from './pages/Login'
import ReflexaoDiaria from './pages/ReflexaoDiaria'
import Checkin from './pages/Checkin'
import Calendario from './pages/Calendario'
import Gratidao from './pages/Gratidao'
import AvaliacaoEvolutiva from './pages/AvaliacaoEvolutiva'
import MapaHolos from './pages/MapaHolos'
import AnaliseHolos from './pages/AnaliseHolos'
import EscolhaDor from './pages/EscolhaDor'
import Home from './pages/Home'
import RodasHolos from './pages/RodasHolos'
import ClubeHolos from './pages/ClubeHolos'
import Profissionais from './pages/Profissionais'
import Biblioteca from './pages/Biblioteca'
import HolosStore from './pages/HolosStore'
import JornadaHolos from './pages/JornadaHolos'
import Premium from './pages/Premium'
import Perfil from './pages/Perfil'
import TelaFinal from './pages/TelaFinal'

import ProHome from './pages/pro/ProHome'
import ProConteudos from './pages/pro/ProConteudos'
import ProEvolucao from './pages/pro/ProEvolucao'
import ProMatches from './pages/pro/ProMatches'
import ProRede from './pages/pro/ProRede'
import ProSelos from './pages/pro/ProSelos'
import ProPerfil from './pages/pro/ProPerfil'
import ProPremium from './pages/pro/ProPremium'
import ProRelatorios from './pages/pro/ProRelatorios'
import ProDestaque from './pages/pro/ProDestaque'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsuarios from './pages/admin/AdminUsuarios'
import AdminProfissionais from './pages/admin/AdminProfissionais'
import AdminConteudos from './pages/admin/AdminConteudos'
import AdminMatches from './pages/admin/AdminMatches'
import AdminRodas from './pages/admin/AdminRodas'
import AdminComunicacoes from './pages/admin/AdminComunicacoes'
import AdminIndicacoes from './pages/admin/AdminIndicacoes'
import AdminPlanos from './pages/admin/AdminPlanos'
import AdminRelatorios from './pages/admin/AdminRelatorios'
import AdminContatos from './pages/admin/AdminContatos'
import AdminSuporte from './pages/admin/AdminSuporte'
import AdminConfiguracoes from './pages/admin/AdminConfiguracoes'
import AdminSeguranca from './pages/admin/AdminSeguranca'
import AdminMais from './pages/admin/AdminMais'

import BottomNav from './components/BottomNav'

function AppRoutes() {
  const { user, perfil, loading } = useAuth()

  if (loading) return (
    <div className="loading-screen">
      <img src="/arvore.png" alt="Holos" style={{ width:60, marginBottom:16, opacity:0.8 }}/>
      <div className="spinner"/>
    </div>
  )

  if (!user) return (
    <Routes>
      <Route path="/login" element={<Login/>}/>
      <Route path="*" element={<Navigate to="/login" replace/>}/>
    </Routes>
  )

  const tipo = perfil?.perfil || 'Usuario'

  return (
    <div className="app-layout">
      <header className="topbar">
        <div className="topbar-logo">
          <img src="/arvore.png" alt="Holos"/>
          <div className="topbar-logo-text">
            <span className="topbar-logo-plataforma">PLATAFORMA</span>
            <span className="topbar-logo-holos">HOLOS</span>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          {perfil?.plano === 'Premium' && <span className="badge-premium">👑</span>}
          {tipo === 'Admin' && <span className="badge-admin">Admin</span>}
        </div>
      </header>

      <Routes>
        {tipo === 'Admin' ? (
          <>
            <Route path="/admin" element={<AdminDashboard/>}/>
            <Route path="/admin/usuarios" element={<AdminUsuarios/>}/>
            <Route path="/admin/profissionais" element={<AdminProfissionais/>}/>
            <Route path="/admin/conteudos" element={<AdminConteudos/>}/>
            <Route path="/admin/matches" element={<AdminMatches/>}/>
            <Route path="/admin/rodas" element={<AdminRodas/>}/>
            <Route path="/admin/comunicacoes" element={<AdminComunicacoes/>}/>
            <Route path="/admin/indicacoes" element={<AdminIndicacoes/>}/>
            <Route path="/admin/planos" element={<AdminPlanos/>}/>
            <Route path="/admin/relatorios" element={<AdminRelatorios/>}/>
            <Route path="/admin/contatos" element={<AdminContatos/>}/>
            <Route path="/admin/suporte" element={<AdminSuporte/>}/>
            <Route path="/admin/configuracoes" element={<AdminConfiguracoes/>}/>
            <Route path="/admin/seguranca" element={<AdminSeguranca/>}/>
            <Route path="/admin/mais" element={<AdminMais/>}/>
            <Route path="*" element={<Navigate to="/admin" replace/>}/>
          </>
        ) : tipo === 'Profissional' ? (
          <>
            <Route path="/pro" element={<ProHome/>}/>
            <Route path="/pro/dashboard" element={<ProHome/>}/>
            <Route path="/pro/conteudo" element={<ProConteudos/>}/>
            <Route path="/pro/conteudos" element={<ProConteudos/>}/>
            <Route path="/pro/evolucao" element={<ProEvolucao/>}/>
            <Route path="/pro/matches" element={<ProMatches/>}/>
            <Route path="/pro/rede" element={<ProRede/>}/>
            <Route path="/pro/selos" element={<ProSelos/>}/>
            <Route path="/pro/perfil" element={<ProPerfil/>}/>
            <Route path="/pro/premium" element={<ProPremium/>}/>
            <Route path="/pro/relatorios" element={<ProRelatorios/>}/>
            <Route path="/pro/destaque" element={<ProDestaque/>}/>
            <Route path="*" element={<Navigate to="/pro" replace/>}/>
          </>
        ) : (
          <>
            <Route path="/" element={<ReflexaoDiaria/>}/>
            <Route path="/reflexao" element={<ReflexaoDiaria/>}/>
            <Route path="/home" element={<Home/>}/>
            <Route path="/checkin" element={<Checkin/>}/>
            <Route path="/calendario" element={<Calendario/>}/>
            <Route path="/gratidao" element={<Gratidao/>}/>
            <Route path="/avaliacao" element={<AvaliacaoEvolutiva/>}/>
            <Route path="/mapa" element={<MapaHolos/>}/>
            <Route path="/analise" element={<AnaliseHolos/>}/>
            <Route path="/diario" element={<AnaliseHolos/>}/>
            <Route path="/dor" element={<EscolhaDor/>}/>
            <Route path="/dores" element={<EscolhaDor/>}/>
            <Route path="/rodas" element={<RodasHolos/>}/>
            <Route path="/clube" element={<ClubeHolos/>}/>
            <Route path="/profissionais" element={<Profissionais/>}/>
            <Route path="/biblioteca" element={<Biblioteca/>}/>
            <Route path="/store" element={<HolosStore/>}/>
            <Route path="/jornada" element={<JornadaHolos/>}/>
            <Route path="/premium" element={<Premium/>}/>
            <Route path="/perfil" element={<Perfil/>}/>
            <Route path="/final" element={<TelaFinal/>}/>
            {/* redireciona /caminho para /perfil */}
            <Route path="/caminho" element={<Navigate to="/perfil" replace/>}/>
            <Route path="*" element={<Navigate to="/" replace/>}/>
          </>
        )}
      </Routes>

      <BottomNav tipoPerfil={tipo}/>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes/>
      </AuthProvider>
    </BrowserRouter>
  )
}
