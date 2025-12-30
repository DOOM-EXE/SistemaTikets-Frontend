<template>
  <div class="filters-container">
    <div class="filters-header" @click="toggleFilters">
      <i :class="['pi', modelValue ? 'pi-chevron-down' : 'pi-chevron-right']"></i>
      <span class="filters-title">Filtros</span>
    </div>
    
    <div v-show="modelValue" class="filters-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const toggleFilters = () => {
  emit('update:modelValue', !props.modelValue)
}
</script>

<style scoped>
.filters-container {
  background: white;
  border-radius: 8px;
  padding: 15px 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filters-header {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.filters-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.filters-content {
  margin-top: 20px;
}
</style>
