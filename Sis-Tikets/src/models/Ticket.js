/**
 * Modelo de Ticket
 * Representa un ticket en el sistema
 */
export class Ticket {
  constructor({
    id = null,
    numero = '',
    codigo = null,
    area = '',
    tipo = '',
    asunto = '',
    descripcion = '',
    estado = 'nuevo',
    prioridad = 'media',
    fecha = new Date().toLocaleDateString('es-ES'),
    fechaCreacion = new Date(),
    fechaActualizacion = new Date(),
    solicitanteId = null,
    solicitante = null,
    idSolicitante = null,
    asignadoId = null,
    idGestorAsignado = null,
    gestor = null,
    comentarios = [],
    archivos = [],
    archivoUrl = null,
    idPrioridad = null,
    idArea = null,
    idTipoSolicitud = null,
    idEstado = null
  } = {}) {
    this.id = id
    this.numero = numero
    this.codigo = codigo
    this.area = area
    this.tipo = tipo
    this.asunto = asunto
    this.descripcion = descripcion
    this.estado = estado
    this.prioridad = prioridad
    this.fecha = fecha
    this.fechaCreacion = fechaCreacion
    this.fechaActualizacion = fechaActualizacion
    this.solicitanteId = solicitanteId || idSolicitante
    this.solicitante = solicitante
    this.idSolicitante = idSolicitante || solicitanteId
    this.asignadoId = asignadoId
    this.idGestorAsignado = idGestorAsignado
    this.gestor = gestor
    this.comentarios = comentarios
    this.archivos = archivos
    this.archivoUrl = archivoUrl
    this.idPrioridad = idPrioridad
    this.idArea = idArea
    this.idTipoSolicitud = idTipoSolicitud
    this.idEstado = idEstado
  }

  // Estados válidos del ticket
  static ESTADOS = {
    NUEVO: 'nuevo',
    EN_PROCESO: 'en-proceso',
    RESUELTO: 'resuelto',
    CERRADO: 'cerrada'
  }

  // Prioridades válidas
  static PRIORIDADES = {
    BAJA: 'baja',
    MEDIA: 'media',
    ALTA: 'alta'
  }

  // Tipos de ticket
  static TIPOS = {
    SOPORTE_TECNICO: 'Soporte Tecnico',
    REPARACION: 'Reparacion',
    SOLICITUD: 'Solicitud',
    CONSULTA: 'Consulta',
    INSTALACION: 'Instalacion',
    NUEVO_EQUIPO: 'Nuevo Equipo'
  }

  /**
   * Convierte el ticket a formato JSON
   */
  toJSON() {
    return {
      id: this.id,
      numero: this.numero,
      codigo: this.codigo,
      area: this.area,
      tipo: this.tipo,
      asunto: this.asunto,
      descripcion: this.descripcion,
      estado: this.estado,
      prioridad: this.prioridad,
      fecha: this.fecha,
      fechaCreacion: this.fechaCreacion,
      fechaActualizacion: this.fechaActualizacion,
      solicitanteId: this.solicitanteId,
      solicitante: this.solicitante,
      idSolicitante: this.idSolicitante,
      asignadoId: this.asignadoId,
      gestor: this.gestor,
      comentarios: this.comentarios,
      archivos: this.archivos,
      archivoUrl: this.archivoUrl,
      idPrioridad: this.idPrioridad,
      idArea: this.idArea,
      idTipoSolicitud: this.idTipoSolicitud,
      idEstado: this.idEstado
    }
  }

  /**
   * Crea una instancia de Ticket desde datos JSON
   */
  static fromJSON(json) {
    return new Ticket(json)
  }
}
