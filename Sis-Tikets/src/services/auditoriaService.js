import { apiService } from './apiService'

/**
 * Servicio de Auditoria
 * Maneja operaciones de consulta de registros de auditoria
 */
class AuditoriaService {
  /**
   * Transforma los datos del API al formato esperado
   */
  transformarDatos(item) {
    return {
      idAuditoria: item.idLog || item.idAuditoria,
      idUsuario: item.idUsuario,
      nombreUsuario: item.nombreUsuario,
      tipoAccion: item.tipoAccion,
      entidadAfectada: item.entidadAfectada,
      idEntidad: item.idEntidad,
      descripcion: item.descripcion,
      fechaHora: item.fechaEvento || item.fechaHora,
      ipAddress: item.ipOrigen || item.ipAddress,
      detalles: item.valoresNuevos || item.detalles,
      resultado: item.resultado
    }
  }

  /**
   * Extrae el array de datos de la respuesta
   */
  extraerDatos(response) {
    if (Array.isArray(response)) {
      return response
    }
    if (response && response.data && Array.isArray(response.data)) {
      return response.data
    }
    if (response && response.data && response.data.items && Array.isArray(response.data.items)) {
      return response.data.items
    }
    return []
  }

  /**
   * Obtiene todos los registros de auditoria
   * @returns {Promise<Array>}
   */
  async getAll() {
    try {
      const response = await apiService.get('/Auditoria')
      const datos = this.extraerDatos(response)
      return datos.map(item => this.transformarDatos(item))
    } catch (error) {
      console.error('Error obteniendo auditorias:', error)
      throw error
    }
  }

  /**
   * Obtiene auditorias por usuario
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Array>}
   */
  async getByUsuario(idUsuario) {
    try {
      const response = await apiService.get(`/Auditoria/usuario/${idUsuario}`)
      const datos = this.extraerDatos(response)
      return datos.map(item => this.transformarDatos(item))
    } catch (error) {
      console.error('Error obteniendo auditorias por usuario:', error)
      throw error
    }
  }

  /**
   * Obtiene auditorias por entidad
   * @param {string} entidad - Nombre de la entidad
   * @returns {Promise<Array>}
   */
  async getByEntidad(entidad) {
    try {
      const response = await apiService.get(`/Auditoria/entidad/${entidad}`)
      const datos = this.extraerDatos(response)
      return datos.map(item => this.transformarDatos(item))
    } catch (error) {
      console.error('Error obteniendo auditorias por entidad:', error)
      throw error
    }
  }

  /**
   * Obtiene auditorias por tipo de accion
   * @param {string} tipoAccion - Tipo de accion (Crear, Modificar, Eliminar, etc.)
   * @returns {Promise<Array>}
   */
  async getByAccion(tipoAccion) {
    try {
      const response = await apiService.get(`/Auditoria/accion/${tipoAccion}`)
      const datos = this.extraerDatos(response)
      return datos.map(item => this.transformarDatos(item))
    } catch (error) {
      console.error('Error obteniendo auditorias por accion:', error)
      throw error
    }
  }

  /**
   * Obtiene auditorias por rango de fechas
   * @returns {Promise<Array>}
   */
  async getByFechas() {
    try {
      const response = await apiService.get('/Auditoria/fechas')
      const datos = this.extraerDatos(response)
      return datos.map(item => this.transformarDatos(item))
    } catch (error) {
      console.error('Error obteniendo auditorias por fechas:', error)
      throw error
    }
  }

  /**
   * Obtiene auditorias por rango de fechas (nuevo endpoint filtrado)
   * @param {string} fechaInicio ISO
   * @param {string} fechaFin ISO
   * @returns {Promise<Array>}
   */
  async getByFechasRango(fechaInicio, fechaFin) {
    try {
      const response = await apiService.get('/Auditoria/filtrar-fechas', {
        params: {
          fechaInicio,
          fechaFin
        }
      })
      const datos = this.extraerDatos(response)
      return datos.map(item => this.transformarDatos(item))
    } catch (error) {
      console.error('Error obteniendo auditorias por rango de fechas:', error)
      throw error
    }
  }

  /**
   * Filtra auditorias con multiples criterios
   * @param {Object} filtros - Objeto con criterios de filtrado
   * @returns {Promise<Array>}
   */
  async filtrar(filtros) {
    try {
      const body = {
        idUsuario: filtros.idUsuario || null,
        tipoAccion: filtros.tipoAccion || '',
        entidadAfectada: filtros.entidadAfectada || '',
        idEntidad: 0,
        fechaInicio: filtros.fechaInicio || null,
        fechaFin: filtros.fechaFin || null,
        pageNumber: filtros.pageNumber || 1,
        pageSize: filtros.pageSize || 50
      }

      console.log('Body enviado al API:', body)
      const response = await apiService.post('/Auditoria/filtrar', body)
      console.log('Respuesta del API:', response)
      const datos = this.extraerDatos(response)
      console.log('Datos extraidos:', datos)
      const resultado = datos.map(item => this.transformarDatos(item))
      console.log('Datos transformados:', resultado)
      return resultado
    } catch (error) {
      console.error('Error filtrando auditorias:', error)
      throw error
    }
  }
}

export const auditoriaService = new AuditoriaService()
