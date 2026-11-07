// entities/abilities/api.js — como a entidade Abilities fala com a PokéAPI. Só aqui há URLs.
// How the Abilities entity talks to PokéAPI. URLs live only here.
// No M2 passa a ser a nossa API Express (mesmos nomes, corpos novos). · In M2 it becomes our Express API.
import { getJSON } from '../../api/getJSON.js'

const BASE = 'https://pokeapi.co/api/v2/ability'
export const PAGE_SIZE = 20

// A PokéAPI é só de leitura (não aceita POST): o que o formulário cria vive aqui, em memória,
// e perde-se no F5. · The API is read-only: what the form creates lives here, in memory.
const local = []

// A lista só traz { name, url }; o id é o último segmento do url.
// The list only has { name, url }; the id is the last segment of the url.
const idFromUrl = (url) => Number(url.split('/').filter(Boolean).pop())

// page começa em 1. Devolve { count, results: [{ id, name, local? }] } — a resposta é transformada aqui.
// Os locais aparecem à frente, só na página 1.
export async function list(page = 1, signal) {
  const offset = (page - 1) * PAGE_SIZE
  const data = await getJSON(`${BASE}/?limit=${PAGE_SIZE}&offset=${offset}`, { signal })
  const fromApi = data.results.map((r) => ({ id: idFromUrl(r.url), name: r.name }))
  const mine = page === 1 ? local.map((a) => ({ id: a.id, name: a.name, local: true })) : []
  return { count: data.count, results: [...mine, ...fromApi] }
}

// Uma habilidade, só com os campos que o ecrã usa. Os locais são procurados primeiro.
// One ability, only the fields the screen uses. Local ones are looked up first.
export async function get(id, signal) {
  const found = local.find((a) => a.id === Number(id))
  if (found) return found

  const d = await getJSON(`${BASE}/${id}`, { signal })
  const en = d.effect_entries?.find((e) => e.language.name === 'en')
  return {
    id: d.id,
    name: d.name,
    generation: d.generation?.name ?? '',
    isMainSeries: d.is_main_series,
    effect: en?.short_effect ?? '',
    pokemonCount: d.pokemon?.length ?? 0,
    pokemon: (d.pokemon ?? []).slice(0, 10).map((p) => p.pokemon.name),
  }
}

// M1: guarda em memória e devolve o id novo. · M1: saves in memory and returns the new id.
// Date.now(): único, sem servidor. · unique, no server needed.
export function create(draft) {
  const id = Date.now()
  local.unshift({
    id,
    local: true,
    name: draft.name,
    generation: draft.generation,
    isMainSeries: draft.isMainSeries,
    effect: draft.effect,
    pokemonCount: 0,
    pokemon: [],
  })
  return id
}
