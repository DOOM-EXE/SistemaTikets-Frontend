<template>
  <div class="panel-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <button class="btn-back" @click="goBack">
          <i class="pi pi-arrow-left"></i>
        </button>
        <div class="header-info">
          <h1 class="header-title">Gestión de Usuarios</h1>
          <p class="header-subtitle">Administra los usuarios del sistema</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn-create" @click="abrirModalCrear">
          <i class="pi pi-plus"></i>
          Crear Nuevo Usuario
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="panel-content">
      <!-- Stats Cards -->
      <div class="stats-container">
        <div class="stat-card total">
          <div class="stat-icon">
            <i class="pi pi-users"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Total Usuarios</span>
            <span class="stat-value">{{ stats.total }}</span>
          </div>
        </div>

        <div class="stat-card gestores">
          <div class="stat-icon">
            <i class="pi pi-shield"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Gestores</span>
            <span class="stat-value">{{ stats.gestores }}</span>
          </div>
        </div>

        <div class="stat-card activos">
          <div class="stat-icon">
            <i class="pi pi-check-circle"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Usuarios Activos</span>
            <span class="stat-value">{{ stats.activos }}</span>
          </div>
        </div>

        <div class="stat-card areas">
          <div class="stat-icon">
            <i class="pi pi-briefcase"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Áreas</span>
            <span class="stat-value">{{ stats.areas }}</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-container">
        <div class="filters-header" @click="toggleFilters">
          <i :class="['pi', showFilters ? 'pi-chevron-down' : 'pi-chevron-right']"></i>
          <span class="filters-title">Filtros</span>
        </div>
        
        <div v-show="showFilters" class="filters-content">
          <div class="filters-row">
            <div class="filter-field">
              <label>Rol</label>
              <select v-model="filters.rol" class="filter-select">
                <option value="">Todos</option>
                <option value="Admin">Admin</option>
                <option value="Gestor">Gestor</option>
                <option value="Solicitante">Solicitante</option>
              </select>
            </div>

            <div class="filter-field">
              <label>Área</label>
              <select v-model="filters.idArea" class="filter-select">
                <option value="">Todos</option>
                <option v-for="area in areas" :key="area.idArea" :value="area.idArea">
                  {{ area.nombre }}
                </option>
              </select>
            </div>
          </div>

          <div class="search-row">
            <i class="pi pi-search search-icon"></i>
            <input 
              type="text" 
              v-model="filters.busqueda" 
              class="search-input" 
              placeholder="Buscar por nombre, email o id"
            />
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="table-container">
        <div class="table-header">
          <h2>Lista de Usuarios</h2>
          <span class="table-count">Total: {{ usuariosFiltrados.length }} usuarios</span>
        </div>

        <div class="table-wrapper" v-if="!loading">
          <table class="usuarios-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Username</th>
                <th>Rol</th>
                <th>Área</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="usuariosFiltrados.length === 0">
                <td colspan="7" class="no-data">No hay usuarios para mostrar</td>
              </tr>
              <tr v-for="usuario in paginatedUsuarios" :key="usuario.idUsuario">
                <td>#{{ usuario.idUsuario }}</td>
                <td>{{ usuario.nombreCompleto }}</td>
                <td>
                  <span class="username-badge">{{ usuario.username }}</span>
                </td>
                <td>
                  <span :class="['badge-rol', `badge-${usuario.rol.toLowerCase()}`]">
                    {{ usuario.rol }}
                  </span>
                </td>
                <td>{{ usuario.nombreArea }}</td>
                <td>{{ formatFecha(usuario.fechaCreacionUsuario) }}</td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-table-action btn-view" @click="verUsuario(usuario)" title="Ver">
                      <i class="pi pi-eye"></i>
                    </button>
                    <button class="btn-table-action btn-delete" @click="eliminarUsuario(usuario)" title="Eliminar">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Loading state -->
        <div v-else class="loading-state">
          <i class="pi pi-spin pi-spinner"></i>
          Cargando usuarios...
        </div>

        <!-- Pagination -->
        <div class="pagination" v-if="!loading && usuariosFiltrados.length > 0">
          <button 
            class="pagination-btn" 
            @click="goToFirstPage" 
            :disabled="currentPage === 1"
          >
            «
          </button>
          <button 
            class="pagination-btn" 
            @click="previousPage" 
            :disabled="currentPage === 1"
          >
            ‹
          </button>
          <button 
            v-for="page in visiblePages" 
            :key="page"
            :class="['pagination-btn', { active: page === currentPage }]"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <span class="pagination-info">...</span>
          <span class="pagination-info">{{ totalPages }}</span>
          <button 
            class="pagination-btn" 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
          >
            ›
          </button>
          <button 
            class="pagination-btn" 
            @click="goToLastPage" 
            :disabled="currentPage === totalPages"
          >
            »
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usuarioService, catalogoService, apiService } from '@/services'

