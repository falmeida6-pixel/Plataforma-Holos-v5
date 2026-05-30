// Configuração central da Plataforma Holos
// Para alterar o link público do app, use REACT_APP_URL na Vercel.
// Sem variável, o app compartilha automaticamente o domínio atual aberto no navegador.
export const APP_URL = process.env.REACT_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://plataforma-holos.vercel.app')
export const APP_NAME = 'Plataforma Holos'
export const APP_TAGLINE = 'A direção é para dentro.'
