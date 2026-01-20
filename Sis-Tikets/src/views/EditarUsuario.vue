<template>
  <div class="editar-usuario-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <button class="btn-back" @click="goBack">
          <i class="pi pi-arrow-left"></i>
        </button>
        <div class="header-info">
          <div class="header-icon">
            <i class="pi pi-user-edit"></i>
          </div>
          <div>
            <h1 class="header-title">Editar Usuario</h1>
            <p class="header-subtitle">Actualiza la información del usuario</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Content -->
    <div class="form-container" v-if="!loading">
      <div class="form-card">
        <form @submit.prevent="actualizarUsuario">
          <!-- Nombre Completo -->
          <div class="form-group">
            <label class="form-label">
              Nombre Completo
              <span class="required">*</span>
            </label>
            <input 
              v-model="formData.nombreCompleto"
              type="text" 
              class="form-input"
              placeholder="Ingrese el nombre completo"
              required
            />
          </div>

          <!-- Username -->
          <div class="form-group">
            <label class="form-label">
              Username
              <span class="required">*</span>
            </label>
            <div class="input-with-icon">
              <i class="pi pi-user input-icon"></i>
              <input 
                v-model="formData.username"
                type="text" 
                class="form-input with-icon"
                placeholder="lmartinez"
                required
              />
            </div>
            <small class="form-hint">Identificador único del usuario en el sistema</small>
          </div>

          <!-- Rol -->
          <div class="form-group">
            <label class="form-label">
              Rol
              <span class="required">*</span>
            </label>
            <select 
              v-model="formData.idRol" 
              class="form-select"
              required
            >
              <option value="">Seleccione un rol</option>
              <option v-for="rol in roles" :key="rol.idRol" :value="rol.idRol">
                {{ rol.nombre }}
              </option>
            </select>
          </div>

          <!-- Área -->
          <div class="form-group">
            <label class="form-label">
              Área
              <span class="required">*</span>
            </label>
            <select 
              v-model="formData.idAreaAsignada" 
              class="form-select"
              required
            >
              <option value="">Seleccione el área</option>
              <option v-for="area in areas" :key="area.idArea" :value="area.idArea">
                {{ area.nombre }}
              </option>
            </select>
          </div>

          <!-- Estado Activo -->
          <div class="form-group">
            <label class="form-label">Estado del Usuario</label>
            <div class="toggle-container">
              <label class="toggle-switch">
                <input type="checkbox" v-model="formData.activo" />
                <span class="toggle-slider"></span>
              </label>
              <span :class="['toggle-label', formData.activo ? 'active' : 'inactive']">
                {{ formData.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
            <small class="form-hint">
              Los usuarios inactivos no podrán acceder al sistema
            </small>
          </div>

          <!-- Contraseña temporal -->
          <div class="form-section">
            <div class="section-header" @click="showPasswordSection = !showPasswordSection">
              <i :class="['pi', showPasswordSection ? 'pi-chevron-down' : 'pi-chevron-right']"></i>
              <span>Contraseña temporal</span>
            </div>
            <div v-show="showPasswordSection" class="section-content">
              <div class="form-group">
                <label class="form-label">Contraseña temporal</label>
                <div class="input-with-icon">
                  <i class="pi pi-lock input-icon"></i>
                  <input 
                    v-model="passwordData.newPassword"
                    :type="showPassword ? 'text' : 'password'" 
                    class="form-input with-icon with-toggle"
                    placeholder="Mínimo 8 caracteres"
                    minlength="8"
                  />
                  <button 
                    type="button" 
                    class="toggle-password"
                    @click="showPassword = !showPassword"
                  >
                    <i :class="['pi', showPassword ? 'pi-eye-slash' : 'pi-eye']"></i>
                  </button>
                </div>
                <small class="form-hint">Deja en blanco si no deseas cambiar la contraseña. Esta contraseña será temporal y el usuario deberá cambiarla al ingresar.</small>
              </div>
            </div>
          </div>

          <!-- Botones -->
          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="goBack">
              Cancelar
            </button>
            <button type="submit" class="btn-submit" :disabled="submitting">
              <i v-if="submitting" class="pi pi-spin pi-spinner"></i>
              <span v-else>Guardar cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Loading state -->
    <div v-else class="loading-container">
      <i class="pi pi-spin pi-spinner"></i>
      Cargando información del usuario...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { catalogoService, apiService } from '@/services'

const router = useRouter()
const route = useRoute()

const userId = route.params.id

const loading = ref(true)
const submitting = ref(false)
const showPassword = ref(false)
const showPasswordSection = ref(false)
const areas = ref([])
const roles = ref([])

const formData = ref({
  nombreCompleto: '',
  username: '',
  idRol: '',
  idAreaAsignada: '',
  activo: true
})

const passwordData = ref({
  newPassword: '',
  confirmPassword: ''
})

const goBack = () => {
  router.push('/gestion-usuarios')
}

const loadUsuario = async () => {
  try {
    loading.value = true
    const data = await apiService.get(`/Usuarios/${userId}`)
    
    formData.value = {
      nombreCompleto: data.nombreCompleto,
      username: data.username,
      idRol: data.idRol,
      idAreaAsignada: data.idAreaAsignada,
      activo: data.activo !== undefined ? data.activo : true
    }
  } catch (error) {
    console.error('Error cargando usuario:', error)
    alert('Error al cargar la información del usuario')
    goBack()
  } finally {
    loading.value = false
  }
}

const actualizarUsuario = async () => {
  try {
    submitting.value = true

    // Validación de contraseñas si se está cambiando
    if (passwordData.value.newPassword) {
      if (passwordData.value.newPassword.length < 8) {
        alert('La contraseña debe tener al menos 8 caracteres')
        return
      }
    }

    // Preparar datos para enviar
    const userData = {
      nombreCompleto: formData.value.nombreCompleto,
      username: formData.value.username,
      idRol: parseInt(formData.value.idRol),
      idAreaAsignada: parseInt(formData.value.idAreaAsignada),
      activo: formData.value.activo,
      debeCambiarPassword: formData.value.debeCambiarPassword || false
    }

    // Si hay nueva contraseña, agregarla y el flag cambiarSoloPassword (como en PanelAdmin.vue)
    if (passwordData.value.newPassword) {
      userData.newPassword = passwordData.value.newPassword;
      userData.debeCambiarPassword = true;
    }

    // Enviar a la API
    await apiService.put(`/Usuarios/${userId}`, userData)

    alert('Usuario actualizado exitosamente')
    router.push('/gestion-usuarios')
  } catch (error) {
    console.error('Error actualizando usuario:', error)
    alert(error.response?.data?.message || 'Error al actualizar el usuario')
  } finally {
    submitting.value = false
  }
}

const loadAreas = async () => {
  try {
    areas.value = await catalogoService.getAreas()
  } catch (error) {
    console.error('Error cargando áreas:', error)
  }
}

const loadRoles = async () => {
  try {
    roles.value = await catalogoService.getRoles()
  } catch (error) {
    console.error('Error cargando roles:', error)
  }
}

onMounted(async () => {
  await loadAreas()
  await loadRoles()
  await loadUsuario()
})
</script>

<style scoped>
.editar-usuario-container {
  width: 100%;
  min-height: 100vh;
  background: #F9FAFB;
}

/* Header */
.page-header {
  background: white;
  padding: 20px 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-back {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-back:hover {
  background: #e5e7eb;
  color: #374151;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.header-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* Form Container */
.form-container {
  padding: 0 30px 30px;
  max-width: 800px;
  margin: 0 auto;
}

.form-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.required {
  color: #ef4444;
}

.form-input,
.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  outline: none;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus,
.form-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.input-with-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 16px;
}

.form-input.with-icon {
  padding-left: 46px;
}

.form-input.with-toggle {
  padding-right: 46px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.toggle-password:hover {
  color: #374151;
}

.form-hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
}

/* Toggle Switch */
.toggle-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e5e7eb;
  transition: 0.3s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #10b981;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.toggle-label {
  font-size: 14px;
  font-weight: 600;
}

.toggle-label.active {
  color: #10b981;
}

.toggle-label.inactive {
  color: #ef4444;
}

.form-section {
  margin: 32px 0;
  padding: 20px;
  background: #f9fafb;
  border-radius: 10px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  font-size: 15px;
  font-weight: 600;
  color: #374151;
}

.section-content {
  margin-top: 20px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-cancel {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-submit {
  background: #3b82f6;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 400px;
  color: #6b7280;
  font-size: 14px;
}

.loading-container i {
  font-size: 24px;
  color: #3b82f6;
}

@media (max-width: 768px) {
  .form-card {
    padding: 24px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }
}
</style>
