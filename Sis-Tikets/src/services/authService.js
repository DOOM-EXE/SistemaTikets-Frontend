import { Usuario } from '@/models'
import { apiService } from './apiService'

/**
 * Servicio de Autenticación
 * Maneja el login, logout y validación de usuarios
 */
class AuthService {
  constructor() {
    this.currentUser = null
    this.token = null
  }

  /**
   * Inicia sesión con usuario y contraseña
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   * @returns {Promise<Usuario>}
   */
  async login(username, password) {
    try {
      const response = await apiService.post('/auth/login', {
        username: username,
        password: password
      }, false)

      this.token = response.token
      
      const userData = {
        id: response.idUsuario,
        username: response.username,
        nombre: response.nombreCompleto,
        apellido: '',
        email: '',
        rol: response.rol, // Mantener el rol tal cual viene del API
        area: response.idAreaAsignada,
        nombreArea: response.nombreArea || 'Sin área',
        esEncargado: response.esEncargado || false,
        encargadosDeAreas: response.encargadosDeAreas || []
      }

      this.currentUser = Usuario.fromJSON(userData)
      
      // Guardar en localStorage
      localStorage.setItem('token', this.token)
      localStorage.setItem('user', JSON.stringify(userData))

      return this.currentUser
    } catch (error) {
      console.error('Error en login:', error)
      throw error
    }
  }

  /**
   * Cierra la sesión del usuario actual
   */
  logout() {
    this.currentUser = null
    this.token = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  /**
   * Obtiene el usuario actualmente autenticado
   * @returns {Usuario|null}
   */
  getCurrentUser() {
    if (this.currentUser) {
      return this.currentUser
    }

    // Intentar recuperar del localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      this.currentUser = Usuario.fromJSON(JSON.parse(userData))
      this.token = localStorage.getItem('token')
      return this.currentUser
    }

    return null
  }

  /**
   * Verifica si hay un usuario autenticado
   * @returns {boolean}
   */
  isAuthenticated() {
    return this.token !== null || localStorage.getItem('token') !== null
  }

  /**
   * Obtiene el token de autenticación
   * @returns {string|null}
   */
  getToken() {
    return this.token || localStorage.getItem('token')
  }

  /**
   * Obtiene información del usuario desde localStorage
   * @returns {Object|null}
   */
  getUser() {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData) : null
  }

  /**
   * Verifica si el usuario actual puede asignar solicitudes
   * @returns {boolean}
   */
  puedeAsignarSolicitudes() {
    const user = this.getUser()
    if (!user) return false
    
    // Admin siempre puede asignar
    if (user.rol === 'Admin') return true
    
    // Encargados pueden asignar
    return user.esEncargado === true
  }

  /**
   * Verifica si el usuario es encargado de un área específica
   * @param {number} idArea - ID del área
   * @returns {boolean}
   */
  esEncargadoDeArea(idArea) {
    const user = this.getUser()
    if (!user || !user.encargadosDeAreas) return false
    
    return user.encargadosDeAreas.some(
      enc => enc.idArea === idArea && enc.activo
    )
  }

  /**
   * Verifica si el usuario es Admin
   * @returns {boolean}
   */
  esAdmin() {
    const user = this.getUser()
    return user && user.rol === 'Admin'
  }

  /**
   * Verifica si el usuario es Gestor
   * @returns {boolean}
   */
  esGestor() {
    const user = this.getUser()
    return user && user.rol === 'Gestor'
  }
}

// Exportar instancia singleton
export const authService = new AuthService()
