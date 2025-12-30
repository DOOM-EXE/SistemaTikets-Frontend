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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services'

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  // Limpiar error previo
  error.value = ''

  // Validación
  if (!username.value || !password.value) {
    error.value = 'Por favor ingrese usuario y contraseña'
    return
  }

  loading.value = true

  try {
    const user = await authService.login(username.value, password.value)
    
    // Redirigir según el rol del usuario
    if (user && user.rol === 'Admin') {
      await router.push('/panel-admin')
    } else if (user && user.rol === 'Gestor') {
      await router.push('/panel-gestor')
    } else {
      await router.push('/panel-solicitante')
    }
  } catch (err) {
    // Mostrar mensaje de error
    error.value = err.message || 'Credenciales inválidas. Por favor intente de nuevo.'
    console.error('Error en login:', err)
  } finally {
    loading.value = false
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
</style>
