<script setup>
// AbilityNew.vue — a página do formulário: guarda localmente (api.js) e navega para o detalhe.
// The form page: saves locally via api.js and navigates to the detail (push, not back).
import { useRouter } from 'vue-router'
import { create } from './api.js'
import AbilityForm from './AbilityForm.vue'

const router = useRouter()

function onSave(draft) {
  const id = create(draft)
  router.push({ name: 'ability-detail', params: { id } })
}
</script>

<template>
  <p><RouterLink :to="{ name: 'abilities-list' }">← Abilities</RouterLink></p>
  <h2>New ability</h2>
  <AbilityForm @save="onSave" />
</template>
