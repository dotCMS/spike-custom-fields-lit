# Configuración de Variables de Entorno

Este proyecto utiliza variables de entorno para configurar diferentes ambientes (desarrollo, producción, etc.) con archivos `.env` específicos.

## Configuración por Ambientes

### 1. Archivos de entorno disponibles

El proyecto soporta múltiples archivos de entorno que se cargan automáticamente según el modo:

- `.env` - Variables por defecto (siempre cargadas)
- `.env.local` - Variables locales (ignoradas por git, siempre cargadas)
- `.env.development` - Variables para desarrollo (cargadas en modo development)
- `.env.production` - Variables para producción (cargadas en modo production)

### 2. Crear archivos de entorno

#### `.env.development` (Desarrollo)
```bash
# Variables de entorno para DESARROLLO
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_APP_ENV=development
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

#### `.env.production` (Producción)
```bash
# Variables de entorno para PRODUCCIÓN
VITE_API_BASE_URL=https://api.tu-dominio.com/api/v1
VITE_APP_ENV=production
VITE_DEBUG=false
VITE_LOG_LEVEL=error
```

#### `.env.local` (Local - opcional)
```bash
# Variables de entorno LOCALES (ignoradas por git)
# Este archivo es para configuraciones específicas de tu máquina local
# VITE_API_BASE_URL=http://localhost:3000/api/v1
# VITE_DEBUG=true
```

### 3. Variables de entorno disponibles

| Variable | Descripción | Valores por defecto |
|----------|-------------|-------------------|
| `VITE_API_BASE_URL` | URL base de la API | `http://localhost:8080/api/v1` |
| `VITE_APP_ENV` | Ambiente actual | `development` |
| `VITE_DEBUG` | Habilitar logs de debug | `false` |
| `VITE_LOG_LEVEL` | Nivel de logging | `info` |

## Uso en el código

### Acceso a la configuración

```typescript
// Importar la configuración centralizada
import { config, apiUrls, logger } from './config';

// Usar la configuración
console.log('Ambiente:', config.appEnv);
console.log('API URL:', config.apiBaseUrl);
console.log('Es producción:', config.isProduction);

// URLs específicas de la API
const templatesUrl = apiUrls.templates;
const contentUrl = apiUrls.content;

// Logging condicional
logger.debug('Este mensaje solo aparece en desarrollo');
logger.info('Mensaje informativo');
logger.error('Mensaje de error');
```

### Acceso directo a variables

```typescript
// Acceso directo (no recomendado)
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const isDebug = import.meta.env.VITE_DEBUG === 'true';
```

## Scripts disponibles

### Desarrollo
```bash
# Desarrollo con variables de .env.development
npm run dev

# Desarrollo simulando producción
npm run dev:prod
```

### Build
```bash
# Build para producción (usa .env.production)
npm run build

# Build para desarrollo
npm run build:dev
```

### Preview
```bash
# Preview del build de producción
npm run preview

# Preview del build de desarrollo
npm run preview:dev
```

## Orden de carga de archivos .env

Vite carga los archivos en el siguiente orden (los últimos sobrescriben a los anteriores):

1. `.env`
2. `.env.local`
3. `.env.[mode]` (ej: `.env.development`)
4. `.env.[mode].local` (ej: `.env.development.local`)

## Notas importantes

1. **Prefijo VITE_**: Solo las variables que empiecen con `VITE_` están disponibles en el código del cliente
2. **Seguridad**: No pongas información sensible en variables con prefijo `VITE_`
3. **Archivos .local**: Los archivos `.env.local` están en `.gitignore` y son para configuraciones locales
4. **Tipos**: Los tipos están definidos en `src/vite-env.d.ts`
5. **Modo automático**: Vite detecta automáticamente el modo basado en el comando ejecutado
