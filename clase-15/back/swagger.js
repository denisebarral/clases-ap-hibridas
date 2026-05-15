/**
 * swagger.js
 *
 * Script de generación automática de documentación Swagger (OpenAPI).
 *
 * NO es parte del servidor Express: es un script independiente que se corre
 * UNA SOLA VEZ (o cada vez que se cambian las rutas) para generar el archivo
 * swagger.json, que luego el servidor sirve como interfaz visual.
 *
 * Flujo completo:
 *  1. Este script escanea los archivos de rutas listados en `endpointsFiles`.
 *  2. swagger-autogen lee esos archivos y detecta automáticamente los endpoints.
 *  3. Genera el archivo swagger.json con la especificación OpenAPI completa.
 *  4. main.js toma ese swagger.json y lo sirve en /api-docs con swagger-ui-express.
 *
 * Cómo usarlo:
 *  → Correr UNA VEZ: node swagger.js
 *  → Luego descomentar las líneas de swagger en main.js y reiniciar el servidor.
 *  → Visitar: http://localhost:2026/api-docs
 *
 * Dependencias:
 *  - swagger-autogen:    escanea las rutas y genera el JSON de especificación.
 *  - swagger-ui-express: sirve la interfaz visual (se usa en main.js, no acá).
 */
import swaggerAutogen from "swagger-autogen"

// Metadata general de la API que aparece en la interfaz de Swagger UI
const doc = {
    info: {
        title: "Api de personajes y cafes",
        description: "Esta es una api de pruebas"
    },
    // Host y basePath: dónde está corriendo la API y cuál es el prefijo base de los endpoints
    host: "localhost:2026",
    basePath: "/api",
    schemes: ["http"]   // protocolo: http en desarrollo, https en producción
}

// Archivos de rutas que swagger-autogen va a escanear para detectar los endpoints
const endpointsFiles = [
    "./api/routes/products.routes.js",
    "./api/routes/personajes.routes.js"
]

// Genera el archivo swagger.json leyendo los endpointsFiles y aplicando el doc de metadata.
// El primer argumento es el nombre del archivo de salida.
const swagger = swaggerAutogen()
swagger( "swagger.json", endpointsFiles, doc )
