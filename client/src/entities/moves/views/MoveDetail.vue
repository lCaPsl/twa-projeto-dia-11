<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLoad } from '../../../useLoad.js'
import { get } from '../api/api.js'
import { findLocalMove, isLocalId } from '../data/localStore.js'
import MoveTypeBadge from '../components/MoveTypeBadge.vue'

const route = useRoute()
const id = computed(() => route.params.id)

const { status, error, data: move, reload } = useLoad((signal) => {
  if (isLocalId(id.value)) {
    const local = findLocalMove(id.value)
    if (!local) throw new Error('Local move not found; locally created moves are lost on reload.')
    return local
  }
  return get(id.value, signal)
}, id)
</script>

<template>
  <p><RouterLink :to="{ name: 'moves-list' }">← Moves</RouterLink></p>
  <p v-if="status === 'loading'" class="status">Loading move…</p>
  <p v-else-if="status === 'error'" class="status">
    Error: {{ error }} <button type="button" @click="reload">Retry</button>
  </p>
  <article v-else>
    <h2>{{ move.name }} <small v-if="move.local">(local)</small></h2>
    <dl>
      <dt>Type</dt><dd><MoveTypeBadge :type="move.type" /></dd>
      <dt>Damage class</dt><dd>{{ move.damageClass || '—' }}</dd>
      <dt>Power</dt><dd>{{ move.power ?? '—' }}</dd>
      <dt>Accuracy</dt><dd>{{ move.accuracy == null ? '—' : `${move.accuracy}%` }}</dd>
      <dt>PP</dt><dd>{{ move.pp ?? '—' }}</dd>
      <dt>Priority</dt><dd>{{ move.priority ?? '—' }}</dd>
      <dt>Effect</dt><dd>{{ move.effect || '—' }}</dd>
    </dl>
  </article>
</template>

<style scoped>
dl { display: grid; grid-template-columns: max-content 1fr; gap: .25rem 1rem; }
dt { color: #666; }
dd { margin: 0; }
</style>
