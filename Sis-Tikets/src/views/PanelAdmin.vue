<template>
  <div class="panel-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <i class="pi pi-shield header-icon"></i>
        <div class="header-info">
          <h1 class="header-title">Panel de Administrador</h1>
          <p class="header-subtitle">{{ userName }} - {{ userRole }}</p>
        </div>
      </div>
      <div class="header-actions">
        <button v-if="isSuperAdmin" class="btn-header" @click="goToUsuarios">
          <i class="pi pi-users"></i>
          Usuarios
        </button>
        <button class="btn-header" @click="goToEncargados">
          <i class="pi pi-star"></i>
          Encargados
        </button>
        <button class="btn-header" @click="goToCatalogos">
          <i class="pi pi-cog"></i>
          Catálogos
        </button>
        <button class="btn-header btn-reportes" @click="goToReportes">
          <i class="pi pi-chart-bar"></i>
          Reportes
        </button>
        <button class="btn-logout" @click="handleLogout">
          <i class="pi pi-sign-out"></i>
          Cerrar sesión
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="panel-content">
      <!-- Stats Cards -->
      <div class="stats-container">
        <div class="stat-card nuevas">
          <div class="stat-icon">
            <i class="pi pi-info-circle"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Nuevas</span>
            <span class="stat-value">{{ stats.nuevas }}</span>
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

        <div class="stat-card cerradas">
          <div class="stat-icon">
            <i class="pi pi-lock"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Cerradas</span>
            <span class="stat-value">{{ stats.cerradas }}</span>
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

        <div class="stat-card rechazadas">
          <div class="stat-icon">
            <i class="pi pi-times-circle"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Rechazadas</span>
            <span class="stat-value">{{ stats.rechazadas }}</span>
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
              <label>Área</label>
              <select v-model="filters.idArea" class="filter-select">
                <option value="">Todas</option>
                <option v-for="area in areas" :key="area.idArea" :value="area.idArea">
                  {{ area.nombre }}
                </option>
              </select>
            </div>

            <div class="filter-field">
              <label>Asignación</label>
              <select v-model="filters.asignacion" class="filter-select">
                <option value="">Todos</option>
                <option value="asignadas">Asignadas</option>
                <option value="sin-asignar">Sin Asignar</option>
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
          <h2>Todas las solicitudes</h2>
          <span class="table-count">Total: {{ solicitudes.length }} solicitudes</span>
        </div>

        <div class="table-wrapper" v-if="!loading">
          <table class="solicitudes-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Área</th>
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
                <td colspan="10" class="no-data">No hay solicitudes para mostrar</td>
              </tr>
              <tr v-for="solicitud in paginatedSolicitudes" :key="solicitud.id">
                <td>{{ solicitud.codigo || solicitud.numero }}</td>
                <td>{{ solicitud.area }}</td>
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
                  <span v-else class="sin-asignar-badge">
                    Sin asignar
                  </span>
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
          <span class="pagination-info">{{ currentPage }}</span>
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
import { authService, catalogoService, ticketService, apiService, usuarioService } from '@/services'
import EstadoBadge from '@/components/ticket/EstadoBadge.vue'
import PrioridadBadge from '@/components/ticket/PrioridadBadge.vue'

const router = useRouter()

const loading = ref(true)
const solicitudes = ref([])
const showFilters = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(15)
const userName = ref('')
const userRole = ref('')
const isSuperAdmin = ref(false)

// Catálogos
const estados = ref([])
const prioridades = ref([])
const areas = ref([])

// Filtros
const filters = ref({
  idEstado: '',
  idPrioridad: '',
  idArea: '',
  asignacion: '',
  fechaDesde: '',
  fechaHasta: '',
  busqueda: ''
})

// Stats
const stats = computed(() => {
  return {
    nuevas: solicitudes.value.filter(s => s.estado === 'nuevo').length,
    enProceso: solicitudes.value.filter(s => s.estado === 'en-proceso').length,
    cerradas: solicitudes.value.filter(s => s.estado === 'cerrada').length,
    resueltas: solicitudes.value.filter(s => s.estado === 'resuelto').length,
    rechazadas: solicitudes.value.filter(s => s.estado === 'rechazada').length,
    sinAsignar: solicitudes.value.filter(s => !s.gestor).length
  }
})

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const handleLogout = () => {
  authService.logout()
  router.push('/login')
}

const goToUsuarios = () => {
  router.push('/gestion-usuarios')
}

const goToEncargados = () => {
  router.push('/gestion-encargados')
}

const goToCatalogos = () => {
  router.push('/catalogos')
}

const goToReportes = () => {
  router.push('/reportes')
}

const verSolicitud = (id) => {
  router.push(`/solicitud/${id}`)
}

const loadCatalogos = async () => {
  try {
    const [estadosData, prioridadesData, areasData] = await Promise.all([
      catalogoService.getEstados(),
      catalogoService.getPrioridades(),
      catalogoService.getAreas()
    ])
    estados.value = estadosData
    prioridades.value = prioridadesData
    areas.value = areasData
  } catch (error) {
    console.error('Error cargando catálogos:', error)
  }
}

