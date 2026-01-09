import * as XLSX from 'xlsx'

/**
 * Exporta datos a un archivo Excel
 * @param {Array} data - Array de objetos con los datos a exportar
 * @param {String} fileName - Nombre del archivo (sin extensión)
 * @param {String} sheetName - Nombre de la hoja
 */
export const exportToExcel = (data, fileName = 'reporte', sheetName = 'Datos') => {
  try {
    // Crear un nuevo libro de trabajo
    const workbook = XLSX.utils.book_new()

    // Convertir los datos a hoja de trabajo
    const worksheet = XLSX.utils.json_to_sheet(data)

    // Ajustar el ancho de las columnas automáticamente
    const maxWidth = 50
    const colWidths = []
    
    if (data.length > 0) {
      Object.keys(data[0]).forEach((key, i) => {
        const maxLength = Math.max(
          key.length,
          ...data.map(row => (row[key] ? row[key].toString().length : 0))
        )
        colWidths[i] = { wch: Math.min(maxLength + 2, maxWidth) }
      })
      worksheet['!cols'] = colWidths
    }

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // Generar el archivo y descargarlo
    XLSX.writeFile(workbook, `${fileName}.xlsx`)

    return true
  } catch (error) {
    console.error('Error al exportar a Excel:', error)
    return false
  }
}

/**
 * Exporta múltiples conjuntos de datos a diferentes hojas de un mismo archivo Excel
 * @param {Array} sheets - Array de objetos con { data, sheetName }
 * @param {String} fileName - Nombre del archivo
 */
export const exportMultipleSheets = (sheets, fileName = 'reporte') => {
  try {
    const workbook = XLSX.utils.book_new()

    sheets.forEach(({ data, sheetName }) => {
      const worksheet = XLSX.utils.json_to_sheet(data)

      // Ajustar ancho de columnas
      if (data.length > 0) {
        const colWidths = Object.keys(data[0]).map(key => {
          const maxLength = Math.max(
            key.length,
            ...data.map(row => (row[key] ? row[key].toString().length : 0))
          )
          return { wch: Math.min(maxLength + 2, 50) }
        })
        worksheet['!cols'] = colWidths
      }

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
    })

    XLSX.writeFile(workbook, `${fileName}.xlsx`)
    return true
  } catch (error) {
    console.error('Error al exportar múltiples hojas:', error)
    return false
  }
}

/**
 * Formatea datos de reportes para exportación
 * @param {Array} data - Datos crudos
 * @param {Object} headers - Mapeo de keys a nombres legibles
 */
export const formatDataForExport = (data, headers) => {
  return data.map(item => {
    const formatted = {}
    Object.keys(headers).forEach(key => {
      formatted[headers[key]] = item[key] || '-'
    })
    return formatted
  })
}

/**
 * Genera nombre de archivo con fecha actual
 * @param {String} baseName - Nombre base del archivo
 */
export const generateFileName = (baseName) => {
  const date = new Date()
  const dateStr = date.toISOString().split('T')[0]
  const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-')
  return `${baseName}_${dateStr}_${timeStr}`
}
