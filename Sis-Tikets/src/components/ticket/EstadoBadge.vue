<template>
  <span :class="['badge', 'badge-estado', `badge-${estado}`]">
    {{ formatEstado(estado) }}
  </span>
</template>

<script setup>
import { defineProps } from 'vue'
import { formatEstado } from '@/utils/helpers'

defineProps({
  estado: {
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

.badge-estado.badge-nuevo {
  background: #e3f2fd;
  color: #1976d2;
}

.badge-estado.badge-en-proceso {
  background: #fff8e1;
  color: #f57c00;
}

.badge-estado.badge-cerrada {
  background: #e8f5e9;
  color: #388e3c;
}

.badge-estado.badge-resuelto {
  background: #f3e5f5;
  color: #7b1fa2;
}

.badge-estado.badge-rechazada {
  background: #ffebee;
  color: #c62828;
}
</style>
