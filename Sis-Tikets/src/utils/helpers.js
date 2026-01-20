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
 * Descarga un archivo del servidor
 * @param {string} fileName - Nombre del archivo a descargar
 * @param {string} baseURL - URL base de la API
 */
export const DescargarArchivo = async (fileName, baseURL) => {
  try {
    const token = localStorage.getItem('token')
    
    const response = await fetch(`${baseURL}/Archivos/download/${fileName}`, {
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
    throw error
  }
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
