/**
 * Modelo de Area
 * Representa un área del sistema
 */
export class Area {
  constructor({
    idArea = null,
    nombre = '',
    tiposSolicitud = [],
    usuariosAsignados = [],
    solicitudes = [],
    encargados = []
  } = {}) {
    this.idArea = idArea
    this.nombre = nombre
    this.tiposSolicitud = tiposSolicitud
    this.usuariosAsignados = usuariosAsignados
    this.solicitudes = solicitudes
    this.encargados = encargados
  }

  /**
   * Convierte el área a formato JSON
   */
  toJSON() {
    return {
      idArea: this.idArea,
      nombre: this.nombre,
      tiposSolicitud: this.tiposSolicitud,
      usuariosAsignados: this.usuariosAsignados,
      solicitudes: this.solicitudes,
      encargados: this.encargados
    }
  }

  /**
   * Crea una instancia de Area desde datos JSON
   */
  static fromJSON(json) {
    return new Area(json)
  }
}
