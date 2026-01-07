<template>
  <div class="panel-container">
    <!-- Header -->
    <PageHeader :title="`Panel de Gestor - ${areaName}`" @logout="handleLogout" />

    <!-- Badge Encargado (si aplica) -->
    <div v-if="esEncargado" class="alert-info">
      <i class="pi pi-star-fill"></i>
      <span><strong>Encargado del área:</strong> Tienes acceso a todas las solicitudes de tu área</span>
    </div>

    <!-- Main Content -->
    <div class="panel-content">
      <!-- Stats Cards -->
      <div class="stats-container">
        <div class="stat-card asignadas">
          <div class="stat-icon">
            <i class="pi pi-file"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Solicitudes Asignadas</span>
            <span class="stat-value">{{ stats.asignadas }}</span>
          </div>
        </div>

        <div class="stat-card en-proceso">
          <div class="stat-icon">
            <i class="pi pi-clock"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">En proceso</span>
            <span class="stat-value">{{ stats.enProceso }}</span>
          </div>
        </div>

        <div class="stat-card sin-asignar">
          <div class="stat-icon">
            <i class="pi pi-exclamation-circle"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Sin Asignar</span>
            <span class="stat-value">{{ stats.sinAsignar }}</span>
          </div>
        </div>

        <div class="stat-card resueltas">
          <div class="stat-icon">
            <i class="pi pi-check-circle"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Resueltas</span>
            <span class="stat-value">{{ stats.resueltas }}</span>
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
              <label>Estado</label>
              <select v-model="filters.idEstado" class="filter-select">
                <option value="">Todos</option>
                <option v-for="estado in estados" :key="estado.idEstado" :value="estado.idEstado">
                  {{ estado.nombre }}
                </option>
              </select>
            </div>

            <div class="filter-field">
              <label>Prioridad</label>
              <select v-model="filters.idPrioridad" class="filter-select">
                <option value="">Todos</option>
                <option v-for="prioridad in prioridades" :key="prioridad.idPrioridad" :value="prioridad.idPrioridad">
                  {{ prioridad.nombre }}
                </option>
              </select>
            </div>

            <div class="filter-field">
              <label>Fecha Desde</label>
              <input type="date" v-model="filters.fechaDesde" class="filter-input" placeholder="dd/mm/aaaa" />
            </div>

            <div class="filter-field">
              <label>Fecha Hasta</label>
              <input type="date" v-model="filters.fechaHasta" class="filter-input" placeholder="dd/mm/aaaa" />
            </div>
          </div>

          <div class="search-row">
            <i class="pi pi-search search-icon"></i>
            <input 
              type="text" 
              v-model="filters.busqueda" 
              class="search-input" 
              placeholder="Buscar por asunto o número"
            />
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="table-container">
        <div class="table-header">
          <h2>Solicitudes de {{ areaName }}</h2>
          <span class="table-count">Vista: {{ solicitudes.length }} solicitudes</span>
        </div>

        <div class="table-wrapper" v-if="!loading">
          <table class="solicitudes-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Tipo</th>
                <th>Asunto</th>
                <th>Solicitante</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Asignado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="solicitudes.length === 0">
                <td colspan="9" class="no-data">No hay solicitudes para mostrar</td>
              </tr>
              <tr v-for="solicitud in paginatedSolicitudes" :key="solicitud.id">
                <td>{{ solicitud.codigo || solicitud.numero }}</td>
                <td>{{ solicitud.tipo }}</td>
                <td class="asunto-cell">{{ solicitud.asunto }}</td>
                <td>{{ solicitud.solicitante }}</td>
                <td>
                  <EstadoBadge :estado="solicitud.estado" />
                </td>
                <td>
                  <PrioridadBadge :prioridad="solicitud.prioridad" />
                </td>
                <td>
                  <span v-if="solicitud.gestor" class="asignado-badge">
                    {{ solicitud.gestor }}
                  </span>
                  <span v-else class="sin-asignar-badge">Sin asignar</span>
                </td>
                <td>{{ solicitud.fecha }}</td>
                <td>
                  <button class="btn-action" @click="verSolicitud(solicitud.id)">
                    <i class="pi pi-eye"></i>
                    Ver
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Loading state -->
        <div v-else class="loading-state">
          <i class="pi pi-spin pi-spinner"></i>
          Cargando solicitudes...
        </div>

        <!-- Pagination -->
        <div class="pagination" v-if="!loading && solicitudes.length > 0">
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
import { authService, catalogoService, ticketService, apiService, encargadoService } from '@/services'
import PageHeader from '@/components/layout/PageHeader.vue'
import EstadoBadge from '@/components/ticket/EstadoBadge.vue'
import PrioridadBadge from '@/components/ticket/PrioridadBadge.vue'

const router = useRouter()

const loading = ref(true)
const solicitudesCrudas = ref([]) // Todas las solicitudes del área
const showFilters = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const areaName = ref('Área')
const currentUserId = ref(null)
const esEncargado = ref(false)

// Catálogos
const estados = ref([])
const prioridades = ref([])

