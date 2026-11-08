<script setup>
import { reactive, computed } from 'vue'
import MoveTypeBadge from './MoveTypeBadge.vue'

const emit = defineEmits(['save'])

const draft = reactive({
  name: '',
  type: 'normal',
  damageClass: 'status',
  power: null,
  accuracy: null,
  pp: null,
  effect: '',
})

const errors = computed(() => {
  const result = {}
  if (draft.name.length < 2) result.name = 'Name needs at least 2 characters.'
  for (const field of ['power', 'pp']) {
    if (draft[field] !== null && (!Number.isInteger(draft[field]) || draft[field] < 0)) {
      result[field] = `${field === 'pp' ? 'PP' : 'Power'} must be a non-negative whole number.`
    }
  }
  if (draft.accuracy !== null && (!Number.isFinite(draft.accuracy) || draft.accuracy < 0 || draft.accuracy > 100)) {
    result.accuracy = 'Accuracy must be between 0 and 100.'
  }
  return result
})
const isValid = computed(() => Object.keys(errors.value).length === 0)

function submit() {
  if (isValid.value) emit('save', { ...draft })
}
</script>

<template>
  <form @submit.prevent="submit">
    <label>Name
      <input v-model.trim="draft.name" required minlength="2" autocomplete="off" />
      <small v-if="errors.name">{{ errors.name }}</small>
    </label>

    <label>Type
      <select v-model="draft.type" required>
        <option value="normal">Normal</option>
        <option value="fire">Fire</option>
        <option value="water">Water</option>
        <option value="electric">Electric</option>
        <option value="grass">Grass</option>
        <option value="ice">Ice</option>
        <option value="fighting">Fighting</option>
        <option value="poison">Poison</option>
        <option value="ground">Ground</option>
        <option value="flying">Flying</option>
        <option value="psychic">Psychic</option>
        <option value="bug">Bug</option>
        <option value="rock">Rock</option>
        <option value="ghost">Ghost</option>
        <option value="dragon">Dragon</option>
        <option value="dark">Dark</option>
        <option value="steel">Steel</option>
        <option value="fairy">Fairy</option>
      </select>
      <MoveTypeBadge :type="draft.type" />
    </label>

    <label>Damage class
      <select v-model="draft.damageClass" required>
        <option value="physical">Physical</option>
        <option value="special">Special</option>
        <option value="status">Status</option>
      </select>
    </label>

    <label>Power
      <input v-model.number="draft.power" type="number" min="0" step="1" />
      <small v-if="errors.power">{{ errors.power }}</small>
    </label>

    <label>Accuracy (%)
      <input v-model.number="draft.accuracy" type="number" min="0" max="100" />
      <small v-if="errors.accuracy">{{ errors.accuracy }}</small>
    </label>

    <label>PP
      <input v-model.number="draft.pp" type="number" min="0" step="1" />
      <small v-if="errors.pp">{{ errors.pp }}</small>
    </label>

    <label>Effect
      <textarea v-model.trim="draft.effect" rows="3" />
    </label>

    <button type="submit" :disabled="!isValid">Save move</button>
  </form>
</template>

<style scoped>
form { display: grid; gap: .75rem; max-width: 28rem; }
label { display: grid; gap: .25rem; }
input, select, textarea { font: inherit; }
small { color: #b00020; }
</style>
