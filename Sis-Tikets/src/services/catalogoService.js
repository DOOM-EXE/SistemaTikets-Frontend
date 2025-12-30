import { apiService } from './apiService'

/**
 * Servicio de Catálogos
 * Maneja la obtención y gestión de catálogos (áreas, tipos, prioridades, estados)
 */
class CatalogoService {
  // ============= ÁREAS =============
  
  /**
   * Obtiene todas las áreas
   * @returns {Promise<Array>}
   */
  async getAreas() {
    try {
      const data = await apiService.get('/Catalogos/areas')
      return data
    } catch (error) {
      console.error('Error obteniendo áreas:', error)
      throw error
    }
  }

  /**
   * Obtiene un área por ID
   * @param {number} id - ID del área
   * @returns {Promise<Object>}
   */
  async getAreaById(id) {
    try {
      const data = await apiService.get(`/Catalogos/areas/${id}`)
      return data
    } catch (error) {
      console.error('Error obteniendo área:', error)
      throw error
    }
  }

  /**
   * Crea una nueva área
   * @param {Object} area - Datos del área
   * @returns {Promise<Object>}
   */
  async createArea(area) {
    try {
      const data = await apiService.post('/Catalogos/areas', area)
      return data
    } catch (error) {
      console.error('Error creando área:', error)
      throw error
    }
  }

  /**
   * Actualiza un área
   * @param {number} id - ID del área
   * @param {Object} area - Datos actualizados del área
   * @returns {Promise<Object>}
   */
  async updateArea(id, area) {
    try {
      const data = await apiService.put(`/Catalogos/areas/${id}`, area)
      return data
    } catch (error) {
      console.error('Error actualizando área:', error)
      throw error
    }
  }

  /**
   * Elimina un área
   * @param {number} id - ID del área
   * @returns {Promise<void>}
   */
  async deleteArea(id) {
    try {
      await apiService.delete(`/Catalogos/areas/${id}`)
    } catch (error) {
      console.error('Error eliminando área:', error)
      throw error
    }
  }

  // ============= TIPOS DE SOLICITUD =============

  /**
   * Obtiene todos los tipos de solicitud
   * @returns {Promise<Array>}
   */
  async getTiposSolicitud() {
    try {
      const data = await apiService.get('/Catalogos/tipos-solicitud')
      return data
    } catch (error) {
      console.error('Error obteniendo tipos de solicitud:', error)
      throw error
    }
  }

  /**
   * Obtiene tipos de solicitud filtrados por área
   * @param {number} idArea - ID del área
   * @returns {Promise<Array>}
   */
  async getTiposSolicitudPorArea(idArea) {
    try {
      const data = await apiService.get(`/Catalogos/tipos-solicitud/area/${idArea}`)
      return data
    } catch (error) {
      console.error('Error obteniendo tipos de solicitud por área:', error)
      throw error
    }
  }

  /**
   * Obtiene un tipo de solicitud por ID
   * @param {number} id - ID del tipo de solicitud
   * @returns {Promise<Object>}
   */
  async getTipoSolicitudById(id) {
    try {
      const data = await apiService.get(`/Catalogos/tipos-solicitud/${id}`)
      return data
    } catch (error) {
      console.error('Error obteniendo tipo de solicitud:', error)
      throw error
    }
  }

  /**
   * Crea un nuevo tipo de solicitud
   * @param {Object} tipo - Datos del tipo de solicitud
   * @returns {Promise<Object>}
   */
  async createTipoSolicitud(tipo) {
    try {
      const data = await apiService.post('/Catalogos/tipos-solicitud', tipo)
      return data
    } catch (error) {
      console.error('Error creando tipo de solicitud:', error)
      throw error
    }
  }

  /**
   * Actualiza un tipo de solicitud
   * @param {number} id - ID del tipo de solicitud
   * @param {Object} tipo - Datos actualizados del tipo de solicitud
   * @returns {Promise<Object>}
   */
  async updateTipoSolicitud(id, tipo) {
    try {
      const data = await apiService.put(`/Catalogos/tipos-solicitud/${id}`, tipo)
      return data
    } catch (error) {
      console.error('Error actualizando tipo de solicitud:', error)
      throw error
    }
  }

