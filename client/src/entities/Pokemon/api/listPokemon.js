// Action: paginated Pokémon list.
import { getJSON } from '../../../api/getJSON.js'
import { DEFAULT_LIMIT, MAX_LIMIT } from './config.js'
import { pokeLog, pokeWarn } from './debug.js'
import { parseList, parsePage } from './parse.js'
import { pokemonListUrl } from './safe.js'

export async function listPokemon(options = {}) {
  const { limit, offset } = parsePage({
    limit: options.limit ?? DEFAULT_LIMIT,
    offset: options.offset ?? 0,
    maxLimit: MAX_LIMIT,
  })
  const { signal } = options
  const url = pokemonListUrl(limit, offset)
  pokeLog('list:start', { limit, offset })
  try {
    const page = parseList(await getJSON(url, { signal }))
    pokeLog('list:ok', { count: page.count, results: page.results.length, offset })
    return page
  } catch (err) {
    if (err?.name !== 'AbortError') pokeWarn('list:fail', err?.message || err)
    throw err
  }
}
