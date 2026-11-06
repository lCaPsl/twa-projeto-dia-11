// Trusted URL helpers — never follow user-supplied hosts.
import { BASE } from './config.js'

/** Keep only https sprite URLs from known hosts. */
export function httpsSprite(url) {
  if (typeof url !== 'string' || !url) return null
  try {
    const u = new URL(url)
    if (u.protocol !== 'https:') return null
    const host = u.hostname
    if (host === 'raw.githubusercontent.com' || host.endsWith('.githubusercontent.com') || host === 'pokeapi.co') {
      return u.href
    }
    return null
  } catch {
    return null
  }
}

/** Only follow related URLs on the trusted PokeAPI host. */
export function pokeUrl(url) {
  if (typeof url !== 'string' || !url.startsWith(BASE + '/')) return null
  return url
}

export function spriteForSpeciesUrl(speciesUrl) {
  const m = String(speciesUrl).match(/\/pokemon-species\/(\d+)\/?$/)
  if (!m) return null
  return httpsSprite(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${m[1]}.png`)
}

export function spriteForPokemonUrl(pokemonUrl) {
  const m = String(pokemonUrl || '').match(/\/pokemon\/(\d+)\/?$/)
  if (!m) return null
  return httpsSprite(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${m[1]}.png`)
}

export function pokemonIdFromUrl(pokemonUrl) {
  const m = String(pokemonUrl || '').match(/\/pokemon\/(\d+)\/?$/)
  return m ? Number(m[1]) : null
}

export function speciesDetailUrl(id) {
  return `${BASE}/pokemon-species/${encodeURIComponent(String(id))}/`
}

export function pokemonListUrl(limit, offset) {
  return `${BASE}/pokemon?limit=${limit}&offset=${offset}`
}

export function pokemonDetailUrl(key) {
  return `${BASE}/pokemon/${encodeURIComponent(key)}`
}

export function typeUrl(typeName) {
  return `${BASE}/type/${encodeURIComponent(typeName)}`
}
