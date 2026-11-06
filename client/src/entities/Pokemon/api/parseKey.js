// Action: validate / clean a Pokémon name or numeric ID.
const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const ID_RE = /^[1-9]\d*$/

/**
 * @throws {Error} short message for the UI
 */
export function parseKey(raw) {
  const value = String(raw ?? '').trim().toLowerCase()
  if (!value) throw new Error('Enter a Pokémon name or ID')
  if (/^\d+$/.test(value)) {
    if (!ID_RE.test(value)) throw new Error('Use a positive numeric ID')
    return value
  }
  if (NAME_RE.test(value)) return value
  throw new Error('Use a valid name (letters, numbers, hyphens) or a positive ID')
}
