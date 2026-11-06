// Display helpers (UI formatting only — no network).
export function formatId(id) {
  return '#' + String(id).padStart(3, '0')
}

export function formatName(name) {
  if (!name) return ''
  return name
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}

export function heightMeters(height) {
  if (typeof height !== 'number') return '—'
  return (height / 10).toFixed(1) + ' m'
}

export function weightKg(weight) {
  if (typeof weight !== 'number') return '—'
  return (weight / 10).toFixed(1) + ' kg'
}