const router = useRouter()

const loading = ref(true)
const usuarios = ref([])
const areas = ref([])
const showFilters = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Filtros
const filters = ref({
  rol: '',
  idArea: '',
  estado: '',
  busqueda: ''
})

// Stats
const stats = computed(() => {
  return {
    total: usuarios.value.length,
    gestores: usuarios.value.filter(u => u.rol === 'Gestor').length,
    activos: usuarios.value.filter(u => u.activo).length,
    areas: [...new Set(usuarios.value.map(u => u.idAreaAsignada))].length
  }
})

// Usuarios filtrados
const usuariosFiltrados = computed(() => {
  let resultado = [...usuarios.value]

  // Filtro por rol
  if (filters.value.rol) {
    resultado = resultado.filter(u => u.rol === filters.value.rol)
  }

  // Filtro por área
  if (filters.value.idArea) {
    resultado = resultado.filter(u => u.idAreaAsignada === parseInt(filters.value.idArea))
  }

  // Filtro por estado
  if (filters.value.estado === 'activo') {
    resultado = resultado.filter(u => u.activo)
  } else if (filters.value.estado === 'inactivo') {
    resultado = resultado.filter(u => !u.activo)
  }

  // Filtro por búsqueda
  if (filters.value.busqueda) {
    const busqueda = filters.value.busqueda.toLowerCase()
    resultado = resultado.filter(u => 
      u.nombreCompleto.toLowerCase().includes(busqueda) ||
      u.username.toLowerCase().includes(busqueda) ||
      u.idUsuario.toString().includes(busqueda)
    )
  }

  return resultado
})

// Pagination
const totalPages = computed(() => Math.ceil(usuariosFiltrados.value.length / itemsPerPage.value))

const paginatedUsuarios = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return usuariosFiltrados.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i)
    } else if (current >= total - 2) {
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      for (let i = current - 2; i <= current + 2; i++) pages.push(i)
    }
  }
  
  return pages
})

const goToPage = (page) => {
  currentPage.value = page
}

const previousPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const goToFirstPage = () => {
  currentPage.value = 1
}

const goToLastPage = () => {
  currentPage.value = totalPages.value
}

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const goBack = () => {
  router.push('/panel-admin')
}

const abrirModalCrear = () => {
  router.push('/crear-usuario')
}

const verUsuario = (usuario) => {
  router.push(`/editar-usuario/${usuario.idUsuario}`)
}

const eliminarUsuario = async (usuario) => {
  // Determinar el mensaje según el rol
  let mensajeConfirmacion = `¿Estás seguro de que deseas eliminar al usuario "${usuario.nombreCompleto}"?`
  
  if (usuario.rol === 'Gestor') {
    mensajeConfirmacion += '\n\nSi el gestor tiene solicitudes asignadas, estas serán desasignadas automáticamente.'
  } else if (usuario.rol === 'Solicitante') {
    mensajeConfirmacion += '\n\nNota: Si el usuario tiene solicitudes creadas, no podrá ser eliminado.'
  }
  
  mensajeConfirmacion += '\n\nEsta acción no se puede deshacer.'
  
  if (confirm(mensajeConfirmacion)) {
    try {
      await apiService.delete(`/Usuarios/${usuario.idUsuario}`)
      
      // Mensaje de éxito según el rol
      if (usuario.rol === 'Gestor') {
        alert('Usuario eliminado. Las solicitudes asignadas han sido desasignadas automáticamente.')
      } else {
        alert('Usuario eliminado correctamente.')
      }
      
      await loadUsuarios()
    } catch (error) {
      console.error('Error eliminando usuario:', error)
      
      // Manejar errores específicos del API
      const errorMessage = error.response?.data?.message || error.message || ''
      
      // Detectar error de solicitudes activas (como solicitante)
      if (errorMessage.includes('solicitud(es) activa(s)') || errorMessage.includes('solicitudes activa')) {
        // Extraer los códigos de solicitud del mensaje si están disponibles
        const codigosMatch = errorMessage.match(/SOL-\d{4}-\d{5}/g)
        let mensaje = 'No se puede eliminar el usuario porque tiene solicitudes activas.\n\n'
        
        if (codigosMatch && codigosMatch.length > 0) {
          mensaje += `Solicitudes pendientes: ${codigosMatch.join(', ')}\n\n`
        }
        
        mensaje += 'Las solicitudes deben estar en estado Resuelta, Cerrada o Cancelada para poder eliminar el usuario.\n\n'
        mensaje += 'Opciones:\n• Resolver o cerrar las solicitudes pendientes\n• Cancelar las solicitudes'
        
        alert(mensaje)
      } else if (errorMessage.includes('solicitudes creadas') || error.response?.status === 400) {
        alert('No se puede eliminar. El usuario tiene solicitudes creadas.\n\nOpciones:\n• Eliminar primero las solicitudes del usuario')
      } else {
        alert(errorMessage || 'Error al eliminar el usuario')
      }
    }
  }
}

const formatFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-MX')
}

const esEncargado = (usuario) => {
  return usuario.encargadosDeAreas && usuario.encargadosDeAreas.length > 0
}

const loadUsuarios = async () => {
  try {
    loading.value = true
    const data = await usuarioService.getGestores() // Este método devuelve todos los usuarios
    
    // Obtener todos los usuarios desde el API
    const response = await fetch('http://localhost:5266/api/Usuarios', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    const allUsers = await response.json()
    
    usuarios.value = allUsers.map(u => ({
      ...u,
      activo: true // Por ahora todos activos, luego vendrá del API
    }))
  } catch (error) {
    console.error('Error cargando usuarios:', error)
    alert('Error al cargar usuarios')
  } finally {
    loading.value = false
  }
}

const loadAreas = async () => {
  try {
    areas.value = await catalogoService.getAreas()
  } catch (error) {
    console.error('Error cargando áreas:', error)
  }
}

// Watch filters
watch(filters, () => {
  currentPage.value = 1
}, { deep: true })

onMounted(async () => {
  await loadAreas()
  await loadUsuarios()
})
</script>

<style scoped>
.panel-container {
  width: 100%;
  min-height: 100vh;
  background: #F9FAFB;
}

.panel-content {
  padding: 30px;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-back {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-back:hover {
  background: #e5e7eb;
  color: #374151;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.header-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-create {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #7c3aed;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-create:hover {
  background: #6d28d9;
  transform: translateY(-1px);
}

/* Stats */
.stats-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-card.total .stat-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.stat-card.gestores .stat-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.stat-card.activos .stat-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-card.areas .stat-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  color: #1a1a1a;
  font-weight: 700;
}

/* Filters */
.filters-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filters-header {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.filters-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.filters-content {
  margin-top: 20px;
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 15px;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-field label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.filter-select,
.filter-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  transition: all 0.3s ease;
}

.filter-select:focus,
.filter-input:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.search-row {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 38px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

/* Table */
.table-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e5e7eb;
}

.table-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.table-count {
  font-size: 13px;
  color: #6b7280;
}

.table-wrapper {
  overflow-x: auto;
}

.usuarios-table {
  width: 100%;
  border-collapse: collapse;
}

.usuarios-table thead tr {
  background: #f9fafb;
}

.usuarios-table th {
  padding: 12px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.usuarios-table td {
  padding: 16px 12px;
  border-top: 1px solid #e5e7eb;
  font-size: 13px;
  color: #374151;
}

.username-badge {
  display: inline-block;
  padding: 4px 8px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.badge-rol {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.badge-admin {
  background: #fef3c7;
  color: #92400e;
}

.badge-gestor {
  background: #dbeafe;
  color: #1e40af;
}

.badge-solicitante {
  background: #e0e7ff;
  color: #4338ca;
}

.badge-estado {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
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

.badge-encargado {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #78350f;
}

.badge-encargado i {
  font-size: 11px;
}

.badge-no-encargado {
  color: #9ca3af;
  font-size: 12px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-table-action {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-view {
  background: #dbeafe;
  color: #1e40af;
}

.btn-view:hover {
  background: #bfdbfe;
}

.btn-delete {
  background: #fee2e2;
  color: #991b1b;
}

.btn-delete:hover {
  background: #fecaca;
}

.no-data {
  text-align: center;
  color: #9ca3af;
  padding: 40px !important;
  font-style: italic;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: #6b7280;
  font-size: 14px;
}

.loading-state i {
  font-size: 24px;
  color: #7c3aed;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.pagination-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #7c3aed;
  color: #7c3aed;
}

.pagination-btn.active {
  background: #7c3aed;
  border-color: #7c3aed;
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 13px;
  color: #6b7280;
  padding: 0 4px;
}

@media (max-width: 1024px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters-row {
    grid-template-columns: 1fr;
  }
}
</style>
