<script setup>
// AbilityDetail.vue — detalhe: o id vem do URL (/abilities/:id), useLoad(() => get(id)).
// Detail: the id comes from the URL, so reload and shared links work.
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLoad } from '../../useLoad.js'
import { get } from './api.js'

const route = useRoute()
const id = computed(() => route.params.id)

// o segundo argumento faz recarregar quando o id muda (/abilities/1 → /abilities/2)
const { status, error, data: ability, reload } = useLoad((signal) => get(id.value, signal), id)
</script>

<template>
  <p><RouterLink :to="{ name: 'abilities-list' }">← Abilities</RouterLink></p>

  <p v-if="status === 'loading'" class="status">Loading…</p>
  <p v-else-if="status === 'error'" class="status">
    Error: {{ error }} <button type="button" @click="reload">Retry</button>
  </p>
  <template v-else>
    <h2>{{ ability.name }} <small v-if="ability.local">(local)</small></h2>
    <dl>
      <dt>Generation</dt><dd>{{ ability.generation || '—' }}</dd>
      <dt>Main series</dt><dd>{{ ability.isMainSeries ? 'Yes' : 'No' }}</dd>
      <dt>Effect</dt><dd>{{ ability.effect || '—' }}</dd>
      <dt>Pokémon</dt>
      <dd>
        <template v-if="ability.pokemon.length">
          {{ ability.pokemon.join(', ') }}<span v-if="ability.pokemonCount > ability.pokemon.length">
            … ({{ ability.pokemonCount }} total)</span>
        </template>
        <template v-else>—</template>
      </dd>
    </dl>
  </template>
</template>

<style scoped>
dl { display: grid; grid-template-columns: max-content 1fr; gap: .25rem 1rem; }
dt { color: #666; }
</style>
