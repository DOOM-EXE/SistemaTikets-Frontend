/**
 * Modelo de Auditoria
 * Representa un registro de auditoria en el sistema
 */
export class Auditoria {
  constructor({
    idAuditoria = null,
    idUsuario = null,
    nombreUsuario = '',
    tipoAccion = '',
    entidadAfectada = '',
    idEntidad = null,
    descripcion = '',
    fechaHora = new Date(),
    ipAddress = '',
    detalles = null
  } = {}) {
    this.idAuditoria = idAuditoria
    this.idUsuario = idUsuario
    this.nombreUsuario = nombreUsuario
    this.tipoAccion = tipoAccion
    this.entidadAfectada = entidadAfectada
    this.idEntidad = idEntidad
    this.descripcion = descripcion
    this.fechaHora = fechaHora
    this.ipAddress = ipAddress
    this.detalles = detalles
  }

  /**
   * Crea una instancia de Auditoria desde un objeto JSON de la API
   */
  static fromJSON(json) {
    return new Auditoria({
      idAuditoria: json.idAuditoria,
      idUsuario: json.idUsuario,
      nombreUsuario: json.nombreUsuario || json.usuario || 'N/A',
      tipoAccion: json.tipoAccion || json.accion,
      entidadAfectada: json.entidadAfectada || json.entidad,
      idEntidad: json.idEntidad,
      descripcion: json.descripcion,
      fechaHora: json.fechaHora ? new Date(json.fechaHora) : new Date(),
      ipAddress: json.ipAddress || json.ip,
      detalles: json.detalles
    })
  }

  /**
   * Obtiene la fecha formateada
   */
  getFechaFormateada() {
    return this.fechaHora.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  /**
   * Obtiene el color del badge segun el tipo de accion
   */
  getColorAccion() {
    const colores = {
      'Crear': 'success',
      'Modificar': 'info',
      'Eliminar': 'danger',
      'Login': 'primary',
      'Logout': 'secondary',
      'Asignar': 'warning'
    }
    return colores[this.tipoAccion] || 'secondary'
  }
}
