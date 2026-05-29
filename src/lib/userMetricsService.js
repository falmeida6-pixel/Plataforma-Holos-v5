import { supabase } from './supabase'
import { hojeLocal } from './dataLocal'

export function normalizarDimensao(valor) {
  if (!valor) return null
  const v = String(valor).trim().toLowerCase()
  if (v.includes('corpo') || v.includes('fisic')) return 'Corpo'
  if (v.includes('mente') || v.includes('mental')) return 'Mente'
  if (v.includes('consci') || v.includes('conscien') || v.includes('espiritual') || v.includes('alma')) return 'Consciência'
  return null
}

export function dataLocalMenosDias(dias) {
  const d = new Date()
  d.setDate(d.getDate() - dias)
  const ano = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

async function safeQuery(promise, fallback = []) {
  try {
    const { data, error, count } = await promise
    if (error) return { data: fallback, count: count || 0, error }
    return { data: data || fallback, count: count || (Array.isArray(data) ? data.length : 0), error: null }
  } catch (error) {
    return { data: fallback, count: 0, error }
  }
}

function contarCheckins(checkins = []) {
  const completos = checkins.filter(c => c.status_dia === 'Completo' || (!!c.vitoria_corpo && !!c.vitoria_mente && !!c.vitoria_consciencia)).length
  const parciais = checkins.filter(c => {
    const total = [c.vitoria_corpo, c.vitoria_mente, c.vitoria_consciencia].filter(Boolean).length
    return c.status_dia === 'Parcial' || (total > 0 && total < 3)
  }).length
  return { completos, parciais }
}

function extrairDimensoesDeDiario(diarios = []) {
  const dims = []
  diarios.forEach(d => {
    ;[d.dimensao_cuidado, d.palavra_chave, d.dimensao, d.instancia].forEach(v => {
      const dim = normalizarDimensao(v)
      if (dim) dims.push(dim)
    })
  })
  return dims
}

export async function getUserMetrics(userId, { dias = 7 } = {}) {
  if (!userId) {
    return {
      checkins: [], diarios: [], gratidoes: [], curtidas: [], conteudos: [], matches: [],
      completos: 0, parciais: 0, diasSemRegistro: dias, gratidoesTotal: 0, diariosTotal: 0,
      curtidasTotal: 0, ultimaGratidao: null, ultimoConteudo: null, dimMais: '—', fraseSemana: 'Sua jornada começa com pequenos registros. 🌱', hoje: {}
    }
  }

  const inicio = dataLocalMenosDias(dias - 1)
  const hoje = hojeLocal()

  const [checkinsRes, diariosRes, gratidoesRes, curtidasRes, matchesRes] = await Promise.all([
    safeQuery(supabase.from('checkins').select('*').eq('user_id', userId).gte('data', inicio).order('data', { ascending: false })),
    safeQuery(supabase.from('checkins').select('*').eq('user_id', userId).not('observacao', 'is', null).order('data', { ascending: false }).limit(30)),
    safeQuery(supabase.from('gratidao').select('*').eq('user_id', userId).order('data', { ascending: false }).limit(60)),
    safeQuery(supabase.from('curtidas').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(80)),
    safeQuery(supabase.from('matches').select('*,profissionais(id,nome,especialidades,bio)').eq('user_id', userId).order('data_match', { ascending: false }).limit(1)),
  ])

  const checkins = checkinsRes.data || []
  const diarios = diariosRes.data || []
  const gratidoes = gratidoesRes.data || []
  const curtidas = curtidasRes.data || []
  const matches = matchesRes.data || []

  const conteudoIds = [...new Set(curtidas.map(c => c.conteudo_id).filter(Boolean))]
  let conteudos = []
  if (conteudoIds.length) {
    const conteudosRes = await safeQuery(supabase.from('conteudos').select('*').in('id', conteudoIds))
    conteudos = conteudosRes.data || []
  }

  const { completos, parciais } = contarCheckins(checkins)
  const diasComRegistro = new Set(checkins.map(c => c.data)).size
  const diasSemRegistro = Math.max(0, dias - diasComRegistro)
  const gratidoesTotal = gratidoes.length
  const diariosTotal = diarios.length
  const curtidasTotal = curtidas.length

  const dimCount = { Corpo: 0, Mente: 0, 'Consciência': 0 }
  checkins.forEach(c => {
    if (c.vitoria_corpo) dimCount.Corpo++
    if (c.vitoria_mente) dimCount.Mente++
    if (c.vitoria_consciencia) dimCount['Consciência']++
  })
  extrairDimensoesDeDiario(diarios).forEach(dim => { dimCount[dim] = (dimCount[dim] || 0) + 1 })
  curtidas.forEach(c => {
    const dim = normalizarDimensao(c.dimensao)
    if (dim) dimCount[dim] = (dimCount[dim] || 0) + 1
  })
  conteudos.forEach(c => {
    const dim = normalizarDimensao(c.instancia || c.dimensao || c.categoria)
    if (dim) dimCount[dim] = (dimCount[dim] || 0) + 1
  })

  const maior = Math.max(...Object.values(dimCount))
  const dimMais = maior === 0 ? '—' : Object.entries(dimCount).sort((a, b) => b[1] - a[1])[0][0]

  let fraseSemana = 'Pequenos registros também constroem caminho. 🌿'
  if (completos >= 4) fraseSemana = `Você completou ${completos} dias de vitórias nesta semana.`
  else if (parciais > completos && parciais > 0) fraseSemana = 'Você manteve presença mesmo em dias parciais.'
  else if (gratidoesTotal > 0) fraseSemana = 'Você registrou gratidão nesta semana.'
  else if (diariosTotal > 0) fraseSemana = 'Você tem nomeado o que sente. Isso também é cuidado.'
  else if (diasComRegistro === 0) fraseSemana = 'Seu caminho ainda está começando. O primeiro passo pode ser pequeno.'

  const ultimaGratidao = gratidoes[0] || null
  const ultimoConteudo = curtidas[0]
    ? conteudos.find(c => String(c.id) === String(curtidas[0].conteudo_id)) || null
    : null

  const checkinHoje = checkins.find(c => c.data === hoje) || null
  const gratidaoHoje = gratidoes.find(g => g.data === hoje) || null
  const diarioHoje = diarios.find(d => d.data === hoje) || null

  return {
    checkins, diarios, gratidoes, curtidas, conteudos, matches,
    completos, parciais, diasSemRegistro, diasComRegistro,
    gratidoesTotal, diariosTotal, curtidasTotal,
    ultimaGratidao, ultimoConteudo,
    dimMais, dimCount, fraseSemana,
    hoje: { data: hoje, checkin: checkinHoje, gratidao: gratidaoHoje, diario: diarioHoje },
  }
}

export async function getProfessionalHelpCounts(profissionais = []) {
  const result = {}
  profissionais.forEach(p => { result[p.id] = 0 })

  const curtidasRes = await safeQuery(supabase.from('curtidas').select('conteudo_id').limit(1000))
  const conteudoIds = [...new Set((curtidasRes.data || []).map(c => c.conteudo_id).filter(Boolean))]
  if (!conteudoIds.length) return result

  const conteudosRes = await safeQuery(supabase.from('conteudos').select('id,profissional_id,profissional_origem').in('id', conteudoIds))
  const conteudosPorId = new Map((conteudosRes.data || []).map(c => [String(c.id), c]))

  ;(curtidasRes.data || []).forEach(c => {
    const conteudo = conteudosPorId.get(String(c.conteudo_id))
    if (!conteudo) return
    profissionais.forEach(p => {
      const idsIguais = conteudo.profissional_id && String(conteudo.profissional_id) === String(p.id)
      const emailOrigem = conteudo.profissional_origem && (conteudo.profissional_origem === p.email_contato || conteudo.profissional_origem === p.email)
      if (idsIguais || emailOrigem) result[p.id] = (result[p.id] || 0) + 1
    })
  })

  return result
}
