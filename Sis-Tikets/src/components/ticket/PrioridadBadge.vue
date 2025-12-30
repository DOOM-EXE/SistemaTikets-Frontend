<template>
  <span :class="['badge', 'badge-prioridad', `badge-${prioridad}`]">
    {{ formatPrioridad(prioridad) }}
  </span>
</template>

<script setup>
import { defineProps } from 'vue'
import { formatPrioridad } from '@/utils/helpers'

defineProps({
  prioridad: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.badge-prioridad.badge-alta {
  background: #ffebee;
  color: #c62828;
}

.badge-prioridad.badge-media {
  background: #fff8e1;
  color: #f57c00;
}

.badge-prioridad.badge-baja {
  background: #e8f5e9;
  color: #388e3c;
}
</style>
