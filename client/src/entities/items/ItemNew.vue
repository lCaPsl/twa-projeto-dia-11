<script setup>
// ItemNew.vue — a página do formulário: guarda no store local e navega para o item criado.
// The form page: saves to the local store and navigates to the created item.
import { useRouter } from 'vue-router'
import ItemForm from './ItemForm.vue'
import { addLocalItem } from './localStore.js'

const router = useRouter()

function onSave(draft) {
  const item = addLocalItem(draft)
  router.push({ name: 'item-detail', params: { id: item.id } })
}
</script>

<template>
  <p><RouterLink :to="{ name: 'items-list' }">← Items</RouterLink></p>
  <h2>New item</h2>
  <ItemForm @save="onSave" />
</template>
