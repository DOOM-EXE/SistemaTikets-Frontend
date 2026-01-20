import { apiService } from './apiService'

/**
 * Servicio de Usuarios
 * Maneja operaciones relacionadas con usuarios y gestores
 */
class UsuarioService {
  /**
   * Cambia la contraseña de un usuario
   * @param {number} idUsuario - ID del usuario
   * @param {Object} data - { newPassword }
   * @returns {Promise<Object>}
   */
  async cambiarPassword(idUsuario, data) {
    try {
      // Obtener datos actuales del usuario objetivo
      const usuarioActual = await apiService.get(`/Usuarios/${idUsuario}`)
      const payload = {
        nombreCompleto: usuarioActual.nombreCompleto || usuarioActual.nombre || '',
        username: usuarioActual.username,
        idRol: usuarioActual.idRol,
        idAreaAsignada: usuarioActual.idAreaAsignada || usuarioActual.idArea || 1,
        activo: usuarioActual.activo !== undefined ? usuarioActual.activo : true,
        NewPassword: data.NewPassword,
        CambiarSoloPassword: true
      }
      return await apiService.put(`/Usuarios/${idUsuario}`, payload)
    } catch (error) {
      console.error('Error cambiando contraseña del usuario:', error)
      throw error
    }
  }
  /**
   * Obtiene todos los gestores
   * @returns {Promise<Array>}
   */
  async getGestores() {
    try {
      const data = await apiService.get('/Usuarios')
      // Filtrar solo los usuarios con rol Gestor
      return data.filter(usuario => usuario.rol === 'Gestor').map(gestor => ({
        idUsuario: gestor.idUsuario,
        nombre: gestor.nombreCompleto,
        username: gestor.username,
        idArea: gestor.idAreaAsignada,
        nombreArea: gestor.nombreArea
      }))
    } catch (error) {
      console.error('Error obteniendo gestores:', error)
      throw error
    }
  }

  /**
   * Obtiene gestores filtrados por área
   * @param {number} idArea - ID del área
   * @returns {Promise<Array>}
   */
  async getGestoresPorArea(idArea) {
    try {
      const data = await apiService.get('/Usuarios')
      // Filtrar por rol Gestor y área específica
      return data.filter(usuario => 
        usuario.rol === 'Gestor' && usuario.idAreaAsignada === idArea
      ).map(gestor => ({
        idUsuario: gestor.idUsuario,
        nombre: gestor.nombreCompleto,
        username: gestor.username,
        idArea: gestor.idAreaAsignada,
        nombreArea: gestor.nombreArea
      }))
    } catch (error) {
      console.error('Error obteniendo gestores por área:', error)
      throw error
    }
  }

  /**
   * Activa o desactiva un usuario
   * @param {number} idUsuario - ID del usuario
   * @param {boolean} activo - true para activar, false para desactivar
   * @returns {Promise<Object>}
   */
  async toggleEstado(idUsuario, activo) {
    try {
      return await apiService.patch(`/Usuarios/${idUsuario}/estado`, { activo })
    } catch (error) {
      console.error('Error cambiando estado del usuario:', error)
      throw error
    }
  }
}

// Exportar instancia singleton
export const usuarioService = new UsuarioService()
