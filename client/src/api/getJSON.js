// getJSON — o fetch das Fichas 01–04: res.ok + JSON, lança em caso de erro.
// The fetch from Fichas 01–04. Every entity uses this function.
// Optional: AbortSignal + timeout (default 10s). Backward-compatible with getJSON(url).

const DEFAULT_TIMEOUT_MS = 10_000
const HTTP_PREFIX = '[HTTP]'

function httpDebug() {
  try {
    return Boolean(import.meta.env?.DEV)
  } catch {
    return false
  }
}

function shortUrl(url) {
  try {
    const u = new URL(url, typeof location !== 'undefined' ? location.origin : 'http://local')
    return u.pathname + u.search
  } catch {
    return String(url)
  }
}

export async function getJSON(url, { signal, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(new Error('Request timeout')), timeoutMs)

  const onExternalAbort = () => controller.abort(signal?.reason)
  if (signal) {
    if (signal.aborted) controller.abort(signal.reason)
    else signal.addEventListener('abort', onExternalAbort, { once: true })
  }

  if (httpDebug()) console.log(HTTP_PREFIX, '→', shortUrl(url))

  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    let data
    try {
      data = await res.json()
    } catch {
      throw new Error('Invalid JSON response')
    }
    if (httpDebug()) console.log(HTTP_PREFIX, '←', res.status, shortUrl(url))
    return data
  } catch (err) {
    if (err?.name === 'AbortError' || controller.signal.aborted) {
      const reason = controller.signal.reason
      const msg = reason instanceof Error ? reason.message : 'Request aborted'
      const abortErr = new Error(msg)
      abortErr.name = 'AbortError'
      if (httpDebug()) console.log(HTTP_PREFIX, '✖ abort', shortUrl(url), msg)
      throw abortErr
    }
    if (httpDebug()) console.warn(HTTP_PREFIX, '✖', shortUrl(url), err?.message || err)
    if (err instanceof TypeError) throw new Error('Network error — API unavailable')
    throw err
  } finally {
    clearTimeout(timer)
    if (signal) signal.removeEventListener('abort', onExternalAbort)
  }
}