  /**
   * Elimina un tipo de solicitud
   * @param {number} id - ID del tipo de solicitud
   * @returns {Promise<void>}
   */
  async deleteTipoSolicitud(id) {
    try {
      await apiService.delete(`/Catalogos/tipos-solicitud/${id}`)
    } catch (error) {
      console.error('Error eliminando tipo de solicitud:', error)
      throw error
    }
  }

  // ============= PRIORIDADES =============

  /**
   * Obtiene todas las prioridades
   * @returns {Promise<Array>}
   */
  async getPrioridades() {
    try {
      const data = await apiService.get('/Catalogos/prioridades')
      return data
    } catch (error) {
      console.error('Error obteniendo prioridades:', error)
      throw error
    }
  }

  /**
   * Obtiene una prioridad por ID
   * @param {number} id - ID de la prioridad
   * @returns {Promise<Object>}
   */
  async getPrioridadById(id) {
    try {
      const data = await apiService.get(`/Catalogos/prioridades/${id}`)
      return data
    } catch (error) {
      console.error('Error obteniendo prioridad:', error)
      throw error
    }
  }

  /**
   * Crea una nueva prioridad
   * @param {Object} prioridad - Datos de la prioridad
   * @returns {Promise<Object>}
   */
  async createPrioridad(prioridad) {
    try {
      const data = await apiService.post('/Catalogos/prioridades', prioridad)
      return data
    } catch (error) {
      console.error('Error creando prioridad:', error)
      throw error
    }
  }

  /**
   * Actualiza una prioridad
   * @param {number} id - ID de la prioridad
   * @param {Object} prioridad - Datos actualizados de la prioridad
   * @returns {Promise<Object>}
   */
  async updatePrioridad(id, prioridad) {
    try {
      const data = await apiService.put(`/Catalogos/prioridades/${id}`, prioridad)
      return data
    } catch (error) {
      console.error('Error actualizando prioridad:', error)
      throw error
    }
  }

  /**
   * Elimina una prioridad
   * @param {number} id - ID de la prioridad
   * @returns {Promise<void>}
   */
  async deletePrioridad(id) {
    try {
      await apiService.delete(`/Catalogos/prioridades/${id}`)
    } catch (error) {
      console.error('Error eliminando prioridad:', error)
      throw error
    }
  }

  // ============= ESTADOS =============

  /**
   * Obtiene todos los estados
   * @returns {Promise<Array>}
   */
  async getEstados() {
    try {
      const data = await apiService.get('/Catalogos/estados')
      return data
    } catch (error) {
      console.error('Error obteniendo estados:', error)
      throw error
    }
  }

  /**
   * Obtiene un estado por ID
   * @param {number} id - ID del estado
   * @returns {Promise<Object>}
   */
  async getEstadoById(id) {
    try {
      const data = await apiService.get(`/Catalogos/estados/${id}`)
      return data
    } catch (error) {
      console.error('Error obteniendo estado:', error)
      throw error
    }
  }

  /**
   * Crea un nuevo estado
   * @param {Object} estado - Datos del estado
   * @returns {Promise<Object>}
   */
  async createEstado(estado) {
    try {
      const data = await apiService.post('/Catalogos/estados', estado)
      return data
    } catch (error) {
      console.error('Error creando estado:', error)
      throw error
    }
  }

  /**
   * Actualiza un estado
   * @param {number} id - ID del estado
   * @param {Object} estado - Datos actualizados del estado
   * @returns {Promise<Object>}
   */
  async updateEstado(id, estado) {
    try {
      const data = await apiService.put(`/Catalogos/estados/${id}`, estado)
      return data
    } catch (error) {
      console.error('Error actualizando estado:', error)
      throw error
    }
  }

  /**
   * Elimina un estado
   * @param {number} id - ID del estado
   * @returns {Promise<void>}
   */
  async deleteEstado(id) {
    try {
      await apiService.delete(`/Catalogos/estados/${id}`)
    } catch (error) {
      console.error('Error eliminando estado:', error)
      throw error
    }
  }

  // ============= ROLES =============

  /**
   * Obtiene todos los roles
   * @returns {Promise<Array>}
   */
  async getRoles() {
    try {
      const data = await apiService.get('/Catalogos/roles')
      return data
    } catch (error) {
      console.error('Error obteniendo roles:', error)
      throw error
    }
  }
}

// Exportar instancia singleton
export const catalogoService = new CatalogoService()
