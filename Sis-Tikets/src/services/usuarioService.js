import { apiService } from './apiService'

/**
 * Servicio de Usuarios
 * Maneja operaciones relacionadas con usuarios y gestores
 */
class UsuarioService {
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
}

// Exportar instancia singleton
export const usuarioService = new UsuarioService()
