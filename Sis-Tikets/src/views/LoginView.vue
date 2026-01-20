<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-icon">
        <i class="pi pi-sign-in"></i>
      </div>
      
      <h1 class="login-title">Login</h1>
      <p class="login-subtitle">Ingrese sus credenciales para continuar</p>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Mensaje de error -->
        <div v-if="error" class="error-message">
          <i class="pi pi-exclamation-circle"></i>
          {{ error }}
        </div>

        <div class="form-group">
          <label class="form-label">Usuario</label>
          <div class="input-wrapper">
            <i class="pi pi-user input-icon"></i>
            <input 
              type="text" 
              v-model="username" 
              placeholder="Ingrese su usuario"
              class="form-input"
              :disabled="loading"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Contraseña</label>
          <div class="input-wrapper">
            <i class="pi pi-lock input-icon"></i>
            <input 
              type="password" 
              v-model="password" 
              placeholder="Ingrese su contraseña"
              class="form-input"
              :disabled="loading"
              @keyup.enter="handleLogin"
            />
          </div>
        </div>
        
        <button type="submit" class="login-button" :disabled="loading">
          <span v-if="!loading">Iniciar Sesion</span>
          <span v-else>
            <i class="pi pi-spinner pi-spin"></i> Iniciando...
          </span>
        </button>
      </form>
      
      <p class="help-text">
        Necesita Ayuda? <a href="#" class="help-link">Contacta soporte</a>
      </p>
    </div>
    <!-- Modal de cambio de contraseña -->
    <div v-if="showChangePasswordModal" class="modal-overlay">
      <div class="modal-content">
        <h2>Cambiar contraseña</h2>
        <p>Por seguridad, debe cambiar su contraseña antes de continuar.</p>
        <div class="form-group">
          <label>Nueva contraseña</label>
          <input type="password" v-model="newPassword" class="form-input" :disabled="changePasswordLoading" />
        </div>
        <div class="form-group">
          <label>Repetir nueva contraseña</label>
          <input type="password" v-model="confirmPassword" class="form-input" :disabled="changePasswordLoading" />
        </div>
        <div v-if="changePasswordError" class="error-message">
          <i class="pi pi-exclamation-circle"></i>
          {{ changePasswordError }}
        </div>
        <button class="login-button" @click="handleChangePassword" :disabled="changePasswordLoading">
          <span v-if="!changePasswordLoading">Cambiar contraseña</span>
          <span v-else><i class="pi pi-spinner pi-spin"></i> Cambiando...</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services'
import { usuarioService } from '@/services'

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

// Cambio de password forzado
const showChangePasswordModal = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const changePasswordError = ref('')
const changePasswordLoading = ref(false)
const userId = ref(null)
const userPanel = ref('')

const handleLogin = async () => {
  error.value = ''
  if (!username.value || !password.value) {
    error.value = 'Por favor ingrese usuario y contraseña'
    return
  }
  loading.value = true
  try {
    const user = await authService.login(username.value, password.value)
    userId.value = user.idUsuario
    userPanel.value = user.rol === 'Admin' ? '/panel-admin' : user.rol === 'Gestor' ? '/panel-gestor' : '/panel-solicitante'
    await router.push(userPanel.value)
    if (user.debeCambiarPassword) {
      showChangePasswordModal.value = true
    }
    // Si no debe cambiar password, acceso normal
  } catch (err) {
    error.value = err.message || 'Credenciales inválidas. Por favor intente de nuevo.'
    console.error('Error en login:', err)
  } finally {
    loading.value = false
  }
}

const handleChangePassword = async () => {
  changePasswordError.value = ''
  if (!newPassword.value || !confirmPassword.value) {
    changePasswordError.value = 'Debe ingresar y confirmar la nueva contraseña.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    changePasswordError.value = 'Las contraseñas no coinciden.'
    return
  }
  if (newPassword.value.length < 6) {
    changePasswordError.value = 'La contraseña debe tener al menos 6 caracteres.'
    return
  }
  changePasswordLoading.value = true
  try {
    await usuarioService.cambiarPassword(userId.value, {
      NewPassword: newPassword.value,
      CambiarSoloPassword: true
    })
    showChangePasswordModal.value = false
    newPassword.value = ''
    confirmPassword.value = ''
    // Opcional: mostrar mensaje de éxito
  } catch (err) {
    changePasswordError.value = err.message || 'Error al cambiar la contraseña.'
    console.error('Error cambiando contraseña:', err)
  } finally {
    changePasswordLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F9FAFB;
  padding: 0;
  box-sizing: border-box;
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 40px 50px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  text-align: center;
  border: 2px solid #e0e0e0;
}

.login-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.login-icon i {
  width: 70px;
  height: 70px;
  background: #4F39F6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 36px;
}

.login-title {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 30px;
}

.login-form {
  width: 100%;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 15px;
  font-size: 18px;
  color: #4F39F6;
  z-index: 1;
}

.form-input {
  width: 100%;
  padding: 12px 15px 12px 50px;
  border: 1px solid #d1d1d1;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #4F39F6;
  box-shadow: 0 0 0 3px rgba(79, 57, 246, 0.1);
}

.form-input::placeholder {
  color: #999;
}

.login-button {
  width: 100%;
  padding: 14px;
  background: #4F39F6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.login-button:hover {
  background: #3d2bc4;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 57, 246, 0.3);
}

.login-button:active {
  transform: translateY(0);
}

.login-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 14px;
  margin-bottom: 20px;
  text-align: left;
}

.error-message i {
  font-size: 16px;
}

.help-text {
  margin-top: 25px;
  font-size: 14px;
  color: #666;
}

.help-link {
  color: #4F39F6;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.help-link:hover {
  color: #3d2bc4;
  text-decoration: underline;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 32px 28px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  min-width: 320px;
  max-width: 95vw;
  width: 100%;
  text-align: center;
}
</style>
