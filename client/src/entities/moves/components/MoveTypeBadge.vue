<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: '',
  },
})

const label = computed(() => props.type || 'Unknown')
const badgeClass = computed(() => `type-${props.type || 'unknown'}`)
</script>

<template>
  <span class="type-badge" :class="badgeClass">{{ label }}</span>
</template>

<style scoped>
.type-badge {
  display: inline-block;
  min-width: 4.5rem;
  padding: .2rem .55rem;
  border: 1px solid rgb(0 0 0 / 15%);
  border-radius: .3rem;
  color: #fff;
  font-size: .75rem;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
  text-transform: uppercase;
  text-shadow: 0 1px 1px rgb(0 0 0 / 25%);
}

.type-normal { background: #a8a878; }
.type-fire { background: #f08030; }
.type-water { background: #6890f0; }
.type-electric { background: #f8d030; color: #222; text-shadow: none; }
.type-grass { background: #78c850; color: #222; text-shadow: none; }
.type-ice { background: #98d8d8; color: #222; text-shadow: none; }
.type-fighting { background: #c03028; }
.type-poison { background: #a040a0; }
.type-ground { background: #e0c068; color: #222; text-shadow: none; }
.type-flying { background: #a890f0; color: #222; text-shadow: none; }
.type-psychic { background: #f85888; }
.type-bug { background: #a8b820; color: #222; text-shadow: none; }
.type-rock { background: #b8a038; }
.type-ghost { background: #705898; }
.type-dragon { background: #7038f8; }
.type-dark { background: #705848; }
.type-steel { background: #b8b8d0; color: #222; text-shadow: none; }
.type-fairy { background: #ee99ac; color: #222; text-shadow: none; }
.type-unknown { background: #666; }
</style>