// Filtros
const filters = ref({
  idEstado: '',
  idPrioridad: '',
  fechaDesde: '',
  fechaHasta: '',
  busqueda: ''
})

// Solicitudes filtradas según permisos del usuario
const solicitudes = computed(() => {
  let filtradas = solicitudesCrudas.value

  // SI NO ES ENCARGADO: Solo mostrar asignadas a él o sin asignar
  if (!esEncargado.value && currentUserId.value) {
    filtradas = filtradas.filter(s => {
      // Sin asignar o asignadas a este gestor
      return !s.idGestorAsignado || s.idGestorAsignado === currentUserId.value
    })
  }

  // Aplicar filtros adicionales
  if (filters.value.idEstado) {
    filtradas = filtradas.filter(s => s.idEstado === parseInt(filters.value.idEstado))
  }

  if (filters.value.idPrioridad) {
    filtradas = filtradas.filter(s => s.idPrioridad === parseInt(filters.value.idPrioridad))
  }

  if (filters.value.busqueda) {
    const busqueda = filters.value.busqueda.toLowerCase()
    filtradas = filtradas.filter(s => 
      s.asunto?.toLowerCase().includes(busqueda) ||
      s.codigo?.toLowerCase().includes(busqueda) ||
      s.numero?.toLowerCase().includes(busqueda)
    )
  }

  if (filters.value.fechaDesde) {
    filtradas = filtradas.filter(s => {
      const fecha = new Date(s.fechaCreacion)
      return fecha >= new Date(filters.value.fechaDesde)
    })
  }

  if (filters.value.fechaHasta) {
    filtradas = filtradas.filter(s => {
      const fecha = new Date(s.fechaCreacion)
      return fecha <= new Date(filters.value.fechaHasta)
    })
  }

  return filtradas
})

// Stats calculados sobre solicitudes filtradas
const stats = computed(() => {
  return {
    asignadas: solicitudes.value.filter(s => s.gestor).length,
    enProceso: solicitudes.value.filter(s => s.estado === 'en-proceso').length,
    sinAsignar: solicitudes.value.filter(s => !s.gestor).length,
    resueltas: solicitudes.value.filter(s => s.estado === 'resuelto').length
  }
})

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const handleLogout = () => {
  authService.logout()
  router.push('/login')
}

const verSolicitud = (id) => {
  router.push(`/solicitud/${id}`)
}

// Paginación
const totalPages = computed(() => {
  return Math.ceil(solicitudes.value.length / itemsPerPage.value)
})

const paginatedSolicitudes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return solicitudes.value.slice(start, end)
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
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }

  return pages
})

const goToPage = (page) => {
  if (page === '...') return
  currentPage.value = page
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const goToFirstPage = () => {
  currentPage.value = 1
}

const goToLastPage = () => {
  currentPage.value = totalPages.value
}

// Cargar catálogos
const loadCatalogos = async () => {
  try {
    const [estadosData, prioridadesData] = await Promise.all([
      catalogoService.getEstados(),
      catalogoService.getPrioridades()
    ])
    estados.value = estadosData
    prioridades.value = prioridadesData
  } catch (error) {
    console.error('Error cargando catálogos:', error)
  }
}

// Cargar solicitudes
const loadSolicitudes = async () => {
  try {
    loading.value = true
    
    // Cargar todas las solicitudes del área (sin filtros de permisos, el computed se encarga)
    const data = await ticketService.getAllSolicitudes()
    
    // Guardar las solicitudes crudas con todos los campos necesarios
    solicitudesCrudas.value = data.map(item => ({
      ...item,
      idGestorAsignado: item.idGestorAsignado || null,
      fechaCreacion: item.fechaCreacion || new Date(),
      idEstado: item.idEstado,
      idPrioridad: item.idPrioridad
    }))

    // Reset page if needed
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
      currentPage.value = totalPages.value
    }
  } catch (error) {
    console.error('Error cargando solicitudes:', error)
    alert('Error al cargar las solicitudes')
  } finally {
    loading.value = false
  }
}

const mapEstadoFromAPI = (nombreEstado) => {
  if (!nombreEstado) return 'nuevo'
  const estadoMap = {
    'Nueva': 'nuevo',
    'En Progreso': 'en-proceso',
    'Cerrada': 'cerrada',
    'Resuelta': 'resuelto',
    'Rechazado': 'rechazada'
  }
  return estadoMap[nombreEstado] || nombreEstado.toLowerCase()
}

const mapPrioridadFromAPI = (nombrePrioridad) => {
  if (!nombrePrioridad) return 'media'
  const prioridadMap = {
    'Baja': 'baja',
    'Media': 'media',
    'Alta': 'alta'
  }
  return prioridadMap[nombrePrioridad] || nombrePrioridad.toLowerCase()
}

// Watch filters
watch(filters, () => {
  // Los filtros ahora se aplican en el computed, solo resetear página
  if (currentPage.value > totalPages.value && totalPages.value > 0) {
    currentPage.value = 1
  }
}, { deep: true })

