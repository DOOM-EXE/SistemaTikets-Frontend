<template>
  <div class="panel-container">
    <!-- Header -->
    <div class="page-header">
      <button class="btn-back" @click="goBack">
        <i class="pi pi-chevron-left"></i>
      </button>
      <div class="header-text">
        <h1 class="header-title">Solicitud {{ ticket?.codigo || ticket?.numero }}</h1>
        <p class="header-description">Visualiza toda la información de tu solicitud</p>
      </div>
    </div>

    <!-- Content -->
    <div class="content-layout" v-if="ticket">
      <!-- Columna Izquierda -->
      <div class="left-column">
        <!-- Información de solicitud -->
        <div class="info-card">
          <div class="card-header-with-action">
            <h2 class="card-title">Información de solicitud</h2>
            <button 
              v-if="canEdit"
              class="btn-edit-ticket"
              @click="startEdit"
              type="button"
            >
              <i class="pi pi-pencil"></i>
              Editar
            </button>
          </div>
          
          <!-- Modo visualización -->
          <template v-if="!isEditing">
            <div class="info-section">
              <div class="info-label">
                <i class="pi pi-tag"></i>
                Asunto
              </div>
              <div class="info-value">{{ ticket.asunto }}</div>
            </div>

            <div class="info-section">
              <div class="info-label">
                <i class="pi pi-align-left"></i>
                Descripción
              </div>
              <div class="info-value description">{{ ticket.descripcion }}</div>
            </div>

            <div class="info-section" v-if="ticket.archivoUrl">
              <div class="info-label">
                <i class="pi pi-paperclip"></i>
                Archivo adjunto
              </div>
              <div class="attachments-list">
                <button 
                  class="attachment-link"
                  @click="downloadFile(ticket.archivoUrl)"
                  type="button"
                >
                  <i class="pi pi-file-pdf"></i>
                  Descargar archivo
                </button>
              </div>
            </div>
          </template>

          <!-- Modo edición -->
          <template v-else>
            <div class="edit-form">
              <div class="form-group">
                <label class="form-label">
                  <i class="pi pi-tag"></i>
                  Asunto
                </label>
                <input 
                  v-model="editForm.asunto"
                  type="text"
                  class="form-input"
                  placeholder="Asunto de la solicitud"
                />
              </div>

              <div class="form-group">
                <label class="form-label">
                  <i class="pi pi-align-left"></i>
                  Descripción
                </label>
                <textarea 
                  v-model="editForm.descripcion"
                  class="form-textarea"
                  placeholder="Descripción detallada"
                  rows="5"
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <i class="pi pi-exclamation-triangle"></i>
                  Prioridad
                </label>
                <select 
                  v-model="editForm.idPrioridad"
                  class="form-select"
                >
                  <option value="" disabled>Selecciona una prioridad</option>
                  <option 
                    v-for="prioridad in prioridades" 
                    :key="prioridad.id"
                    :value="prioridad.id"
                  >
                    {{ prioridad.nombre }}
                  </option>
                </select>
              </div>

              <div class="form-actions">
                <button 
                  class="btn-cancel"
                  @click="cancelEdit"
                  type="button"
                  :disabled="saving"
                >
                  Cancelar
                </button>
                <button 
                  class="btn-save"
                  @click="saveEdit"
                  type="button"
                  :disabled="saving || !isFormValid"
                >
                  <i :class="saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'"></i>
                  {{ saving ? 'Guardando...' : 'Guardar cambios' }}
                </button>
              </div>
            </div>
          </template>
        </div>

        <!-- Timeline de Trazabilidad y Comentarios -->
        <div class="timeline-card">
          <h2 class="card-title">
            <i class="pi pi-history"></i>
            Historial y Comentarios
          </h2>

          <div v-if="comentarios.length === 0" class="timeline-empty">
            <i class="pi pi-info-circle"></i>
            <p>No hay eventos registrados</p>
          </div>

          <div v-else class="timeline">
            <div 
              v-for="item in comentarios" 
              :key="item.id"
              class="timeline-item"
            >
              <div class="timeline-line-container">
                <div class="timeline-avatar" :class="`avatar-${item.tipo}`">
                  <i :class="getAvatarIcon(item.tipo)"></i>
                </div>
                <div class="timeline-line" v-if="item !== comentarios[comentarios.length - 1]"></div>
              </div>
              
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="timeline-author">{{ item.autor }}</span>
                  <span class="timeline-date">{{ item.fecha }}</span>
                </div>
                <p class="timeline-message">{{ item.mensaje }}</p>
                <div v-if="item.badges" class="timeline-badges">
                  <span 
                    v-for="(badge, index) in item.badges" 
                    :key="index"
                    class="timeline-badge"
                    :class="`badge-${badge.type}`"
                  >
                    {{ badge.text }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Agregar comentario -->
        <div class="comments-card">
          <h2 class="card-title">
            <i class="pi pi-comment"></i>
            Agregar Comentario
          </h2>
          <div class="add-comment">
            <div class="comment-input-group">
              <textarea 
                v-model="newComment"
                class="comment-input"
                placeholder="Escribe tu comentario..."
                rows="4"
              ></textarea>
              <div class="comment-actions">
                <button class="btn-send-comment" type="button" @click="addComment" :disabled="!newComment.trim() || sendingComment">
                  <i :class="sendingComment ? 'pi pi-spin pi-spinner' : 'pi pi-send'"></i>
                  <span class="btn-text">{{ sendingComment ? 'Enviando...' : 'Enviar' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna Derecha -->
      <div class="right-column">
        <!-- Detalles -->
        <div class="details-card">
          <h2 class="card-title">Detalles</h2>
          
          <div class="detail-item">
            <span class="detail-label">Estado</span>
            <EstadoBadge :estado="ticket.estado" />
          </div>

          <div class="detail-item">
            <span class="detail-label">Prioridad</span>
            <PrioridadBadge :prioridad="ticket.prioridad" />
          </div>
        </div>

        <!-- Información Adicional -->
        <div class="additional-card">
          <h2 class="card-title">Información Adicional</h2>
          
          <div class="additional-item">
            <i class="pi pi-calendar"></i>
            <div class="additional-content">
              <span class="additional-label">Fecha de Creación</span>
              <span class="additional-value">{{ ticket.fecha }}</span>
            </div>
          </div>

          <div class="additional-item">
            <i class="pi pi-user"></i>
            <div class="additional-content">
              <span class="additional-label">Solicitante</span>
              <span class="additional-value">{{ solicitanteDisplay }}</span>
            </div>
          </div>

          <div class="additional-item">
            <i class="pi pi-briefcase"></i>
            <div class="additional-content">
              <span class="additional-label">Área</span>
              <span class="additional-value">{{ ticket.area }}</span>
            </div>
          </div>

          <div class="additional-item">
            <i class="pi pi-tag"></i>
            <div class="additional-content">
              <span class="additional-label">Tipo</span>
              <span class="additional-value">{{ ticket.tipo }}</span>
            </div>
          </div>

          <div class="additional-item" v-if="ticket.codigo">
            <i class="pi pi-qrcode"></i>
            <div class="additional-content">
              <span class="additional-label">Código</span>
              <span class="additional-value">{{ ticket.codigo }}</span>
            </div>
          </div>

          <div class="additional-item">
            <i class="pi pi-users"></i>
            <div class="additional-content">
              <span class="additional-label">Asignado a</span>
              <span class="additional-value">{{ ticket.gestor || 'Sin asignar' }}</span>
            </div>
          </div>
        </div>

        <!-- Acciones de Gestor -->
        <div class="actions-card" v-if="isGestor">
          <h2 class="card-title">Acciones</h2>
          
          <button 
            v-if="!ticket.gestor"
            class="btn-action-primary"
            @click="tomarSolicitud"
            :disabled="tomandoSolicitud"
          >
            <i :class="tomandoSolicitud ? 'pi pi-spin pi-spinner' : 'pi pi-user-plus'"></i>
            {{ tomandoSolicitud ? 'Tomando...' : 'Tomar Solicitud' }}
          </button>

          <div class="action-group">
            <label class="action-label">Cambiar Estado</label>
            <select 
              v-model="nuevoEstado"
              class="action-select"
              :disabled="cambiandoEstado || !ticket.gestor"
            >
              <option 
                v-for="estado in estados" 
                :key="estado.idEstado"
                :value="estado.idEstado"
              >
                {{ estado.nombre }}
              </option>
            </select>
            <p v-if="!ticket.gestor" class="action-warning">
              <i class="pi pi-info-circle"></i>
              Debes tomar la solicitud antes de cambiar el estado
            </p>
            <div v-if="parseInt(nuevoEstado) === 5" class="cancelacion-group">
              <label class="action-label required">Razón de Rechazo</label>
              <textarea
                v-model="razonCancelacion"
                class="action-textarea"
                placeholder="Explica por qué se rechaza esta solicitud..."
                rows="3"
                :disabled="cambiandoEstado"
              ></textarea>
            </div>
            <button 
              class="btn-action-secondary"
              @click="cambiarEstado"
              :disabled="!nuevoEstado || cambiandoEstado || parseInt(nuevoEstado) === parseInt(ticket.idEstado) || !ticket.gestor || (parseInt(nuevoEstado) === 5 && !razonCancelacion.trim())"
            >
              <i :class="cambiandoEstado ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"></i>
              {{ cambiandoEstado ? 'Cambiando...' : 'Aplicar Cambio' }}
            </button>
          </div>
        </div>

        <!-- Asignación de Gestor (Admin y Encargados) -->
        <div class="actions-card" v-if="puedeAsignar">
          <h2 class="card-title">
            <i class="pi pi-users"></i>
            Asignación de Gestor
          </h2>

          <div class="additional-item" style="padding: 0; margin-bottom: 16px;">
            <i class="pi pi-users"></i>
            <div class="additional-content">
              <span class="additional-label">Asignado</span>
              <span class="additional-value" :class="{ 'asignado-link': ticket.gestor }">
                {{ ticket.gestor || 'Sin asignar' }}
              </span>
            </div>
          </div>

          <div class="action-group">
            <label class="action-label">{{ ticket.gestor ? 'Reasignar a' : 'Asignar Gestor' }}</label>
            <select 
              v-model="gestorSeleccionado"
              class="action-select"
              :disabled="asignandoGestor || ticket.estado === 'cerrada' || loadingGestores"
            >
              <option value="">{{ loadingGestores ? 'Cargando...' : 'Seleccione un gestor...' }}</option>
              <option 
                v-for="gestor in gestoresFiltrados" 
                :key="gestor.idUsuario"
                :value="gestor.idUsuario"
              >
                {{ gestor.nombreCompleto }}
                <span v-if="esUsuarioActual(gestor.idUsuario)"> (Usted)</span>
              </option>
            </select>
            <p v-if="ticket.estado === 'cerrada'" class="action-warning">
              <i class="pi pi-info-circle"></i>
              No se puede reasignar una solicitud cerrada
            </p>
            <button 
              class="btn-action-primary"
              @click="asignarGestorATicket"
              :disabled="!gestorSeleccionado || asignandoGestor || ticket.estado === 'cerrada'"
            >
              <i :class="asignandoGestor ? 'pi pi-spin pi-spinner' : 'pi pi-user-plus'"></i>
              {{ asignandoGestor ? 'Asignando...' : (ticket.gestor ? 'Reasignar' : 'Asignar') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-else class="loading-state">
      <i class="pi pi-spin pi-spinner"></i>
      Cargando solicitud...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ticketService, comentarioService, apiService, authService, catalogoService, usuarioService, encargadoService } from '@/services'
import EstadoBadge from '@/components/ticket/EstadoBadge.vue'
import PrioridadBadge from '@/components/ticket/PrioridadBadge.vue'

const router = useRouter()
const route = useRoute()

const ticket = ref(null)
const comentarios = ref([])
const trazabilidad = ref([])
const newComment = ref('')
const loading = ref(true)
const loadingComentarios = ref(false)
const sendingComment = ref(false)

// Edit functionality
const isEditing = ref(false)
const saving = ref(false)
const prioridades = ref([])
const editForm = ref({
  asunto: '',
  descripcion: '',
  idPrioridad: null
})

// Gestor functionality
const isGestor = ref(false)
const tomandoSolicitud = ref(false)
const cambiandoEstado = ref(false)
const nuevoEstado = ref('')
const razonCancelacion = ref('')
const estados = ref([])

// Admin functionality
const isAdmin = ref(false)
const gestores = ref([])
const gestoresDisponibles = ref([])
const gestorSeleccionado = ref('')
const asignandoGestor = ref(false)
const loadingGestores = ref(false)

// Encargado functionality
const esEncargado = ref(false)
const puedeAsignar = computed(() => {
  return isAdmin.value || esEncargado.value
})

const gestoresFiltrados = computed(() => {
  if (!ticket.value || !ticket.value.idGestorAsignado) {
    return gestoresDisponibles.value
  }
  // Filtrar al gestor actualmente asignado
  return gestoresDisponibles.value.filter(
    gestor => gestor.idUsuario !== ticket.value.idGestorAsignado
  )
})

const estaAsignadoAMi = computed(() => {
  return ticket.value && gestorSeleccionado.value && 
         parseInt(gestorSeleccionado.value) === ticket.value.idGestorAsignado
})

const esUsuarioActual = (idUsuario) => {
  const user = authService.getUser()
  return user && user.id === idUsuario
}

const solicitanteDisplay = computed(() => {
  if (!ticket.value) return ''
  const user = authService.getUser()
  // Si es el solicitante, mostrar "(Usted)"
  if (user && ticket.value.idSolicitante === user.id) {
    return `${ticket.value.solicitante} (Usted)`
  }
  return ticket.value.solicitante
})

// Solo se puede editar si el estado es "Nueva" (idEstado === 1) y es el solicitante
const canEdit = computed(() => {
  const user = authService.getUser()
  return ticket.value && 
         ticket.value.idEstado === 1 && 
         user && 
         ticket.value.idSolicitante === user.id
})

const isFormValid = computed(() => {
  return editForm.value.asunto.trim() !== '' &&
         editForm.value.descripcion.trim() !== '' &&
         editForm.value.idPrioridad !== null
})

const getAvatarIcon = (tipo) => {
  const icons = {
    'system': 'pi pi-info-circle',
    'admin': 'pi pi-shield',
    'user': 'pi pi-user'
  }
  return icons[tipo] || 'pi pi-comment'
}

const goBack = () => {
  router.push('/panel-solicitante')
}

const startEdit = async () => {
  // Cargar prioridades si aún no están cargadas
  if (prioridades.value.length === 0) {
    try {
      prioridades.value = await catalogoService.getPrioridades()
    } catch (error) {
      console.error('Error cargando prioridades:', error)
      alert('Error al cargar las prioridades')
      return
    }
  }

  // Llenar el formulario con los datos actuales
  editForm.value = {
    asunto: ticket.value.asunto,
    descripcion: ticket.value.descripcion,
    idPrioridad: ticket.value.idPrioridad
  }

  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  editForm.value = {
    asunto: '',
    descripcion: '',
    idPrioridad: null
  }
}

const saveEdit = async () => {
  if (!isFormValid.value) return

  try {
    saving.value = true

    const updatedTicket = await ticketService.updateTicket(ticket.value.id, {
      asunto: editForm.value.asunto,
      descripcion: editForm.value.descripcion,
      idPrioridad: editForm.value.idPrioridad
    })

    // Recargar la solicitud y comentarios con todos sus datos
    ticket.value = await ticketService.getTicketById(ticket.value.id)
    await loadComentarios(ticket.value.id)

    // Actualizar el estado en el dropdown si es gestor
    if (isGestor.value && ticket.value.idEstado) {
      nuevoEstado.value = ticket.value.idEstado
    }

    isEditing.value = false
    alert('Solicitud actualizada exitosamente')
  } catch (error) {
    console.error('Error actualizando solicitud:', error)
    
    // Manejar diferentes tipos de error
    if (error.message && error.message.includes('estado')) {
      alert('Solo se pueden editar solicitudes en estado "Nueva"')
    } else {
      alert('Error al actualizar la solicitud')
    }
  } finally {
    saving.value = false
  }
}

const addComment = async () => {
  if (!newComment.value.trim()) return
  
  try {
    sendingComment.value = true
    await comentarioService.createComentario(
      ticket.value.id,
      newComment.value
    )
    
    // Recargar comentarios y trazabilidad
    await loadComentarios(ticket.value.id)
    
    newComment.value = ''
    alert('Comentario agregado exitosamente')
  } catch (error) {
    console.error('Error agregando comentario:', error)
    alert('Error al agregar comentario')
  } finally {
    sendingComment.value = false
  }
}

const downloadFile = async (archivoUrl) => {
  if (!archivoUrl) return
  
  try {
    const fileName = archivoUrl.split('/').pop()
    const token = localStorage.getItem('token')
    
    const response = await fetch(`${apiService.baseURL}/Archivos/download/${fileName}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Error descargando archivo')
    }
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error descargando archivo:', error)
    alert('Error al descargar el archivo')
  }
}

const tomarSolicitud = async () => {
  if (!confirm('¿Estás seguro de que deseas tomar esta solicitud?')) return

  try {
    tomandoSolicitud.value = true
    await ticketService.tomarSolicitud(ticket.value.id)
    
    // Recargar la solicitud y comentarios para actualizar la información
    ticket.value = await ticketService.getTicketById(ticket.value.id)
    await loadComentarios(ticket.value.id)
    
    // Actualizar el estado en el dropdown
    if (ticket.value.idEstado) {
      nuevoEstado.value = ticket.value.idEstado
    }
    
    alert('Solicitud tomada exitosamente')
  } catch (error) {
    console.error('Error tomando solicitud:', error)
    alert('Error al tomar la solicitud')
  } finally {
    tomandoSolicitud.value = false
  }
}

const cambiarEstado = async () => {
  if (!nuevoEstado.value) return
  
  // Validar razón de rechazo si el estado es Rechazada (5)
  if (parseInt(nuevoEstado.value) === 5 && !razonCancelacion.value.trim()) {
    alert('Debes proporcionar una razón para rechazar la solicitud')
    return
  }
  
  if (!confirm('¿Estás seguro de que deseas cambiar el estado de esta solicitud?')) return

  try {
    cambiandoEstado.value = true
    
    // Usar la razón de rechazo como comentario si es estado Rechazada
    const comentario = parseInt(nuevoEstado.value) === 5 ? razonCancelacion.value : ''
    
    await ticketService.cambiarEstadoSolicitud(
      ticket.value.id, 
      nuevoEstado.value, 
      comentario
    )
    
    // Recargar la solicitud para actualizar la información
    ticket.value = await ticketService.getTicketById(ticket.value.id)
    await loadComentarios(ticket.value.id)
    
    // Actualizar el estado en el dropdown con el nuevo estado
    nuevoEstado.value = ticket.value.idEstado
    razonCancelacion.value = ''
    alert('Estado cambiado exitosamente')
  } catch (error) {
    console.error('Error cambiando estado:', error)
    alert('Error al cambiar el estado')
  } finally {
    cambiandoEstado.value = false
  }
}

const asignarGestorATicket = async () => {
  if (!gestorSeleccionado.value) return

  if (!confirm(`¿Estás seguro de ${ticket.value.gestor ? 'reasignar' : 'asignar'} esta solicitud?`)) return

  try {
    asignandoGestor.value = true
    
    // Debug: Log para diagnosticar
    const user = authService.getUser()
    console.log('🔍 Diagnóstico de asignación:', {
      usuario: user.nombre,
      rol: user.rol,
      idUsuario: user.id,
      esEncargadoLocal: esEncargado.value,
      solicitudId: ticket.value.id,
      solicitudArea: ticket.value.idArea,
      gestorDestino: gestorSeleccionado.value
    })
    
    await ticketService.asignarGestorASolicitud(ticket.value.id, gestorSeleccionado.value)
    
    // Recargar la solicitud y comentarios
    ticket.value = await ticketService.getTicketById(ticket.value.id)
    await loadComentarios(ticket.value.id)
    
    // Actualizar el estado en el dropdown si es gestor
    if (isGestor.value && ticket.value.idEstado) {
      nuevoEstado.value = ticket.value.idEstado
    }
    
    gestorSeleccionado.value = ''
    alert('Gestor asignado exitosamente')
  } catch (error) {
    console.error('Error asignando gestor:', error)
    
    // Mensaje de error más descriptivo según el código
    if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
      alert('No tienes permisos para asignar gestores en esta área. Solo los Administradores y Supervisores (Encargados) del área pueden asignar solicitudes.')
    } else {
      alert(error.response?.data?.message || error.message || 'Error al asignar gestor')
    }
  } finally {
    asignandoGestor.value = false
  }
}

const loadTrazabilidad = async (idSolicitud) => {
  try {
    const data = await ticketService.getTrazabilidad(idSolicitud)
    trazabilidad.value = data || []
  } catch (error) {
    console.error('Error cargando trazabilidad:', error)
    trazabilidad.value = []
  }
}

const loadGestoresDisponibles = async (idArea) => {
  try {
    loadingGestores.value = true
    gestoresDisponibles.value = await encargadoService.getGestoresDisponibles(idArea)
  } catch (error) {
    console.error('Error cargando gestores:', error)
    // Fallback a gestores del área
    try {
      gestoresDisponibles.value = await usuarioService.getGestoresPorArea(idArea)
    } catch (fallbackError) {
      console.error('Error cargando gestores (fallback):', fallbackError)
      gestoresDisponibles.value = []
    }
  } finally {
    loadingGestores.value = false
  }
}

const verificarPermisos = async () => {
  const user = authService.getUser()
  if (!user || !ticket.value) return

  // Admin siempre puede asignar
  if (user.rol === 'Admin') {
    esEncargado.value = true
    return
  }

  // Verificar si es encargado del área de la solicitud
  if (user.rol === 'Gestor' && ticket.value.idArea) {
    try {
      const result = await encargadoService.verificarEncargado(user.id, ticket.value.idArea)
      esEncargado.value = result.esEncargado || result
    } catch (error) {
      console.error('Error verificando permisos:', error)
      esEncargado.value = false
    }
  }
}

onMounted(async () => {
  try {
    loading.value = true
    const id = route.params.id
    
    // Verificar si el usuario es gestor o admin
    const user = authService.getUser()
    if (user && user.rol === 'Gestor') {
      isGestor.value = true
      // Cargar catálogo de estados para gestores
      estados.value = await catalogoService.getEstados()
    }
    
    if (user && user.rol === 'Admin') {
      isAdmin.value = true
    }
    
    // Cargar solicitud
    ticket.value = await ticketService.getTicketById(id)
    
    // Establecer el estado actual si es gestor
    if (isGestor.value && ticket.value.idEstado) {
      nuevoEstado.value = ticket.value.idEstado
    }
    
    // Cargar gestores disponibles si puede asignar
    if (ticket.value.idArea) {
      await verificarPermisos()
      
      if (puedeAsignar.value) {
        await loadGestoresDisponibles(ticket.value.idArea)
      }
    }
    
    // Cargar comentarios y trazabilidad
    await loadComentarios(id)
  } catch (error) {
    console.error('Error cargando solicitud:', error)
    alert('Error al cargar la solicitud')
    const user = authService.getUser()
    if (user && user.rol === 'Gestor') {
      router.push('/panel-gestor')
    } else {
      router.push('/panel-solicitante')
    }
  } finally {
    loading.value = false
  }
})

const loadComentarios = async (idSolicitud) => {
  try {
    loadingComentarios.value = true
    
    // La API de solicitud/{id} ya incluye comentarios y trazabilidad
    const response = await apiService.get(`/Solicitudes/${idSolicitud}`)
    
    const allItems = []
    
    // Agregar trazabilidad como eventos del sistema
    if (response.trazabilidad && response.trazabilidad.length > 0) {
      response.trazabilidad.forEach(t => {
        // Limpiar el mensaje de "Se agregó un nuevo comentario:"
        let mensaje = t.descripcion
        if (mensaje && mensaje.includes('Se agregó un nuevo comentario:')) {
          // No mostrar estos eventos, ya que los comentarios se muestran por separado
          return
        }
        
        const item = {
          id: `traz-${t.idTrazabilidad}`,
          tipo: 'system',
          autor: t.nombreUsuario || 'Sistema',
          mensaje: mensaje,
          fecha: formatFecha(t.fechaEvento),
          fechaOriginal: new Date(t.fechaEvento)
        }
        
        // Detectar si es un cambio de estado y agregar badges
        if (t.descripcion && t.descripcion.toLowerCase().includes('estado cambiado')) {
          const estadoMatch = t.descripcion.match(/de (.+?) a (.+?)$/)
          if (estadoMatch) {
            item.badges = [
              { text: estadoMatch[1], type: 'estado-anterior' },
              { text: estadoMatch[2], type: 'estado-nuevo' }
            ]
          }
        }
        
        allItems.push(item)
      })
    }
    
    // Agregar comentarios
    if (response.comentarios && response.comentarios.length > 0) {
      response.comentarios.forEach(c => {
        allItems.push({
          id: c.idComentario,
          tipo: mapTipoComentario(c.rol || 'Solicitante'),
          autor: c.nombreUsuario,
          mensaje: c.texto,
          fecha: formatFecha(c.fechaComentario),
          fechaOriginal: new Date(c.fechaComentario)
        })
      })
    }
    
    // Ordenar por fecha original (más antiguo primero)
    allItems.sort((a, b) => a.fechaOriginal - b.fechaOriginal)
    
    comentarios.value = allItems
  } catch (error) {
    console.error('Error cargando comentarios:', error)
  } finally {
    loadingComentarios.value = false
  }
}

const mapTipoComentario = (rol) => {
  const tipoMap = {
    'Admin': 'admin',
    'Gestor': 'admin',
    'Solicitante': 'user'
  }
  return tipoMap[rol] || 'user'
}

const formatFecha = (fecha) => {
  return new Date(fecha).toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getFileUrl = (archivoUrl) => {
  if (!archivoUrl) return ''
  // Si ya es una URL completa, devolverla tal cual
  if (archivoUrl.startsWith('http')) return archivoUrl
  
  // Extraer el nombre del archivo de la ruta
  const fileName = archivoUrl.split('/').pop()
  
  // Construir URL usando el endpoint de descarga
  return `${apiService.baseURL}/Archivos/download/${fileName}`
}
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

.content-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card,
.comments-card,
.timeline-card,
.details-card,
.additional-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.card-header-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header-with-action .card-title {
  margin: 0;
}

.btn-edit-ticket {
  background: #4F39F6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.btn-edit-ticket:hover {
  background: #3d2bc4;
}

.btn-edit-ticket i {
  font-size: 12px;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
}

.form-label i {
  font-size: 13px;
}

.form-input,
.form-textarea,
.form-select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: all 0.3s ease;
  color: #374151;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  border-color: #4F39F6;
  box-shadow: 0 0 0 3px rgba(79, 57, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 8px;
}

.btn-cancel,
.btn-save {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-cancel {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-cancel:hover:not(:disabled) {
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

.btn-save:disabled,
.btn-cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.info-section {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.info-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
}

.info-label i {
  font-size: 13px;
}

.info-value {
  font-size: 13px;
  color: #374151;
  line-height: 1.5;
}

.info-value.description {
  text-align: justify;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-link {
  color: #4F39F6;
  text-decoration: none;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.attachment-link:hover {
  text-decoration: underline;
}

.attachment-link::before {
  content: '📎';
}

.timeline-empty {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.timeline-empty i {
  font-size: 48px;
  color: #d1d5db;
}

.timeline-empty p {
  margin: 0;
  font-size: 14px;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 24px;
}

.timeline-item {
  display: flex;
  gap: 12px;
  padding-bottom: 20px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-line-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.timeline-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
  font-size: 18px;
  z-index: 1;
  background: white;
}

.timeline-avatar i {
  color: white;
}

.timeline-avatar.avatar-system {
  background: #3b82f6;
}

.timeline-avatar.avatar-admin {
  background: #8b5cf6;
}

.timeline-avatar.avatar-user {
  background: #10b981;
}

.timeline-line {
  width: 2px;
  flex: 1;
  background: #e5e7eb;
  margin-top: 4px;
  min-height: 40px;
}

.timeline-content {
  flex: 1;
  padding-top: 2px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.timeline-author {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.timeline-date {
  font-size: 12px;
  color: #9ca3af;
}

.timeline-message {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
  line-height: 1.5;
}

.timeline-badges {
  display: flex;
  gap: 8px;
}

.timeline-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.timeline-badge.badge-estado-anterior {
  background: #dbeafe;
  color: #1e40af;
}

.timeline-badge.badge-estado-nuevo {
  background: #fef3c7;
  color: #92400e;
}

.add-comment {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.comment-label {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
}

.comment-input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  resize: vertical;
  transition: all 0.3s ease;
  min-height: 80px;
}

.comment-input:focus {
  border-color: #4F39F6;
  box-shadow: 0 0 0 3px rgba(79, 57, 246, 0.1);
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-send-comment {
  background: #4F39F6;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.btn-send-comment .btn-text {
  display: inline;
}

@media (max-width: 768px) {
  .btn-send-comment .btn-text {
    display: none;
  }
  
  .btn-send-comment {
    width: 44px;
    height: 44px;
    padding: 0;
    justify-content: center;
  }
}

.btn-send-comment:hover:not(:disabled) {
  background: #3d2bc4;
}

.btn-send-comment:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:first-of-type {
  padding-top: 0;
}

.detail-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.detail-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.additional-item {
  display: flex;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.additional-item:first-of-type {
  padding-top: 0;
}

.additional-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.additional-item i {
  font-size: 15px;
  color: #6b7280;
  margin-top: 2px;
}

.additional-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.additional-label {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 500;
}

.additional-value {
  font-size: 13px;
  color: #1f2937;
  font-weight: 500;
}

/* Actions Card (Gestor) */
.actions-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.badge-encargado-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fffbf0 0%, #fef3c7 100%);
  border-left: 4px solid #ffc107;
  border-radius: 8px;
  font-size: 13px;
  color: #78350f;
  margin-bottom: 8px;
}

.badge-encargado-info i {
  font-size: 16px;
  color: #f59e0b;
}

.btn-action-primary {
  width: 100%;
  padding: 12px 16px;
  background: #4F39F6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-action-primary:hover:not(:disabled) {
  background: #3d2bc4;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(79, 57, 246, 0.3);
}

.btn-action-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.action-label.required::after {
  content: ' *';
  color: #ef4444;
}

.cancelacion-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
}

.action-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #f59e0b;
  background: #fffbeb;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #fef3c7;
  margin: 0;
}

.action-warning i {
  font-size: 14px;
}

.action-select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  transition: all 0.3s;
  background: white;
  color: #374151;
}

.action-select:focus {
  border-color: #4F39F6;
  box-shadow: 0 0 0 3px rgba(79, 57, 246, 0.1);
}

.action-select:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.current-assignment {
  margin-bottom: 16px;
}

.current-value {
  padding: 10px 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  color: #374151;
  margin-top: 6px;
  font-weight: 500;
}

.asignado-link {
  color: #4F39F6 !important;
  cursor: pointer;
  text-decoration: none;
}

.asignado-link:hover {
  text-decoration: underline;
}

.action-textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  resize: vertical;
  transition: all 0.3s;
  color: #374151;
  min-height: 60px;
}

.action-textarea:focus {
  border-color: #4F39F6;
  box-shadow: 0 0 0 3px rgba(79, 57, 246, 0.1);
}

.action-textarea:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.btn-action-secondary {
  width: 100%;
  padding: 10px 16px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-action-secondary:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
}

.btn-action-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

@media (max-width: 1024px) {
  .content-layout {
    grid-template-columns: 1fr;
  }
  
  .right-column {
    order: -1;
  }
}
</style>
