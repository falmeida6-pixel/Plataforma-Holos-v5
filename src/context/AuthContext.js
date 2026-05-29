import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessaoBloqueada] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        carregarPerfil(session.user.id)
      } else {
        setUser(null)
        setPerfil(null)
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        carregarPerfil(session.user.id)
      } else {
        setUser(null)
        setPerfil(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function carregarPerfil(userId) {
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', userId)
        .single()

      if (error || !data) {
        // Tenta novamente após 1.5s (perfil pode ainda estar sendo criado)
        setTimeout(async () => {
          const { data: data2 } = await supabase
            .from('perfis')
            .select('*')
            .eq('id', userId)
            .single()
          if (data2) setPerfil(data2)
          setLoading(false)
        }, 1500)
        return
      }

      setPerfil(data)
    } catch (e) {
      console.error('Erro ao carregar perfil:', e)
    }
    setLoading(false)
  }

  async function login(email, senha) {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    return { error }
  }

  async function cadastrar(nome, email, senha, tipoPerfil = 'Usuario', codigoConvite = null) {
    if (codigoConvite) {
      const { data: convite, error: errConvite } = await supabase
        .from('convites')
        .select('*')
        .eq('codigo', codigoConvite.toUpperCase().trim())
        .eq('status', 'Disponivel')
        .single()

      if (errConvite || !convite) {
        return { error: { message: 'Código de convite inválido ou já utilizado.' } }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome, perfil: convite.tipo_perfil } }
      })
      if (error) return { error }

      await new Promise(r => setTimeout(r, 2000))

      if (convite.plano === 'Premium' && data.user) {
        await supabase.from('perfis').update({ plano: 'Premium' }).eq('id', data.user.id)
      }

      await supabase.from('convites').update({
        status: 'Usado',
        email_usado_por: email,
        usado_em: new Date().toISOString()
      }).eq('codigo', codigoConvite.toUpperCase().trim())

      return { error: null }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome, perfil: tipoPerfil } }
    })
    return { error }
  }

  async function sair() {
    await supabase.auth.signOut()
  }

  async function atualizarPerfil(dados) {
    const { error } = await supabase
      .from('perfis')
      .update(dados)
      .eq('id', user.id)
    if (!error) setPerfil(prev => ({ ...prev, ...dados }))
    return { error }
  }

  return (
    <AuthContext.Provider value={{
      user, perfil, loading, sessaoBloqueada,
      login, cadastrar, sair, atualizarPerfil, carregarPerfil
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
