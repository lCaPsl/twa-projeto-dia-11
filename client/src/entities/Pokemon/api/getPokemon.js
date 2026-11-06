// Action: one Pokémon (+ species / evolution / weaknesses for detail).
import { getJSON } from '../../../api/getJSON.js'
import { pokeLog, pokeWarn } from './debug.js'
import { parseKey } from './parseKey.js'
import {
  englishFlavor,
  parseGender,
  parsePokemon,
  walkEvolution,
  withVarietyForms,
} from './parse.js'
import { pokeUrl, pokemonDetailUrl, speciesDetailUrl, typeUrl } from './safe.js'

async function loadWeaknesses(types, signal) {
  pokeLog('weaknesses:start', { types })
  const weak = new Set()
  await Promise.all(
    types.map(async (typeName) => {
      const data = await getJSON(typeUrl(typeName), { signal })
      const list = data?.damage_relations?.double_damage_from
      if (!Array.isArray(list)) return
      for (const t of list) {
        if (typeof t?.name === 'string') weak.add(t.name)
      }
    }),
  )
  const weaknesses = [...weak]
  pokeLog('weaknesses:ok', weaknesses)
  return weaknesses
}

/**
 * Attach Mega/alternate forms for each stage (species.varieties).
 * Reuses species already loaded for the current Pokémon when possible.
 */
async function enrichEvolutionsWithForms(evolutions, currentSpecies, currentSpeciesId, signal) {
  let result = evolutions
  const seen = new Set()

  for (const evo of evolutions) {
    if (!evo?.id || evo.form || seen.has(evo.id)) continue
    seen.add(evo.id)

    let species = currentSpeciesId === evo.id ? currentSpecies : null
    if (!species) {
      pokeLog('evolution:species', { id: evo.id, name: evo.name })
      try {
        species = await getJSON(speciesDetailUrl(evo.id), { signal })
      } catch (err) {
        pokeWarn('evolution:species-fail', { id: evo.id, message: err?.message })
        continue
      }
    }
    const before = result.length
    result = withVarietyForms(result, species.varieties)
    if (result.length !== before) {
      pokeLog('evolution:forms', {
        base: evo.name,
        added: result.slice(before).map((e) => e.name),
      })
    }
  }
  return result
}

export async function getPokemon(key, { signal } = {}) {
  const pathKey = parseKey(key)
  pokeLog('get:start', { key: pathKey })

  try {
    const raw = await getJSON(pokemonDetailUrl(pathKey), { signal })
    const base = parsePokemon(raw)
    pokeLog('get:pokemon', { id: base.id, name: base.name, types: base.types })

    let description = ''
    let captureRate = null
    let catchPercent = null
    let gender = { genderless: true, male: null, female: null }
    let evolutions = [{ name: base.name, sprite: base.sprite, minLevel: null, id: base.id, form: null }]
    let currentSpecies = null
    let currentSpeciesId = null

    if (base.speciesUrl) {
      pokeLog('get:species', base.speciesUrl)
      currentSpecies = await getJSON(base.speciesUrl, { signal })
      const idMatch = String(base.speciesUrl).match(/\/pokemon-species\/(\d+)\/?$/)
      currentSpeciesId = idMatch ? Number(idMatch[1]) : null

      description = englishFlavor(currentSpecies.flavor_text_entries)
      if (typeof currentSpecies.capture_rate === 'number') {
        captureRate = currentSpecies.capture_rate
        catchPercent = Math.round((currentSpecies.capture_rate / 255) * 1000) / 10
      }
      gender = parseGender(currentSpecies.gender_rate)

      const chainUrl = pokeUrl(currentSpecies.evolution_chain?.url)
      if (chainUrl) {
        pokeLog('get:evolution-chain', chainUrl)
        const chain = await getJSON(chainUrl, { signal })
        const walked = walkEvolution(chain.chain)
        if (walked.length) evolutions = walked
        pokeLog(
          'get:evolution-line',
          evolutions.map((e) => e.name),
        )
      }

      evolutions = await enrichEvolutionsWithForms(
        evolutions,
        currentSpecies,
        currentSpeciesId,
        signal,
      )
      pokeLog(
        'get:evolutions',
        evolutions.map((e) => (e.form ? `${e.name}(${e.form})` : e.name)),
      )
    }

    const weaknesses = base.types.length ? await loadWeaknesses(base.types, signal) : []

    pokeLog('get:ok', { name: base.name, id: base.id, evolutions: evolutions.length })
    return {
      ...base,
      description,
      captureRate,
      catchPercent,
      gender,
      evolutions,
      weaknesses,
    }
  } catch (err) {
    if (err?.name !== 'AbortError') pokeWarn('get:fail', { key: pathKey, message: err?.message })
    throw err
  }
}
