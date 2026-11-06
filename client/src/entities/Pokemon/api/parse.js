// Parse / normalise PokeAPI JSON into UI-safe shapes.
import { STAT_ORDER } from './config.js'
import { httpsSprite, pokeUrl, spriteForSpeciesUrl, spriteForPokemonUrl, pokemonIdFromUrl } from './safe.js'

export function parsePage({ limit, offset, maxLimit }) {
  const lim = Number(limit)
  const off = Number(offset)
  if (!Number.isInteger(lim) || lim < 1 || lim > maxLimit) {
    throw new Error(`limit must be an integer from 1 to ${maxLimit}`)
  }
  if (!Number.isInteger(off) || off < 0) {
    throw new Error('offset must be a non-negative integer')
  }
  return { limit: lim, offset: off }
}

export function parseList(data) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.results)) {
    throw new Error('Unexpected list response from API')
  }
  return {
    count: typeof data.count === 'number' ? data.count : 0,
    next: data.next ?? null,
    previous: data.previous ?? null,
    results: data.results
      .filter((r) => r && typeof r.name === 'string' && r.name)
      .map((r) => ({ name: r.name, url: typeof r.url === 'string' ? r.url : '' })),
  }
}

function parseStats(stats) {
  const byName = new Map()
  if (Array.isArray(stats)) {
    for (const row of stats) {
      const name = row?.stat?.name
      const value = row?.base_stat
      if (typeof name === 'string' && typeof value === 'number') byName.set(name, value)
    }
  }
  const rows = STAT_ORDER.map((meta) => ({
    key: meta.key,
    label: meta.label,
    color: meta.color,
    value: byName.has(meta.key) ? byName.get(meta.key) : 0,
  }))
  const total = rows.reduce((sum, r) => sum + r.value, 0)
  return { rows, total }
}

export function parsePokemon(data) {
  if (!data || typeof data !== 'object') throw new Error('Unexpected Pokémon response from API')
  if (typeof data.id !== 'number' || typeof data.name !== 'string') {
    throw new Error('Incomplete Pokémon response from API')
  }
  const types = Array.isArray(data.types)
    ? data.types
        .map((t) => t?.type?.name)
        .filter((n) => typeof n === 'string' && n)
    : []
  const { rows: stats, total: statsTotal } = parseStats(data.stats)

  return {
    id: data.id,
    name: data.name,
    height: typeof data.height === 'number' ? data.height : null,
    weight: typeof data.weight === 'number' ? data.weight : null,
    types,
    sprite: httpsSprite(data.sprites?.front_default),
    spriteShiny: httpsSprite(data.sprites?.front_shiny),
    stats,
    statsTotal,
    speciesUrl: pokeUrl(data.species?.url),
  }
}

export function englishFlavor(entries) {
  if (!Array.isArray(entries)) return ''
  const en = entries.filter((e) => e?.language?.name === 'en' && typeof e.flavor_text === 'string')
  if (!en.length) return ''
  return en[en.length - 1].flavor_text.replace(/\f/g, ' ').replace(/\s+/g, ' ').trim()
}

export function parseGender(rate) {
  if (typeof rate !== 'number') return { genderless: true, male: null, female: null }
  if (rate < 0) return { genderless: true, male: null, female: null }
  const female = Math.round((rate / 8) * 1000) / 10
  const male = Math.round((100 - female) * 10) / 10
  return { genderless: false, male, female }
}

export function walkEvolution(node, into = []) {
  if (!node?.species?.name) return into
  const idMatch = String(node.species.url || '').match(/\/pokemon-species\/(\d+)\/?$/)
  const details = Array.isArray(node.evolution_details) ? node.evolution_details[0] : null
  const minLevel = typeof details?.min_level === 'number' ? details.min_level : null
  into.push({
    name: node.species.name,
    sprite: spriteForSpeciesUrl(node.species.url),
    minLevel,
    id: idMatch ? Number(idMatch[1]) : null,
    form: null,
  })
  const next = Array.isArray(node.evolves_to) ? node.evolves_to[0] : null
  if (next) walkEvolution(next, into)
  return into
}

/**
 * Mega / alternate forms live on species.varieties (not the evolution chain).
 * Example: baxcalibur → baxcalibur-mega
 */
export function parseVarieties(varieties) {
  if (!Array.isArray(varieties)) return []
  const forms = []
  for (const row of varieties) {
    if (!row || row.is_default) continue
    const name = row.pokemon?.name
    if (typeof name !== 'string' || !name) continue
    const id = pokemonIdFromUrl(row.pokemon.url)
    const form = name.includes('-mega') ? 'mega' : 'form'
    forms.push({
      name,
      sprite: spriteForPokemonUrl(row.pokemon.url),
      minLevel: null,
      id,
      form,
    })
  }
  return forms
}

/** Insert variety forms after their base species in the evolution list. */
export function withVarietyForms(evolutions, varieties) {
  const forms = parseVarieties(varieties)
  if (!forms.length) return evolutions
  const out = []
  for (const evo of evolutions) {
    out.push(evo)
    for (const form of forms) {
      if (form.name === evo.name || form.name.startsWith(`${evo.name}-`)) {
        out.push(form)
      }
    }
  }
  return out
}
