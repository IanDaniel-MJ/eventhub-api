# EventHub API

API RESTful para la gestión de eventos académicos, desarrollada con **Node.js** y **Express** bajo una arquitectura por capas, almacenamiento en memoria con datos semilla, seguridad mediante **JWT + 2FA**, y control de tráfico con **Rate Limiting**.

> **Release actual:** `v0.1.0` — Cierre de Sprint 1 (Infraestructura base, Seguridad y Autenticación, Módulo de Ponentes y Colección de pruebas en Postman).

---

## Stack Tecnológico

* **Runtime:** Node.js (CommonJS)
* **Framework:** Express `^5.3.0`
* **Seguridad:** `bcryptjs` (hash de contraseñas), `jsonwebtoken` (JWT de acceso y temporal), `crypto` nativo (UUID v4 y OTP de 6 dígitos), `express-rate-limit`
* **Configuración y desarrollo:** `dotenv`, `nodemon`
* **Pruebas y documentación:** Postman (Collection + Environment)

---

## Estructura del Proyecto

```text
eventhub-api/
├── postman/                  # Colecciones y entornos exportados de Postman
├── src/
│   ├── controllers/          # Manejo de req/res y códigos HTTP
│   │   ├── auth.controller.js
│   │   ├── health.controller.js
│   │   └── speakers.controller.js
│   ├── data/                 # Datos semilla y almacenes en memoria
│   │   ├── auth.store.js     # Usuarios y códigos OTP temporales (Map)
│   │   ├── index.js          # Capa de acceso en memoria (speakers/events)
│   │   └── seed.json         # 5 ponentes, 5 eventos y 5 asistentes base
│   ├── middlewares/          # Middlewares transversales y de validación
│   │   ├── authenticate.js   # Verificación de Bearer JWT (type: "access")
│   │   ├── errorHandler.js   # Respuestas JSON estandarizadas de error
│   │   ├── logger.js         # Log HTTP con duración en milisegundos
│   │   ├── notFound.js       # Captura de rutas inexistentes (404)
│   │   ├── rateLimiter.js    # Limitador global (60/min) y auth (10/min)
│   │   ├── validateAuth.js   # Validación de register, login y verify-2fa
│   │   └── validateSpeaker.js# Validación de campos de ponentes
│   ├── routes/               # Enrutadores de Express (/api/v1/*)
│   │   ├── auth.routes.js
│   │   ├── health.routes.js
│   │   └── speakers.routes.js
│   ├── services/             # Lógica de negocio y reglas de dominio
│   │   ├── auth.service.js
│   │   └── speakers.service.js
│   ├── utils/                # Utilidades reutilizables
│   │   ├── ApiError.js       # Clase de errores operacionales
│   │   └── idGenerator.js    # Generador UUID v4 con crypto.randomUUID()
│   ├── app.js                # Configuración de Express y orden de middlewares
│   └── server.js             # Punto de entrada y carga de variables de entorno
├── .env.example              # Plantilla de variables de entorno
└── package.json
```

---

## Instalación y Ejecución Local

1. **Clonar el repositorio e instalar dependencias:**
   ```bash
   git clone <URL-del-repositorio>
   cd eventhub-api
   npm install
   ```

2. **Configurar variables de entorno:**
   Copia `.env.example` a un archivo `.env` en la raíz del proyecto:
   ```env
   PORT=3000
   NODE_ENV=development
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX=60
   AUTH_RATE_LIMIT_MAX=10
   JWT_SECRET=eventhub_super_secret_key_2026
   JWT_EXPIRES_IN=1h
   ```

3. **Iniciar el servidor:**
   * Modo desarrollo (con recarga automática):
     ```bash
     npm run dev
     ```
   * Modo producción:
     ```bash
     npm start
     ```

El servidor quedará disponible en `http://localhost:3000`.

---

## Endpoints Disponibles (`/api/v1`)

### Salud del servicio (Público)

