<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoad } from '../../../useLoad.js'
import { list, localMoves, PAGE_SIZE, searchByName } from '../api/api.js'

const route = useRoute()
const router = useRouter()
const searchQuery = computed(() => typeof route.query.q === 'string' ? route.query.q.trim().toLowerCase() : '')
const page = computed(() => {
  const value = Number(route.query.page)
  return Number.isInteger(value) && value >= 1 ? value : 1
})

const searchText = ref(searchQuery.value)
watch(searchQuery, (query) => {
  searchText.value = query
})

function updateSearch(query) {
  const normalizedQuery = query.trim().toLowerCase()
  if (normalizedQuery === searchQuery.value) return
  router.replace({ name: 'moves-list', query: normalizedQuery ? { q: normalizedQuery } : {} })
}

watch(searchText, (value, _oldValue, onCleanup) => {
  const timer = setTimeout(() => updateSearch(value), 300)
  onCleanup(() => clearTimeout(timer))
})

function searchMoves() {
  updateSearch(searchText.value)
}

const source = computed(() => `${page.value}:${searchQuery.value}`)
const { status, error, data, reload } = useLoad(
  (signal) => searchQuery.value
    ? searchByName(searchQuery.value, signal)
    : list(page.value, signal),
  source,
)
const totalPages = computed(() => Math.max(1, Math.ceil((data.value?.count ?? 0) / PAGE_SIZE)))
const displayedMoves = computed(() => {
  if (!searchQuery.value) return page.value === 1 ? localMoves : []
  return localMoves.filter((move) => move.name.toLowerCase().includes(searchQuery.value))
})

function goToPage(nextPage) {
  router.push({ name: 'moves-list', query: nextPage > 1 ? { page: String(nextPage) } : {} })
}
</script>

<template>
  <h2>Moves</h2>
  <form @submit.prevent="searchMoves">
    <label for="move-search">Procurar move por nome ou ID</label>
    <div class="search-bar">
      <input id="move-search" v-model="searchText" placeholder="ex.: tackle ou 33" />
      <button type="submit">Pesquisar</button>
    </div>
  </form>
  <p><RouterLink :to="{ name: 'move-new' }">+ New move</RouterLink></p>

  <p v-if="status === 'loading'" class="status">Loading moves…</p>
  <p v-else-if="status === 'error'" class="status">
    Error: {{ error }} <button type="button" @click="reload">Retry</button>
  </p>
  <template v-else>
    <p v-if="searchQuery" class="status">
      {{ displayedMoves.length + data.length }} move(s) found for “{{ searchQuery }}”.
    </p>
    <p v-else-if="page === 1 && localMoves.length" class="status">
      Locally created moves are temporary and are lost when you reload the page.
    </p>
    <ul>
      <li v-for="move in displayedMoves" :key="move.id">
        <RouterLink :to="{ name: 'move-detail', params: { id: move.id } }">{{ move.name }}</RouterLink>
        <em> · local</em>
      </li>
      <li v-for="move in (searchQuery ? data : data.results)" :key="move.id">
        <RouterLink :to="{ name: 'move-detail', params: { id: move.id } }">{{ move.name }}</RouterLink>
      </li>
    </ul>
    <p v-if="searchQuery && displayedMoves.length + data.length === 0" class="status">
      No moves found for “{{ searchQuery }}”.
    </p>
    <p v-if="!searchQuery" class="pager">
      <button type="button" :disabled="page <= 1" @click="goToPage(page - 1)">← Previous</button>
      Page {{ page }} / {{ totalPages }}
      <button type="button" :disabled="page >= totalPages" @click="goToPage(page + 1)">Next →</button>
    </p>
  </template>
</template>

<style scoped>
ul { list-style: none; padding: 0; }
li { padding: .4rem 0; border-bottom: 1px solid #ddd; }
.pager { display: flex; gap: 1rem; align-items: center; }
.search-bar { display: flex; gap: 0.5rem; align-items: center; }
</style>
