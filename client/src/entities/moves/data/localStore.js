// The public API is read-only, so moves created by the form stay in memory.
import { reactive } from 'vue'

export const localMoves = reactive([])

export const isLocalId = (id) => String(id).startsWith('local-')
export const findLocalMove = (id) => localMoves.find((move) => move.id === String(id))

export function addLocalMove(draft) {
  const move = { ...draft, id: `local-${Date.now()}`, local: true }
  localMoves.push(move)
  return move
}
