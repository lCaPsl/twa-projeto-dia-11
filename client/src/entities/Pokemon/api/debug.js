// Lightweight console helpers for Pokémon core flow (dev only).
const PREFIX = '[Pokemon]'

function enabled() {
  try {
    return Boolean(import.meta.env?.DEV)
  } catch {
    return false
  }
}

export function pokeLog(step, detail) {
  if (!enabled()) return
  if (detail === undefined) console.log(PREFIX, step)
  else console.log(PREFIX, step, detail)
}

export function pokeWarn(step, detail) {
  if (!enabled()) return
  if (detail === undefined) console.warn(PREFIX, step)
  else console.warn(PREFIX, step, detail)
}
