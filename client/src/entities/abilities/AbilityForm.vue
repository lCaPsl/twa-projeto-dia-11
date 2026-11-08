<script setup>
// AbilityForm.vue — rascunho reactive, v-model com modificadores, validação HTML + computed, um emit('save').
// O formulário não sabe para onde vão os dados — a página (AbilityNew) é que sabe.
// Draft in a reactive object, v-model modifiers, HTML + computed validation, one emit.
import { computed, reactive } from 'vue'

const emit = defineEmits(['save'])

const generations = [
  'generation-i', 'generation-ii', 'generation-iii', 'generation-iv', 'generation-v',
  'generation-vi', 'generation-vii', 'generation-viii', 'generation-ix',
]

const form = reactive({ name: '', generation: '', isMainSeries: true, effect: '' })

const errors = computed(() => {
  const e = {}
  if (form.name.trim().length < 3) e.name = 'At least 3 characters.'
  if (!form.generation) e.generation = 'Pick a generation.'
  if (form.effect.trim().length > 0 && form.effect.trim().length < 10) {
    e.effect = 'If filled in, at least 10 characters.'
  }
  return e
})
const isValid = computed(() => Object.keys(errors.value).length === 0)

function submit() {
  if (!isValid.value) return
  emit('save', {
    name: form.name.trim(),
    generation: form.generation,
    isMainSeries: form.isMainSeries,
    effect: form.effect.trim(),
  })
}
</script>

<template>
  <form @submit.prevent="submit">
    <label>Name
      <input v-model.trim="form.name" required minlength="3" />
      <small v-if="errors.name">{{ errors.name }}</small>
    </label>

    <label>Generation
      <select v-model="form.generation" required>
        <option value="" disabled>— choose —</option>
        <option v-for="g in generations" :key="g" :value="g">{{ g }}</option>
      </select>
      <small v-if="errors.generation">{{ errors.generation }}</small>
    </label>

    <label class="check">
      <input v-model="form.isMainSeries" type="checkbox" /> Main series
    </label>

    <label>Effect
      <textarea v-model.trim="form.effect" rows="3" />
      <small v-if="errors.effect">{{ errors.effect }}</small>
    </label>

    <button type="submit" :disabled="!isValid">Save</button>
  </form>
</template>

<style scoped>
form { display: grid; gap: .75rem; max-width: 28rem; }
label { display: grid; gap: .25rem; }
label.check { display: flex; align-items: center; gap: .5rem; }
small { color: #b00020; }
</style>
