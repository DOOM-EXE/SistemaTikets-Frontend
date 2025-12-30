import { createRouter, createWebHistory } from 'vue-router'
import { authService } from '@/services'

// Importar vistas
import LoginView from '@/views/LoginView.vue'
import PanelSolicitante from '@/views/PanelSolicitante.vue'
import PanelGestor from '@/views/PanelGestor.vue'
import PanelAdmin from '@/views/PanelAdmin.vue'
import CrearSolicitud from '@/views/CrearSolicitud.vue'
import VerSolicitud from '@/views/VerSolicitud.vue'
import GestionUsuarios from '@/views/GestionUsuarios.vue'
import GestionEncargados from '@/views/GestionEncargados.vue'
import Catalogos from '@/views/Catalogos.vue'
import CrearUsuario from '@/views/CrearUsuario.vue'
import EditarUsuario from '@/views/EditarUsuario.vue'

/**
 * Configuración de rutas del sistema de tickets
 */
const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: {
      requiresAuth: false,
      title: 'Iniciar Sesión'
    }
  },
  {
    path: '/panel-solicitante',
    name: 'PanelSolicitante',
    component: PanelSolicitante,
    meta: {
      requiresAuth: true,
      role: 'Solicitante',
      title: 'Panel de Solicitante'
    }
  },
  {
    path: '/panel-gestor',
    name: 'PanelGestor',
    component: PanelGestor,
    meta: {
      requiresAuth: true,
      role: 'Gestor',
      title: 'Panel de Gestor'
    }
  },
  {
    path: '/panel-admin',
    name: 'PanelAdmin',
    component: PanelAdmin,
    meta: {
      requiresAuth: true,
      role: 'Admin',
      title: 'Panel de Administrador'
    }
  },
  {
    path: '/crear-solicitud',
    name: 'CrearSolicitud',
    component: CrearSolicitud,
    meta: {
      requiresAuth: true,
      role: 'Solicitante',
      title: 'Crear Nueva Solicitud'
    }
  },
  {
    path: '/solicitud/:id',
    name: 'VerSolicitud',
    component: VerSolicitud,
    meta: {
      requiresAuth: true,
      title: 'Ver Solicitud'
    }
  },
  {
    path: '/gestion-usuarios',
    name: 'GestionUsuarios',
    component: GestionUsuarios,
    meta: {
      requiresAuth: true,
      role: 'Admin',
      title: 'Gestión de Usuarios'
    }
  },
  {
    path: '/gestion-encargados',
    name: 'GestionEncargados',
    component: GestionEncargados,
    meta: {
      requiresAuth: true,
      role: 'Admin',
      title: 'Gestión de Encargados'
    }
  },
  {
    path: '/crear-usuario',
    name: 'CrearUsuario',
    component: CrearUsuario,
    meta: {
      requiresAuth: true,
      role: 'Admin',
      title: 'Crear Usuario'
    }
  },
  {
    path: '/editar-usuario/:id',
    name: 'EditarUsuario',
    component: EditarUsuario,
    meta: {
      requiresAuth: true,
      role: 'Admin',
      title: 'Editar Usuario'
    }
  },
  {
    path: '/catalogos',
    name: 'Catalogos',
    component: Catalogos,
    meta: {
      requiresAuth: true,
      role: 'Admin',
      title: 'Gestión de Catálogos'
    }
  },
  // Ruta 404 - Not Found
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * Guard de navegación global
 * Verifica autenticación antes de cada ruta
 */
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated()
  const requiresAuth = to.meta.requiresAuth
  const user = authService.getUser()

  // Actualizar título de la página
  document.title = to.meta.title ? `${to.meta.title} - Sistema de Tickets` : 'Sistema de Tickets'

  // Si la ruta requiere autenticación y el usuario no está autenticado
  if (requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  // Si el usuario está autenticado y trata de ir al login
  if (to.path === '/login' && isAuthenticated) {
    // Redirigir según el rol
    if (user && user.rol === 'Admin') {
      next('/panel-admin')
    } else if (user && user.rol === 'Gestor') {
      next('/panel-gestor')
    } else {
      next('/panel-solicitante')
    }
    return
  }

  // Verificar que el usuario tenga el rol correcto para la ruta
  if (requiresAuth && to.meta.role && user) {
    if (user.rol !== to.meta.role) {
      // Redirigir al panel correcto según su rol
      if (user.rol === 'Admin') {
        next('/panel-admin')
      } else if (user.rol === 'Gestor') {
        next('/panel-gestor')
      } else {
        next('/panel-solicitante')
      }
      return
    }
  }

  next()
})

export default router
