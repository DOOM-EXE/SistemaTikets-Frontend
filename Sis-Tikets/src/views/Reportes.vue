<template>
  <div class="reportes-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <button class="btn-back" @click="router.push('/panel-admin')">
          <i class="pi pi-arrow-left"></i>
        </button>
        <div class="header-info">
          <h1 class="header-title">Reportes y Estadísticas</h1>
          <p class="header-subtitle">Análisis detallado de solicitudes del sistema</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="reportes-content">
      <!-- Stats Cards -->
      <div class="stats-container" v-if="resumenGeneral">
        <div class="stat-card total">
          <div class="stat-icon">
            <i class="pi pi-chart-bar"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Total Solicitudes</span>
            <span class="stat-value">{{ resumenGeneral.total }}</span>
          </div>
        </div>

        <div class="stat-card pendientes">
          <div class="stat-icon">
            <i class="pi pi-clock"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Pendientes</span>
            <span class="stat-value">{{ resumenGeneral.nuevas + resumenGeneral.enProceso }}</span>
          </div>
        </div>

        <div class="stat-card completadas">
          <div class="stat-icon">
            <i class="pi pi-check-circle"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Completadas</span>
            <span class="stat-value">{{ resumenGeneral.resueltas + resumenGeneral.cerradas }}</span>
          </div>
        </div>

        <div class="stat-card eficiencia">
          <div class="stat-icon">
            <i class="pi pi-chart-line"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Eficiencia</span>
            <span class="stat-value">{{ calcularEficiencia() }}%</span>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-container">
        <div class="filters-header">
          <i class="pi pi-filter"></i>
          <span class="filters-title">Filtros de Búsqueda</span>
        </div>
        
        <div class="filters-content">
          <div class="filters-row">
            <div class="filter-field">
              <label>Fecha Desde</label>
              <input type="date" v-model="filters.fechaDesde" class="filter-input" />
            </div>

            <div class="filter-field">
              <label>Fecha Hasta</label>
              <input type="date" v-model="filters.fechaHasta" class="filter-input" />
            </div>

            <div class="filter-field">
              <label>Área</label>
              <select v-model="filters.idArea" class="filter-select">
                <option value="">Todas las áreas</option>
                <option v-for="area in areas" :key="area.idArea" :value="area.idArea">
                  {{ area.nombre }}
                </option>
              </select>
            </div>

            <div class="filter-field">
              <button class="btn-generate" @click="generarReporte">
                <i class="pi pi-refresh"></i>
                Generar Reporte
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs Section -->
      <div class="tabs-container">
        <div class="tabs-header">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            :class="['tab-btn', { active: activeTab === tab.id }]"
            @click="cambiarTab(tab.id)"
          >
            <i :class="tab.icon"></i>
            {{ tab.label }}
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <i class="pi pi-spin pi-spinner"></i>
          <p>Generando reporte...</p>
        </div>

        <!-- Actions Bar -->
        <div v-if="!loading && activeTab !== 'general' && datosReporte.length > 0" class="actions-bar">
          <div class="actions-left">
            <i class="pi pi-info-circle"></i>
            <span>{{ datosReporte.length }} registros encontrados</span>
          </div>
          <div class="actions-right">
            <button class="btn-action-export" @click="exportarReporte">
              <i class="pi pi-file-excel"></i>
              <span>Exportar a Excel</span>
            </button>
          </div>
        </div>

        <!-- Content Tabs -->
        <div v-if="!loading" class="tab-content">
          <!-- Reporte por Gestor -->
          <div v-if="activeTab === 'gestor'" class="report-section">
            <div class="table-header">
              <h3>Solicitudes por Gestor</h3>
              <span class="table-count">{{ datosReporte.length }} gestores</span>
            </div>
            <div class="table-wrapper" v-if="datosReporte.length">
              <table class="report-table">
                <thead>
                  <tr>
                    <th>Gestor</th>
                    <th>Área</th>
                    <th>Total</th>
                    <th>Nuevas</th>
                    <th>En Proceso</th>
                    <th>Cerradas</th>
                    <th>Resueltas</th>
                    <th>Rechazadas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in datosReporte" :key="item.idGestor || 'sin-asignar'">
                    <td><strong>{{ item.nombre }}</strong></td>
                    <td>{{ item.area }}</td>
                    <td><span class="badge-total">{{ item.total }}</span></td>
                    <td><span class="badge-nuevas">{{ item.nuevas }}</span></td>
                    <td><span class="badge-proceso">{{ item.enProceso }}</span></td>
                    <td><span class="badge-cerradas">{{ item.cerradas }}</span></td>
                    <td><span class="badge-resueltas">{{ item.resueltas }}</span></td>
                    <td><span class="badge-rechazadas">{{ item.rechazadas }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="empty-state">
              <i class="pi pi-inbox"></i>
              <p>No hay datos para mostrar</p>
            </div>
          </div>

          <!-- Reporte por Área -->
          <div v-if="activeTab === 'area'" class="report-section">
            <div class="table-header">
              <h3>Solicitudes por Área</h3>
              <span class="table-count">{{ datosReporte.length }} áreas</span>
            </div>
            <div class="table-wrapper" v-if="datosReporte.length">
              <table class="report-table">
                <thead>
                  <tr>
                    <th>Área</th>
                    <th>Total</th>
                    <th>Asignadas</th>
                    <th>Sin Asignar</th>
                    <th>Nuevas</th>
                    <th>En Proceso</th>
                    <th>Cerradas</th>
                    <th>Resueltas</th>
                    <th>Rechazadas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in datosReporte" :key="item.idArea || 'sin-area'">
                    <td><strong>{{ item.nombre }}</strong></td>
                    <td><span class="badge-total">{{ item.total }}</span></td>
                    <td><span class="badge-asignadas">{{ item.asignadas }}</span></td>
                    <td><span class="badge-sin-asignar">{{ item.sinAsignar }}</span></td>
                    <td><span class="badge-nuevas">{{ item.nuevas }}</span></td>
                    <td><span class="badge-proceso">{{ item.enProceso }}</span></td>
                    <td><span class="badge-cerradas">{{ item.cerradas }}</span></td>
                    <td><span class="badge-resueltas">{{ item.resueltas }}</span></td>
                    <td><span class="badge-rechazadas">{{ item.rechazadas }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="empty-state">
              <i class="pi pi-inbox"></i>
              <p>No hay datos para mostrar</p>
            </div>
          </div>

          <!-- Reporte por Estado -->
          <div v-if="activeTab === 'estado'" class="report-section">
            <div class="table-header">
              <h3>Solicitudes por Estado</h3>
              <span class="table-count">{{ datosReporte.length }} estados</span>
            </div>
            <div class="table-wrapper" v-if="datosReporte.length">
              <table class="report-table compact">
                <thead>
                  <tr>
                    <th>Estado</th>
                    <th>Cantidad</th>
                    <th>Porcentaje</th>
                    <th>Visualización</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in datosReporte" :key="item.estado">
                    <td><strong>{{ item.estado }}</strong></td>
                    <td><span class="badge-total">{{ item.cantidad }}</span></td>
                    <td>{{ item.porcentaje }}%</td>
                    <td>
                      <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: item.porcentaje + '%' }"></div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="empty-state">
              <i class="pi pi-inbox"></i>
              <p>No hay datos para mostrar</p>
            </div>
          </div>

          <!-- Reporte por Prioridad -->
          <div v-if="activeTab === 'prioridad'" class="report-section">
            <div class="table-header">
              <h3>Solicitudes por Prioridad</h3>
              <span class="table-count">{{ datosReporte.length }} prioridades</span>
            </div>
            <div class="table-wrapper" v-if="datosReporte.length">
              <table class="report-table compact">
                <thead>
                  <tr>
                    <th>Prioridad</th>
                    <th>Cantidad</th>
                    <th>Porcentaje</th>
                    <th>Visualización</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in datosReporte" :key="item.prioridad">
                    <td><strong>{{ item.prioridad }}</strong></td>
                    <td><span class="badge-total">{{ item.cantidad }}</span></td>
                    <td>{{ item.porcentaje }}%</td>
                    <td>
                      <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: item.porcentaje + '%' }"></div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="empty-state">
              <i class="pi pi-inbox"></i>
              <p>No hay datos para mostrar</p>
            </div>
          </div>

          <!-- Reporte por Tipo -->
          <div v-if="activeTab === 'tipo'" class="report-section">
            <div class="table-header">
              <h3>Solicitudes por Tipo</h3>
              <span class="table-count">{{ datosReporte.length }} tipos</span>
            </div>
            <div class="table-wrapper" v-if="datosReporte.length">
              <table class="report-table compact">
                <thead>
                  <tr>
                    <th>Tipo de Solicitud</th>
                    <th>Cantidad</th>
                    <th>Área más Frecuente</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in datosReporte" :key="item.tipo">
                    <td><strong>{{ item.tipo }}</strong></td>
                    <td><span class="badge-total">{{ item.cantidad }}</span></td>
                    <td>{{ item.areaMasFrecuente }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="empty-state">
              <i class="pi pi-inbox"></i>
              <p>No hay datos para mostrar</p>
            </div>
          </div>

          <!-- Reporte General -->
          <div v-if="activeTab === 'general'" class="report-section">
            <div class="table-header">
              <div>
                <h3>Reporte General del Sistema</h3>
                <span class="table-count">Vista completa de todas las métricas</span>
              </div>
              <button class="btn-export-general" @click="exportarReporteGeneral" :disabled="!resumenGeneral">
                <i class="pi pi-file-excel"></i>
                <span>Exportar Reporte Completo</span>
              </button>
            </div>
            
            <div class="general-report" v-if="resumenGeneral">
              <!-- Sección de Estados -->
              <div class="report-category">
                <h4 class="category-title">
                  <i class="pi pi-flag"></i>
                  Por Estado
                </h4>
                <div class="category-grid">
                  <div class="metric-card">
                    <span class="metric-label">Nuevas</span>
                    <span class="metric-value badge-nuevas">{{ resumenGeneral.nuevas }}</span>
                    <span class="metric-percent">{{ calcularPorcentaje(resumenGeneral.nuevas) }}%</span>
                  </div>
                  <div class="metric-card">
                    <span class="metric-label">En Proceso</span>
                    <span class="metric-value badge-proceso">{{ resumenGeneral.enProceso }}</span>
                    <span class="metric-percent">{{ calcularPorcentaje(resumenGeneral.enProceso) }}%</span>
                  </div>
                  <div class="metric-card">
                    <span class="metric-label">Cerradas</span>
                    <span class="metric-value badge-cerradas">{{ resumenGeneral.cerradas }}</span>
                    <span class="metric-percent">{{ calcularPorcentaje(resumenGeneral.cerradas) }}%</span>
                  </div>
                  <div class="metric-card">
                    <span class="metric-label">Resueltas</span>
                    <span class="metric-value badge-resueltas">{{ resumenGeneral.resueltas }}</span>
                    <span class="metric-percent">{{ calcularPorcentaje(resumenGeneral.resueltas) }}%</span>
                  </div>
                  <div class="metric-card">
                    <span class="metric-label">Rechazadas</span>
                    <span class="metric-value badge-rechazadas">{{ resumenGeneral.rechazadas }}</span>
                    <span class="metric-percent">{{ calcularPorcentaje(resumenGeneral.rechazadas) }}%</span>
                  </div>
                </div>
              </div>

              <!-- Sección de Asignación -->
              <div class="report-category">
                <h4 class="category-title">
                  <i class="pi pi-users"></i>
                  Por Asignación
                </h4>
                <div class="category-grid cols-2">
                  <div class="metric-card">
                    <span class="metric-label">Asignadas</span>
                    <span class="metric-value badge-asignadas">{{ resumenGeneral.asignadas }}</span>
                    <span class="metric-percent">{{ calcularPorcentaje(resumenGeneral.asignadas) }}%</span>
                  </div>
                  <div class="metric-card">
                    <span class="metric-label">Sin Asignar</span>
                    <span class="metric-value badge-sin-asignar">{{ resumenGeneral.sinAsignar }}</span>
                    <span class="metric-percent">{{ calcularPorcentaje(resumenGeneral.sinAsignar) }}%</span>
                  </div>
                </div>
              </div>

              <!-- Sección de Prioridad -->
              <div class="report-category">
                <h4 class="category-title">
                  <i class="pi pi-exclamation-triangle"></i>
                  Por Prioridad
                </h4>
                <div class="category-grid">
                  <div class="metric-card">
                    <span class="metric-label">Alta</span>
                    <span class="metric-value badge-total">{{ resumenGeneral.prioridadAlta }}</span>
                    <span class="metric-percent">{{ calcularPorcentaje(resumenGeneral.prioridadAlta) }}%</span>
                  </div>
                  <div class="metric-card">
                    <span class="metric-label">Media</span>
                    <span class="metric-value badge-total">{{ resumenGeneral.prioridadMedia }}</span>
                    <span class="metric-percent">{{ calcularPorcentaje(resumenGeneral.prioridadMedia) }}%</span>
                  </div>
                  <div class="metric-card">
                    <span class="metric-label">Baja</span>
                    <span class="metric-value badge-total">{{ resumenGeneral.prioridadBaja }}</span>
                    <span class="metric-percent">{{ calcularPorcentaje(resumenGeneral.prioridadBaja) }}%</span>
                  </div>
                </div>
              </div>

              <!-- Sección de Resumen -->
              <div class="report-category">
                <h4 class="category-title">
                  <i class="pi pi-chart-bar"></i>
                  Resumen
                </h4>
                <div class="summary-cards">
                  <div class="summary-card total">
                    <div class="summary-icon">
                      <i class="pi pi-file"></i>
                    </div>
                    <div class="summary-content">
                      <span class="summary-label">Total de Solicitudes</span>
                      <span class="summary-value">{{ resumenGeneral.total }}</span>
                    </div>
                  </div>
                  <div class="summary-card pending">
                    <div class="summary-icon">
                      <i class="pi pi-clock"></i>
                    </div>
                    <div class="summary-content">
                      <span class="summary-label">Pendientes</span>
                      <span class="summary-value">{{ resumenGeneral.nuevas + resumenGeneral.enProceso }}</span>
                    </div>
                  </div>
                  <div class="summary-card completed">
                    <div class="summary-icon">
                      <i class="pi pi-check-circle"></i>
                    </div>
                    <div class="summary-content">
                      <span class="summary-label">Completadas</span>
                      <span class="summary-value">{{ resumenGeneral.resueltas + resumenGeneral.cerradas }}</span>
                    </div>
                  </div>
                  <div class="summary-card efficiency">
                    <div class="summary-icon">
                      <i class="pi pi-chart-line"></i>
                    </div>
                    <div class="summary-content">
                      <span class="summary-label">Eficiencia</span>
                      <span class="summary-value">{{ calcularEficiencia() }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { catalogoService } from '@/services'
import reporteService from '@/services/reporteService'
import { exportToExcel, formatDataForExport, generateFileName } from '@/utils/excelExport'

const router = useRouter()
const loading = ref(false)
const activeTab = ref('general')
const datosReporte = ref([])
const resumenGeneral = ref(null)
const areas = ref([])

const filters = ref({
  fechaDesde: '',
  fechaHasta: '',
  idArea: ''
})

const tabs = [
  { id: 'general', label: 'Reporte General', icon: 'pi pi-chart-bar' },
  { id: 'gestor', label: 'Por Gestor', icon: 'pi pi-user' },
  { id: 'area', label: 'Por Área', icon: 'pi pi-building' },
  { id: 'estado', label: 'Por Estado', icon: 'pi pi-flag' },
  { id: 'prioridad', label: 'Por Prioridad', icon: 'pi pi-exclamation-triangle' },
  { id: 'tipo', label: 'Por Tipo', icon: 'pi pi-tag' }
]

const cambiarTab = async (tabId) => {
  activeTab.value = tabId
  await cargarDatosReporte()
}

const generarReporte = async () => {
  await cargarResumenGeneral()
  await cargarDatosReporte()
}

const cargarResumenGeneral = async () => {
  try {
    loading.value = true
    resumenGeneral.value = await reporteService.getResumenGeneral(
      filters.value.fechaDesde || null,
      filters.value.fechaHasta || null
    )
  } catch (error) {
    console.error('Error cargando resumen general:', error)
  } finally {
    loading.value = false
  }
}

const cargarDatosReporte = async () => {
  try {
    loading.value = true
    
    const fechaDesde = filters.value.fechaDesde || null
    const fechaHasta = filters.value.fechaHasta || null
    const idArea = filters.value.idArea || null

    switch (activeTab.value) {
      case 'gestor':
        datosReporte.value = await reporteService.getReportePorGestor(fechaDesde, fechaHasta, idArea)
        break
      case 'area':
        datosReporte.value = await reporteService.getReportePorArea(fechaDesde, fechaHasta)
        break
      case 'estado':
        datosReporte.value = await reporteService.getReportePorEstado(fechaDesde, fechaHasta)
        break
      case 'prioridad':
        datosReporte.value = await reporteService.getReportePorPrioridad(fechaDesde, fechaHasta)
        break
      case 'tipo':
        datosReporte.value = await reporteService.getReportePorTipo(fechaDesde, fechaHasta)
        break
    }
  } catch (error) {
    console.error('Error cargando datos del reporte:', error)
    alert('Error al cargar los datos del reporte')
  } finally {
    loading.value = false
  }
}

const exportarReporte = () => {
  if (!datosReporte.value.length) return

  let dataToExport = []
  let fileName = ''
  let headers = {}

  switch (activeTab.value) {
    case 'gestor':
      headers = {
        nombre: 'Gestor',
        area: 'Área',
        total: 'Total',
        nuevas: 'Nuevas',
        enProceso: 'En Proceso',
        cerradas: 'Cerradas',
        resueltas: 'Resueltas',
        rechazadas: 'Rechazadas'
      }
      fileName = generateFileName('Reporte_Por_Gestor')
      break
    case 'area':
      headers = {
        nombre: 'Área',
        total: 'Total',
        asignadas: 'Asignadas',
        sinAsignar: 'Sin Asignar',
        nuevas: 'Nuevas',
        enProceso: 'En Proceso',
        cerradas: 'Cerradas',
        resueltas: 'Resueltas',
        rechazadas: 'Rechazadas'
      }
      fileName = generateFileName('Reporte_Por_Area')
      break
    case 'estado':
      headers = {
        estado: 'Estado',
        cantidad: 'Cantidad',
        porcentaje: 'Porcentaje (%)'
      }
      fileName = generateFileName('Reporte_Por_Estado')
      break
    case 'prioridad':
      headers = {
        prioridad: 'Prioridad',
        cantidad: 'Cantidad',
        porcentaje: 'Porcentaje (%)'
      }
      fileName = generateFileName('Reporte_Por_Prioridad')
      break
    case 'tipo':
      headers = {
        tipo: 'Tipo de Solicitud',
        cantidad: 'Cantidad',
        areaMasFrecuente: 'Área más Frecuente'
      }
      fileName = generateFileName('Reporte_Por_Tipo')
      break
  }

  dataToExport = formatDataForExport(datosReporte.value, headers)
  
  const success = exportToExcel(dataToExport, fileName, 'Reporte')
  
  if (success) {
    alert('Reporte exportado exitosamente')
  } else {
    alert('Error al exportar el reporte')
  }
}

const exportarReporteGeneral = async () => {
  if (!resumenGeneral.value) return

  try {
    loading.value = true
    
    // Obtener todos los datos para las 5 tablas
    const fechaDesde = filters.value.fechaDesde || null
    const fechaHasta = filters.value.fechaHasta || null
    const idArea = filters.value.idArea || null

    const [gestorData, areaData, estadoData, prioridadData, tipoData] = await Promise.all([
      reporteService.getReportePorGestor(fechaDesde, fechaHasta, idArea),
      reporteService.getReportePorArea(fechaDesde, fechaHasta),
      reporteService.getReportePorEstado(fechaDesde, fechaHasta),
      reporteService.getReportePorPrioridad(fechaDesde, fechaHasta),
      reporteService.getReportePorTipo(fechaDesde, fechaHasta)
    ])

    // Formatear datos para cada hoja
    const sheets = [
      {
        data: formatDataForExport(gestorData, {
          nombre: 'Gestor',
          area: 'Área',
          total: 'Total',
          nuevas: 'Nuevas',
          enProceso: 'En Proceso',
          cerradas: 'Cerradas',
          resueltas: 'Resueltas',
          rechazadas: 'Rechazadas'
        }),
        sheetName: 'Por Gestor'
      },
      {
        data: formatDataForExport(areaData, {
          nombre: 'Área',
          total: 'Total',
          asignadas: 'Asignadas',
          sinAsignar: 'Sin Asignar',
          nuevas: 'Nuevas',
          enProceso: 'En Proceso',
          cerradas: 'Cerradas',
          resueltas: 'Resueltas',
          rechazadas: 'Rechazadas'
        }),
        sheetName: 'Por Área'
      },
      {
        data: formatDataForExport(estadoData, {
          estado: 'Estado',
          cantidad: 'Cantidad',
          porcentaje: 'Porcentaje (%)'
        }),
        sheetName: 'Por Estado'
      },
      {
        data: formatDataForExport(prioridadData, {
          prioridad: 'Prioridad',
          cantidad: 'Cantidad',
          porcentaje: 'Porcentaje (%)'
        }),
        sheetName: 'Por Prioridad'
      },
      {
        data: formatDataForExport(tipoData, {
          tipo: 'Tipo de Solicitud',
          cantidad: 'Cantidad',
          areaMasFrecuente: 'Área más Frecuente'
        }),
        sheetName: 'Por Tipo'
      }
    ]

    const fileName = generateFileName('Reporte_General_Completo')
    const { exportMultipleSheets } = await import('@/utils/excelExport')
    const success = exportMultipleSheets(sheets, fileName)

    if (success) {
      alert('Reporte general exportado exitosamente con 5 hojas')
    } else {
      alert('Error al exportar el reporte general')
    }
  } catch (error) {
    console.error('Error exportando reporte general:', error)
    alert('Error al generar el reporte general')
  } finally {
    loading.value = false
  }
}

const calcularEficiencia = () => {
  if (!resumenGeneral.value || resumenGeneral.value.total === 0) return 0
  const completadas = resumenGeneral.value.resueltas + resumenGeneral.value.cerradas
  return ((completadas / resumenGeneral.value.total) * 100).toFixed(1)
}

const calcularPorcentaje = (cantidad) => {
  if (!resumenGeneral.value || resumenGeneral.value.total === 0) return 0
  return ((cantidad / resumenGeneral.value.total) * 100).toFixed(1)
}

const loadCatalogos = async () => {
  try {
    areas.value = await catalogoService.getAreas()
  } catch (error) {
    console.error('Error cargando catálogos:', error)
  }
}

onMounted(async () => {
  await loadCatalogos()
  await generarReporte()
})
</script>

<style scoped>
.reportes-container {
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
.reportes-content {
  padding: 0 30px 30px;
  max-width: 1600px;
  margin: 0 auto;
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

.stat-card.pendientes .stat-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-card.completadas .stat-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-card.eficiencia .stat-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
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

/* Filters */
.filters-container {
  background: white;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 30px;
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

.filter-input,
.filter-select {
  padding: 10px 12px;
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
  width: 100%;
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
  margin-top: auto;
}

.btn-generate:hover {
  background: #6d28d9;
}

/* Tabs */
.tabs-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  padding: 0;
  background: #f9fafb;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 20px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.tab-btn.active {
  background: white;
  color: #7c3aed;
  border-bottom-color: #7c3aed;
}

.tab-content {
  padding: 30px;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 20px;
  color: #6b7280;
}

.loading-state i {
  font-size: 48px;
  color: #7c3aed;
}

.loading-state p {
  font-size: 16px;
  margin: 0;
}

/* Actions Bar */
.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.actions-left {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.actions-left i {
  color: #7c3aed;
  font-size: 16px;
}

.actions-right {
  display: flex;
  gap: 12px;
}

.btn-action-export,
.btn-action-print {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-action-export {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-action-export:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-action-export i {
  font-size: 18px;
}

.btn-action-print {
  background: white;
  color: #374151;
  border: 2px solid #d1d5db;
}

.btn-action-print:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-action-print i {
  font-size: 18px;
}

/* Report Section */
.report-section {
  width: 100%;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
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
  display: block;
  margin-top: 4px;
}

.btn-export-general {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-export-general:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
}

.btn-export-general:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-export-general i {
  font-size: 18px;
}

.table-wrapper {
  overflow-x: auto;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
}

.report-table thead {
  background: #f9fafb;
}

.report-table th {
  padding: 14px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e5e7eb;
}

.report-table td {
  padding: 16px;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #f0f0f0;
}

.report-table tbody tr:hover {
  background: #f9fafb;
}

.report-table.compact th,
.report-table.compact td {
  padding: 12px 16px;
}

/* Badges */
.badge-total,
.badge-nuevas,
.badge-proceso,
.badge-cerradas,
.badge-resueltas,
.badge-rechazadas,
.badge-asignadas,
.badge-sin-asignar {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.badge-total {
  background: #e0e7ff;
  color: #4338ca;
}

.badge-nuevas {
  background: #e3f2fd;
  color: #1976d2;
}

.badge-proceso {
  background: #fff8e1;
  color: #f57c00;
}

.badge-cerradas {
  background: #e8f5e9;
  color: #388e3c;
}

.badge-resueltas {
  background: #f3e5f5;
  color: #7b1fa2;
}

.badge-rechazadas {
  background: #ffebee;
  color: #c62828;
}

.badge-asignadas {
  background: #e0f2fe;
  color: #0369a1;
}

.badge-sin-asignar {
  background: #fef3c7;
  color: #92400e;
}

/* Progress Bar */
.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed 0%, #6d28d9 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: #9ca3af;
}

.empty-state i {
  font-size: 48px;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}

/* General Report */
.general-report {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.report-category {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

.category-title i {
  color: #7c3aed;
  font-size: 18px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.category-grid.cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.metric-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.metric-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
  text-align: center;
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  padding: 6px 16px;
  border-radius: 8px;
}

.metric-percent {
  font-size: 14px;
  color: #7c3aed;
  font-weight: 600;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.summary-card.total {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
}

.summary-card.pending {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.summary-card.completed {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.summary-card.efficiency {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.summary-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 28px;
  color: white;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.summary-value {
  font-size: 32px;
  color: white;
  font-weight: 700;
}

/* Print Styles */
@media print {
  .page-header,
  .filters-container,
  .tabs-header,
  .actions-bar {
    display: none !important;
  }

  .reportes-container {
    background: white;
  }

  .tab-content {
    padding: 0;
  }
}

/* Responsive */
@media (max-width: 1400px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .category-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: 1fr;
  }

  .filters-row {
    grid-template-columns: 1fr;
  }

  .category-grid,
  .category-grid.cols-2 {
    grid-template-columns: 1fr;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .actions-bar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .actions-left {
    justify-content: center;
  }

  .actions-right {
    flex-direction: column;
  }

  .btn-action-export,
  .btn-action-print {
    width: 100%;
    justify-content: center;
  }

  .tabs-header {
    overflow-x: auto;
    flex-wrap: nowrap;
  }

  .tab-btn {
    flex: 0 0 auto;
    min-width: 120px;
  }

  .table-wrapper {
    overflow-x: scroll;
  }
}
</style>
