/**
 * Modelo de Usuario
 * Representa un usuario del sistema
 */
export class Usuario {
  constructor({
    id = null,
    username = '',
    nombre = '',
    apellido = '',
    email = '',
    rol = 'solicitante',
    area = '',
    activo = true,
    fechaCreacion = new Date(),
    encargadosDeAreas = []
  } = {}) {
    this.id = id
    this.username = username
    this.nombre = nombre
    this.apellido = apellido
    this.email = email
    this.rol = rol
    this.area = area
    this.activo = activo
    this.fechaCreacion = fechaCreacion
    this.encargadosDeAreas = encargadosDeAreas
  }

  // Roles del sistema
  static ROLES = {
    SOLICITANTE: 'solicitante',
    TECNICO: 'tecnico',
    ADMINISTRADOR: 'administrador'
  }

  /**
   * Obtiene el nombre completo del usuario
   */
  get nombreCompleto() {
    return `${this.nombre} ${this.apellido}`.trim()
  }

  /**
   * Verifica si el usuario es administrador
   */
  esAdministrador() {
    return this.rol === Usuario.ROLES.ADMINISTRADOR
  }

  /**
   * Verifica si el usuario es técnico
   */
  esTecnico() {
    return this.rol === Usuario.ROLES.TECNICO
  }

  /**
   * Verifica si el usuario es solicitante
   */
  esSolicitante() {
    return this.rol === Usuario.ROLES.SOLICITANTE
  }

  /**
   * Verifica si el usuario es encargado de al menos un área
   */
  esEncargado() {
    return this.encargadosDeAreas && this.encargadosDeAreas.length > 0
  }

  /**
   * Convierte el usuario a formato JSON
   */
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      rol: this.rol,
      area: this.area,
      activo: this.activo,
      fechaCreacion: this.fechaCreacion,
      encargadosDeAreas: this.encargadosDeAreas
    }
  }

  /**
   * Crea una instancia de Usuario desde datos JSON
   */
  static fromJSON(json) {
    return new Usuario(json)
  }
}
