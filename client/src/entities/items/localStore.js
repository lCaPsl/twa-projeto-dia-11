// localStore.js — a API é só de leitura, por isso os itens criados no formulário ficam aqui (em memória).
// The API is read-only, so items created in the form live here (in memory). In M2: POST to our API.
import { reactive } from 'vue'

export const localItems = reactive([])

export const isLocalId = (id) => String(id).startsWith('local-')
export const findLocalItem = (id) => localItems.find((i) => i.id === String(id))

export function addLocalItem(draft) {
  const item = { ...draft, id: `local-${Date.now()}`, local: true }
  localItems.push(item)
  return item
}
