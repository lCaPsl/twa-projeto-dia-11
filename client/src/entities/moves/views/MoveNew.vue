<script setup>
import { useRouter } from 'vue-router'
import MoveForm from '../components/MoveForm.vue'
import { create } from '../api/api.js'

const router = useRouter()

function onSave(draft) {
  const move = create(draft)
  router.push({ name: 'move-detail', params: { id: move.id } })
}
</script>

<template>
  <p><RouterLink :to="{ name: 'moves-list' }">← Moves</RouterLink></p>
  <h2>New move</h2>
  <p class="status">The public PokéAPI is read-only. This move is saved locally for this session only.</p>
  <MoveForm @save="onSave" />
</template>
