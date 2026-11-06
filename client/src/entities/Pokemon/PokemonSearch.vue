<script setup>
// PokemonSearch.vue — search by name or ID, then open PokemonDetail.
defineOptions({ name: 'PokemonSearch' })

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { parseKey } from './api.js'
import { pokeLog, pokeWarn } from './api/debug.js'

const router = useRouter()
const search = ref('')
const error = ref(null)

function submit() {
  error.value = null
  try {
    const key = parseKey(search.value)
    pokeLog('ui:search-submit', { key, to: `/pokemon/${key}` })
    router.push(`/pokemon/${encodeURIComponent(key)}`)
  } catch (err) {
    error.value = err.message
    pokeWarn('ui:search-invalid', err.message)
  }
}
</script>

<template>
  <p><RouterLink to="/pokemon">← Pokémon</RouterLink></p>
  <h2>Search</h2>
  <p class="status">Find a Pokémon by name (e.g. bulbasaur) or ID (e.g. 1).</p>
  <form @submit.prevent="submit">
    <label>
      Name or ID
      <input v-model="search" type="text" name="search" autocomplete="off" />
    </label>
    <button type="submit">Search</button>
  </form>
  <p v-if="error" class="status">{{ error }}</p>
</template>

<style scoped>
a { color: #5b1f2e; text-decoration: none; }
a:hover { text-decoration: underline; }
form { display: flex; flex-wrap: wrap; gap: .5rem 1rem; align-items: end; margin: 1rem 0; }
label { display: flex; flex-direction: column; gap: .25rem; color: #222; }
input {
  padding: .35rem .5rem;
  border: 1px solid #ddd;
  min-width: 12rem;
  background: none;
  color: #222;
  font: inherit;
}
button {
  border: 1px solid #ddd;
  background: none;
  color: #5b1f2e;
  padding: .35rem .75rem;
  cursor: pointer;
  font: inherit;
}
button:hover { text-decoration: underline; }
</style>
