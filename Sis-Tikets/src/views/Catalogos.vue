<template>
  <div class="panel-container">
    <!-- Header -->
    <div class="page-header">
      <button class="btn-back" @click="goBack">
        <i class="pi pi-chevron-left"></i>
      </button>
      <div class="header-text">
        <h1 class="header-title">Gestión de Catálogos</h1>
        <p class="header-description">Administra áreas, tipos, prioridades y estados del sistema</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="panel-content">
      <!-- Tabs -->
      <div class="tabs-container">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <i :class="tab.icon"></i>
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Áreas -->
        <div v-if="activeTab === 'areas'" class="catalog-section">
          <div class="section-header">
            <h2>Áreas</h2>
            <button class="btn-create" @click="openModal('area')">
              <i class="pi pi-plus"></i>
              Nueva Área
            </button>
          </div>

          <div class="table-wrapper">
            <table class="catalog-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="area in areas" :key="area.idArea">
                  <td>{{ area.idArea }}</td>
                  <td>{{ area.nombre }}</td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-edit" @click="editItem('area', area)">
                        <i class="pi pi-pencil"></i>
                      </button>
                      <button class="btn-delete" @click="deleteItem('area', area.idArea, area.nombre)">
                        <i class="pi pi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tipos de Solicitud -->
        <div v-if="activeTab === 'tipos'" class="catalog-section">
          <div class="section-header">
            <h2>Tipos de Solicitud</h2>
            <div class="header-actions">
              <div class="filter-area">
                <label>Filtrar por área:</label>
                <select v-model="filtroAreaTipos" class="filter-select">
                  <option value="">Todas las áreas</option>
                  <option v-for="area in areas" :key="area.idArea" :value="area.idArea">
                    {{ area.nombre }}
                  </option>
                </select>
              </div>
              <button class="btn-create" @click="openModal('tipo')">
                <i class="pi pi-plus"></i>
                Nuevo Tipo
              </button>
            </div>
          </div>

          <div class="table-wrapper" v-if="tiposFiltrados.length > 0">
            <table class="catalog-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Área</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tipo in tiposFiltrados" :key="tipo.idTipoSolicitud">
                  <td>{{ tipo.idTipoSolicitud }}</td>
                  <td>{{ tipo.nombre }}</td>
                  <td>{{ tipo.nombreArea || '-' }}</td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-edit" @click="editItem('tipo', tipo)">
                        <i class="pi pi-pencil"></i>
                      </button>
                      <button class="btn-delete" @click="deleteItem('tipo', tipo.idTipoSolicitud, tipo.nombre)">
                        <i class="pi pi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mensaje cuando no hay tipos para el área seleccionada -->
          <div v-else-if="filtroAreaTipos" class="empty-state">
            <i class="pi pi-inbox empty-icon"></i>
            <p class="empty-text">Esta área no tiene tipos de solicitud asignados</p>
            <button class="btn-add-tipo" @click="openModalConArea">
              <i class="pi pi-plus"></i>
              Agregar tipo de solicitud
            </button>
          </div>

          <!-- Mensaje cuando no hay tipos en general -->
          <div v-else class="empty-state">
            <i class="pi pi-inbox empty-icon"></i>
            <p class="empty-text">No hay tipos de solicitud registrados</p>
            <button class="btn-create" @click="openModal('tipo')">
              <i class="pi pi-plus"></i>
              Crear primer tipo
            </button>
          </div>
        </div>

        <!-- Prioridades -->
        <div v-if="activeTab === 'prioridades'" class="catalog-section">
          <div class="section-header">
            <h2>Prioridades</h2>
            <button class="btn-create" @click="openModal('prioridad')">
              <i class="pi pi-plus"></i>
              Nueva Prioridad
            </button>
          </div>

          <div class="table-wrapper">
            <table class="catalog-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="prioridad in prioridades" :key="prioridad.idPrioridad">
                  <td>{{ prioridad.idPrioridad }}</td>
                  <td>{{ prioridad.nombre }}</td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-edit" @click="editItem('prioridad', prioridad)">
                        <i class="pi pi-pencil"></i>
                      </button>
                      <button class="btn-delete" @click="deleteItem('prioridad', prioridad.idPrioridad, prioridad.nombre)">
                        <i class="pi pi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Estados -->
        <div v-if="activeTab === 'estados'" class="catalog-section">
          <div class="section-header">
            <h2>Estados</h2>
            <button class="btn-create" @click="openModal('estado')">
              <i class="pi pi-plus"></i>
              Nuevo Estado
            </button>
          </div>

          <div class="table-wrapper">
            <table class="catalog-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="estado in estados" :key="estado.idEstado">
                  <td>{{ estado.idEstado }}</td>
                  <td>{{ estado.nombre }}</td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-edit" @click="editItem('estado', estado)">
                        <i class="pi pi-pencil"></i>
                      </button>
                      <button class="btn-delete" @click="deleteItem('estado', estado.idEstado, estado.nombre)">
                        <i class="pi pi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ modalTitle }}</h3>
          <button class="btn-close" @click="closeModal">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveItem" class="modal-form">
          <!-- Área Form -->
          <template v-if="modalType === 'area'">
            <div class="form-group">
              <label>Nombre *</label>
              <input 
                v-model="formData.nombre"
                type="text"
                class="form-input"
                required
                placeholder="Nombre del área"
              />
            </div>
          </template>

          <!-- Tipo Solicitud Form -->
          <template v-if="modalType === 'tipo'">
            <div class="form-group">
              <label>Nombre *</label>
              <input 
                v-model="formData.nombre"
                type="text"
                class="form-input"
                required
                placeholder="Nombre del tipo"
              />
            </div>
            <div class="form-group">
              <label>Área *</label>
              <select 
                v-model="formData.idArea"
                class="form-select"
                required
              >
                <option value="">Seleccione un área</option>
                <option 
                  v-for="area in areas" 
                  :key="area.idArea"
                  :value="area.idArea"
                >
                  {{ area.nombre }}
                </option>
              </select>
            </div>
          </template>

          <!-- Prioridad Form -->
          <template v-if="modalType === 'prioridad'">
            <div class="form-group">
              <label>Nombre *</label>
              <input 
                v-model="formData.nombre"
                type="text"
                class="form-input"
                required
                placeholder="Nombre de la prioridad"
              />
            </div>
          </template>

          <!-- Estado Form -->
          <template v-if="modalType === 'estado'">
            <div class="form-group">
              <label>Nombre *</label>
              <input 
                v-model="formData.nombre"
                type="text"
                class="form-input"
                required
                placeholder="Nombre del estado"
              />
            </div>
          </template>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="closeModal">
              Cancelar
            </button>
            <button type="submit" class="btn-save" :disabled="saving">
              <i :class="saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'"></i>
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { catalogoService, authService } from '@/services'

