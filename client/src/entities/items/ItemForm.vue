<script setup>
// ItemForm.vue — rascunho reactive, v-model com modificadores, validação HTML + computed, um emit('save').
// Draft in a reactive object, v-model modifiers, HTML validation + computed, a single emit.
import { reactive, computed } from 'vue'

const emit = defineEmits(['save'])

const draft = reactive({ name: '', cost: 0, category: '', effect: '' })

const errors = computed(() => {
  const e = {}
  if (draft.name.length < 2) e.name = 'Name needs at least 2 characters.'
  if (!Number.isFinite(draft.cost) || draft.cost < 0) e.cost = 'Cost must be a number ≥ 0.'
  if (!draft.category) e.category = 'Category is required.'
  return e
})
const isValid = computed(() => Object.keys(errors.value).length === 0)

function submit() {
  if (isValid.value) emit('save', { ...draft })
}
</script>

<template>
  <form @submit.prevent="submit">
    <label>Name
      <input v-model.trim="draft.name" required minlength="2" />
      <small v-if="errors.name">{{ errors.name }}</small>
    </label>

    <label>Cost
      <input v-model.number="draft.cost" type="number" min="0" required />
      <small v-if="errors.cost">{{ errors.cost }}</small>
    </label>

    <label>Category
      <input v-model.trim="draft.category" required />
      <small v-if="errors.category">{{ errors.category }}</small>
    </label>

    <label>Effect
      <textarea v-model.trim="draft.effect" rows="3" />
    </label>

    <button type="submit" :disabled="!isValid">Save</button>
  </form>
</template>

<style scoped>
form { display: grid; gap: .75rem; max-width: 28rem; }
label { display: grid; gap: .25rem; }
small { color: #b00020; }
</style>
