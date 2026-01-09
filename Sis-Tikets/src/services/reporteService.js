import { apiService } from './apiService'

/**
 * Servicio para gestionar reportes y estadísticas
 */
const reporteService = {
  /**
   * Obtiene reporte de solicitudes por gestor
   */
  async getReportePorGestor(fechaDesde = null, fechaHasta = null, idArea = null) {
    try {
      const params = new URLSearchParams()
      if (fechaDesde) params.append('fechaDesde', fechaDesde)
      if (fechaHasta) params.append('fechaHasta', fechaHasta)
      if (idArea) params.append('idArea', idArea)

      const queryString = params.toString()
      const endpoint = queryString ? `/Solicitudes?${queryString}` : '/Solicitudes'
      
      const solicitudes = await apiService.get(endpoint)
      
      // Procesar datos para agrupar por gestor (excluyendo sin asignar)
      const gestoresMap = {}
      
      solicitudes.forEach(solicitud => {
        const gestorId = solicitud.idGestorAsignado
        
        // Saltar solicitudes sin gestor asignado
        if (!gestorId) return
        
        const gestorNombre = solicitud.nombreGestorAsignado
        const gestorArea = solicitud.nombreArea || 'N/A'
        const estado = this._mapEstado(solicitud.nombreEstado)
        
        if (!gestoresMap[gestorId]) {
          gestoresMap[gestorId] = {
            idGestor: gestorId,
            nombre: gestorNombre,
            area: gestorArea,
            total: 0,
            nuevas: 0,
            enProceso: 0,
            cerradas: 0,
            resueltas: 0,
            rechazadas: 0
          }
        }
        
        const gestor = gestoresMap[gestorId]
        gestor.total++
        
        switch(estado) {
          case 'nuevo': gestor.nuevas++; break
          case 'en-proceso': gestor.enProceso++; break
          case 'cerrada': gestor.cerradas++; break
          case 'resuelto': gestor.resueltas++; break
          case 'rechazada': gestor.rechazadas++; break
        }
      })
      
      return Object.values(gestoresMap).sort((a, b) => b.total - a.total)
    } catch (error) {
      console.error('Error obteniendo reporte por gestor:', error)
      throw error
    }
  },

  /**
   * Obtiene reporte de solicitudes por área
   */
  async getReportePorArea(fechaDesde = null, fechaHasta = null) {
    try {
      const params = new URLSearchParams()
      if (fechaDesde) params.append('fechaDesde', fechaDesde)
      if (fechaHasta) params.append('fechaHasta', fechaHasta)

      const queryString = params.toString()
      const endpoint = queryString ? `/Solicitudes?${queryString}` : '/Solicitudes'
      
      const solicitudes = await apiService.get(endpoint)
      
      // Procesar datos para agrupar por área
      const areasMap = {}
      
      solicitudes.forEach(solicitud => {
        const areaId = solicitud.idArea
        const areaNombre = solicitud.nombreArea || 'Sin Área'
        const estado = this._mapEstado(solicitud.nombreEstado)
        const tieneGestor = !!solicitud.idGestorAsignado
        
        if (!areasMap[areaId || 'sin-area']) {
          areasMap[areaId || 'sin-area'] = {
            idArea: areaId,
            nombre: areaNombre,
            total: 0,
            asignadas: 0,
            sinAsignar: 0,
            nuevas: 0,
            enProceso: 0,
            cerradas: 0,
            resueltas: 0,
            rechazadas: 0
          }
        }
        
        const area = areasMap[areaId || 'sin-area']
        area.total++
        
        if (tieneGestor) {
          area.asignadas++
        } else {
          area.sinAsignar++
        }
        
        switch(estado) {
          case 'nuevo': area.nuevas++; break
          case 'en-proceso': area.enProceso++; break
          case 'cerrada': area.cerradas++; break
          case 'resuelto': area.resueltas++; break
          case 'rechazada': area.rechazadas++; break
        }
      })
      
      return Object.values(areasMap).sort((a, b) => b.total - a.total)
    } catch (error) {
      console.error('Error obteniendo reporte por área:', error)
      throw error
    }
  },

  /**
   * Obtiene reporte de solicitudes por estado
   */
  async getReportePorEstado(fechaDesde = null, fechaHasta = null) {
    try {
      const params = new URLSearchParams()
      if (fechaDesde) params.append('fechaDesde', fechaDesde)
      if (fechaHasta) params.append('fechaHasta', fechaHasta)

      const queryString = params.toString()
      const endpoint = queryString ? `/Solicitudes?${queryString}` : '/Solicitudes'
      
      const solicitudes = await apiService.get(endpoint)
      
      const estadosMap = {}
      const total = solicitudes.length
      
      solicitudes.forEach(solicitud => {
        const estado = this._mapEstado(solicitud.nombreEstado)
        const estadoNombre = this._getNombreEstado(estado)
        
        if (!estadosMap[estado]) {
          estadosMap[estado] = {
            estado: estadoNombre,
            cantidad: 0,
            porcentaje: 0
          }
        }
        
        estadosMap[estado].cantidad++
      })
      
      // Calcular porcentajes
      Object.values(estadosMap).forEach(item => {
        item.porcentaje = total > 0 ? ((item.cantidad / total) * 100).toFixed(1) : 0
      })
      
      return Object.values(estadosMap).sort((a, b) => b.cantidad - a.cantidad)
    } catch (error) {
      console.error('Error obteniendo reporte por estado:', error)
      throw error
    }
  },

  /**
   * Obtiene reporte de solicitudes por prioridad
   */
  async getReportePorPrioridad(fechaDesde = null, fechaHasta = null) {
    try {
      const params = new URLSearchParams()
      if (fechaDesde) params.append('fechaDesde', fechaDesde)
      if (fechaHasta) params.append('fechaHasta', fechaHasta)

      const queryString = params.toString()
      const endpoint = queryString ? `/Solicitudes?${queryString}` : '/Solicitudes'
      
      const solicitudes = await apiService.get(endpoint)
      
      const prioridadesMap = {}
      const total = solicitudes.length
      
      solicitudes.forEach(solicitud => {
        const prioridad = solicitud.nombrePrioridad || 'Sin Prioridad'
        
        if (!prioridadesMap[prioridad]) {
          prioridadesMap[prioridad] = {
            prioridad: prioridad,
            cantidad: 0,
            porcentaje: 0
          }
        }
        
        prioridadesMap[prioridad].cantidad++
      })
      
      // Calcular porcentajes
      Object.values(prioridadesMap).forEach(item => {
        item.porcentaje = total > 0 ? ((item.cantidad / total) * 100).toFixed(1) : 0
      })
      
      // Ordenar por prioridad (Alta, Media, Baja)
      const orden = { 'Alta': 1, 'Media': 2, 'Baja': 3 }
      return Object.values(prioridadesMap).sort((a, b) => 
        (orden[a.prioridad] || 999) - (orden[b.prioridad] || 999)
      )
    } catch (error) {
      console.error('Error obteniendo reporte por prioridad:', error)
      throw error
    }
  },

  /**
   * Obtiene reporte de solicitudes por tipo
   */
  async getReportePorTipo(fechaDesde = null, fechaHasta = null) {
    try {
      const params = new URLSearchParams()
      if (fechaDesde) params.append('fechaDesde', fechaDesde)
      if (fechaHasta) params.append('fechaHasta', fechaHasta)

      const queryString = params.toString()
      const endpoint = queryString ? `/Solicitudes?${queryString}` : '/Solicitudes'
      
      const solicitudes = await apiService.get(endpoint)
      
      const tiposMap = {}
      
      solicitudes.forEach(solicitud => {
        const tipo = solicitud.nombreTipoSolicitud || 'Sin Tipo'
        const area = solicitud.nombreArea || 'N/A'
        
        if (!tiposMap[tipo]) {
          tiposMap[tipo] = {
            tipo: tipo,
            cantidad: 0,
            areas: {}
          }
        }
        
        tiposMap[tipo].cantidad++
        tiposMap[tipo].areas[area] = (tiposMap[tipo].areas[area] || 0) + 1
      })
      
      // Encontrar área más frecuente para cada tipo
      return Object.values(tiposMap).map(item => ({
        tipo: item.tipo,
        cantidad: item.cantidad,
        areaMasFrecuente: Object.keys(item.areas).reduce((a, b) => 
          item.areas[a] > item.areas[b] ? a : b
        )
      })).sort((a, b) => b.cantidad - a.cantidad)
    } catch (error) {
      console.error('Error obteniendo reporte por tipo:', error)
      throw error
    }
  },

  /**
   * Obtiene resumen general de solicitudes
   */
  async getResumenGeneral(fechaDesde = null, fechaHasta = null) {
    try {
      const params = new URLSearchParams()
      if (fechaDesde) params.append('fechaDesde', fechaDesde)
      if (fechaHasta) params.append('fechaHasta', fechaHasta)

      const queryString = params.toString()
      const endpoint = queryString ? `/Solicitudes?${queryString}` : '/Solicitudes'
      
      const solicitudes = await apiService.get(endpoint)
      
      const resumen = {
        total: solicitudes.length,
        nuevas: 0,
        enProceso: 0,
        cerradas: 0,
        resueltas: 0,
        rechazadas: 0,
        asignadas: 0,
        sinAsignar: 0,
        prioridadAlta: 0,
        prioridadMedia: 0,
        prioridadBaja: 0
      }
      
      solicitudes.forEach(solicitud => {
        const estado = this._mapEstado(solicitud.nombreEstado)
        const prioridad = solicitud.nombrePrioridad
        
        switch(estado) {
          case 'nuevo': resumen.nuevas++; break
          case 'en-proceso': resumen.enProceso++; break
          case 'cerrada': resumen.cerradas++; break
          case 'resuelto': resumen.resueltas++; break
          case 'rechazada': resumen.rechazadas++; break
        }
        
        if (solicitud.idGestorAsignado) {
          resumen.asignadas++
        } else {
          resumen.sinAsignar++
        }
        
        if (prioridad === 'Alta') resumen.prioridadAlta++
        else if (prioridad === 'Media') resumen.prioridadMedia++
        else if (prioridad === 'Baja') resumen.prioridadBaja++
      })
      
      return resumen
    } catch (error) {
      console.error('Error obteniendo resumen general:', error)
      throw error
    }
  },

  // Helper para mapear estados
  _mapEstado(nombreEstado) {
    if (!nombreEstado) return 'nuevo'
    const estadoMap = {
      'Nueva': 'nuevo',
      'En Progreso': 'en-proceso',
      'Cerrada': 'cerrada',
      'Resuelta': 'resuelto',
      'Rechazado': 'rechazada'
    }
    return estadoMap[nombreEstado] || nombreEstado.toLowerCase()
  },

  // Helper para obtener nombre legible del estado
  _getNombreEstado(estado) {
    const nombres = {
      'nuevo': 'Nueva',
      'en-proceso': 'En Progreso',
      'cerrada': 'Cerrada',
      'resuelto': 'Resuelta',
      'rechazada': 'Rechazada'
    }
    return nombres[estado] || estado
  }
}

export default reporteService
