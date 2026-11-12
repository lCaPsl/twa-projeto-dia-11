// Moves API client. All public PokéAPI URLs for this entity live here.
import { getJSON } from '../../../api/getJSON.js'
import { reactive } from 'vue'

const BASE = 'https://pokeapi.co/api/v2/move'
export const PAGE_SIZE = 15

const idFromUrl = (url) => url.split('/').filter(Boolean).pop()

export const localMoves = reactive([])

export async function list(page = 1, signal) {
  const offset = (page - 1) * PAGE_SIZE
  const data = await getJSON(`${BASE}/?limit=${PAGE_SIZE}&offset=${offset}`, { signal })
  return {
    count: data.count,
    results: data.results.map((move) => ({
      id: idFromUrl(move.url),
      name: move.name,
    })),
  }
}

export async function searchByName(query, signal) {
  const data = await getJSON(`${BASE}/?limit=1000`, { signal })
  const normalizedQuery = query.trim().toLowerCase()

  return data.results
    .map((move) => ({
      id: idFromUrl(move.url),
      name: move.name,
    }))
    .filter((move) => move.name.includes(normalizedQuery) || move.id === normalizedQuery)
}

export async function get(id, signal) {
  const local = localMoves.find((move) => move.id === String(id))
  if (local) return local
  if (String(id).startsWith('local-')) {
    throw new Error('Local move not found; locally created moves are lost on reload.')
  }

  const data = await getJSON(`${BASE}/${encodeURIComponent(id)}`, { signal })
  const effect = data.effect_entries?.find((entry) => entry.language.name === 'en')

  return {
    id: data.id,
    name: data.name,
    accuracy: data.accuracy,
    damageClass: data.damage_class?.name ?? '',
    effect: effect?.short_effect ?? '',
    power: data.power,
    pp: data.pp,
    priority: data.priority,
    type: data.type?.name ?? '',
  }
}

export function create(draft) {
  const move = { ...draft, id: `local-${Date.now()}`, local: true }
  localMoves.push(move)
  return move
}