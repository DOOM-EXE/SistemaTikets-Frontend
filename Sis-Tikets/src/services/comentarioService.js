import { apiService } from './apiService'

/**
 * Servicio de Comentarios
 * Maneja las operaciones de comentarios en solicitudes
 */
class ComentarioService {
  /**
   * Obtiene todos los comentarios de una solicitud
   * @param {number} idSolicitud - ID de la solicitud
   * @returns {Promise<Array>}
   */
  async getComentarios(idSolicitud) {
    try {
      const data = await apiService.get(`/Comentarios/solicitud/${idSolicitud}`)
      return data.map(comentario => ({
        idComentario: comentario.idComentario,
        texto: comentario.texto,
        fechaComentario: comentario.fechaComentario,
        idUsuario: comentario.idUsuario,
        nombreUsuario: comentario.nombreUsuario
      }))
    } catch (error) {
      console.error('Error obteniendo comentarios:', error)
      throw error
    }
  }

  /**
   * Crea un nuevo comentario en una solicitud
   * @param {number} idSolicitud - ID de la solicitud
   * @param {string} texto - Contenido del comentario
   * @returns {Promise<Object>}
   */
  async createComentario(idSolicitud, texto) {
    try {
      const data = await apiService.post('/Comentarios', {
        idSolicitud,
        texto
      })
      
      return {
        idComentario: data.idComentario,
        texto: data.texto,
        fechaComentario: data.fechaComentario,
        idUsuario: data.idUsuario,
        nombreUsuario: data.nombreUsuario
      }
    } catch (error) {
      console.error('Error creando comentario:', error)
      throw error
    }
  }

  /**
   * Actualiza un comentario existente
   * @param {number} id - ID del comentario
   * @param {string} texto - Nuevo contenido
   * @returns {Promise<Object>}
   */
  async updateComentario(id, texto) {
    try {
      const data = await apiService.put(`/Comentarios/${id}`, { texto })
      
      return {
        idComentario: data.idComentario,
        texto: data.texto,
        fechaComentario: data.fechaComentario,
        idUsuario: data.idUsuario,
        nombreUsuario: data.nombreUsuario
      }
    } catch (error) {
      console.error('Error actualizando comentario:', error)
      throw error
    }
  }

  /**
   * Elimina un comentario
   * @param {number} id - ID del comentario
   * @returns {Promise<void>}
   */
  async deleteComentario(id) {
    try {
      await apiService.delete(`/Comentarios/${id}`)
    } catch (error) {
      console.error('Error eliminando comentario:', error)
      throw error
    }
  }
}

// Exportar instancia singleton
export const comentarioService = new ComentarioService()
