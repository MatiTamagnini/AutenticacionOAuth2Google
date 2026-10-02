# TP: Autenticación OAuth2 Google en NestJS

Microservicio backend en **NestJS** que autentica usuarios con **Google OAuth2**, los guarda en **SQL Server** mediante **Prisma ORM** y devuelve un **JWT** para acceder a rutas privadas.

## Tecnologías

- NestJS + TypeScript
- Passport (`passport-google-oauth20`, `passport-jwt`)
- `@nestjs/jwt`
- Prisma ORM 6 + SQL Server

## Requisitos

- Node.js 18 o superior
- SQL Server (probado con SQLEXPRESS) y SSMS
- Un proyecto en Google Cloud Console con credenciales OAuth (aplicación web)

## Configuración de Google Cloud

1. Crear un proyecto y configurar la pantalla de consentimiento (usuario de prueba: tu mail).
2. Crear un **ID de cliente de OAuth** de tipo *Aplicación web*.
3. Registrar la URI de redirección autorizada:

```
http://localhost:3000/auth/google/callback
```

## Instalación

```bash
npm install
```

## Variables de entorno

Copiar `.env.example` a `.env` y completar los valores:

```bash
copy .env.example .env
```

| Variable | Descripción |
| --- | --- |
| `GOOGLE_CLIENT_ID` | ID de cliente de Google |
| `GOOGLE_CLIENT_SECRET` | Secreto de cliente de Google |
| `GOOGLE_CALLBACK_URL` | URI de callback registrada en Google |
| `JWT_SECRET` | Clave para firmar los tokens |
| `JWT_EXPIRES_IN` | Duración del token (ej. `1h`) |
| `DATABASE_URL` | Cadena de conexión a SQL Server |

El archivo `.env` está en `.gitignore` y no debe subirse al repositorio.

## Base de datos

1. En SSMS, crear la base de datos `tp_oauth_google`.
2. Habilitar **TCP/IP** para la instancia en SQL Server Configuration Manager y reiniciar el servicio.
3. Ajustar el puerto en `DATABASE_URL` (ver *IPAll > TCP Dynamic Ports*). Puede cambiar si se reinicia el servicio.
4. Crear las tablas y generar el cliente de Prisma:

```bash
npx prisma migrate dev
npx prisma generate
```

### Modelo `User`

Modelo híbrido para usuarios locales y federados:

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | Int | PK autoincremental |
| `email` | String | Único (evita cuentas duplicadas) |
| `password` | String? | Solo usuarios locales |
| `name` | String? | |
| `avatar` | String? | |
| `googleId` | String? | Solo usuarios de Google |
| `provider` | String | `local` o `google` |
| `createdAt` | DateTime | Marca de tiempo de creación |

Si un usuario inicia sesión con Google y ya existe una cuenta con ese email, se vincula en lugar de crear otra.

## Ejecución

```bash
npm run start:dev
```

El servidor queda en `http://localhost:3000`.

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/auth/google` | Inicia el login con Google |
| GET | `/auth/google/callback` | Callback de Google; devuelve `access_token` y el usuario |
| GET | `/auth/profile` | Ruta privada (requiere JWT) |

## Probar el flujo

1. Abrir `http://localhost:3000/auth/google` en el navegador y elegir la cuenta de Google.
2. Copiar el `access_token` de la respuesta.
3. Probar la ruta privada:

```bash
# Sin token: 401 Unauthorized
curl.exe http://localhost:3000/auth/profile

# Con token: devuelve id, email y name
curl.exe -H "Authorization: Bearer TU_TOKEN" http://localhost:3000/auth/profile
```

## Estructura

```
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── google.strategy.ts
│   ├── jwt.strategy.ts
│   └── jwt-auth.guard.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── app.module.ts
└── main.ts
prisma/
├── schema.prisma
└── migrations/
```

## Seguridad

- Las credenciales de Google y la clave del JWT se leen desde variables de entorno con `ConfigService`; no están en el código.
- El token se firma con expiración configurable.
- La respuesta del login no incluye el campo `password`.
