# CrowdFunding101 - Plataforma de Financiación Colectiva

Plataforma web completa de crowdfunding desarrollada con HTML, CSS, JavaScript (frontend) y Node.js/Express (backend) con base de datos MariaDB.

## Características

- Frontend con HTML, CSS y JavaScript vanilla (sin frameworks)
- Backend REST API con Node.js/Express
- Base de datos MariaDB con todas las tablas necesarias
- Sistema de autenticación con JWT
- Activación de cuentas por email
- Gestión completa de proyectos con estados
- Sistema de donaciones
- Panel de administración
- Docker y Docker Compose para fácil despliegue

## Estructura del Proyecto

```
proyecto-crowdfunding/
├── src/                    # Código fuente completo
│   ├── assets/            # Imágenes y recursos
│   ├── css/               # Estilos CSS
│   ├── js/                # JavaScript frontend
│   ├── routes/            # Rutas del backend
│   ├── config/            # Configuración
│   ├── middleware/        # Middleware de autenticación
│   ├── utils/             # Utilidades
│   ├── scripts/           # Scripts de utilidad
│   ├── *.html             # Páginas HTML
│   ├── index.js           # Servidor Express
│   └── package.json       # Dependencias Node.js
├── db/                     # Scripts SQL
│   └── script-de-inicializacion.sql
├── uploads/                # Archivos subidos
├── Dockerfile              # Imagen Docker
├── docker-compose.yml      # Orquestación de contenedores
└── script-de-inicializacion.sql  # Script SQL (copia)
```

## Requisitos Previos

- Docker y Docker Compose instalados
- Git (para clonar el repositorio)

## Instalación y Ejecución

### Opción 1: Docker Compose (Recomendado)

1. Clonar o descargar el proyecto
2. En la raíz del proyecto, ejecutar:

```bash
docker-compose up -d --build
```

3. Esperar a que los contenedores estén saludables (la API aplica todas las migraciones y datos por sí sola)
4. Abrir `http://localhost:3000`

### Opción 2: Desarrollo Local

1. Instalar Node.js 18+ y MariaDB
2. Crear base de datos y ejecutar `db/script-de-inicializacion.sql`
3. Copiar `src/.env.example` a `src/.env` y configurar
4. Instalar dependencias:

```bash
cd src
npm install
```

5. Iniciar servidor:

```bash
npm start
```

## Usuarios de Prueba

Las cuentas se precargan automáticamente al iniciar el backend.

