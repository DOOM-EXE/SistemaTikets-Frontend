<template>
  <div class="panel-header">
    <div class="header-left">
      <i class="pi pi-file-edit header-icon"></i>
      <div class="header-text">
        <h1 class="header-title">{{ title }}</h1>
        <p class="header-description">{{ description }}</p>
      </div>
    </div>
    <button class="btn-logout" @click="handleLogout">
      <i class="pi pi-sign-out"></i>
      Cerrar sesion
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  title: {
    type: String,
    default: 'Panel de solicitante'
  },
  description: {
    type: String,
    default: 'Gestiona tus solicitudes'
  }
})

const emit = defineEmits(['logout'])

const handleLogout = () => {
  emit('logout')
}
</script>

<style scoped>
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #FFFFFF;
  padding: 20px 30px;
  margin: -20px -20px 30px -20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-icon {
  font-size: 28px;
  color: #4F39F6;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.header-description {
  font-size: 13px;
  color: #666;
  margin: 0;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border: 1px solid #d1d1d1;
  border-radius: 6px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-logout:hover {
  background: #f5f5f5;
}
</style>
