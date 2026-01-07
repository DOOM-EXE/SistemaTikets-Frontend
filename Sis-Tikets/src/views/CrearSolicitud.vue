<template>
  <div class="panel-container">
    <!-- Header -->
    <div class="page-header">
      <button class="btn-back" @click="goBack">
        <i class="pi pi-chevron-left"></i>
      </button>
      <div class="header-content">
        <div class="header-icon-wrapper">
          <i class="pi pi-file-edit header-icon"></i>
        </div>
        <div class="header-text">
          <h1 class="header-title">Crear Nueva Solicitud</h1>
          <p class="header-description">Completa el formulario para enviar tu solicitud</p>
        </div>
      </div>
    </div>

    <!-- Form Content -->
    <div class="form-container">
      <form @submit.prevent="handleSubmit" class="solicitud-form">
        <!-- Área -->
        <div class="form-group">
          <label class="form-label">Área</label>
          <select v-model="formData.idArea" class="form-select" required :disabled="loadingCatalogos">
            <option :value="null" disabled>{{ loadingCatalogos ? 'Cargando...' : 'Seleccione un área' }}</option>
            <option v-for="area in areas" :key="area.idArea" :value="area.idArea">
              {{ area.nombre }}
            </option>
          </select>
        </div>

        <!-- Tipo de solicitud -->
        <div class="form-group">
          <label class="form-label">Tipo de solicitud</label>
          <select v-model="formData.idTipoSolicitud" class="form-select" required :disabled="!formData.idArea || loadingTipos">
            <option :value="null" disabled>
              {{ !formData.idArea ? 'Seleccione primero un área' : (loadingTipos ? 'Cargando...' : 'Seleccione un tipo') }}
            </option>
            <option v-for="tipo in tipos" :key="tipo.idTipoSolicitud" :value="tipo.idTipoSolicitud">
              {{ tipo.nombre }}
            </option>
          </select>
        </div>

        <!-- Prioridad -->
        <div class="form-group">
          <label class="form-label">Prioridad</label>
          <select v-model="formData.idPrioridad" class="form-select" required :disabled="loadingCatalogos">
            <option :value="null" disabled>{{ loadingCatalogos ? 'Cargando...' : 'Seleccione una prioridad' }}</option>
            <option v-for="prioridad in prioridades" :key="prioridad.idPrioridad" :value="prioridad.idPrioridad">
              {{ prioridad.nombre }}
            </option>
          </select>
          <p class="form-hint form-hint-warning">
            <i class="pi pi-exclamation-triangle"></i>
            Seleccione Alta solo si es urgente y afecta su trabajo diario
          </p>
        </div>

        <!-- Asunto -->
        <div class="form-group">
          <div class="label-row">
            <label class="form-label">Asunto</label>
            <span class="char-counter" :class="{ 'counter-warning': formData.asunto.length > 80, 'counter-danger': formData.asunto.length >= 100 }">
              {{ formData.asunto.length }}/100
            </span>
          </div>
          <input 
            type="text" 
            v-model="formData.asunto" 
            class="form-input"
            placeholder="Resumen breve de su solicitud"
            required
            maxlength="100"
            @input="onAsuntoInput"
          />
          <p v-if="asuntoError" class="form-error">
            <i class="pi pi-exclamation-circle"></i>
            {{ asuntoError }}
          </p>
        </div>

        <!-- Descripción -->
        <div class="form-group">
          <div class="label-row">
            <label class="form-label">Descripción</label>
            <span class="char-counter" :class="{ 'counter-warning': formData.descripcion.length > 800, 'counter-danger': formData.descripcion.length >= 1000 }">
              {{ formData.descripcion.length }}/1000
            </span>
          </div>
          <textarea 
            v-model="formData.descripcion" 
            class="form-textarea"
            placeholder="Describe detalladamente tu solicitud. Incluye toda información que considere relevante"
            rows="6"
            required
            maxlength="1000"
            @input="onDescripcionInput"
          ></textarea>
          <p v-if="descripcionError" class="form-error">
            <i class="pi pi-exclamation-circle"></i>
            {{ descripcionError }}
          </p>
          <p class="form-hint">
            <i class="pi pi-info-circle"></i>
            Proporciona la mayor cantidad de detalles posibles para agilizar la atención
          </p>
        </div>

        <!-- Adjuntar Archivo -->
        <div class="form-group">
          <label class="form-label">Adjuntar Archivo</label>
          <div 
            class="upload-area"
            @dragover.prevent="dragOver = true"
            @dragleave.prevent="dragOver = false"
            @drop.prevent="handleDrop"
            :class="{ 'drag-over': dragOver }"
          >
            <input 
              type="file" 
              ref="fileInput" 
              @change="handleFileSelect"
              class="file-input"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <i class="pi pi-cloud-upload upload-icon"></i>
            <p class="upload-text">Arrastra un archivo aquí o haz clic para seleccionar</p>
            <p class="upload-hint">Formatos aceptados: PDF, DOCX, JPG, PNG (Máx 10MB) - Solo 1 archivo</p>
          </div>
          
          <!-- Lista de archivos seleccionados -->
          <div v-if="selectedFiles.length > 0" class="file-list">
            <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
              <div class="file-icon" :class="getFileIconClass(file.name)">
                <i :class="getFileIcon(file.name)"></i>
              </div>
              <div class="file-info">
                <span class="file-name">{{ file.name }}</span>
                <span class="file-meta">{{ getFileTypeLabel(file.name) }} • {{ formatFileSize(file.size) }}</span>
              </div>
              <button type="button" @click="removeFile(index)" class="btn-remove-file">
                <i class="pi pi-times"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Botones -->
        <div class="form-actions">
          <button type="button" @click="goBack" class="btn-cancel" :disabled="loading">
            Cancelar
          </button>
          <button type="submit" class="btn-submit" :disabled="loading || uploadingFiles">
            <i v-if="!loading && !uploadingFiles" class="pi pi-send"></i>
            <i v-else class="pi pi-spinner pi-spin"></i>
            {{ uploadingFiles ? 'Subiendo archivo...' : (loading ? 'Enviando...' : 'Enviar Solicitud') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ticketService, catalogoService, archivoService } from '@/services'

const router = useRouter()

const formData = ref({
  idArea: null,
  idTipoSolicitud: null,
  idPrioridad: null,
  asunto: '',
  descripcion: ''
})

const asuntoError = ref('')
const descripcionError = ref('')

const onAsuntoInput = () => {
  const value = formData.value.asunto
  if (!value.trim()) {
    asuntoError.value = 'El asunto no puede estar vacío o solo contener espacios.'
  } else if (value.length < 5) {
    asuntoError.value = 'El asunto debe tener al menos 5 caracteres.'
  } else if (value.length > 100) {
    asuntoError.value = 'El asunto no puede superar los 100 caracteres.'
  } else {
    asuntoError.value = ''
  }
}

const onDescripcionInput = () => {
  const value = formData.value.descripcion
  if (!value.trim()) {
    descripcionError.value = 'La descripción no puede estar vacía o solo contener espacios.'
  } else if (value.length < 10) {
    descripcionError.value = 'La descripción debe tener al menos 10 caracteres.'
  } else if (value.length > 1000) {
    descripcionError.value = 'La descripción no puede superar los 1000 caracteres.'
  } else {
    descripcionError.value = ''
  }
}

const areas = ref([])
const tipos = ref([])
const prioridades = ref([])

const selectedFiles = ref([])
const fileInput = ref(null)
const dragOver = ref(false)
const loading = ref(false)
const loadingCatalogos = ref(true)
const loadingTipos = ref(false)
const uploadingFiles = ref(false)

// Cargar catálogos al montar
onMounted(async () => {
  try {
    loadingCatalogos.value = true
    const [areasData, prioridadesData] = await Promise.all([
      catalogoService.getAreas(),
      catalogoService.getPrioridades()
    ])
    areas.value = areasData
    prioridades.value = prioridadesData
  } catch (error) {
    console.error('Error cargando catálogos:', error)
    alert('Error al cargar los catálogos')
  } finally {
    loadingCatalogos.value = false
  }
})

// Watch para cargar tipos cuando cambie el área
watch(() => formData.value.idArea, async (newIdArea) => {
  if (newIdArea) {
    // Limpiar tipo seleccionado al cambiar área
    formData.value.idTipoSolicitud = null
    tipos.value = []
    
    try {
      loadingTipos.value = true
      const tiposData = await catalogoService.getTiposSolicitudPorArea(newIdArea)
      tipos.value = tiposData
    } catch (error) {
      console.error('Error cargando tipos de solicitud:', error)
      alert('Error al cargar tipos de solicitud')
    } finally {
      loadingTipos.value = false
    }
  } else {
    tipos.value = []
    formData.value.idTipoSolicitud = null
  }
})

const goBack = () => {
  router.push('/panel-solicitante')
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  addFiles(files)
}

const handleDrop = (event) => {
  dragOver.value = false
  const files = Array.from(event.dataTransfer.files)
  addFiles(files)
}

const addFiles = (files) => {
  // Solo tomar el primer archivo (reemplaza el anterior)
  const file = files[0]
  if (!file) return
  
  if (file.size <= 10 * 1024 * 1024) { // 10MB max
    selectedFiles.value = [file] // Reemplazar, no agregar
  } else {
    alert(`El archivo ${file.name} excede el tamaño máximo de 10MB`)
  }
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Funciones para manejar iconos de archivos
const getFileExtension = (fileName) => {
  if (!fileName) return ''
  const ext = fileName.split('.').pop().toLowerCase()
  return ext
}

const getFileIcon = (fileName) => {
  const ext = getFileExtension(fileName)
  const iconMap = {
    'pdf': 'pi pi-file-pdf',
    'doc': 'pi pi-file-word',
    'docx': 'pi pi-file-word',
    'xls': 'pi pi-file-excel',
    'xlsx': 'pi pi-file-excel',
    'ppt': 'pi pi-file',
    'pptx': 'pi pi-file',
    'txt': 'pi pi-file',
    'png': 'pi pi-image',
    'jpg': 'pi pi-image',
    'jpeg': 'pi pi-image',
    'gif': 'pi pi-image',
    'webp': 'pi pi-image',
    'svg': 'pi pi-image',
    'zip': 'pi pi-file-zip',
    'rar': 'pi pi-file-zip',
    '7z': 'pi pi-file-zip'
  }
  return iconMap[ext] || 'pi pi-file'
}

const getFileIconClass = (fileName) => {
  const ext = getFileExtension(fileName)
  if (ext === 'pdf') return 'icon-pdf'
  if (['doc', 'docx'].includes(ext)) return 'icon-word'
  if (['xls', 'xlsx'].includes(ext)) return 'icon-excel'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'icon-image'
  if (['zip', 'rar', '7z'].includes(ext)) return 'icon-zip'
  return 'icon-default'
}

const getFileTypeLabel = (fileName) => {
  const ext = getFileExtension(fileName)
  const labelMap = {
    'pdf': 'Documento PDF',
    'doc': 'Documento Word',
    'docx': 'Documento Word',
    'xls': 'Hoja de cálculo',
    'xlsx': 'Hoja de cálculo',
    'ppt': 'Presentación',
    'pptx': 'Presentación',
    'txt': 'Archivo de texto',
    'png': 'Imagen PNG',
    'jpg': 'Imagen JPEG',
    'jpeg': 'Imagen JPEG',
    'gif': 'Imagen GIF',
    'webp': 'Imagen WebP',
    'svg': 'Imagen SVG',
    'zip': 'Archivo comprimido',
    'rar': 'Archivo comprimido',
    '7z': 'Archivo comprimido'
  }
  return labelMap[ext] || 'Archivo'
}

const handleSubmit = async () => {
  onAsuntoInput()
  onDescripcionInput()
  if (asuntoError.value || descripcionError.value) {
    alert('Por favor corrige los errores antes de enviar la solicitud.')
    return
  }
  loading.value = true
  try {
    const payload = {
      asunto: formData.value.asunto.trim(),
      descripcion: formData.value.descripcion.trim(),
      idArea: formData.value.idArea,
      idTipoSolicitud: formData.value.idTipoSolicitud,
      idPrioridad: formData.value.idPrioridad
    }
    // Subir archivo si hay uno seleccionado
    if (selectedFiles.value.length > 0) {
      try {
        uploadingFiles.value = true
        const file = selectedFiles.value[0] // Tomar solo el primer archivo
        const fileUrl = await archivoService.uploadFile(file)
        payload.archivoUrl = fileUrl
      } catch (uploadError) {
        console.error('Error subiendo archivo:', uploadError)
        alert('Error al subir el archivo: ' + (uploadError.message || 'Error desconocido'))
        return
      } finally {
        uploadingFiles.value = false
      }
    }
    await ticketService.createTicket(payload)
    alert('Solicitud creada exitosamente')
    router.push('/panel-solicitante')
  } catch (error) {
    console.error('Error creando solicitud:', error)
    alert('Error al crear la solicitud: ' + (error.message || 'Error desconocido'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.panel-container {
  width: 100%;
  min-height: 100vh;
  background: #F9FAFB;
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #FFFFFF;
  padding: 20px 30px;
  margin: -20px -20px 30px -20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-back {
  background: transparent;
  border: none;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  color: #333;
  font-size: 20px;
}

.btn-back:hover {
  background: #f5f5f5;
  border-radius: 6px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-icon-wrapper {
  background: #4F39F6;
  border-radius: 8px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-icon {
  font-size: 24px;
  color: white;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.header-description {
  font-size: 13px;
  color: #666;
  margin: 0;
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.solicitud-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.form-select,
.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d1d1d1;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: all 0.3s ease;
  background: white;
}

.form-select:focus,
.form-input:focus,
.form-textarea:focus {
  border-color: #4F39F6;
  box-shadow: 0 0 0 3px rgba(79, 57, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-counter {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
  padding: 2px 8px;
  background: #f3f4f6;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.char-counter.counter-warning {
  color: #f59e0b;
  background: #fef3c7;
}

.char-counter.counter-danger {
  color: #ef4444;
  background: #fee2e2;
}

.form-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
  margin: 4px 0 0 0;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
  border-left: 3px solid #cbd5e1;
}

.form-hint i {
  font-size: 14px;
  color: #9ca3af;
}

.form-hint.form-hint-warning {
  background: #fffbeb;
  border-left-color: #f59e0b;
  color: #92400e;
}

.form-hint.form-hint-warning i {
  color: #f59e0b;
}

.form-error {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ef4444;
  font-size: 12px;
  margin: 4px 0 0 0;
  padding: 8px 12px;
  background: #fef2f2;
  border-radius: 6px;
  border-left: 3px solid #ef4444;
}

.form-error i {
  font-size: 14px;
}

.upload-area {
  border: 2px dashed #d1d1d1;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: #4F39F6;
  background: rgba(79, 57, 246, 0.05);
}

.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.upload-icon {
  font-size: 48px;
  color: #999;
  margin-bottom: 12px;
}

.upload-text {
  font-size: 14px;
  color: #333;
  margin: 0 0 4px 0;
}

.upload-hint {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.file-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.file-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.file-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.file-icon i {
  font-size: 18px;
  color: white;
}

.file-icon.icon-pdf {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.file-icon.icon-word {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.file-icon.icon-excel {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.file-icon.icon-image {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.file-icon.icon-zip {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.file-icon.icon-default {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.file-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  font-size: 12px;
  color: #64748b;
}

.btn-remove-file {
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.btn-remove-file:hover {
  color: #e74c3c;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 10px;
}

.btn-cancel {
  padding: 12px 24px;
  background: white;
  border: 1px solid #d1d1d1;
  border-radius: 8px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: #f5f5f5;
}

.btn-submit {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #4F39F6;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-submit:hover:not(:disabled) {
  background: #3d2bc4;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 57, 246, 0.3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .btn-cancel,
  .btn-submit {
    width: 100%;
    justify-content: center;
  }
}
</style>
