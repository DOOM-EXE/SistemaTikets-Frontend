import { Encargado } from '@/models'
import { apiService } from './apiService'

/**
 * Servicio de Encargados
 * Maneja operaciones CRUD de encargados
 */
class EncargadoService {
  /**
   * Obtiene todos los encargados
   * @returns {Promise<Encargado[]>}
   */
  async getAll() {
    try {
      const data = await apiService.get('/Encargados')
      return data.map(item => Encargado.fromJSON(item))
    } catch (error) {
      console.error('Error obteniendo todos los encargados:', error)
      throw error
    }
  }

  /**
   * Obtiene los encargados de un área específica
   * @param {number} idArea - ID del área
   * @returns {Promise<Encargado[]>}
   */
  async getEncargadosPorArea(idArea) {
    try {
      const data = await apiService.get(`/Encargados/area/${idArea}`)
      return data.map(item => Encargado.fromJSON(item))
    } catch (error) {
      console.error('Error obteniendo encargados del área:', error)
      throw error
    }
  }

  /**
   * Obtiene las áreas donde un usuario es encargado
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Encargado[]>}
   */
  async getEncargadosPorUsuario(idUsuario) {
    try {
      const data = await apiService.get(`/Encargados/usuario/${idUsuario}`)
      return data.map(item => Encargado.fromJSON(item))
    } catch (error) {
      console.error('Error obteniendo encargados del usuario:', error)
      throw error
    }
  }

  /**
   * Obtiene todos los encargados activos
   * @returns {Promise<Encargado[]>}
   */
  async getEncargadosActivos() {
    try {
      const data = await apiService.get('/Encargados')
      // Filtrar solo activos en el frontend
      return data
        .filter(item => item.activo)
        .map(item => Encargado.fromJSON(item))
    } catch (error) {
      console.error('Error obteniendo encargados activos:', error)
      throw error
    }
  }

  /**
   * Obtiene encargados activos de un área específica
   * @param {number} idArea - ID del área
   * @returns {Promise<Encargado[]>}
   */
  async getEncargadosActivosPorArea(idArea) {
    try {
      const data = await apiService.get(`/Encargados/area/${idArea}/activos`)
      return data.map(item => Encargado.fromJSON(item))
    } catch (error) {
      console.error('Error obteniendo encargados activos del área:', error)
      throw error
    }
  }

  /**
   * Obtiene gestores disponibles para asignar como encargados
   * @param {number} idArea - ID del área
   * @returns {Promise<any[]>}
   */
  async getGestoresDisponibles(idArea) {
    try {
      const data = await apiService.get(`/Encargados/area/${idArea}/gestores-disponibles`)
      return data
    } catch (error) {
      console.error('Error obteniendo gestores disponibles:', error)
      throw error
    }
  }

  /**
   * Verifica si un usuario es encargado ACTIVO de un área
   * @param {number} idUsuario - ID del usuario
   * @param {number} idArea - ID del área
   * @returns {Promise<{esEncargado: boolean, activo: boolean}>}
   */
  async verificarEncargado(idUsuario, idArea) {
    try {
      const result = await apiService.get(`/Encargados/verificar/${idUsuario}/${idArea}`)
      
      // Si el API devuelve un boolean simple, convertirlo a objeto
      if (typeof result === 'boolean') {
        return { esEncargado: result, activo: result }
      }
      
      // Si devuelve un objeto, asegurar que tenga la estructura esperada
      if (typeof result === 'object' && result !== null) {
        return {
          esEncargado: result.esEncargado === true,
          activo: result.activo !== false // Por defecto true si no viene
        }
      }
      
      return { esEncargado: false, activo: false }
    } catch (error) {
      console.error('Error verificando encargado:', error)
      // En caso de error, no es encargado
      return { esEncargado: false, activo: false }
    }
  }

  /**
   * Asigna un encargado a un área
   * @param {number} idUsuario - ID del usuario
   * @param {number} idArea - ID del área
   * @returns {Promise<Encargado>}
   */
  async asignarEncargado(idUsuario, idArea) {
    try {
      const data = await apiService.post('/Encargados', {
        idUsuario,
        idArea
      })
      return Encargado.fromJSON(data)
    } catch (error) {
      console.error('Error asignando encargado:', error)
      throw error
    }
  }

  /**
   * Desactiva un encargado (sin eliminar)
   * @param {number} idEncargado - ID del encargado
   * @returns {Promise<void>}
   */
  async desactivarEncargado(idEncargado) {
    try {
      await apiService.put(`/Encargados/${idEncargado}`, { activo: false })
    } catch (error) {
      console.error('Error desactivando encargado:', error)
      throw error
    }
  }

  /**
   * Activa un encargado
   * @param {number} idEncargado - ID del encargado
   * @returns {Promise<void>}
   */
  async activarEncargado(idEncargado) {
    try {
      await apiService.put(`/Encargados/${idEncargado}`, { activo: true })
    } catch (error) {
      console.error('Error activando encargado:', error)
      throw error
    }
  }

  /**
   * Elimina un encargado
   * @param {number} idEncargado - ID del encargado
   * @returns {Promise<void>}
   */
  async eliminarEncargado(idEncargado) {
    try {
      await apiService.delete(`/Encargados/${idEncargado}`)
    } catch (error) {
      console.error('Error eliminando encargado:', error)
      throw error
    }
  }
}

export const encargadoService = new EncargadoService()
