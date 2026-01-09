# Sistema de Gestion de Tickets

Sistema web de gestion de solicitudes y tickets desarrollado con Vue 3, disenado para facilitar la administracion, seguimiento y resolucion de solicitudes en entornos corporativos.

## Descripcion

Este sistema permite gestionar solicitudes de manera eficiente mediante un flujo de trabajo estructurado con diferentes roles de usuario. Incluye funcionalidades de seguimiento, asignacion de encargados, generacion de reportes y exportacion de datos.

## Caracteristicas Principales

### Sistema Multi-Rol
- **Solicitante**: Crear y dar seguimiento a sus propias solicitudes
- **Gestor**: Administrar solicitudes asignadas por area
- **Administrador**: Control total del sistema, usuarios y catalogos

### Gestion de Solicitudes
- Creacion de tickets con informacion detallada
- Sistema de estados: Nuevo, En proceso, Resuelto, Cerrado, Rechazado
- Niveles de prioridad: Alta, Media, Baja
- Asignacion automatica y manual de encargados por area
- Adjuntar archivos a las solicitudes

### Trazabilidad Completa
- Historial de cambios de estado
- Sistema de comentarios internos
- Timeline de eventos y acciones
- Seguimiento de fechas de creacion y actualizacion

### Reportes y Estadisticas
- Dashboard con estadisticas generales
- Reportes por estado, prioridad y area
- Indicadores de eficiencia y tiempos de respuesta
- Exportacion a Excel (XLSX)

### Gestion de Catalogos
- Administracion de areas
- Tipos de solicitud
- Estados y prioridades personalizables

### Gestion de Usuarios
- Creacion y edicion de usuarios
- Asignacion de roles
- Control de permisos por rol
- Gestion de encargados por area

## Tecnologias Utilizadas

- **Vue 3** - Framework JavaScript progresivo
- **Vue Router 4** - Enrutamiento oficial para Vue
- **PrimeVue 4** - Biblioteca de componentes UI ricos
- **PrimeIcons** - Conjunto de iconos
- **Vite** - Build tool y servidor de desarrollo
- **XLSX** - Libreria para exportacion a Excel

## Estructura del Proyecto

```
Sis-Tikets/
├── src/
│   ├── assets/          # Recursos estaticos
│   ├── components/      # Componentes reutilizables
│   │   ├── common/      # Componentes compartidos
│   │   ├── encargados/  # Componentes de gestion de encargados
│   │   ├── layout/      # Componentes de layout (Header, etc.)
│   │   └── ticket/      # Componentes relacionados con tickets
│   ├── config/          # Configuraciones (API, env)
│   ├── models/          # Modelos de datos
│   ├── router/          # Configuracion de rutas
│   ├── services/        # Servicios de API
│   ├── utils/           # Utilidades y helpers
│   └── views/           # Vistas/Paginas principales
├── public/              # Archivos publicos
└── package.json         # Dependencias y scripts
```

## Requisitos Previos

- Node.js (version 16 o superior)
- pnpm (gestor de paquetes)

## Instalacion

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd Sis-Tikets
```

2. Instalar dependencias:
```bash
pnpm install
```

3. Configurar la URL del API en `src/config/env.js`

## Ejecucion

### Modo Desarrollo
```bash
pnpm dev
```
La aplicacion estara disponible en `http://localhost:5173`



## Modulos del Sistema

### Panel de Solicitante
- Crear nuevas solicitudes
- Visualizar mis solicitudes
- Dar seguimiento al estado
- Agregar comentarios
- Ver historial de cambios

### Panel de Gestor
- Ver solicitudes asignadas a mi area
- Asignar encargados especificos
- Cambiar estados de solicitudes
- Gestionar prioridades
- Agregar notas y comentarios

### Panel de Administrador
- Dashboard con estadisticas generales
- Gestion completa de usuarios
- Configuracion de catalogos
- Gestion de encargados por area
- Generacion de reportes
- Exportacion de datos

## Configuracion de API

El sistema requiere un backend API REST. Configurar la URL base en:
```javascript
// src/config/env.js
export const API_BASE_URL = 'http://tu-api-backend.com/api'
```

## Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **Solicitante** | Crear y ver sus propias solicitudes |
| **Gestor** | Gestionar solicitudes de su area |
| **Admin** | Acceso completo al sistema |



## Licencia

Este proyecto es privado y confidencial.

---

Desarrollado usando Vue 3 y Vite
