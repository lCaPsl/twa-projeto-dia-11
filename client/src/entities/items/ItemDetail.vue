<script setup>
// ItemDetail.vue — detalhe: o id vem do URL (/items/:id), useLoad(() => get(id)).
// Detail: the id comes from the URL.
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLoad } from '../../useLoad.js'
import { get } from './api.js'
import { findLocalItem, isLocalId } from './localStore.js'

const route = useRoute()
const id = computed(() => route.params.id)

const { status, error, data: item, reload } = useLoad((signal) => {
  // itens criados no formulário vivem no store local, não na API
  if (isLocalId(id.value)) {
    const local = findLocalItem(id.value)
    if (!local) throw new Error('Local item not found (local items are lost on reload)')
    return local
  }
  return get(id.value, signal)
}, id)
</script>

<template>
  <p><RouterLink :to="{ name: 'items-list' }">← Items</RouterLink></p>
  <p v-if="status === 'loading'" class="status">Loading…</p>
  <p v-else-if="status === 'error'" class="status">
    Error: {{ error }} <button type="button" @click="reload">Retry</button>
  </p>
  <template v-else>
    <h2>{{ item.name }} <small v-if="item.local">(local)</small></h2>
    <img v-if="item.sprite" :src="item.sprite" :alt="item.name" width="96" height="96" />
    <dl>
      <dt>Category</dt><dd>{{ item.category }}</dd>
      <dt>Cost</dt><dd>{{ item.cost }}</dd>
      <dt>Effect</dt><dd>{{ item.effect || '—' }}</dd>
    </dl>
  </template>
</template>

<style scoped>
dl { display: grid; grid-template-columns: max-content 1fr; gap: .25rem 1rem; }
dt { color: #666; }
</style>
