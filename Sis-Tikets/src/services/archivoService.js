import { apiService } from './apiService'

/**
 * Servicio de Archivos
 * Maneja la subida y eliminación de archivos
 */
class ArchivoService {
  /**
   * Sube un archivo al servidor
   * @param {File} file - Archivo a subir
   * @returns {Promise<string>} - URL del archivo subido
   */
  async uploadFile(file) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('token')
      
      const response = await fetch(`${apiService.baseURL}/archivos/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData // No establecer Content-Type, el navegador lo hace automáticamente con boundary
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Error al subir archivo')
      }

      const data = await response.json()
      return data.fileUrl || data.url
    } catch (error) {
      console.error('Error subiendo archivo:', error)
      throw error
    }
  }

  /**
   * Elimina un archivo del servidor
   * @param {string} fileName - Nombre del archivo a eliminar
   * @returns {Promise<void>}
   */
  async deleteFile(fileName) {
    try {
      await apiService.delete(`/archivos/${fileName}`)
    } catch (error) {
      console.error('Error eliminando archivo:', error)
      throw error
    }
  }
}

// Exportar instancia singleton
export const archivoService = new ArchivoService()
