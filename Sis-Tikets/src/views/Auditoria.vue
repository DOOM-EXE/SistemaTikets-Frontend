<template>
  <div class="auditoria-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <button class="btn-back" @click="router.push('/panel-admin')">
          <i class="pi pi-arrow-left"></i>
        </button>
        <div class="header-info">
          <h1 class="header-title">Auditoria del Sistema</h1>
          <p class="header-subtitle">Registro detallado de acciones y cambios en el sistema</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->

      <div class="auditoria-content">
        <!-- Filters Section -->
        <div class="filters-container">
          <div class="filters-header">
            <i class="pi pi-filter"></i>
            <span class="filters-title">Filtros de Busqueda</span>
          </div>
          <div class="filters-row">
            <div class="filter-field">  
              <label>Usuario</label>
              <select v-model="filtros.idUsuario" class="filter-select">
                <option value="">Todos los usuarios</option>
                <option v-for="usuario in usuarios" :key="usuario.idUsuario" :value="usuario.idUsuario">
                  {{ usuario.nombreCompleto || usuario.username }}
                </option>
              </select>
            </div>
            <div class="filter-field">
              <label>Tipo de Accion</label>
              <select v-model="filtros.tipoAccion" class="filter-select">
                <option value="">Todas las acciones</option>
                <option value="Crear">Crear</option>
                <option value="Editar">Editar</option>
                <option value="Eliminar">Eliminar</option>
                <option value="Login">Login</option>
                <option value="Asignar">Asignar</option>
              </select>
            </div>
            <div class="filter-field">
              <label>Entidad Afectada</label>
              <select v-model="filtros.entidadAfectada" class="filter-select">
                <option value="">Todas las entidades</option>
                <option value="Solicitud">Solicitud</option>
                <option value="Usuario">Usuario</option>
                <option value="Comentario">Comentario</option>
                <option value="Encargado">Encargado</option>
                <option value="Area">Area</option>
                <option value="Catalogo">Catalogo</option>
              </select>
            </div>
          </div>
          <div class="filters-row">
            <div class="filter-field">
              <label>Fecha Inicio</label>
              <input 
                type="datetime-local" 
                v-model="filtros.fechaInicio" 
                class="filter-input" 
              />
            </div>
            <div class="filter-field">
              <label>Fecha Fin</label>
              <input 
                type="datetime-local" 
                v-model="filtros.fechaFin" 
                class="filter-input" 
              />
            </div>
            <!-- Filtro de registros por página eliminado -->
            <div class="filter-buttons">
              <button class="btn-generate" @click="filtros.pageNumber = 1; aplicarFiltros()">
                <i class="pi pi-search"></i>
                Buscar
              </button>
              <button class="btn-reset" @click="limpiarFiltros">
                <i class="pi pi-times"></i>
                Limpiar
              </button>
            </div>
          </div>
        </div>
        <!-- Stats Cards -->
        <div class="stats-container" v-if="stats">
          <div class="stat-card total">
            <div class="stat-icon">
              <i class="pi pi-list"></i>
            </div>
            <div class="stat-content">
              <span class="stat-label">Total Registros</span>
              <span class="stat-value">{{ stats.total }}</span>
            </div>
          </div>
          <div class="stat-card crear">
            <div class="stat-icon">
              <i class="pi pi-plus-circle"></i>
            </div>
            <div class="stat-content">
              <span class="stat-label">Crear</span>
              <span class="stat-value">{{ stats.crear }}</span>
            </div>
          </div>
          <div class="stat-card Editar">
            <div class="stat-icon">
              <i class="pi pi-pencil"></i>
            </div>
            <div class="stat-content">
                <span class="stat-label">Editar</span>
              <span class="stat-value">{{ stats.Editar }}</span>
            </div>
          </div>
          <div class="stat-card eliminar">
            <div class="stat-icon">
              <i class="pi pi-trash"></i>
            </div>
            <div class="stat-content">
              <span class="stat-label">Eliminar</span>
              <span class="stat-value">{{ stats.eliminar }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner"></i>
        <p>Cargando registros de auditoria...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <i class="pi pi-exclamation-triangle"></i>
        <h3>Error al cargar los datos</h3>
        <p>{{ error }}</p>
        <button class="btn-retry" @click="cargarAuditorias">
          <i class="pi pi-refresh"></i>
          Reintentar
        </button>
      </div>

      <!-- Table -->
      <div v-else class="table-container">
        <div class="table-header">
          <h3>Registros de Auditoria</h3>
          <span class="table-count">
            <template v-if="tieneFiltros">
              Vista: {{ paginatedAuditorias.length }} / {{ totalFiltradas }} registros
            </template>
            <template v-else>
              Total: {{ totalFiltradas }} registros
            </template>
          </span>
        </div>

        <!-- Empty State -->
        <div v-if="auditorias.length === 0" class="empty-state">
          <i class="pi pi-inbox"></i>
          <p>No hay registros de auditoria</p>
        </div>

        <!-- Table with data -->
        <div v-else class="table-wrapper">
          <table class="auditoria-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha y Hora</th>
                <th>Usuario</th>
                <th>Accion</th>
                <th>Entidad</th>
                <th>Descripcion</th>
                <th>IP</th>
                <th>Detalles</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="auditoria in paginatedAuditorias" :key="auditoria.idAuditoria">
                <td>{{ auditoria.idAuditoria }}</td>
                <td>{{ formatearFecha(auditoria.fechaHora) }}</td>
                <td>{{ auditoria.nombreUsuario }}</td>
                <td>
                  <span :class="['badge-accion', getBadgeClass(auditoria.tipoAccion)]">
                    {{ auditoria.tipoAccion }}
                  </span>
                </td>
                <td>{{ auditoria.entidadAfectada }}</td>
                <td class="td-descripcion">{{ auditoria.descripcion || '-' }}</td>
                <td>{{ auditoria.ipAddress || '-' }}</td>
                <td class="td-actions">
                  <button 
                    v-if="auditoria.detalles"
                    class="btn-icon-view"
                    @click="verDetalles(auditoria)"
                    title="Ver detalles"
                  >
                    <i class="pi pi-eye"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="paginatedAuditorias.length > 0 && totalPages > 1" class="pagination custom-pagination">
          <button 
            class="pagination-btn first-btn" 
            @click="goToFirstPageAndScroll"
            :disabled="filtros.pageNumber === 1"
            title="Primera página"
          >
            <i class="pi pi-angle-double-left"></i>
          </button>
          <button 
            class="pagination-btn prev-btn" 
            @click="previousPageAndScroll"
            :disabled="filtros.pageNumber === 1"
            title="Página anterior"
          >
            <i class="pi pi-angle-left"></i>
          </button>
          <button 
            v-for="page in visiblePages" 
            :key="page"
            :class="['pagination-btn', { active: page === filtros.pageNumber }]"
            @click="goToPageAndScroll(page)"
          >
            {{ page }}
          </button>
          <button 
            class="pagination-btn next-btn" 
            @click="nextPageAndScroll"
            :disabled="filtros.pageNumber === totalPages"
            title="Página siguiente"
          >
            <i class="pi pi-angle-right"></i>
          </button>
          <button 
            class="pagination-btn last-btn" 
            @click="goToLastPageAndScroll"
            :disabled="filtros.pageNumber === totalPages"
            title="Última página"
          >
            <i class="pi pi-angle-double-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Detalles -->
    <div v-if="showModal" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Detalles de Auditoria</h3>
          <button class="btn-close-modal" @click="cerrarModal">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="detail-row">
            <label>ID:</label>
            <span>{{ auditoriaSeleccionada?.idAuditoria }}</span>
          </div>
          <div class="detail-row">
            <label>Fecha y Hora:</label>
            <span>{{ formatearFecha(auditoriaSeleccionada?.fechaHora) }}</span>
          </div>
          <div class="detail-row">
            <label>Usuario:</label>
            <span>{{ auditoriaSeleccionada?.nombreUsuario }}</span>
          </div>
          <div class="detail-row">
            <label>Accion:</label>
            <span :class="['badge-accion', getBadgeClass(auditoriaSeleccionada?.tipoAccion)]">
              {{ auditoriaSeleccionada?.tipoAccion }}
            </span>
          </div>
          <div class="detail-row">
            <label>Entidad:</label>
            <span>{{ auditoriaSeleccionada?.entidadAfectada }}</span>
          </div>
          <div class="detail-row">
            <label>Descripcion:</label>
            <span>{{ auditoriaSeleccionada?.descripcion || '-' }}</span>
          </div>
          <div class="detail-row">
            <label>IP:</label>
            <span>{{ auditoriaSeleccionada?.ipAddress || '-' }}</span>
          </div>
          <div v-if="auditoriaSeleccionada?.detalles" class="detail-row full-width">
            <label>Detalles JSON:</label>
            <pre class="detalles-json">{{ formatearDetalles(auditoriaSeleccionada.detalles) }}</pre>
          </div>
        </div>
      </div>
    </div>

</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { auditoriaService } from '@/services/auditoriaService'

const router = useRouter()

// Estado
const auditorias = ref([])
const usuarios = ref([])
const loading = ref(false)
const error = ref(null)
const showModal = ref(false)
const auditoriaSeleccionada = ref(null)
const totalFiltradas = ref(0) // total de registros después de filtrar

// Filtros
const filtros = ref({
  idUsuario: '',
  tipoAccion: '',
  entidadAfectada: '',
  fechaInicio: '',
  fechaFin: '',
  pageNumber: 1,
  pageSize: 50
})

// Computed
const tieneFiltros = computed(() => {
  const { idUsuario, tipoAccion, entidadAfectada, fechaInicio, fechaFin } = filtros.value
  return Boolean(idUsuario || tipoAccion || entidadAfectada || fechaInicio || fechaFin)
})


const totalPages = computed(() => {
  if (!totalFiltradas.value) return 1
  return Math.max(1, Math.ceil(totalFiltradas.value / filtros.value.pageSize))
})

const paginatedAuditorias = computed(() => {
  const start = (filtros.value.pageNumber - 1) * filtros.value.pageSize
  const end = start + filtros.value.pageSize
  return auditorias.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = filtros.value.pageNumber

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
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

const stats = computed(() => {
  const auditoriasArray = Array.isArray(auditorias.value) ? auditorias.value : []
  if (auditoriasArray.length === 0) return null
  
  return {
    total: auditoriasArray.length,
    crear: auditoriasArray.filter(a => a.tipoAccion === 'Crear').length,
    Editar: auditoriasArray.filter(a => a.tipoAccion === 'Editar').length,
    eliminar: auditoriasArray.filter(a => a.tipoAccion === 'Eliminar').length
  }
})

// Métodos
const scrollToFirstRow = () => {
  // Esperar a que la tabla se renderice
  setTimeout(() => {
    const table = document.querySelector('.auditoria-table')
    if (table) {
      const firstRow = table.querySelector('tbody tr')
      if (firstRow) {
        // Calcular el offset para dejar visible el encabezado de la tabla
        const header = document.querySelector('.table-header')
        const headerRect = header ? header.getBoundingClientRect() : { bottom: 0 }
        const scrollY = window.scrollY + firstRow.getBoundingClientRect().top - (headerRect.bottom - headerRect.top) - 24
        window.scrollTo({ top: scrollY, behavior: 'smooth' })
      }
    }
  }, 50)
}

const goToPageAndScroll = (page) => {
  if (page < 1 || page > totalPages.value) return
  filtros.value.pageNumber = page
  scrollToFirstRow()
}

const nextPageAndScroll = () => {
  if (filtros.value.pageNumber < totalPages.value) {
    filtros.value.pageNumber++
    scrollToFirstRow()
  }
}

const previousPageAndScroll = () => {
  if (filtros.value.pageNumber > 1) {
    filtros.value.pageNumber--
    scrollToFirstRow()
  }
}

const goToFirstPageAndScroll = () => {
  filtros.value.pageNumber = 1
  scrollToFirstRow()
}

const goToLastPageAndScroll = () => {
  filtros.value.pageNumber = totalPages.value
  scrollToFirstRow()
}

const cargarAuditorias = async () => {
  loading.value = true
  error.value = null

  try {
    // Cargar todo sin paginar (el endpoint /Auditoria no acepta paginación)
    const response = await auditoriaService.getAll()
    auditorias.value = Array.isArray(response) ? response : []
    totalFiltradas.value = auditorias.value.length
    // Siempre resetear página a 1 cuando se cargan todos
    filtros.value.pageNumber = 1
  } catch (err) {
    error.value = err.message || 'Error al cargar las auditorias'
    console.error('Error cargando auditorias:', err)
  } finally {
    loading.value = false
  }
}

const cargarUsuarios = async () => {
  try {
    // Cargar usuarios sin paginación para el dropdown
    const data = await auditoriaService.getAll()
    if (Array.isArray(data)) {
      // Extraer usuarios unicos de los registros de auditoria
      const usuariosSet = new Map()
      data.forEach(auditoria => {
        if (auditoria.idUsuario && !usuariosSet.has(auditoria.idUsuario)) {
          usuariosSet.set(auditoria.idUsuario, {
            idUsuario: auditoria.idUsuario,
            nombreCompleto: auditoria.nombreUsuario,
            username: auditoria.nombreUsuario
          })
        }
      })
      usuarios.value = Array.from(usuariosSet.values())
    }
  } catch (err) {
    console.error('Error cargando usuarios:', err)
  }
}

const aplicarFiltros = async () => {
  loading.value = true
  error.value = null
  
  try {
    const { idUsuario, tipoAccion, entidadAfectada, fechaInicio, fechaFin, pageNumber, pageSize } = filtros.value

    // Si no hay filtros activos, usar el endpoint general
    if (!tieneFiltros.value) {
      await cargarAuditorias()
      return
    }

    // Formatear fechas correctamente (datetime-local a ISO)
    let fechaInicioFormateada = null
    let fechaFinFormateada = null
    
    if (fechaInicio) {
      const fecha = new Date(fechaInicio)
      fechaInicioFormateada = fecha.toISOString()
    }
    
    if (fechaFin) {
      const fecha = new Date(fechaFin)
      // Asegurar que incluya todo el día (hasta las 23:59:59)
      fecha.setHours(23, 59, 59, 999)
      fechaFinFormateada = fecha.toISOString()
    }

    // Preparar filtros para el API
    const filtrosFormateados = {
      idUsuario: idUsuario ? parseInt(idUsuario) : null,
      tipoAccion: tipoAccion || '',
      entidadAfectada: entidadAfectada || '',
      fechaInicio: fechaInicioFormateada,
      fechaFin: fechaFinFormateada,
      pageNumber: pageNumber,
      pageSize: pageSize
    }


    // siempre traer todos los registros y filtrar localmente si hay filtro de fecha
    let allData = []
    try {
      allData = await auditoriaService.getAll()
    } catch (e) {
      allData = []
    }
    allData = Array.isArray(allData) ? allData : []

    // Filtrado local
    let filtrados = allData
    if (idUsuario) {
      filtrados = filtrados.filter(a => String(a.idUsuario) === String(idUsuario))
    }
    if (tipoAccion) {
      filtrados = filtrados.filter(a => a.tipoAccion === tipoAccion)
    }
    if (entidadAfectada) {
      filtrados = filtrados.filter(a => a.entidadAfectada === entidadAfectada)
    }
    if (fechaInicioFormateada) {
      filtrados = filtrados.filter(a => new Date(a.fechaHora) >= new Date(fechaInicioFormateada))
    }
    if (fechaFinFormateada) {
      filtrados = filtrados.filter(a => new Date(a.fechaHora) <= new Date(fechaFinFormateada))
    }

    // Ordenar por fecha descendente si hay filtro de fecha
    if (fechaInicioFormateada || fechaFinFormateada) {
      filtrados = filtrados.slice().sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora))
    }

    totalFiltradas.value = filtrados.length
    auditorias.value = filtrados

    if (auditorias.value.length === 0 && pageNumber > 1) {
      filtros.value.pageNumber = 1
      await aplicarFiltros()
      return
    }

    // Mostrar mensaje si no hay resultados con filtros aplicados
    if (auditorias.value.length === 0 && (idUsuario || tipoAccion || entidadAfectada || fechaInicio || fechaFin)) {
      error.value = 'No se encontraron registros con los filtros aplicados'
    } else {
      error.value = null
    }
  } catch (err) {
    error.value = err.message || 'Error al filtrar auditorias'
    console.error('Error aplicando filtros:', err)
    auditorias.value = []
  } finally {
    loading.value = false
  }
}


const limpiarFiltros = () => {
  filtros.value = {
    idUsuario: '',
    tipoAccion: '',
    entidadAfectada: '',
    fechaInicio: '',
    fechaFin: '',
    pageNumber: 1,
    pageSize: 50
  }
  cargarAuditorias()
}

const formatearFecha = (fecha) => {
  if (!fecha) return '-'
  const date = new Date(fecha)
  return date.toLocaleString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getBadgeClass = (tipoAccion) => {
  const clases = {
    'Crear': 'badge-crear',
    'Editar': 'badge-Editar',
    'Eliminar': 'badge-eliminar',
    'Login': 'badge-login',
    'Asignar': 'badge-asignar',
  }
  return clases[tipoAccion] || 'badge-default'
}

const verDetalles = (auditoria) => {
  auditoriaSeleccionada.value = auditoria
  showModal.value = true
}

const cerrarModal = () => {
  showModal.value = false
  auditoriaSeleccionada.value = null
}

const formatearDetalles = (detalles) => {
  if (typeof detalles === 'string') {
    try {
      return JSON.stringify(JSON.parse(detalles), null, 2)
    } catch {
      return detalles
    }
  }
  return JSON.stringify(detalles, null, 2)
}

// Lifecycle
onMounted(() => {
  cargarAuditorias()
  cargarUsuarios()
})
</script>

<style scoped>
.auditoria-container {
  width: 100%;
  min-height: 100vh;
  background: #F9FAFB;
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
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  color: #374151;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: #e5e7eb;
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

/* Content */
.auditoria-content {
  padding: 0 30px 30px;
  max-width: 1600px;
  margin: 0 auto;
}

/* Filters */
.filters-container {
  background: white;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 0px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filters-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.filters-header i {
  color: #7c3aed;
  font-size: 18px;
}

.filters-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.filters-row:last-child {
  margin-bottom: 0;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 10px;
}

.filter-field label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.filter-input,
.filter-select {
  padding: 10px 122px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.filter-input:focus,
.filter-select:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.btn-generate {

  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #7c3aed;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-generate:hover {
  background: #6d28d9;
}

.btn-reset {
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-reset:hover {
  background: #4b5563;
}

/* Stats */
.stats-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  margin-top: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  color: white;
}

.stat-card.total .stat-icon {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
}

.stat-card.crear .stat-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-card.Editar .stat-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-card.eliminar .stat-icon {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
  color: #1a1a1a;
  font-weight: 700;
}

/* Loading/Error States */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-state i,
.error-state i,
.empty-state i {
  font-size: 48px;
}

.loading-state i {
  color: #7c3aed;
}

.error-state i {
  color: #ef4444;
}

.empty-state i {
  color: #d1d5db;
}

.error-state h3,
.empty-state h3 {
  font-size: 18px;
  color: #1a1a1a;
  margin: 0;
}

.error-state p,
.empty-state p {
  color: #6b7280;
  margin: 0;
  font-size: 14px;
}

.btn-retry {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #7c3aed;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-retry:hover {
  background: #6d28d9;
}

/* Table */
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.table-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.table-count {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.table-wrapper {
  overflow-x: auto;
}

.auditoria-table {
  width: 100%;
  border-collapse: collapse;
}

.auditoria-table thead {
  background: #f9fafb;
}

.auditoria-table th {
  padding: 14px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.auditoria-table td {
  padding: 14px 16px;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #f0f0f0;
}

.auditoria-table tbody tr:hover {
  background: #f9fafb;
}

.td-descripcion {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.td-actions {
  text-align: center;
}

.badge-accion {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-crear {
  background: #d1fae5;
  color: #065f46;
}

.badge-Editar {
  background: #dbeafe;
  color: #1e40af;
}

.badge-eliminar {
  background: #fee2e2;
  color: #991b1b;
}

.badge-login {
  background: #e0e7ff;
  color: #3730a3;
}

.badge-asignar {
  background: #fef3c7;
  color: #92400e;
}

.badge-default {
  background: #e5e7eb;
  color: #374151;
}

.btn-icon-view {
  background: transparent;
  border: none;
  color: #7c3aed;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon-view:hover {
  color: #6d28d9;
  transform: scale(1.1);
}

/* Pagination (PanelAdmin style) */
/* Paginación personalizada */
.custom-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
}

.custom-pagination .pagination-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border-radius: 50%;
  background: #f3f4f6;
  color: #7c3aed;
  font-weight: 700;
  border: none;
  font-size: 16px;
  box-shadow: 0 1px 2px rgba(124,58,237,0.04);
  transition: background 0.2s, color 0.2s, transform 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-pagination .pagination-btn.active {
  background: #7c3aed;
  color: #fff;
  transform: scale(1.08);
}

.custom-pagination .pagination-btn:disabled {
  background: #e5e7eb;
  color: #bdbdbd;
  cursor: not-allowed;
}

.custom-pagination .pagination-btn:not(:disabled):hover {
  background: #ede9fe;
  color: #5b21b6;
  transform: scale(1.05);
}

.custom-pagination .pagination-btn i {
  font-size: 18px;
  vertical-align: middle;
}

.custom-pagination .first-btn,
.custom-pagination .last-btn {
  background: #ede9fe;
  color: #7c3aed;
}

.custom-pagination .first-btn:disabled,
.custom-pagination .last-btn:disabled {
  background: #e5e7eb;
  color: #bdbdbd;
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
  max-width: 600px;
  width: 100%;
  max-height: 85vh;
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

.btn-close-modal {
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.btn-close-modal:hover {
  background: #f3f4f6;
  color: #1a1a1a;
}

.modal-body {
  padding: 24px;
}

.detail-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.detail-row:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.detail-row.full-width {
  flex-direction: column;
}

.detail-row label {
  font-weight: 600;
  color: #374151;
  min-width: 130px;
}

.detail-row span {
  color: #1a1a1a;
  word-break: break-word;
}

.detalles-json {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  overflow-x: auto;
  margin: 0;
  color: #374151;
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .filters-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-container {
    grid-template-columns: 1fr;
  }

  .page-header {
    padding: 16px 20px;
  }

  .auditoria-content {
    padding: 0 20px 20px;
  }

  .table-wrapper {
    overflow-x: scroll;
  }

  .pagination-container {
    flex-direction: column;
    gap: 16px;
    padding: 16px 20px;
  }

  .modal-content {
    margin: 20px;
  }
}

@media (max-width: 480px) {
  .filters-row {
    grid-template-columns: 1fr;
  }

  .header-title {
    font-size: 18px;
  }

  .stat-value {
    font-size: 22px;
  }
}
</style>