| Método | Ruta | Acceso | Descripción | Códigos HTTP |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/v1/health` | Público | Verifica el estado del servidor, `uptime` y versión. | `200`, `429` |

### Autenticación y 2FA (Público — límite de 10 req/min)

| Método | Ruta | Acceso | Descripción | Códigos HTTP |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Público | Registra un usuario hasheando la contraseña con `bcryptjs`. | `201`, `400`, `409`, `429` |
| `POST` | `/api/v1/auth/login` | Público | Valida credenciales, genera código OTP (6 dígitos, 5 min) en consola y devuelve `tempToken`. | `200`, `400`, `401`, `429` |
| `POST` | `/api/v1/auth/verify-2fa` | Público | Valida `tempToken` + `code` (un solo uso) y emite el `accessToken` JWT. | `200`, `400`, `401`, `429` |

### Gestión de Ponentes (Protegido con `Authorization: Bearer <accessToken>`)

| Método | Ruta | Acceso | Descripción | Códigos HTTP |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/v1/speakers` | JWT | Lista todos los ponentes registrados en memoria. | `200`, `401`, `429` |
| `GET` | `/api/v1/speakers/:id` | JWT | Consulta un ponente específico por UUID. | `200`, `401`, `404`, `429` |
| `POST` | `/api/v1/speakers` | JWT | Registra un ponente nuevo y devuelve cabecera `Location`. | `201`, `400`, `401`, `409`, `429` |
| `PUT` | `/api/v1/speakers/:id` | JWT | Reemplaza los datos de un ponente existente. | `200`, `400`, `401`, `404`, `409`, `429` |
| `DELETE` | `/api/v1/speakers/:id` | JWT | Elimina un ponente validando que no tenga eventos asociados. | `204`, `401`, `404`, `409`, `429` |

---

## Flujo de Seguridad (2FA + JWT + Rate Limiting)

1. **Registro (`POST /api/v1/auth/register`):** recibe `{ nombre, email, password }` (mínimo 6 caracteres) y almacena el hash con `bcryptjs`.
2. **Inicio de sesión (`POST /api/v1/auth/login`):** devuelve un `tempToken` (`type: "2fa_pending"`, vigencia de 5 minutos) e imprime el OTP de 6 dígitos en la consola del servidor (en `NODE_ENV=development` también incluye `devCode` para automatizar pruebas en Postman).
3. **Verificación (`POST /api/v1/auth/verify-2fa`):** recibe `{ tempToken, code }`, invalida el código de inmediato para garantizar un solo uso y emite el `accessToken` (`type: "access"`, vigencia configurada en `JWT_EXPIRES_IN`).
4. **Rutas protegidas:** el middleware `authenticate` exige `Authorization: Bearer <accessToken>` y rechaza cualquier `tempToken` con `401 TOKEN_INVALID`.
5. **Rate Limiting:** todas las respuestas en `/api/v1` incluyen las cabeceras estándar `RateLimit-Limit`, `RateLimit-Remaining` y `RateLimit-Reset`. Al superar 60 peticiones/min globales o 10 peticiones/min en `/auth`, responde `429 Too Many Requests`.

---

## Formato Estándar de Errores

Todos los errores operacionales y de validación responden con la siguiente estructura JSON gestionada por `ApiError` y `errorHandler`:

```json
{
  "error": {
    "status": 401,
    "code": "TOKEN_MISSING",
    "message": "Se requiere un token de acceso en la cabecera Authorization (Bearer).",
    "timestamp": "2026-11-24T05:00:00.000Z"
  }
}
```

**Códigos de error contemplados:** `VALIDATION_ERROR` (`400`), `INVALID_CREDENTIALS`, `TOKEN_MISSING`, `TOKEN_INVALID`, `TOKEN_EXPIRED`, `INVALID_2FA_CODE`, `EXPIRED_2FA_CODE` (`401`), `ROUTE_NOT_FOUND`, `SPEAKER_NOT_FOUND` (`404`), `DUPLICATE_EMAIL`, `USER_ALREADY_EXISTS`, `SPEAKER_HAS_EVENTS` (`409`), `RATE_LIMIT_EXCEEDED` (`429`), `INTERNAL_SERVER_ERROR` (`500`).

---

## Pruebas en Postman

1. Importa la colección y el entorno `Local` (`baseUrl = http://localhost:3000/api/v1`) desde la carpeta `postman/`.
2. Ejecuta las carpetas en orden: **Health** → **Auth** (`register` → `login` → `verify-2fa`, que encadenan automáticamente `tempToken`, `otpCode` y `accessToken`) → **Speakers**.
3. Como los datos viven en memoria, al reiniciar el servidor se recarga `src/data/seed.json` y se reinician los usuarios y contadores de Rate Limiting.

---

## Flujo de Trabajo del Equipo

* **Ramas protegidas:** `main` (releases estables) y `develop` (integración del sprint).
* **Convención:** 1 Historia de JIRA = 1 rama `feature/EVH-XX-descripcion` = 1 Pull Request revisado y aprobado hacia `develop`.
* **Commits:** Conventional Commits vinculados a JIRA (`feat(auth): EVH-68 ...`).
* **Integrantes:** Ian, Cristian, Yare, Mariana e Isaac.