const router = useRouter()

const activeTab = ref('areas')
const showModal = ref(false)
const modalType = ref('')
const editingId = ref(null)
const saving = ref(false)

const areas = ref([])
const tipos = ref([])
const prioridades = ref([])
const estados = ref([])
const filtroAreaTipos = ref('')

const tiposFiltrados = computed(() => {
  if (!filtroAreaTipos.value) {
    return tipos.value
  }
  return tipos.value.filter(tipo => tipo.idArea === filtroAreaTipos.value)
})

const formData = ref({
  nombre: '',
  idArea: ''
})

const tabs = [
  { id: 'areas', label: 'Áreas', icon: 'pi pi-briefcase' },
  { id: 'tipos', label: 'Tipos de Solicitud', icon: 'pi pi-list' },
  { id: 'prioridades', label: 'Prioridades', icon: 'pi pi-exclamation-triangle' },
  { id: 'estados', label: 'Estados', icon: 'pi pi-circle' }
]

const modalTitle = computed(() => {
  const action = editingId.value ? 'Editar' : 'Nueva'
  const labels = {
    area: 'Área',
    tipo: 'Tipo de Solicitud',
    prioridad: 'Prioridad',
    estado: 'Estado'
  }
  return `${action} ${labels[modalType.value]}`
})

const goBack = () => {
  router.push('/panel-admin')
}

const handleLogout = () => {
  authService.logout()
  router.push('/login')
}

const loadData = async () => {
  try {
    areas.value = await catalogoService.getAreas()
    tipos.value = await catalogoService.getTiposSolicitud()
    prioridades.value = await catalogoService.getPrioridades()
    estados.value = await catalogoService.getEstados()
  } catch (error) {
    console.error('Error cargando catálogos:', error)
    alert('Error al cargar los catálogos')
  }
}

const openModal = (type) => {
  modalType.value = type
  editingId.value = null
  formData.value = {
    nombre: '',
    idArea: ''
  }
  showModal.value = true
}

// Abrir modal con el área ya preseleccionada
const openModalConArea = () => {
  modalType.value = 'tipo'
  editingId.value = null
  formData.value = {
    nombre: '',
    idArea: filtroAreaTipos.value
  }
  showModal.value = true
}

const editItem = (type, item) => {
  modalType.value = type
  
  // Obtener el ID correcto según el tipo
  if (type === 'area') {
    editingId.value = item.idArea
  } else if (type === 'tipo') {
    editingId.value = item.idTipoSolicitud
  } else if (type === 'prioridad') {
    editingId.value = item.idPrioridad
  } else if (type === 'estado') {
    editingId.value = item.idEstado
  }
  
  formData.value = {
    nombre: item.nombre,
    idArea: item.idArea || ''
  }
  
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  modalType.value = ''
  editingId.value = null
  formData.value = {
    nombre: '',
    idArea: ''
  }
}

