<script setup>
// AbilitiesList.vue — lista de habilidades da PokéAPI: três estados + Retry, liga ao detalhe, página no URL (?page=).
// Abilities list: three states + Retry, links to the detail, the page lives in the URL.
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoad } from '../../useLoad.js'
import { list, PAGE_SIZE } from './api.js'

const route = useRoute()
const router = useRouter()

const page = computed(() => {
  const n = Number(route.query.page)
  return Number.isInteger(n) && n >= 1 ? n : 1
})

const { status, error, data, reload } = useLoad((signal) => list(page.value, signal), page)

const totalPages = computed(() => Math.max(1, Math.ceil((data.value?.count ?? 0) / PAGE_SIZE)))

function goToPage(p) {
  router.push({ name: 'abilities-list', query: p > 1 ? { page: String(p) } : {} })
}
</script>

<template>
  <h2>Abilities</h2>
  <p><RouterLink :to="{ name: 'ability-new' }">+ New ability</RouterLink></p>

  <p v-if="status === 'loading'" class="status">Loading…</p>
  <p v-else-if="status === 'error'" class="status">
    Error: {{ error }} <button type="button" @click="reload">Retry</button>
  </p>
  <template v-else>
    <ul>
      <li v-for="a in data.results" :key="a.id">
        <RouterLink :to="{ name: 'ability-detail', params: { id: a.id } }">{{ a.name }}</RouterLink>
        <em v-if="a.local"> (local)</em>
      </li>
    </ul>
    <p class="pager">
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
</style>
