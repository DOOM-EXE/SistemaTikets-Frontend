<template>
  <div class="panel-container">
    <!-- Header -->
    <PageHeader title="Panel de solicitante" @logout="handleLogout" />

    <!-- Main Content -->
    <div class="panel-content">
      <!-- Create Button -->
      <button class="btn-create" @click="router.push('/crear-solicitud')">
        <i class="pi pi-plus"></i>
        Crear Nueva Solicitud
      </button>

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
              <select v-model="filters.estado" class="filter-select">
                <option value="">Todos</option>
                <option value="nuevo">Nuevo</option>
                <option value="en-proceso">En proceso</option>
                <option value="cerrada">Cerrada</option>
                <option value="resuelto">Resuelto</option>
              </select>
            </div>

            <div class="filter-field">
              <label>Prioridad</label>
              <select v-model="filters.prioridad" class="filter-select">
                <option value="">Todos</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
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
              v-model="searchQuery" 
              class="search-input" 
              placeholder="Buscar por asunto o número"
            />
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="table-container">
        <div class="table-header">
          <h2>Mis solicitudes</h2>
          <span class="table-count">Total: {{ solicitudes.length }} solicitudes</span>
        </div>

        <!-- Empty State -->
        <div v-if="solicitudes.length === 0" class="empty-state">
          <i class="pi pi-inbox"></i>
          <h3>Usted no tiene solicitudes</h3>
          <p>Comience creando una nueva solicitud haciendo clic en el botón superior</p>
        </div>

        <!-- Table with data -->
        <template v-else>
          <div class="table-wrapper">
            <table class="solicitudes-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Área</th>
                  <th>Tipo</th>
                  <th>Asunto</th>
                  <th>Estado</th>
                  <th>Prioridad</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="solicitud in paginatedSolicitudes" :key="solicitud.id">
                  <td>{{ solicitud.codigo || solicitud.numero }}</td>
                  <td>{{ solicitud.area }}</td>
                  <td>{{ solicitud.tipo }}</td>
                  <td>{{ solicitud.asunto }}</td>
                  <td>
                    <EstadoBadge :estado="solicitud.estado" />
                  </td>
                  <td>
                    <PrioridadBadge :prioridad="solicitud.prioridad" />
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

          <!-- Pagination -->
          <div class="pagination">
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
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ticketService, authService } from '@/services'
import PageHeader from '@/components/layout/PageHeader.vue'
import EstadoBadge from '@/components/ticket/EstadoBadge.vue'
import PrioridadBadge from '@/components/ticket/PrioridadBadge.vue'

const router = useRouter()
const showFilters = ref(true)
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 9
const solicitudes = ref([])
const loading = ref(false)

const filters = ref({
  estado: '',
  prioridad: '',
  fechaDesde: '',
  fechaHasta: ''
})

const handleLogout = () => {
  authService.logout()
  router.push('/login')
}

const loadTickets = async () => {
  loading.value = true
  try {
    const tickets = await ticketService.getTickets({
      estado: filters.value.estado,
      prioridad: filters.value.prioridad,
      search: searchQuery.value
    })
    solicitudes.value = tickets
  } catch (error) {
    console.error('Error cargando tickets:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTickets()
})

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const formatEstado = (estado) => {
  const map = {
    'nuevo': 'Nuevo',
    'en-proceso': 'En proceso',
    'cerrada': 'Cerrada',
    'resuelto': 'Resuelto'
  }
  return map[estado] || estado
}

const formatPrioridad = (prioridad) => {
  const map = {
    'alta': 'Alta',
    'media': 'Media',
    'baja': 'Baja'
  }
  return map[prioridad] || prioridad
}

const totalPages = computed(() => Math.ceil(solicitudes.value.length / itemsPerPage))

const paginatedSolicitudes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
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
      pages.push(1, 2, 3, 4, 5, '...', total)
    } else if (current >= total - 2) {
      pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total)
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }
  
  return pages
})

const goToPage = (page) => {
  if (typeof page === 'number') {
    currentPage.value = page
  }
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

const verSolicitud = (id) => {
  router.push(`/solicitud/${id}`)
}
</script>

<style scoped>
.panel-container {
  width: 100%;
  min-height: 100vh;
  background: #F9FAFB;
  padding: 20px;
}

.panel-content {
  max-width: 1400px;
  margin: 0 auto;
}

.btn-create {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #4F39F6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.btn-create:hover {
  background: #3d2bc4;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 57, 246, 0.3);
}

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

.filters-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
  color: #333;
}

.filter-select,
.filter-input {
  padding: 8px 12px;
  border: 1px solid #d1d1d1;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
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
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #d1d1d1;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #4F39F6;
  box-shadow: 0 0 0 3px rgba(79, 57, 246, 0.1);
}

.table-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.table-count {
  font-size: 14px;
  color: #666;
}

.table-wrapper {
  overflow-x: auto;
}

.solicitudes-table {
  width: 100%;
  border-collapse: collapse;
}

.solicitudes-table thead {
  background: #f8f9fa;
}

.solicitudes-table th {
  padding: 12px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
}

.solicitudes-table td {
  padding: 14px 12px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.solicitudes-table tbody tr:hover {
  background: #f8f9fa;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: none;
  color: #4F39F6;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-action:hover {
  background: #f0f0ff;
  border-radius: 4px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.pagination-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  background: white;
  border: 1px solid #d1d1d1;
  border-radius: 4px;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #4F39F6;
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #9ca3af;
}

.empty-state i {
  font-size: 64px;
  color: #d1d5db;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
}

@media (max-width: 1024px) {
  .filters-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .filters-row {
    grid-template-columns: 1fr;
  }
  
  .table-wrapper {
    overflow-x: scroll;
  }
}
</style>
