<template>
  <div class="panel-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <button class="btn-back" @click="goBack">
          <i class="pi pi-arrow-left"></i>
        </button>
        <div class="header-info">
          <h1 class="header-title">Gestión de Encargados</h1>
          <p class="header-subtitle">Administra los supervisores de cada área</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="panel-content">
      <!-- Stats -->
      <div class="stats-container">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #ffc107 0%, #f59e0b 100%);">
            <i class="pi pi-star-fill"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Total Encargados</span>
            <span class="stat-value">{{ stats.total }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">
            <i class="pi pi-check-circle"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Activos</span>
            <span class="stat-value">{{ stats.activos }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);">
            <i class="pi pi-briefcase"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Áreas Cubiertas</span>
            <span class="stat-value">{{ stats.areasCubiertas }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);">
            <i class="pi pi-exclamation-circle"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Áreas Sin Encargado</span>
            <span class="stat-value">{{ stats.areasSinEncargado }}</span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner"></i>
        Cargando información...
      </div>

      <!-- Áreas con Encargados -->
      <div v-else class="areas-container">
        <div v-for="area in areas" :key="area.idArea" class="area-section">
          <div class="area-header">
            <div class="area-title-wrapper">
              <h3 class="area-title">{{ area.nombre }}</h3>
              <span class="area-count">
                {{ getEncargadosArea(area.idArea).length }} 
                {{ getEncargadosArea(area.idArea).length === 1 ? 'encargado' : 'encargados' }}
              </span>
            </div>
            <button class="btn-add" @click="abrirModalAsignar(area)">
              <i class="pi pi-plus"></i>
              Agregar Encargado
            </button>
          </div>

          <div class="encargados-list">
            <div v-if="getEncargadosArea(area.idArea).length === 0" class="no-encargados">
              <i class="pi pi-info-circle"></i>
              <p>No hay encargados asignados a esta área</p>
              <button class="btn-assign-first" @click="abrirModalAsignar(area)">
                <i class="pi pi-user-plus"></i>
                Asignar Primer Encargado
              </button>
            </div>

            <div v-else class="encargados-grid">
              <EncargadoCard
                v-for="encargado in getEncargadosArea(area.idArea)"
                :key="encargado.idEncargado"
                :encargado="encargado"
                @desactivar="desactivarEncargado"
                @activar="activarEncargado"
                @eliminar="confirmarEliminar"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Asignar Encargado -->
    <AsignarEncargadoModal
      :show="showModal"
      :idArea="areaSeleccionada?.idArea"
      :nombreArea="areaSeleccionada?.nombre"
      @close="cerrarModal"
      @asignado="handleAsignado"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { encargadoService, catalogoService } from '@/services'
import EncargadoCard from '@/components/encargados/EncargadoCard.vue'
import AsignarEncargadoModal from '@/components/encargados/AsignarEncargadoModal.vue'

const router = useRouter()

const loading = ref(true)
const encargados = ref([])
const areas = ref([])
const showModal = ref(false)
const areaSeleccionada = ref(null)

// Stats calculados
const stats = computed(() => {
  const activos = encargados.value.filter(e => e.activo).length
  const areasCubiertas = new Set(
    encargados.value.filter(e => e.activo).map(e => e.idArea)
  ).size
  const areasSinEncargado = areas.value.length - areasCubiertas

  return {
    total: encargados.value.length,
    activos,
    areasCubiertas,
    areasSinEncargado
  }
})

const getEncargadosArea = (idArea) => {
  return encargados.value.filter(e => e.idArea === idArea)
}

const goBack = () => {
  router.push('/panel-admin')
}

const abrirModalAsignar = (area) => {
  areaSeleccionada.value = area
  showModal.value = true
}

const cerrarModal = () => {
  showModal.value = false
  areaSeleccionada.value = null
}

const handleAsignado = async () => {
  await loadEncargados()
}

const desactivarEncargado = async (idEncargado) => {
  if (!confirm('¿Estás seguro de desactivar este encargado?')) return

  try {
    await encargadoService.desactivarEncargado(idEncargado)
    alert('Encargado desactivado exitosamente')
    await loadEncargados()
  } catch (error) {
    console.error('Error desactivando encargado:', error)
    alert(error.response?.data?.message || 'Error al desactivar encargado')
  }
}

const activarEncargado = async (idEncargado) => {
  try {
    await encargadoService.activarEncargado(idEncargado)
    alert('Encargado activado exitosamente')
    await loadEncargados()
  } catch (error) {
    console.error('Error activando encargado:', error)
    alert(error.response?.data?.message || 'Error al activar encargado')
  }
}

const confirmarEliminar = async (idEncargado) => {
  if (!confirm('¿Estás seguro de eliminar permanentemente este encargado?\n\nEsta acción no se puede deshacer.')) return

  try {
    await encargadoService.eliminarEncargado(idEncargado)
    alert('Encargado eliminado exitosamente')
    await loadEncargados()
  } catch (error) {
    console.error('Error eliminando encargado:', error)
    alert(error.response?.data?.message || 'Error al eliminar encargado')
  }
}

const loadEncargados = async () => {
  try {
    const data = await encargadoService.getAll()
    encargados.value = data
  } catch (error) {
    console.error('Error cargando encargados:', error)
    alert('Error al cargar encargados')
  }
}

const loadAreas = async () => {
  try {
    const data = await catalogoService.getAreas()
    areas.value = data
  } catch (error) {
    console.error('Error cargando áreas:', error)
    alert('Error al cargar áreas')
  }
}

onMounted(async () => {
  loading.value = true
  await Promise.all([loadAreas(), loadEncargados()])
  loading.value = false
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
  max-width: 1400px;
  margin: 0 auto;
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
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: white;
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
  font-size: 26px;
  font-weight: 700;
  color: #1f2937;
}

/* Loading */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px;
  font-size: 16px;
  color: #666;
  background: white;
  border-radius: 12px;
}

.loading-state i {
  font-size: 24px;
}

/* Áreas */
.areas-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.area-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.area-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.area-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.area-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.area-count {
  font-size: 13px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #4F39F6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-add:hover {
  background: #3d2bc4;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 57, 246, 0.3);
}

/* Encargados */
.encargados-list {
  min-height: 100px;
}

.no-encargados {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 16px;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 8px;
  border: 2px dashed #d1d5db;
}

.no-encargados i {
  font-size: 48px;
  color: #d1d5db;
}

.no-encargados p {
  margin: 0;
  font-size: 14px;
}

.btn-assign-first {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #4F39F6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
}

.btn-assign-first:hover {
  background: #3d2bc4;
  transform: translateY(-1px);
}

.encargados-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-container {
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

  .area-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .btn-add {
    width: 100%;
    justify-content: center;
  }

  .encargados-grid {
    grid-template-columns: 1fr;
  }
}
</style>
