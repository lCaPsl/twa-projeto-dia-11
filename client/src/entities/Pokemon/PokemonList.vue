<script setup>
// PokemonList.vue — paginated list; page lives in the route (?page=).
defineOptions({ name: 'PokemonList' })

import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { list } from './api.js'
import { pokeLog, pokeWarn } from './api/debug.js'

const PAGE_SIZE = 20
const route = useRoute()
const router = useRouter()

const status = ref('loading') // 'loading' | 'error' | 'ready'
const error = ref(null)
const pokemons = ref([])
const total = ref(0)

let abort = null

/** 1-based page from ?page= (default 1). */
const page = computed(() => {
  const n = Number(route.query.page)
  if (!Number.isInteger(n) || n < 1) return 1
  return n
})

const offset = computed(() => (page.value - 1) * PAGE_SIZE)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE) || 1))

function goToPage(nextPage) {
  const p = Math.max(1, nextPage)
  if (p <= 1) {
    router.push({ name: 'pokemon-list' })
    return
  }
  router.push({ name: 'pokemon-list', query: { page: String(p) } })
}

async function load() {
  abort?.abort()
  abort = new AbortController()
  const signal = abort.signal
  status.value = 'loading'
  error.value = null
  pokeLog('ui:list-load', { path: route.fullPath, page: page.value, offset: offset.value })
  try {
    const data = await list({ limit: PAGE_SIZE, offset: offset.value, signal })
    if (signal.aborted) {
      pokeLog('ui:list-aborted')
      return
    }
    pokemons.value = data.results
    total.value = data.count

    // Clamp if ?page= is past the last page
    const last = Math.max(1, Math.ceil(data.count / PAGE_SIZE) || 1)
    if (page.value > last) {
      pokeLog('ui:list-clamp-page', { from: page.value, to: last })
      goToPage(last)
      return
    }

    status.value = 'ready'
    pokeLog('ui:list-ready', { page: page.value, shown: data.results.length, total: data.count })
  } catch (err) {
    if (err?.name === 'AbortError' || signal.aborted) {
      pokeLog('ui:list-aborted')
      return
    }
    status.value = 'error'
    error.value = err.message === 'HTTP 404' ? 'No Pokémon found' : (err.message || 'Request failed')
    pokeWarn('ui:list-error', error.value)
  }
}

watch(
  () => route.query.page,
  () => {
    pokeLog('ui:list-route', { page: route.query.page ?? 1 })
    load()
  },
  { immediate: true },
)

onBeforeUnmount(() => abort?.abort())
</script>

<template>
  <h2>Pokémon</h2>
  <p>
    <RouterLink to="/pokemon/search">Search by name or ID</RouterLink>
  </p>
  <p v-if="status === 'loading'" class="status">Loading…</p>
  <p v-else-if="status === 'error'" class="status">
    Error: {{ error }} <button type="button" @click="load">Retry</button>
  </p>
  <template v-else>
    <p v-if="pokemons.length === 0" class="status">No Pokémon on this page.</p>
    <ul v-else>
      <li v-for="pokemon in pokemons" :key="pokemon.name">
        <RouterLink :to="`/pokemon/${pokemon.name}`">{{ pokemon.name }}</RouterLink>
      </li>
    </ul>
    <p class="pager">
      <RouterLink
        v-if="page > 1"
        class="pager-link"
        :to="page === 2 ? { name: 'pokemon-list' } : { name: 'pokemon-list', query: { page: page - 1 } }"
      >Previous</RouterLink>
      <span v-else class="pager-disabled">Previous</span>

      <span class="status">
        {{ offset + 1 }}–{{ Math.min(offset + PAGE_SIZE, total) }} of {{ total }}
        · page {{ page }}/{{ totalPages }}
      </span>

      <RouterLink
        v-if="page < totalPages"
        class="pager-link"
        :to="{ name: 'pokemon-list', query: { page: page + 1 } }"
      >Next</RouterLink>
      <span v-else class="pager-disabled">Next</span>
    </p>
  </template>
</template>

<style scoped>
a { color: #5b1f2e; text-decoration: none; }
a:hover { text-decoration: underline; }
ul { list-style: none; padding: 0; }
li { padding: .4rem 0; border-bottom: 1px solid #ddd; }
.pager { display: flex; gap: 1rem; align-items: center; margin-top: 1rem; flex-wrap: wrap; }
.pager-link { color: #5b1f2e; }
.pager-disabled { color: #666; }
</style>