onMounted(async () => {
  // Obtener información del usuario
  const user = authService.getUser()
  if (user) {
    currentUserId.value = user.id
    // Inicialmente usar el valor del login, pero verificar después
    esEncargado.value = false
    
    // Obtener información actualizada del usuario desde el API
    try {
      const usuarioActual = await apiService.get(`/Usuarios/${user.id}`)
      
      if (usuarioActual && usuarioActual.nombreArea) {
        areaName.value = usuarioActual.nombreArea
        
        // Actualizar el localStorage con la información correcta
        const updatedUser = {
          ...user,
          nombreArea: usuarioActual.nombreArea,
          area: usuarioActual.idAreaAsignada
        }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        // Verificar si es encargado ACTIVO del área
        if (usuarioActual.idAreaAsignada) {
          try {
            const resultEncargado = await encargadoService.verificarEncargado(user.id, usuarioActual.idAreaAsignada)
            esEncargado.value = resultEncargado.esEncargado === true && resultEncargado.activo === true
            console.log('🔍 Verificación de encargado en PanelGestor:', {
              usuario: user.nombre,
              idArea: usuarioActual.idAreaAsignada,
              resultado: resultEncargado,
              esEncargadoFinal: esEncargado.value
            })
          } catch (encError) {
            console.error('Error verificando estado de encargado:', encError)
            esEncargado.value = false
          }
        }
      } else {
        areaName.value = user.nombreArea || 'Área no asignada'
      }
    } catch (error) {
      console.error('Error obteniendo información del usuario:', error)
      areaName.value = user.nombreArea || 'Área no asignada'
    }
  }
  
  await loadCatalogos()
  await loadSolicitudes()
})
</script>

<style scoped>
.panel-container {
  width: 100%;
  min-height: 100vh;
  background: #F9FAFB;
}

/* Alerts */
.alert-info,
.alert-warning {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  margin: 20px 40px;
  border-radius: 8px;
  font-size: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.alert-info {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-left: 4px solid #f59e0b;
  color: #92400e;
}

.alert-info i {
  font-size: 18px;
  color: #f59e0b;
}

.alert-warning {
  background: #dbeafe;
  border-left: 4px solid #3b82f6;
  color: #1e3a8a;
}

.alert-warning i {
  font-size: 18px;
  color: #3b82f6;
}

.panel-content {
  padding: 30px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Stats Cards */
.stats-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid;
}

.stat-card.asignadas {
  border-left-color: #3b82f6;
}

.stat-card.en-proceso {
  border-left-color: #f59e0b;
}

.stat-card.sin-asignar {
  border-left-color: #ef4444;
}

.stat-card.resueltas {
  border-left-color: #10b981;
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

.stat-card.asignadas .stat-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.stat-card.en-proceso .stat-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-card.sin-asignar .stat-icon {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.stat-card.resueltas .stat-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

/* Filters */
.filters-container {
  background: white;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
  overflow: hidden;
}

.filters-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 24px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.filters-header:hover {
  background-color: #f9fafb;
}

.filters-header i {
  color: #4F39F6;
  font-size: 16px;
  transition: transform 0.3s;
}

.filters-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.filters-content {
  padding: 20px 24px;
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-field label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.filter-select,
.filter-input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
  background: white;
}

.filter-select:focus,
.filter-input:focus {
  border-color: #4F39F6;
  box-shadow: 0 0 0 3px rgba(79, 57, 246, 0.1);
}

.search-row {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 16px;
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 44px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
}

.search-input:focus {
  border-color: #4F39F6;
  box-shadow: 0 0 0 3px rgba(79, 57, 246, 0.1);
}

/* Table */
.table-container {
  background: white;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
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
  font-weight: 500;
}

.table-wrapper {
  overflow-x: auto;
}

.solicitudes-table {
  width: 100%;
  border-collapse: collapse;
}

.solicitudes-table thead {
  background: #f9fafb;
}

.solicitudes-table th {
  padding: 14px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e5e7eb;
}

.solicitudes-table td {
  padding: 16px;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #f0f0f0;
}

.solicitudes-table tbody tr:hover {
  background-color: #f9fafb;
}

.asunto-cell {
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.asignado-badge {
  display: inline-block;
  padding: 4px 10px;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.sin-asignar-badge {
  display: inline-block;
  padding: 4px 10px;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.no-data {
  text-align: center;
  padding: 40px !important;
  color: #9ca3af;
  font-size: 14px;
}

.btn-action {
  background: #4F39F6;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
  font-weight: 500;
}

.btn-action:hover {
  background: #3d2bc4;
  transform: translateY(-1px);
}

.btn-action i {
  font-size: 14px;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px;
  font-size: 16px;
  color: #666;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border-top: 1px solid #f0f0f0;
}

.pagination-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled):not(.active) {
  background: #f9fafb;
  border-color: #4F39F6;
  color: #4F39F6;
}

.pagination-btn.active {
  background: #4F39F6;
  color: white;
  border-color: #4F39F6;
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 1200px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .panel-content {
    padding: 20px;
  }

  .stats-container {
    grid-template-columns: 1fr;
  }

  .filters-row {
    grid-template-columns: 1fr;
  }

  .table-wrapper {
    overflow-x: scroll;
  }
}
</style>