- Admin: `admin@crowdfunding101.com` / `Admin123!`
- Usuaria: `maria@example.com` / `User123!`
- Usuario: `carlos@example.com` / `User123!`
- Usuaria: `ana@example.com` / `User123!`
- Cuenta de prueba sin activar: `test@test.com` / `Test123!`

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/activate/:token` - Activar cuenta
- `GET /api/auth/me` - Usuario actual

### Proyectos
- `GET /api/projects` - Listar proyectos
- `GET /api/projects/:id` - Detalle de proyecto
- `POST /api/projects` - Crear proyecto (requiere auth)
- `PUT /api/projects/:id` - Editar proyecto (requiere auth)
- `DELETE /api/projects/:id` - Eliminar proyecto (requiere auth)
- `POST /api/projects/:id/submit` - Enviar para revisión (requiere auth)
- `GET /api/projects/user/my-projects` - Mis proyectos (requiere auth)

### Donaciones
- `POST /api/donations/projects/:id` - Hacer donación (requiere auth)
- `GET /api/donations/projects/:id` - Listar donaciones
- `GET /api/donations/user/my-contributions` - Mis aportes (requiere auth)

### Favoritos
- `POST /api/favorites/:projectId` - Agregar favorito (requiere auth)
- `DELETE /api/favorites/:projectId` - Quitar favorito (requiere auth)
- `GET /api/favorites/user/my-favorites` - Mis favoritos (requiere auth)

### Campañas
- `POST /api/campaigns/:id/start` - Iniciar campaña (requiere auth)
- `POST /api/campaigns/:id/pause` - Pausar campaña (requiere auth)
- `POST /api/campaigns/:id/resume` - Reanudar campaña (requiere auth)

### Administración
- `GET /api/admin/projects` - Todos los proyectos (requiere admin)
- `POST /api/admin/projects/:id/approve` - Aprobar proyecto (requiere admin)
- `POST /api/admin/projects/:id/observe` - Observar proyecto (requiere admin)
- `POST /api/admin/projects/:id/reject` - Rechazar proyecto (requiere admin)
- `GET /api/admin/users` - Listar usuarios (requiere admin)
- `POST /api/admin/users` - Crear administrador (requiere admin)
- `PUT /api/admin/users/:id` - Editar usuario (requiere admin)
- `DELETE /api/admin/users/:id` - Eliminar usuario (requiere admin)

### Categorías
- `GET /api/categories` - Listar categorías
- `GET /api/categories/:id` - Detalle de categoría

## Base de Datos

### Tablas Principales
- `usuarios` - Usuarios del sistema
- `proyectos` - Proyectos de crowdfunding
- `categorias` - Categorías de proyectos
- `donaciones` - Donaciones realizadas
- `favoritos` - Proyectos favoritos de usuarios
- `observaciones` - Observaciones de administradores

### Estados de Proyecto
- **Borrador**: Proyecto en creación
- **En Revisión**: Esperando aprobación
- **Observado**: Necesita correcciones
- **Rechazado**: No cumple requisitos
- **Publicado**: Aprobado y visible

### Estados de Campaña
- **No Iniciada**: Aún no comenzó
- **En Progreso** *(se muestra como “En Recaudación” en la interfaz)*: Activa y recibiendo donaciones
- **En Pausa**: Temporalmente pausada
- **Finalizada**: Completada

## Configuración

### Variables de Entorno

Crear archivo `src/.env` (los valores por defecto funcionan con Docker):

```env
DB_HOST=mariadb
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=crowdfunding_db
DB_PORT=3306
PORT=3000
PAYMENT_GATEWAY_PORT=3002
JWT_SECRET=tu_secreto_super_seguro
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
# Opcional para túneles (localtunnel)
APP_TUNNEL_SUBDOMAIN=
GATEWAY_TUNNEL_SUBDOMAIN=
```

### Email (verificación real)

Para que los correos de activación salgan desde Gmail debes definir:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=pruebachuflay@gmail.com
SMTP_PASS=doyjdtinqynbqjvl
```

- Usa la contraseña de aplicación **sin espacios**.
- Si prefieres otras credenciales, solo reemplázalas por tus valores.
- Si no defines variables, la API usa automáticamente la cuenta anterior para no romper el flujo de verificación.

### Acceso desde móviles (túnel opcional)

Si necesitas compartir rápidamente el proyecto (puertos 3000 y 3002) con un celular, puedes levantar dos túneles seguros usando `localtunnel`:

```bash
cd src
npm install    # solo la primera vez
npm run tunnel
```

El script mostrará dos URLs públicas. Comparte la del puerto 3000 para la app web y, si quieres que los QR apunten al exterior, actualiza la variable `PUBLIC_URL` del servicio `payment-gateway` (o el `.env` equivalente) con la URL que se genere para el puerto 3002.

Puedes opcionalmente fijar subdominios amigables configurando `APP_TUNNEL_SUBDOMAIN` y `GATEWAY_TUNNEL_SUBDOMAIN` en tu `.env`.

## Solución de Problemas

### Los contenedores no inician
```bash
docker-compose down
docker-compose up -d --build
```

### Error de conexión a base de datos
- Verificar que MariaDB esté corriendo
- Verificar variables de entorno
- Esperar a que el healthcheck pase

### Limpiar todo y empezar de nuevo
```bash
docker-compose down -v
docker-compose up -d --build
```

## Notas Importantes

- La API inicializa contraseñas, proyectos publicados y campañas automáticamente al arrancar.
- En desarrollo, los emails de activación se muestran en consola.
- Cambia `JWT_SECRET` y las credenciales SMTP para producción.
- Los archivos subidos se guardan en `/uploads` (volumen mapeado).

## Funcionalidades Implementadas

Sistema de autenticación con JWT  
Activación de cuentas por email  
CRUD completo de proyectos  
Sistema de donaciones  
Favoritos  
Panel de administración  
Gestión de campañas  
Estados de proyecto y campaña  
Validación de formularios  
Diseño responsive  


## Desarrollo

Para desarrollo local con hot-reload:

```bash
cd src
npm run dev
```

Requiere `nodemon` instalado globalmente o en devDependencies.
