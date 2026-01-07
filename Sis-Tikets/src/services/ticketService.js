import { Ticket } from '@/models'
import { apiService } from './apiService'

/**
 * Servicio de Tickets
 * Maneja operaciones CRUD de tickets
 */
class TicketService {
  /**
   * Obtiene todos los tickets del usuario actual
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Ticket[]>}
   */
  async getTickets(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      if (filters.idEstado) params.append('idEstado', filters.idEstado)
      if (filters.idArea) params.append('idArea', filters.idArea)
      if (filters.idPrioridad) params.append('idPrioridad', filters.idPrioridad)
      if (filters.fechaDesde) params.append('fechaDesde', filters.fechaDesde)
      if (filters.fechaHasta) params.append('fechaHasta', filters.fechaHasta)
      if (filters.busqueda) params.append('busqueda', filters.busqueda)

      const queryString = params.toString()
      const endpoint = queryString ? `/Solicitudes/mis-solicitudes?${queryString}` : '/Solicitudes/mis-solicitudes'
      
      const data = await apiService.get(endpoint)
      
      return data.map(item => Ticket.fromJSON({
        id: item.idSolicitud,
        numero: `#${item.idSolicitud}`,
        codigo: item.codigo || null,
        area: item.nombreArea || item.area || 'N/A',
        tipo: item.nombreTipoSolicitud || item.tipoSolicitud || 'N/A',
        asunto: item.asunto || item.titulo || 'N/A',
        estado: this.mapEstadoFromAPI(item.nombreEstado || item.estado),
        prioridad: this.mapPrioridadFromAPI(item.nombrePrioridad || item.prioridad),
        fecha: new Date(item.fechaCreacion).toLocaleDateString('es-MX')
      }))
    } catch (error) {
      console.error('Error obteniendo tickets:', error)
      throw error
    }
  }

  /**
   * Obtiene las solicitudes asignadas al gestor actual
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>}
   */
  async getTicketsAsignadosAMi(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      if (filters.idEstado) params.append('idEstado', filters.idEstado)
      if (filters.idPrioridad) params.append('idPrioridad', filters.idPrioridad)
      if (filters.fechaDesde) params.append('fechaDesde', filters.fechaDesde)
      if (filters.fechaHasta) params.append('fechaHasta', filters.fechaHasta)
      if (filters.busqueda) params.append('busqueda', filters.busqueda)

      const queryString = params.toString()
      const endpoint = queryString ? `/Solicitudes/asignadas-a-mi?${queryString}` : '/Solicitudes/asignadas-a-mi'
      
      const data = await apiService.get(endpoint)
      
      return data.map(item => ({
        id: item.idSolicitud,
        numero: `#${item.idSolicitud}`,
        codigo: item.codigo || null,
        tipo: item.nombreTipoSolicitud || 'N/A',
        asunto: item.asunto || 'N/A',
        solicitante: item.nombreSolicitante || 'N/A',
        estado: this.mapEstadoFromAPI(item.nombreEstado),
        prioridad: this.mapPrioridadFromAPI(item.nombrePrioridad),
        gestor: item.nombreGestorAsignado || null,
        fecha: new Date(item.fechaCreacion).toLocaleDateString('es-MX')
      }))
    } catch (error) {
      console.error('Error obteniendo solicitudes asignadas:', error)
      throw error
    }
  }

  /**
   * Obtiene todas las solicitudes (para gestor/admin)
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>}
   */
  async getAllSolicitudes(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      if (filters.idEstado) params.append('idEstado', filters.idEstado)
      if (filters.idPrioridad) params.append('idPrioridad', filters.idPrioridad)
      if (filters.fechaDesde) params.append('fechaDesde', filters.fechaDesde)
      if (filters.fechaHasta) params.append('fechaHasta', filters.fechaHasta)
      if (filters.busqueda) params.append('busqueda', filters.busqueda)

      const queryString = params.toString()
      const endpoint = queryString ? `/Solicitudes?${queryString}` : '/Solicitudes'
      
      const data = await apiService.get(endpoint)
      
      return data.map(item => ({
        id: item.idSolicitud,
        numero: `#${item.idSolicitud}`,
        codigo: item.codigo || null,
        tipo: item.nombreTipoSolicitud || 'N/A',
        asunto: item.asunto || 'N/A',
        solicitante: item.nombreSolicitante || 'N/A',
        estado: this.mapEstadoFromAPI(item.nombreEstado),
        prioridad: this.mapPrioridadFromAPI(item.nombrePrioridad),
        gestor: item.nombreGestorAsignado || null,
        idGestorAsignado: item.idGestorAsignado || null,
        fecha: new Date(item.fechaCreacion).toLocaleDateString('es-MX'),
        fechaCreacion: item.fechaCreacion,
        idEstado: item.idEstado,
        idPrioridad: item.idPrioridad,
        idArea: item.idArea
      }))
    } catch (error) {
      console.error('Error obteniendo todas las solicitudes:', error)
      throw error
    }
  }

  /**
   * Toma una solicitud (asignar al gestor actual)
   * @param {number} id - ID de la solicitud
   * @returns {Promise<Object>}
   */
  async tomarSolicitud(id) {
    try {
      const data = await apiService.post(`/Solicitudes/${id}/tomar`, {})
      return data
    } catch (error) {
      console.error('Error tomando solicitud:', error)
      throw error
    }
  }

  /**
   * Asigna un gestor a una solicitud
   * @param {number} id - ID de la solicitud
   * @param {number} idGestor - ID del gestor
   * @returns {Promise<Object>}
   */
  async asignarGestorASolicitud(id, idGestor) {
    try {
      const data = await apiService.post(`/Solicitudes/${id}/asignar-gestor`, { idGestor })
      return data
    } catch (error) {
      console.error('Error asignando gestor:', error)
      throw error
    }
  }

  /**
   * Cambia el estado de una solicitud
   * @param {number} id - ID de la solicitud
   * @param {number} idEstado - ID del nuevo estado
   * @param {string} comentario - Comentario sobre el cambio
   * @returns {Promise<Object>}
   */
  async cambiarEstadoSolicitud(id, idEstado, comentario = '') {
    try {
      const data = await apiService.post(`/Solicitudes/${id}/cambiar-estado`, { 
        idEstado, 
        comentario 
      })
      return data
    } catch (error) {
      console.error('Error cambiando estado:', error)
      throw error
    }
  }

  /**
   * Obtiene un ticket por su ID
   * @param {number} id - ID del ticket
   * @returns {Promise<Ticket>}
   */
  async getTicketById(id) {
    try {
      const response = await apiService.get(`/Solicitudes/${id}`)
      const data = response.solicitud // Extraer la solicitud del objeto wrapper
      
      const ticket = Ticket.fromJSON({
        id: data.idSolicitud,
        numero: `#${data.idSolicitud}`,
        codigo: data.codigo || null,
        area: data.nombreArea || 'N/A',
        tipo: data.nombreTipoSolicitud || 'N/A',
        asunto: data.asunto,
        descripcion: data.descripcion,
        estado: this.mapEstadoFromAPI(data.nombreEstado),
        prioridad: this.mapPrioridadFromAPI(data.nombrePrioridad),
        fecha: new Date(data.fechaCreacion).toLocaleDateString('es-MX'),
        fechaCreacion: data.fechaCreacion,
        fechaActualizacion: data.fechaAsignacion,
        idSolicitante: data.idSolicitante,
        solicitante: data.nombreSolicitante || 'N/A',
        idGestorAsignado: data.idGestorAsignado || null,
        gestor: data.nombreGestorAsignado || null,
        archivoUrl: data.archivoUrl || null,
        idPrioridad: data.idPrioridad,
        idArea: data.idArea,
        idTipoSolicitud: data.idTipoSolicitud,
        idEstado: data.idEstado
      })

      // Agregar trazabilidad si viene en la respuesta
      if (response.trazabilidad) {
        ticket.trazabilidad = response.trazabilidad
      }

      return ticket
    } catch (error) {
      console.error('Error obteniendo ticket:', error)
      throw error
    }
  }

  /**
   * Obtiene la trazabilidad de una solicitud
   * @param {number} id - ID de la solicitud
   * @returns {Promise<Array>}
   */
  async getTrazabilidad(id) {
    try {
      const data = await apiService.get(`/Solicitudes/${id}/trazabilidad`)
      return data || []
    } catch (error) {
      console.error('Error obteniendo trazabilidad:', error)
      return []
    }
  }

  /**
   * Crea un nuevo ticket
   * @param {Object} ticketData - Datos del ticket
   * @returns {Promise<Ticket>}
   */
  async createTicket(ticketData) {
    try {
      const payload = {
        asunto: ticketData.asunto,
        descripcion: ticketData.descripcion,
        idArea: ticketData.idArea,
        idTipoSolicitud: ticketData.idTipoSolicitud,
        idPrioridad: ticketData.idPrioridad
      }

      // Solo agregar archivoUrl si existe
      if (ticketData.archivoUrl) {
        payload.archivoUrl = ticketData.archivoUrl
      }

      const data = await apiService.post('/Solicitudes', payload)
      
      return Ticket.fromJSON({
        id: data.idSolicitud,
        numero: `#${data.idSolicitud}`,
        area: data.nombreArea || 'N/A',
        tipo: data.nombreTipoSolicitud || 'N/A',
        asunto: data.asunto,
        descripcion: data.descripcion,
        estado: this.mapEstadoFromAPI(data.nombreEstado),
        prioridad: this.mapPrioridadFromAPI(data.nombrePrioridad),
        fecha: new Date(data.fechaCreacion).toLocaleDateString('es-MX')
      })
    } catch (error) {
      console.error('Error creando ticket:', error)
      throw error
    }
  }

  /**
   * Actualiza un ticket existente (solo asunto, descripcion, idPrioridad)
   * Solo se puede editar si está en estado "Nueva"
   * @param {number} id - ID del ticket
   * @param {Object} updates - { asunto, descripcion, idPrioridad }
   * @returns {Promise<Ticket>}
   */
  async updateTicket(id, updates) {
    try {
      const payload = {
        asunto: updates.asunto.trim(),
        descripcion: updates.descripcion.trim(),
        idPrioridad: parseInt(updates.idPrioridad, 10)
      }

      console.log('📤 Enviando actualización:', payload)

      const data = await apiService.put(`/Solicitudes/${id}`, payload)
      
      return Ticket.fromJSON({
        id: data.idSolicitud,
        numero: `#${data.idSolicitud}`,
        codigo: data.codigo || null,
        area: data.nombreArea || 'N/A',
        tipo: data.nombreTipoSolicitud || 'N/A',
        asunto: data.asunto,
        descripcion: data.descripcion,
        estado: this.mapEstadoFromAPI(data.nombreEstado),
        prioridad: this.mapPrioridadFromAPI(data.nombrePrioridad),
        fecha: new Date(data.fechaCreacion).toLocaleDateString('es-MX')
      })
    } catch (error) {
      console.error('Error actualizando ticket:', error)
      throw error
    }
  }

  /**
   * Elimina un ticket
   * @param {number} id - ID del ticket
   * @returns {Promise<boolean>}
   */
  async deleteTicket(id) {
    try {
      await apiService.delete(`/solicitudes/${id}`)
      return true
    } catch (error) {
      console.error('Error eliminando ticket:', error)
      throw error
    }
  }

  /**
   * Cambia el estado de una solicitud
   * @param {number} id - ID de la solicitud
   * @param {string} estado - Nuevo estado
   * @returns {Promise<Ticket>}
   */
  async cambiarEstado(id, estado) {
    try {
      const data = await apiService.put(`/solicitudes/${id}/estado`, { estado })
      
      return Ticket.fromJSON({
        id: data.idSolicitud,
        numero: `#${data.idSolicitud}`,
        area: data.area || 'N/A',
        tipo: data.tipoSolicitud || 'N/A',
        asunto: data.titulo,
        estado: this.mapEstadoFromAPI(data.estado),
        prioridad: this.mapPrioridadFromAPI(data.prioridad),
        fecha: new Date(data.fechaCreacion).toLocaleDateString('es-MX')
      })
    } catch (error) {
      console.error('Error cambiando estado:', error)
      throw error
    }
  }

  /**
   * Asigna un gestor a una solicitud
   * @param {number} id - ID de la solicitud
   * @param {number} idGestor - ID del gestor
   * @returns {Promise<Ticket>}
   */
  async asignarGestor(id, idGestor) {
    try {
      const data = await apiService.put(`/solicitudes/${id}/asignar`, { idGestor })
      
      return Ticket.fromJSON({
        id: data.idSolicitud,
        numero: `#${data.idSolicitud}`,
        area: data.area || 'N/A',
        tipo: data.tipoSolicitud || 'N/A',
        asunto: data.titulo,
        estado: this.mapEstadoFromAPI(data.estado),
        prioridad: this.mapPrioridadFromAPI(data.prioridad),
        fecha: new Date(data.fechaCreacion).toLocaleDateString('es-MX')
      })
    } catch (error) {
      console.error('Error asignando gestor:', error)
      throw error
    }
  }

  /**
   * Mapea estado de la API al formato interno
   */
  mapEstadoFromAPI(estado) {
    if (!estado) return 'nuevo'
    
    const map = {
      'Abierta': 'nuevo',
      'En Progreso': 'en-proceso',
      'Cerrada': 'cerrada',
      'Resuelta': 'resuelto',
      'Rechazado': 'rechazada'
    }
    return map[estado] || estado.toLowerCase()
  }

  /**
   * Mapea prioridad de la API al formato interno
   */
  mapPrioridadFromAPI(prioridad) {
    if (!prioridad) return 'media'
    return prioridad.toLowerCase()
  }
}

// Exportar instancia singleton
export const ticketService = new TicketService()

