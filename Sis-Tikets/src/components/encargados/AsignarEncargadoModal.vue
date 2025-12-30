<template>
  <div v-if="show" class="modal-overlay" @click.self="cerrar">
    <div class="modal-content">
      <div class="modal-header">
        <h3>
          <i class="pi pi-user-plus"></i>
          Asignar Encargado a {{ nombreArea }}
        </h3>
        <button class="btn-close" @click="cerrar">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading-state">
          <i class="pi pi-spin pi-spinner"></i>
          Cargando gestores...
        </div>

        <div v-else>
          <div v-if="gestoresDisponibles.length === 0" class="empty-state">
            <i class="pi pi-info-circle"></i>
            <p>No hay gestores disponibles para asignar a esta área</p>
          </div>

          <div v-else class="form-group">
            <label class="form-label">Seleccionar Gestor</label>
            <select v-model="gestorSeleccionado" class="form-select">
              <option :value="null">Seleccione un gestor...</option>
              <option 
                v-for="gestor in gestoresDisponibles" 
                :key="gestor.idUsuario" 
                :value="gestor.idUsuario"
              >
                {{ gestor.nombreCompleto }} ({{ gestor.username }})
              </option>
            </select>
            <p class="form-hint">Solo se muestran gestores del área que aún no son encargados</p>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="cerrar">Cancelar</button>
        <button 
          class="btn-submit" 
          @click="asignar" 
          :disabled="!gestorSeleccionado || asignando"
        >
          <i v-if="!asignando" class="pi pi-check"></i>
          <i v-else class="pi pi-spin pi-spinner"></i>
          {{ asignando ? 'Asignando...' : 'Asignar Encargado' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { encargadoService } from '@/services'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  idArea: {
    type: Number,
    required: true
  },
  nombreArea: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'asignado'])

const loading = ref(false)
const asignando = ref(false)
const gestoresDisponibles = ref([])
const gestorSeleccionado = ref(null)

watch(() => props.show, async (newVal) => {
  if (newVal) {
    await cargarGestores()
  } else {
    gestorSeleccionado.value = null
  }
})

const cargarGestores = async () => {
  try {
    loading.value = true
    const gestores = await encargadoService.getGestoresDisponibles(props.idArea)
    // Filtrar solo gestores que NO son encargados actualmente
    gestoresDisponibles.value = gestores.filter(g => !g.esEncargado)
  } catch (error) {
    console.error('Error cargando gestores:', error)
    alert('Error al cargar los gestores disponibles')
  } finally {
    loading.value = false
  }
}

const asignar = async () => {
  if (!gestorSeleccionado.value) return

  try {
    asignando.value = true
    await encargadoService.asignarEncargado(gestorSeleccionado.value, props.idArea)
    alert('Encargado asignado exitosamente')
    emit('asignado')
    cerrar()
  } catch (error) {
    console.error('Error asignando encargado:', error)
    alert(error.response?.data?.message || 'Error al asignar encargado')
  } finally {
    asignando.value = false
  }
}

const cerrar = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.modal-header h3 i {
  color: #4F39F6;
}

.btn-close {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: #f3f4f6;
  color: #1a1a1a;
}

.modal-body {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #6b7280;
  gap: 12px;
}

.loading-state i,
.empty-state i {
  font-size: 48px;
  color: #d1d5db;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.form-select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
  background: white;
}

.form-select:focus {
  border-color: #4F39F6;
  box-shadow: 0 0 0 3px rgba(79, 57, 246, 0.1);
}

.form-hint {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-submit {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
}

.btn-cancel {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background: #f3f4f6;
  color: #1a1a1a;
}

.btn-submit {
  background: #4F39F6;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #3d2bc4;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 57, 246, 0.3);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
