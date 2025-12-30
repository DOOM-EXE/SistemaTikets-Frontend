/**
 * Modelo de Encargado
 * Representa la asignación de un usuario como encargado de un área
 */
export class Encargado {
  constructor({
    idEncargado = null,
    idUsuario = null,
    nombreUsuario = null,
    idArea = null,
    nombreArea = null,
    fechaAsignacion = new Date(),
    activo = true,
    usuario = null,
    area = null
  } = {}) {
    this.idEncargado = idEncargado
    this.idUsuario = idUsuario
    this.nombreUsuario = nombreUsuario
    this.idArea = idArea
    this.nombreArea = nombreArea
    this.fechaAsignacion = fechaAsignacion
    this.activo = activo
    this.usuario = usuario
    this.area = area
  }

  /**
   * Convierte el encargado a formato JSON
   */
  toJSON() {
    return {
      idEncargado: this.idEncargado,
      idUsuario: this.idUsuario,
      nombreUsuario: this.nombreUsuario,
      idArea: this.idArea,
      nombreArea: this.nombreArea,
      fechaAsignacion: this.fechaAsignacion,
      activo: this.activo,
      usuario: this.usuario,
      area: this.area
    }
  }

  /**
   * Crea una instancia de Encargado desde datos JSON
   */
  static fromJSON(json) {
    return new Encargado(json)
  }
}
