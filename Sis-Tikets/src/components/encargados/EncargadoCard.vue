<template>
  <div class="encargado-card">
    <div class="encargado-header">
      <div class="encargado-info">
        <span class="encargado-name">{{ encargado.nombreUsuario }}</span>
        <span class="encargado-fecha">Desde {{ formatFecha(encargado.fechaAsignacion) }}</span>
      </div>
      <span class="badge-estado" :class="encargado.activo ? 'badge-activo' : 'badge-inactivo'">
        <i :class="encargado.activo ? 'pi pi-check-circle' : 'pi pi-times-circle'"></i>
        {{ encargado.activo ? 'Activo' : 'Inactivo' }}
      </span>
    </div>

    <div class="encargado-actions">
      <button 
        v-if="encargado.activo" 
        @click="$emit('desactivar', encargado.idEncargado)"
        class="btn-action btn-warning"
        title="Desactivar encargado"
      >
        <i class="pi pi-ban"></i>
        Desactivar
      </button>
      <button 
        v-else
        @click="$emit('activar', encargado.idEncargado)"
        class="btn-action btn-success"
        title="Activar encargado"
      >
        <i class="pi pi-check"></i>
        Activar
      </button>
      <button 
        @click="$emit('eliminar', encargado.idEncargado)"
        class="btn-action btn-danger"
        title="Eliminar encargado"
      >
        <i class="pi pi-trash"></i>
        Eliminar
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  encargado: {
    type: Object,
    required: true
  }
})

defineEmits(['desactivar', 'activar', 'eliminar'])

const formatFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<style scoped>
.encargado-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
}

.encargado-card:hover {
  border-color: #4F39F6;
  box-shadow: 0 2px 8px rgba(79, 57, 246, 0.1);
}

.encargado-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.encargado-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.encargado-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.encargado-fecha {
  font-size: 12px;
  color: #6b7280;
}

.badge-estado {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.badge-activo {
  background: #d1fae5;
  color: #065f46;
}

.badge-inactivo {
  background: #fee2e2;
  color: #991b1b;
}

.encargado-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-warning {
  background: #ffc107;
  color: #000;
}

.btn-warning:hover {
  background: #e0a800;
  transform: translateY(-1px);
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
  transform: translateY(-1px);
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.btn-action i {
  font-size: 12px;
}
</style>
