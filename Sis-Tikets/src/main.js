import { createApp } from 'vue'
import './style.css'
import 'primeicons/primeicons.css'
import PrimeVue from 'primevue/config'
import router from './router'
import App from './App.vue'

const app = createApp(App)
app.use(PrimeVue)
app.use(router)
app.mount('#app')
