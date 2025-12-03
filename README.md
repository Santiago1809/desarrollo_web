# Edge Timer - Barbershop Management System

[![Production](https://img.shields.io/badge/Producci%C3%B3n-Live-brightgreen)](https://desarrollo-web-hazel.vercel.app/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-red)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)

Sistema completo de gestión para barberías que permite la reserva de citas, calificación de servicios, gestión de horarios y soporte al cliente.

## 🚀 Demo en Producción

**🔗 [https://desarrollo-web-hazel.vercel.app/](https://desarrollo-web-hazel.vercel.app/)**

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Variables de Entorno](#-variables-de-entorno)
- [Ejecución](#-ejecución)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Roles de Usuario](#-roles-de-usuario)

---

## ✨ Características

- **Autenticación JWT** - Registro y login seguro con tokens
- **Gestión de Citas** - Crear, reagendar y cancelar citas
- **Sistema de Horarios** - Configuración de disponibilidad por barbero
- **Calificaciones** - Sistema de rating (1-5 estrellas) para servicios completados
- **Tickets de Soporte** - Sistema completo de soporte al cliente
- **Notificaciones por Email** - Confirmaciones y recordatorios automáticos
- **Roles de Usuario** - Cliente, Barbero y Administrador

---

## 🛠 Tecnologías

### Backend
| Tecnología | Versión |
|------------|---------|
| Node.js | 22.x |
| NestJS | 11.x |
| TypeORM | 0.3.27 |
| PostgreSQL | 8.x (driver) |
| JWT | 11.x |
| Nodemailer | 7.0.11 |
| bcrypt | 6.0.0 |

### Frontend
| Tecnología | Versión |
|------------|---------|
| Next.js | 16.0.6 |
| React | 19.2.0 |
| TypeScript | 5.x |
| TanStack Query | 5.90.11 |
| Tailwind CSS | 4.x |
| Axios | 1.13.2 |
| date-fns | 4.1.0 |
| Lucide React | 0.555.0 |

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 22.x ([Descargar](https://nodejs.org/))
- **npm** >= 10.x o **bun** >= 1.x
- **PostgreSQL** >= 14 ([Descargar](https://www.postgresql.org/download/))
- **Git** ([Descargar](https://git-scm.com/))

---

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd desarrollo_web
```

### 2. Instalar dependencias del Backend

```bash
cd backend
npm install
# o con bun
bun install
```

### 3. Instalar dependencias del Frontend

```bash
cd ../frontend
npm install
# o con bun
bun install
```

---

## 🔐 Variables de Entorno

### Backend (`backend/.env`)

Crea un archivo `.env` en la carpeta `backend/` con las siguientes variables:

```env
# ===================================
# DATABASE CONFIGURATION
# ===================================
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario_postgres
DB_PASSWORD=tu_contraseña_postgres
DB_NAME=edge_timer_db

# ===================================
# JWT CONFIGURATION
# ===================================
JWT_SECRET=tu_clave_secreta_jwt_muy_segura_y_larga

# ===================================
# EMAIL CONFIGURATION (SMTP)
# ===================================
# Puedes usar servicios como Gmail, SendGrid, Mailgun, etc.
# Para Gmail: host=smtp.gmail.com, port=587
# Nota: Para Gmail necesitas crear una "App Password"

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password
SMTP_FROM_NAME=Edge Timer
```

#### Descripción de Variables del Backend

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DB_HOST` | Host de la base de datos PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_USER` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `mypassword` |
| `DB_NAME` | Nombre de la base de datos | `edge_timer_db` |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | `mi_clave_super_secreta_123` |
| `SMTP_HOST` | Host del servidor SMTP | `smtp.gmail.com` |
| `SMTP_PORT` | Puerto del servidor SMTP | `587` |
| `SMTP_USER` | Usuario/Email para autenticación SMTP | `email@gmail.com` |
| `SMTP_PASS` | Contraseña/App Password del SMTP | `xxxx xxxx xxxx xxxx` |
| `SMTP_FROM_NAME` | Nombre que aparece como remitente | `Edge Timer` |

### Frontend (`frontend/.env.local`)

Crea un archivo `.env.local` en la carpeta `frontend/` con las siguientes variables:

```env
# ===================================
# API CONFIGURATION
# ===================================
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### Descripción de Variables del Frontend

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL base del API backend | `http://localhost:3000` |

---

## 🚀 Ejecución

### Desarrollo Local

#### 1. Iniciar la Base de Datos

Asegúrate de que PostgreSQL esté corriendo y crea la base de datos:

```sql
CREATE DATABASE edge_timer_db;
```

O usando Docker:

```bash
cd backend
docker-compose up -d
```

#### 2. Iniciar el Backend

```bash
cd backend
npm run start:dev
# o con bun
bun run start:dev
```

El backend estará disponible en: `http://localhost:3000`

#### 3. Iniciar el Frontend

En una nueva terminal:

```bash
cd frontend
npm run dev
# o con bun
bun run dev
```

El frontend estará disponible en: `http://localhost:3001`

### Scripts Disponibles

#### Backend

| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Inicia en modo desarrollo con hot-reload |
| `npm run build` | Compila el proyecto para producción |
| `npm run start:prod` | Inicia el servidor en producción |
| `npm run lint` | Ejecuta el linter ESLint |
| `npm run test` | Ejecuta los tests |
| `npm run test:e2e` | Ejecuta tests end-to-end |

#### Frontend

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia en modo desarrollo |
| `npm run build` | Compila el proyecto para producción |
| `npm run start` | Inicia el servidor de producción |
| `npm run lint` | Ejecuta Biome para linting |

---

## 📁 Estructura del Proyecto

```
desarrollo_web/
├── backend/                    # API NestJS
│   ├── src/
│   │   ├── appointments/       # Módulo de citas
│   │   ├── auth/               # Autenticación
│   │   ├── entities/           # Entidades TypeORM
│   │   ├── notifications/      # Notificaciones y emails
│   │   ├── ratings/            # Sistema de calificaciones
│   │   ├── services/           # Servicios de barbería
│   │   ├── support/            # Tickets de soporte
│   │   ├── users/              # Gestión de usuarios
│   │   └── shared/             # Guards, interceptors, utils
│   ├── migrations/             # Migraciones de DB
│   └── test/                   # Tests
│
├── frontend/                   # Aplicación Next.js
│   ├── app/
│   │   ├── components/         # Componentes reutilizables
│   │   ├── citas/              # Página de citas
│   │   ├── login/              # Página de login
│   │   ├── register/           # Página de registro
│   │   ├── perfil/             # Perfil de usuario
│   │   ├── servicios/          # Servicios disponibles
│   │   └── soporte/            # Tickets de soporte
│   ├── hooks/                  # Custom hooks
│   ├── services/               # Servicios de API
│   ├── types/                  # Tipos TypeScript
│   └── public/                 # Archivos estáticos
│
└── README.md                   # Este archivo
```

---

## 🔌 API Endpoints

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/register` | Registrar nuevo usuario |
| POST | `/auth/login` | Iniciar sesión |

### Citas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/appointments/all` | Obtener todas las citas |
| GET | `/appointments/my-appointments` | Mis citas |
| POST | `/appointments/create` | Crear cita |
| PATCH | `/appointments/reschedule/:id` | Reagendar cita |
| PATCH | `/appointments/cancel/:id` | Cancelar cita |
| PATCH | `/appointments/complete/:id` | Completar cita |

### Calificaciones
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/ratings` | Crear calificación |
| GET | `/ratings/barber/:barberId` | Calificaciones de un barbero |
| GET | `/ratings/my-ratings` | Mis calificaciones |
| GET | `/ratings/check/:appointmentId` | Verificar si puedo calificar |

### Soporte
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/support` | Crear ticket |
| GET | `/support/my-tickets` | Mis tickets |
| GET | `/support/all` | Todos los tickets (Admin) |
| PATCH | `/support/:id` | Actualizar ticket |
| PATCH | `/support/:id/close` | Cerrar ticket |

### Servicios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/services` | Obtener todos los servicios |
| POST | `/services` | Crear servicio (Admin) |

### Usuarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/users/barbers` | Obtener lista de barberos |
| GET | `/users/profile` | Obtener perfil actual |

---

## 👥 Roles de Usuario

El sistema maneja 3 roles diferentes:

| ID | Rol | Permisos |
|----|-----|----------|
| 1 | **Cliente** | Crear citas, calificar servicios, crear tickets de soporte |
| 2 | **Barbero** | Ver sus citas, completar citas, configurar horarios |
| 3 | **Admin** | Gestión completa, ver todos los tickets, gestionar usuarios |

---

## 📧 Configuración de Email (Gmail)

Para usar Gmail como servidor SMTP:

1. Ve a tu cuenta de Google → Seguridad
2. Activa la verificación en 2 pasos
3. Ve a "Contraseñas de aplicaciones"
4. Genera una nueva contraseña para "Correo" y "Computadora Windows"
5. Usa esa contraseña (16 caracteres) en `SMTP_PASS`

---

## 🐳 Docker

El proyecto incluye un `docker-compose.yml` para la base de datos:

```bash
cd backend
docker-compose up -d
```

Esto levantará una instancia de PostgreSQL configurada.

---

## 📝 Licencia

Este proyecto fue desarrollado como parte del curso de Desarrollo Web.

---

## 👨‍💻 Desarrolladores

Santiago Aristizabal Henao (Arquitecto de Software en Botopia S.A.S) <a href="https://github.com/Santiago1809">GuitHub</a>

---

<p align="center">
  <strong>🔗 <a href="https://desarrollo-web-hazel.vercel.app/">Ver Demo en Producción</a></strong>
</p>
