const BASE = 'https://pokeapi.co/api/v2'
export const list = () => getJSON(`${BASE}/pokemon?limit=50`).then((r) => r.results)
export const get = (name) => getJSON(`${BASE}/pokemon/${name}`)
