import { config } from '@/config/env'

/**
 * Servicio base para peticiones HTTP a la API
 */
class ApiService {
  constructor() {
    this.baseURL = config.apiUrl
  }

  /**
   * Realiza una petición HTTP
   */
  async request(endpoint, options = {}, requiresAuth = true) {
    const token = localStorage.getItem('token')
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }

    if (requiresAuth && token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config)

      if (response.status === 401) {
        // Solo redirigir si no estamos en el login (token expirado)
        // Si estamos en login, solo lanzar el error
        if (requiresAuth) {
          localStorage.clear()
          window.location.href = '/login'
        }
        throw new Error('Usuario o contraseña incorrectos')
      }

      if (response.status === 204) return null

      // Intentar parsear como JSON
      const contentType = response.headers.get('content-type')
      let data
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        // Si no es JSON, leer como texto
        const text = await response.text()
        throw new Error(text || `Error ${response.status}: ${response.statusText}`)
      }

      if (!response.ok) {
        throw new Error(data.message || data.title || 'Error en la petición')
      }

      return data
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async get(endpoint, requiresAuth = true) {
    return this.request(endpoint, { method: 'GET' }, requiresAuth)
  }

  async post(endpoint, data, requiresAuth = true) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    }, requiresAuth)
  }

  async put(endpoint, data, requiresAuth = true) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    }, requiresAuth)
  }

  async patch(endpoint, data, requiresAuth = true) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }, requiresAuth)
  }

  async delete(endpoint, requiresAuth = true) {
    return this.request(endpoint, { method: 'DELETE' }, requiresAuth)
  }
}

export const apiService = new ApiService()