const saveItem = async () => {
  try {
    saving.value = true

    const data = {
      nombre: formData.value.nombre
    }

    // Agregar idArea para tipos de solicitud
    if (modalType.value === 'tipo') {
      data.idArea = parseInt(formData.value.idArea)
    }

    if (editingId.value) {
      // Actualizar
      switch (modalType.value) {
        case 'area':
          await catalogoService.updateArea(editingId.value, data)
          break
        case 'tipo':
          await catalogoService.updateTipoSolicitud(editingId.value, data)
          break
        case 'prioridad':
          await catalogoService.updatePrioridad(editingId.value, data)
          break
        case 'estado':
          await catalogoService.updateEstado(editingId.value, data)
          break
      }
      alert('Registro actualizado exitosamente')
    } else {
      // Crear
      switch (modalType.value) {
        case 'area':
          await catalogoService.createArea(data)
          break
        case 'tipo':
          await catalogoService.createTipoSolicitud(data)
          break
        case 'prioridad':
          await catalogoService.createPrioridad(data)
          break
        case 'estado':
          await catalogoService.createEstado(data)
          break
      }
      alert('Registro creado exitosamente')
    }

    await loadData()
    closeModal()
  } catch (error) {
    console.error('Error guardando registro:', error)
    alert(error.response?.data?.message || 'Error al guardar el registro')
  } finally {
    saving.value = false
  }
}

const deleteItem = async (type, id, nombre) => {
  if (!confirm(`¿Estás seguro de eliminar "${nombre}"?`)) return

  try {
    switch (type) {
      case 'area':
        await catalogoService.deleteArea(id)
        break
      case 'tipo':
        await catalogoService.deleteTipoSolicitud(id)
        break
      case 'prioridad':
        await catalogoService.deletePrioridad(id)
        break
      case 'estado':
        await catalogoService.deleteEstado(id)
        break
    }

    alert('Registro eliminado exitosamente')
    await loadData()
  } catch (error) {
    console.error('Error eliminando registro:', error)
    
    // Mensajes específicos según el tipo de catálogo
    const mensajes = {
      area: 'No se puede eliminar el área porque tiene tipos de solicitud o solicitudes asociadas',
      tipo: 'No se puede eliminar el tipo porque tiene solicitudes asociadas',
      prioridad: 'No se puede eliminar la prioridad porque tiene solicitudes asociadas',
      estado: 'No se puede eliminar el estado porque tiene solicitudes asociadas'
    }
    alert(mensajes[type] || 'No se puede eliminar el registro porque está en uso')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.panel-container {
  width: 100%;
  min-height: 100vh;
  background: #F9FAFB;
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #FFFFFF;
  padding: 20px 30px;
  margin: -20px -20px 30px -20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-back {
  background: transparent;
  border: none;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  color: #333;
  font-size: 20px;
}

.btn-back:hover {
  background: #f5f5f5;
  border-radius: 6px;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
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

.panel-content {
  max-width: 1400px;
  margin: 0 auto;
}

.tabs-container {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  background: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.tab-btn:hover {
  background: #f3f4f6;
  color: #4F39F6;
}

.tab-btn.active {
  background: #4F39F6;
  color: white;
}

.tab-btn i {
  font-size: 16px;
}

.tab-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

.catalog-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.filter-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-area label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  min-width: 180px;
  transition: all 0.3s ease;
}

.filter-select:focus {
  border-color: #4F39F6;
  box-shadow: 0 0 0 3px rgba(79, 57, 246, 0.1);
}

.btn-create {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #4F39F6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-create:hover {
  background: #3d2bc4;
  transform: translateY(-1px);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 20px 0;
}

.btn-add-tipo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-add-tipo:hover {
  background: #059669;
  transform: translateY(-1px);
}

.table-wrapper {
  overflow-x: auto;
}

.catalog-table {
  width: 100%;
  border-collapse: collapse;
}

.catalog-table thead {
  background: #f8f9fa;
}

.catalog-table th {
  padding: 12px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
}

.catalog-table td {
  padding: 14px 12px;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #f0f0f0;
}

.catalog-table tbody tr:hover {
  background: #f9fafb;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-edit,
.btn-delete {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-edit {
  background: #eff6ff;
  color: #3b82f6;
}

.btn-edit:hover {
  background: #dbeafe;
}

.btn-delete {
  background: #fef2f2;
  color: #ef4444;
}

.btn-delete:hover {
  background: #fee2e2;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.btn-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: #f3f4f6;
}

.modal-form {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-textarea,
.form-select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  border-color: #4F39F6;
  box-shadow: 0 0 0 3px rgba(79, 57, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-save {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-cancel {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-save {
  background: #4F39F6;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-save:hover:not(:disabled) {
  background: #3d2bc4;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .tabs-container {
    flex-wrap: nowrap;
  }
  
  .tab-btn {
    font-size: 13px;
    padding: 10px 16px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .btn-create {
    width: 100%;
    justify-content: center;
  }
}
</style>