const loadSolicitudes = async () => {
  try {
    loading.value = true
    
    // Admin puede ver todas las solicitudes de todas las áreas
    const queryParams = {}
    
    if (filters.value.idEstado) queryParams.idEstado = filters.value.idEstado
    if (filters.value.idPrioridad) queryParams.idPrioridad = filters.value.idPrioridad
    if (filters.value.idArea) queryParams.idArea = filters.value.idArea
    if (filters.value.fechaDesde) queryParams.fechaDesde = filters.value.fechaDesde
    if (filters.value.fechaHasta) queryParams.fechaHasta = filters.value.fechaHasta
    if (filters.value.busqueda) queryParams.busqueda = filters.value.busqueda

    // Obtener datos directos del API sin mapeo intermedio
    const params = new URLSearchParams()
    
    if (queryParams.idEstado) params.append('idEstado', queryParams.idEstado)
    if (queryParams.idPrioridad) params.append('idPrioridad', queryParams.idPrioridad)
    if (queryParams.idArea) params.append('idArea', queryParams.idArea)
    if (queryParams.fechaDesde) params.append('fechaDesde', queryParams.fechaDesde)
    if (queryParams.fechaHasta) params.append('fechaHasta', queryParams.fechaHasta)
    if (queryParams.busqueda) params.append('busqueda', queryParams.busqueda)

    const queryString = params.toString()
    const endpoint = queryString ? `/Solicitudes?${queryString}` : '/Solicitudes'
    
    const data = await apiService.get(endpoint)
    
    let solicitudesFiltradas = data.map(item => ({
      id: item.idSolicitud,
      numero: `#${item.idSolicitud}`,
      codigo: item.codigo || `#${item.idSolicitud}`,
      area: item.nombreArea || 'N/A',
      idArea: item.idArea,
      tipo: item.nombreTipoSolicitud || 'N/A',
      asunto: item.asunto,
      solicitante: item.nombreSolicitante || 'N/A',
      estado: mapEstadoFromAPI(item.nombreEstado),
      prioridad: mapPrioridadFromAPI(item.nombrePrioridad),
      gestor: item.nombreGestorAsignado || null,
      fecha: new Date(item.fechaCreacion).toLocaleDateString('es-MX'),
      fechaCreacion: item.fechaCreacion,
      idEstado: item.idEstado
    }))

    // Filtrar por asignación en el frontend
    if (filters.value.asignacion === 'asignadas') {
      solicitudesFiltradas = solicitudesFiltradas.filter(s => s.gestor !== null)
    } else if (filters.value.asignacion === 'sin-asignar') {
      solicitudesFiltradas = solicitudesFiltradas.filter(s => s.gestor === null)
    }

    solicitudes.value = solicitudesFiltradas
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

// Pagination
const totalPages = computed(() => Math.ceil(solicitudes.value.length / itemsPerPage.value))

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

// Watch filters
watch(filters, () => {
  currentPage.value = 1
  loadSolicitudes()
}, { deep: true })

onMounted(async () => {
  const user = authService.getUser()
  if (user) {
    userName.value = user.nombre || user.username
    userRole.value = user.rol || 'Admin'
    isSuperAdmin.value = user.id === 1
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

.header-icon {
  font-size: 32px;
  color: #7c3aed;
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

.btn-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-header:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-header.btn-reportes {
  background: #7c3aed;
  color: white;
  border-color: #7c3aed;
}

.btn-header.btn-reportes:hover {
  background: #6d28d9;
  border-color: #6d28d9;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: white;
  border: 1px solid #fee2e2;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-logout:hover {
  background: #fef2f2;
  border-color: #fecaca;
}

/* Stats */
.stats-container {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
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

.stat-card.nuevas .stat-icon {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

.stat-card.en-proceso .stat-icon {
  background: linear-gradient(135deg, #f57c00 0%, #e65100 100%);
}

.stat-card.sin-asignar .stat-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.stat-card.cerradas .stat-icon {
  background: linear-gradient(135deg, #388e3c 0%, #2e7d32 100%);
}

.stat-card.resueltas .stat-icon {
  background: linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%);
}

.stat-card.rechazadas .stat-icon {
  background: linear-gradient(135deg, #c62828 0%, #b71c1c 100%);
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
  grid-template-columns: repeat(6, 1fr);
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

.solicitudes-table {
  width: 100%;
  border-collapse: collapse;
}

.solicitudes-table thead tr {
  background: #f9fafb;
}

.solicitudes-table th {
  padding: 12px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.solicitudes-table td {
  padding: 16px 12px;
  border-top: 1px solid #e5e7eb;
  font-size: 13px;
  color: #374151;
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
  background: #e0e7ff;
  color: #4338ca;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.sin-asignar-badge {
  display: inline-block;
  padding: 4px 10px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #7c3aed;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-action:hover {
  background: #6d28d9;
  transform: translateY(-1px);
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

@media (max-width: 1400px) {
  .stats-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1024px) {
  .filters-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
  }

  .filters-row {
    grid-template-columns: 1fr;
  }

  .stats-container {
    grid-template-columns: 1fr;
  }
}
</style>
