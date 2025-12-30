<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-icon">
        <i class="pi pi-sign-in"></i>
      </div>
      
      <h1 class="login-title">Login</h1>
      <p class="login-subtitle">Ingrese sus credenciales para continuar</p>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label class="form-label">Usuario</label>
          <div class="input-wrapper">
            <i class="pi pi-user input-icon"></i>
            <input 
              type="text" 
              v-model="username" 
              placeholder="Ingrese su usuario"
              class="form-input"
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
            />
          </div>
        </div>
        
        <button type="submit" class="login-button">
          Iniciar Sesion
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

const username = ref('')
const password = ref('')

const handleLogin = () => {
  console.log('Login attempt:', { username: username.value, password: password.value })
  // Aquí puedes agregar la lógica de autenticación
}
</script>

<style scoped>
.login-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
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
  background: #5B5FEF;
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
  color: #5B5FEF;
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
  border-color: #5B5FEF;
  box-shadow: 0 0 0 3px rgba(91, 95, 239, 0.1);
}

.form-input::placeholder {
  color: #999;
}

.login-button {
  width: 100%;
  padding: 14px;
  background: #5B5FEF;
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
  background: #4a4dd4;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(91, 95, 239, 0.3);
}

.login-button:active {
  transform: translateY(0);
}

.help-text {
  margin-top: 25px;
  font-size: 14px;
  color: #666;
}

.help-link {
  color: #5B5FEF;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.help-link:hover {
  color: #4a4dd4;
  text-decoration: underline;
}
</style>
