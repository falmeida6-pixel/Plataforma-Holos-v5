// Configuração central da Plataforma Holos.
// Em produção, configure REACT_APP_URL na Vercel. Se não configurar, usa o domínio atual do navegador.
export const APP_NAME = 'Plataforma Holos'
export const APP_TAGLINE = 'A direção é para dentro.'

export function getAppUrl() {
  const envUrl = process.env.REACT_APP_URL
  if (envUrl && !envUrl.includes('plataforma-holos.vercel.app')) return envUrl
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
  return envUrl || 'https://plataforma-holos.vercel.app'
}

export const APP_URL = getAppUrl()
