/**
 * Utilidades para formateo y validaciones
 */

/**
 * Formatea el estado del ticket para mostrar
 */
export const formatEstado = (estado) => {
  const map = {
    'nueva': 'Nueva',
    'en-proceso': 'En proceso',
    'cerrada': 'Cerrada',
    'resuelto': 'Resuelto',
    'rechazada': 'Rechazada'
  }
  return map[estado] || estado
}

/**
 * Formatea la prioridad del ticket para mostrar
 */
export const formatPrioridad = (prioridad) => {
  const map = {
    'alta': 'Alta',
    'media': 'Media',
    'baja': 'Baja'
  }
  return map[prioridad] || prioridad
}

/**
 * Formatea una fecha a formato dd/mm/yyyy
 */
export const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Valida un email
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * Obtiene la clase CSS según el estado
 */
export const getEstadoClass = (estado) => {
  return `badge-${estado}`
}

/**
 * Obtiene la clase CSS según la prioridad
 */
export const getPrioridadClass = (prioridad) => {
  return `badge-${prioridad}`
}
