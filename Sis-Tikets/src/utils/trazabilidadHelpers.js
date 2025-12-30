/**
 * Helpers para Trazabilidad de Solicitudes
 * Funciones para mapear acciones a iconos, títulos y estilos
 */

/**
 * Mapea una acción de trazabilidad a su icono de PrimeIcons
 * @param {string} accion - Acción de trazabilidad
 * @returns {string} Clase de icono
 */
export const getTrazabilidadIcon = (accion) => {
  const iconos = {
    'ASIGNACION_POR_ADMIN': 'pi-shield',
    'ASIGNACION_POR_SUPERVISOR': 'pi-user-edit',
    'TOMAR_SOLICITUD': 'pi-hand',
    'CREACION': 'pi-plus-circle',
    'CAMBIO_ESTADO': 'pi-sync',
    'Cambio de Estado': 'pi-sync',
    'Asignación de Gestor': 'pi-user',
    'Cambio de Prioridad': 'pi-exclamation-triangle',
    'Comentario Agregado': 'pi-comment',
    'COMENTARIO': 'pi-comment'
  }
  return iconos[accion] || 'pi-circle'
}

/**
 * Mapea una acción de trazabilidad a su título legible
 * @param {string} accion - Acción de trazabilidad
 * @returns {string} Título legible
 */
export const getTrazabilidadTitulo = (accion) => {
  const titulos = {
    'ASIGNACION_POR_ADMIN': 'Asignación por Administrador',
    'ASIGNACION_POR_SUPERVISOR': 'Asignación por Supervisor',
    'TOMAR_SOLICITUD': 'Solicitud Tomada',
    'CREACION': 'Solicitud Creada',
    'CAMBIO_ESTADO': 'Cambio de Estado',
    'Cambio de Estado': 'Cambio de Estado',
    'Asignación de Gestor': 'Asignación de Gestor',
    'Cambio de Prioridad': 'Cambio de Prioridad',
    'Comentario Agregado': 'Comentario',
    'COMENTARIO': 'Comentario'
  }
  return titulos[accion] || accion
}

/**
 * Mapea una acción de trazabilidad a su clase CSS de estilo
 * @param {string} accion - Acción de trazabilidad
 * @returns {string} Clase CSS
 */
export const getTrazabilidadClass = (accion) => {
  // Asignaciones por Admin
  if (accion === 'ASIGNACION_POR_ADMIN') return 'timeline-admin'
  
  // Asignaciones por Supervisor/Encargado
  if (accion === 'ASIGNACION_POR_SUPERVISOR') return 'timeline-supervisor'
  
  // Auto-asignación (Gestor toma solicitud)
  if (accion === 'TOMAR_SOLICITUD') return 'timeline-tomar'
  
  // Creación
  if (accion === 'CREACION') return 'timeline-creacion'
  
  // Cambios de estado
  if (accion === 'CAMBIO_ESTADO' || accion === 'Cambio de Estado') return 'timeline-estado'
  
  // Asignación genérica
  if (accion === 'Asignación de Gestor') return 'timeline-asignacion'
  
  // Cambio de prioridad
  if (accion === 'Cambio de Prioridad') return 'timeline-prioridad'
  
  // Comentarios
  if (accion === 'Comentario Agregado' || accion === 'COMENTARIO') return 'timeline-comentario'
  
  return 'timeline-default'
}

/**
 * Mapea una acción de trazabilidad a su color
 * @param {string} accion - Acción de trazabilidad
 * @returns {string} Color hexadecimal
 */
export const getTrazabilidadColor = (accion) => {
  const colores = {
    'ASIGNACION_POR_ADMIN': '#dc3545',      // Rojo
    'ASIGNACION_POR_SUPERVISOR': '#ffc107', // Amarillo/Dorado
    'TOMAR_SOLICITUD': '#28a745',           // Verde
    'CREACION': '#007bff',                  // Azul
    'CAMBIO_ESTADO': '#fd7e14',             // Naranja
    'Cambio de Estado': '#fd7e14',
    'Asignación de Gestor': '#6c757d',      // Gris
    'Cambio de Prioridad': '#e83e8c',       // Rosa
    'Comentario Agregado': '#17a2b8',       // Cian
    'COMENTARIO': '#17a2b8'
  }
  return colores[accion] || '#6c757d'
}

/**
 * Determina si una acción es de asignación
 * @param {string} accion - Acción de trazabilidad
 * @returns {boolean}
 */
export const esAccionAsignacion = (accion) => {
  return ['ASIGNACION_POR_ADMIN', 'ASIGNACION_POR_SUPERVISOR', 'TOMAR_SOLICITUD', 'Asignación de Gestor'].includes(accion)
}

/**
 * Determina el tipo de actor según la acción
 * @param {string} accion - Acción de trazabilidad
 * @returns {string} Tipo de actor (admin, supervisor, gestor, sistema)
 */
export const getTipoActor = (accion) => {
  if (accion === 'ASIGNACION_POR_ADMIN') return 'admin'
  if (accion === 'ASIGNACION_POR_SUPERVISOR') return 'supervisor'
  if (accion === 'TOMAR_SOLICITUD') return 'gestor'
  return 'usuario'
}

/**
 * Formatea la fecha de un evento de trazabilidad
 * @param {string|Date} fecha - Fecha del evento
 * @returns {string} Fecha formateada
 */
export const formatFechaTrazabilidad = (fecha) => {
  const date = new Date(fecha)
  const ahora = new Date()
  const diffMs = ahora - date
  const diffMinutos = Math.floor(diffMs / 60000)
  const diffHoras = Math.floor(diffMs / 3600000)
  const diffDias = Math.floor(diffMs / 86400000)

  // Hace menos de 1 minuto
  if (diffMinutos < 1) return 'Hace un momento'
  
  // Hace menos de 60 minutos
  if (diffMinutos < 60) return `Hace ${diffMinutos} ${diffMinutos === 1 ? 'minuto' : 'minutos'}`
  
  // Hace menos de 24 horas
  if (diffHoras < 24) return `Hace ${diffHoras} ${diffHoras === 1 ? 'hora' : 'horas'}`
  
  // Hace menos de 7 días
  if (diffDias < 7) return `Hace ${diffDias} ${diffDias === 1 ? 'día' : 'días'}`
  
  // Más de 7 días, mostrar fecha completa
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Ordena eventos de trazabilidad por fecha (más recientes primero)
 * @param {Array} eventos - Array de eventos de trazabilidad
 * @returns {Array} Eventos ordenados
 */
export const ordenarTrazabilidad = (eventos) => {
  return [...eventos].sort((a, b) => {
    return new Date(b.fechaEvento) - new Date(a.fechaEvento)
  })
}

/**
 * Agrupa eventos de trazabilidad por fecha
 * @param {Array} eventos - Array de eventos de trazabilidad
 * @returns {Object} Eventos agrupados por fecha
 */
export const agruparTrazabilidadPorFecha = (eventos) => {
  const grupos = {}
  
  eventos.forEach(evento => {
    const fecha = new Date(evento.fechaEvento)
    const fechaKey = fecha.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
    
    if (!grupos[fechaKey]) {
      grupos[fechaKey] = []
    }
    grupos[fechaKey].push(evento)
  })
  
  return grupos
}
