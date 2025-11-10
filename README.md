# CrowdFunding101 — Fase 3 (Contenido estático)

Este es un demo estático de una plataforma de crowdfunding. Está organizado para ser fácil de editar y correr localmente.

## 🚀 Características

### Autenticación y Usuarios
- Sistema de roles: Visitante, Usuario, Administrador
- Validación de formularios con mensajes inline
- Simulación de login/logout en frontend usando localStorage
- Protección de rutas según rol de usuario

### Gestión de Proyectos
- Estados de proyecto: Borrador, En Revisión, Observado, Rechazado, Publicado
- Estados de campaña: No Iniciada, En Progreso, En Pausa, Finalizada
- Sistema de categorías con iconos Flaticon
- Badges de estado visibles en todas las vistas

### Panel de Administrador
- Página `admin.html` con interfaz de administración
- Listado completo de proyectos con filtros por estado
- Funcionalidad de aprobar/rechazar proyectos con observaciones
- Gestión de usuarios administradores

### Funcionalidades de Usuario
- **Mis Proyectos** (`mis-proyectos.html`): Listado personal de proyectos
- **Proyectos Favoritos** (`favoritos.html`): Proyectos guardados
- **Mis Aportes** (`mis-aportes.html`): Historial de donaciones
- **Crear/Editar Proyecto** (`crear-proyecto.html`): Formulario de creación y edición

### Mejoras de Interfaz
- Badges de estado con colores distintivos
- Diseño responsive para móvil/tablet/desktop
- Validación de formularios mejorada sin alerts
- Iconos Flaticon para categorías

## 📁 Estructura del Proyecto

```
proyecto-crowdfunding/
├── assets/
│   └── images/
│       ├── nuevos/          # 12 nuevas imágenes de proyectos
│       └── ...              # Imágenes existentes
├── css/
│   ├── auth.css            # Estilos de autenticación
│   ├── badges.css          # Estilos de badges y estados
│   ├── detalle-proyecto.css
│   ├── explorar.css
│   ├── home.css
│   ├── styles.css          # Estilos globales
│   └── admin.css           # Estilos del panel admin
├── js/
│   ├── auth.js             # Validación de formularios
│   ├── auth-system.js      # Sistema de autenticación
│   ├── main.js             # Datos de muestra y utilidades
│   ├── home.js             # Página principal
│   ├── explorar.js         # Página de exploración
│   ├── detalle-proyecto.js # Detalle de proyecto
│   ├── admin.js            # Panel de administración
│   ├── mis-proyectos.js    # Mis proyectos
│   ├── favoritos.js        # Favoritos
│   ├── mis-aportes.js      # Mis aportes
│   └── crear-proyecto.js   # Crear/editar proyecto
├── index.html              # Página principal
├── explorar.html           # Explorar proyectos
├── detalle-proyecto.html   # Detalle de proyecto
├── login.html              # Iniciar sesión
├── registro.html           # Registro
├── admin.html              # Panel de administración
├── mis-proyectos.html      # Mis proyectos
├── favoritos.html          # Proyectos favoritos
├── mis-aportes.html        # Mis aportes
├── crear-proyecto.html     # Crear/editar proyecto
├── editar-proyecto.html    # Redirige a crear-proyecto.html
├── Dockerfile
├── nginx.conf
└── README.md
```

## 🎯 Cómo usar

### Opción 1: Abrir directamente en el navegador
1. Descomprime el proyecto
2. Abre `index.html` en tu navegador (doble clic)
3. **Nota**: Algunas funcionalidades requieren un servidor local debido a CORS

### Opción 2: Servidor local (Recomendado)

#### Con Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Con Node.js (http-server):
```bash
npm install -g http-server
http-server -p 8000
```

#### Con PHP:
```bash
php -S localhost:8000
```

Luego abre `http://localhost:8000` en tu navegador.

### Opción 3: Docker

```bash
# Construir la imagen
docker build -t crowdfund-static .

# Ejecutar el contenedor
docker run -p 8080:80 --rm crowdfund-static
```

Luego abre `http://localhost:8080` en tu navegador.

## 👤 Usuarios de Prueba

### Administrador
- **Email**: `admin@crowdfunding101.com`
- **Password**: `admin123`

### Usuarios Normales
- **Email**: `maria@example.com` / **Password**: `user123`
- **Email**: `carlos@example.com` / **Password**: `user123`
- **Email**: `ana@example.com` / **Password**: `user123`
- **Email**: `test@test.com` / **Password**: `test123`

## 🎨 Características Técnicas

### Tecnologías Utilizadas
- HTML5
- CSS3 (Vanilla, sin frameworks)
- JavaScript (Vanilla, sin frameworks)
- Flaticon UIcons (iconos)
- localStorage (simulación de persistencia)

### Estados de Proyecto
- **Borrador**: Proyecto en creación, no visible públicamente
- **En Revisión**: Esperando aprobación del administrador
- **Observado**: Necesita correcciones antes de publicar
- **Rechazado**: No cumple con los lineamientos
- **Publicado**: Visible para todos los usuarios

### Estados de Campaña
- **No Iniciada**: Aún no ha comenzado
- **En Progreso**: Campaña activa
- **En Pausa**: Temporalmente pausada
- **Finalizada**: Campaña completada

## 📝 Notas Importantes

- **Este es un proyecto estático**: No hay backend real, todo se simula con localStorage
- **Los datos se pierden al limpiar el navegador**: localStorage se borra al limpiar datos del navegador
- **No hay persistencia real**: Los cambios no se guardan permanentemente
- **Solo validación del cliente**: No hay validación del servidor
- **Sin frameworks**: Todo está construido con HTML, CSS y JavaScript vanilla

## 🔒 Restricciones

- ❌ NO se usan frameworks frontend (React, Vue, Angular)
- ❌ NO se usa Bootstrap ni frameworks CSS
- ❌ NO hay backend real (solo simulación estática)
- ❌ NO se usa base de datos real
- ✅ Validación solo con JavaScript personalizado
- ✅ Diseño responsive con CSS Grid y Flexbox
- ✅ Iconos de Flaticon UIcons

## 🎯 Funcionalidades Implementadas

✅ Sistema de autenticación con roles  
✅ Validación de formularios mejorada  
✅ Estados de proyecto y campaña  
✅ Panel de administración  
✅ Mis Proyectos  
✅ Proyectos Favoritos  
✅ Mis Aportes  
✅ Crear/Editar Proyectos  
✅ Badges de estado  
✅ Diseño responsive  
✅ Sistema de donaciones  
✅ Categorías clickeables  
✅ Iconos Flaticon  

## 📱 Responsive Design

El diseño es totalmente responsive y se adapta a:
- 📱 Móviles (< 768px)
- 📱 Tablets (768px - 1024px)
- 💻 Desktop (> 1024px)

## 🐛 Solución de Problemas

### Los cambios no se guardan
- Los datos se guardan en localStorage del navegador
- Asegúrate de no estar en modo incógnito
- Limpia el localStorage si hay problemas: `localStorage.clear()`

### Los iconos no se muestran
- Verifica tu conexión a internet (los iconos se cargan desde CDN)
- Verifica la consola del navegador para errores

### El menú móvil no funciona
- Asegúrate de que `js/main.js` y `js/auth-system.js` estén cargados
- Verifica que el ancho de la ventana sea menor a 768px

## 📄 Licencia

Ver archivo `LICENSE.txt` para más información.

## 👨‍💻 Desarrollo

Este proyecto fue desarrollado como parte de la Fase 3 de un sistema de crowdfunding estático. Para funcionalidad completa se requiere implementar un backend real con base de datos.
