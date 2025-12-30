<template>
  <div class="timeline-trazabilidad">
    <h3 class="timeline-title">
      <i class="pi pi-history"></i>
      Historial de la Solicitud
    </h3>

    <div v-if="eventos.length === 0" class="timeline-empty">
      <i class="pi pi-info-circle"></i>
      <p>No hay eventos registrados</p>
    </div>

    <div v-else class="timeline-container">
      <div 
        v-for="(evento, index) in eventosOrdenados" 
        :key="index"
        class="timeline-item"
        :class="getTrazabilidadClass(evento.accion)"
      >
        <!-- Icono del evento -->
        <div class="timeline-marker">
          <div class="timeline-icon" :style="{ backgroundColor: getTrazabilidadColor(evento.accion) }">
            <i :class="['pi', getTrazabilidadIcon(evento.accion)]"></i>
          </div>
          <div v-if="index < eventosOrdenados.length - 1" class="timeline-line"></div>
        </div>

        <!-- Contenido del evento -->
        <div class="timeline-content">
          <div class="timeline-header">
            <h4 class="timeline-event-title">{{ getTrazabilidadTitulo(evento.accion) }}</h4>
            <span class="timeline-date">{{ formatFecha(evento.fechaEvento) }}</span>
          </div>

          <p class="timeline-description">{{ evento.descripcion }}</p>

          <div class="timeline-footer" v-if="evento.usuarioActor">
            <span class="timeline-actor" :class="getActorClass(evento.accion)">
              <i :class="getActorIcon(evento.accion)"></i>
              {{ evento.usuarioActor }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  getTrazabilidadIcon,
  getTrazabilidadTitulo,
  getTrazabilidadClass,
  getTrazabilidadColor,
  formatFechaTrazabilidad,
  ordenarTrazabilidad,
  getTipoActor
} from '@/utils/trazabilidadHelpers'

const props = defineProps({
  eventos: {
    type: Array,
    default: () => []
  }
})

// Ordenar eventos por fecha (más recientes primero)
const eventosOrdenados = computed(() => {
  return ordenarTrazabilidad(props.eventos)
})

const formatFecha = (fecha) => {
  return formatFechaTrazabilidad(fecha)
}

const getActorIcon = (accion) => {
  const tipo = getTipoActor(accion)
  const iconos = {
    'admin': 'pi pi-shield',
    'supervisor': 'pi pi-user-edit',
    'gestor': 'pi pi-user',
    'usuario': 'pi pi-user'
  }
  return iconos[tipo] || 'pi pi-user'
}

const getActorClass = (accion) => {
  const tipo = getTipoActor(accion)
  return `actor-${tipo}`
}
</script>

<style scoped>
.timeline-trazabilidad {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.timeline-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.timeline-title i {
  color: #4F39F6;
  font-size: 20px;
}

.timeline-empty {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.timeline-empty i {
  font-size: 48px;
  color: #ddd;
  margin-bottom: 12px;
}

.timeline-empty p {
  margin: 0;
  font-size: 14px;
}

.timeline-container {
  position: relative;
}

.timeline-item {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  position: relative;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-marker {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.timeline-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 2;
  position: relative;
}

.timeline-line {
  width: 2px;
  flex: 1;
  background: linear-gradient(to bottom, #e0e0e0, transparent);
  margin-top: 8px;
  min-height: 40px;
}

.timeline-content {
  flex: 1;
  background: #f9fafb;
  border-radius: 10px;
  padding: 16px 20px;
  border-left: 3px solid #e0e0e0;
  transition: all 0.3s ease;
}

.timeline-content:hover {
  background: #f5f6f7;
  border-left-color: #4F39F6;
  box-shadow: 0 2px 8px rgba(79, 57, 246, 0.1);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 12px;
}

.timeline-event-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.timeline-date {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

.timeline-description {
  font-size: 14px;
  color: #555;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.timeline-footer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.timeline-actor {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 12px;
  background: white;
  border: 1px solid #e0e0e0;
}

.timeline-actor i {
  font-size: 11px;
}

/* Estilos específicos por tipo de acción */
.timeline-admin .timeline-content {
  border-left-color: #dc3545;
}

.timeline-admin .timeline-actor {
  background: #fff5f5;
  border-color: #dc3545;
  color: #dc3545;
}

.timeline-supervisor .timeline-content {
  border-left-color: #ffc107;
}

.timeline-supervisor .timeline-actor {
  background: #fffbf0;
  border-color: #ffc107;
  color: #8a6d00;
}

.timeline-tomar .timeline-content {
  border-left-color: #28a745;
}

.timeline-tomar .timeline-actor {
  background: #f0fff4;
  border-color: #28a745;
  color: #28a745;
}

.timeline-creacion .timeline-content {
  border-left-color: #007bff;
}

.timeline-estado .timeline-content {
  border-left-color: #fd7e14;
}

.timeline-comentario .timeline-content {
  border-left-color: #17a2b8;
}

.timeline-prioridad .timeline-content {
  border-left-color: #e83e8c;
}

/* Responsive */
@media (max-width: 768px) {
  .timeline-trazabilidad {
    padding: 16px;
  }

  .timeline-item {
    gap: 12px;
  }

  .timeline-icon {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .timeline-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .timeline-date {
    font-size: 11px;
  }
}
</style>
