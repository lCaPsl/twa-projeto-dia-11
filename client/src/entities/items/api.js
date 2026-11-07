// entities/items/api.js — como a entidade Items fala com a PokéAPI. Só aqui há URLs.
// How the Items entity talks to PokéAPI. URLs live only here.
// No M2 passa a ser a nossa API Express: BASE = '/api/items'. · In M2 it becomes our Express API.
import { getJSON } from '../../api/getJSON.js'

const BASE = 'https://pokeapi.co/api/v2/item'
export const PAGE_SIZE = 20

// A lista da PokéAPI traz só { name, url }; o id é o último segmento do url.
// The list only has { name, url }; the id is the last segment of the url.
const idFromUrl = (url) => url.split('/').filter(Boolean).pop()

// page começa em 1. Devolve { count, results: [{ id, name }] } — a resposta é transformada aqui.
export async function list(page = 1, signal) {
  const offset = (page - 1) * PAGE_SIZE
  const data = await getJSON(`${BASE}/?limit=${PAGE_SIZE}&offset=${offset}`, { signal })
  return {
    count: data.count,
    results: data.results.map((r) => ({ id: idFromUrl(r.url), name: r.name })),
  }
}

// Um item (a PokéAPI aceita id ou nome). Só os campos que o ecrã usa.
export async function get(id, signal) {
  const d = await getJSON(`${BASE}/${id}`, { signal })
  const en = d.effect_entries?.find((e) => e.language.name === 'en')
  return {
    id: d.id,
    name: d.name,
    cost: d.cost,
    category: d.category?.name ?? '',
    sprite: d.sprites?.default ?? null,
    effect: en?.short_effect ?? '',
  }
}
