// useLoad.js — os três estados (loading | error | ready) num só sítio, em vez de os copiar em cada ecrã.
// The three states in one place instead of copying them into every screen.
//
//   const { status, error, data, reload } = useLoad((signal) => get(id, signal), id)
//
// - fn recebe um AbortSignal e devolve (uma promise com) os dados.
// - source (opcional): ref/computed; quando muda, volta a carregar (ex.: a página no URL).
import { ref, watch, onBeforeUnmount } from 'vue'

export function useLoad(fn, source) {
  const status = ref('loading') // 'loading' | 'error' | 'ready'
  const error = ref(null)
  const data = ref(null)
  let controller = null

  async function load() {
    controller?.abort() // cancela o pedido anterior · cancel the previous request
    controller = new AbortController()
    const { signal } = controller
    status.value = 'loading'
    error.value = null
    try {
      const result = await fn(signal)
      if (signal.aborted) return // resposta antiga, ignora · stale response, ignore
      data.value = result
      status.value = 'ready'
    } catch (err) {
      if (signal.aborted) return
      error.value = err.message
      status.value = 'error'
    }
  }

  if (source) watch(source, load)
  onBeforeUnmount(() => controller?.abort())
  load()

  return { status, error, data, reload: load }
}
