# Clase 10 — CRUD completo de Personajes + Documentación con Swagger

## Índice

- [¿Qué se hizo esta clase?](#qué-se-hizo-esta-clase)
- [Nuevos archivos y su rol](#nuevos-archivos-y-su-rol)
- [CRUD completo de Personajes en la API](#crud-completo-de-personajes-en-la-api)
- [Soft delete con campo `eliminado`](#soft-delete-con-campo-eliminado)
- [`$push` vs `$addToSet` — evitar duplicados](#push-vs-addtoset--evitar-duplicados)
- [Swagger — documentación automática de la API](#swagger--documentación-automática-de-la-api)
- [Cómo activar Swagger paso a paso](#cómo-activar-swagger-paso-a-paso)
- [Referencia rápida de endpoints](#referencia-rápida-de-endpoints)
- [Cómo probarlo en Postman](#cómo-probarlo-en-postman)

---

## ¿Qué se hizo esta clase?

En la clase anterior (09) la API de personajes solo tenía dos endpoints: listar personajes y asignar un café favorito. Esta clase cierra el CRUD de personajes, replicando el patrón ya conocido de productos.

Los cambios viven exclusivamente en la capa de API (controladores, rutas y servicios):

| Capa       | Archivo modificado                            | Qué se agregó                                  |
|------------|-----------------------------------------------|------------------------------------------------|
| Service    | `services/personajes.service.js`              | `getPersonajeById`, `savePersonaje`, `deletePersonaje`, `editPersonajeById`, filtro `eliminado` en `getPersonajes` |
| Controller | `api/controllers/personajes.controllers.js`   | `getPersonajeById`, `guardarPersonaje`, `borrarPersonaje`, `reemplazarPersonaje`, `actualizarPersonaje` |
| Routes     | `api/routes/personajes.routes.js`             | GET /:id, POST /, DELETE /:id, PATCH /:id, PUT /:id |
| Servidor   | `main.js`                                     | Import de rutas frontend de personajes + preparación para Swagger |
| Swagger    | `swagger.js` (nuevo)                          | Script de generación automática de documentación |

La capa de vistas (HTML) y el frontend de personajes no cambiaron. Solo se expandió la API.

---

## Nuevos archivos y su rol

```
clase-10/
├── swagger.js              ← NUEVO: script de generación de swagger.json (no es parte del servidor)
├── swagger.json            ← se genera al correr `node swagger.js` (ignorar hasta leer la sección Swagger)
├── main.js                 ← imports de PersonajesRoutes (frontend) + preparación Swagger comentada
├── services/
│   └── personajes.service.js  ← nuevas funciones: save, getById, delete, edit
└── api/
    ├── routes/
    │   └── personajes.routes.js   ← 5 rutas nuevas: GET/:id, POST, DELETE/:id, PATCH/:id, PUT/:id
    └── controllers/
        └── personajes.controllers.js  ← 5 controladores nuevos correspondientes
```

---

## CRUD completo de Personajes en la API

El patrón es exactamente el mismo que el de productos, pero aplicado a personajes. Cada verbo HTTP tiene su semántica específica:

| Verbo    | URL                        | Qué hace                                                   |
|----------|----------------------------|------------------------------------------------------------|
| `GET`    | `/api/personajes`          | Lista todos los personajes (con filtros opcionales)        |
| `GET`    | `/api/personajes/:id`      | Un personaje por su ObjectId                               |
| `POST`   | `/api/personajes`          | Crea un personaje nuevo                                    |
| `POST`   | `/api/personajes/:id`      | Asigna un café favorito al personaje (ya existía)          |
| `DELETE` | `/api/personajes/:id`      | Soft delete: marca como `eliminado: true`                  |
| `PATCH`  | `/api/personajes/:id`      | Actualización parcial: solo los campos enviados            |
| `PUT`    | `/api/personajes/:id`      | Reemplazo total: todos los campos del body                 |

### Diferencia entre PUT y PATCH

Esta es la duda más frecuente en REST:

```
Escenario: tenés un personaje { nombre: "Wolverine", equipo: "X-Men", poder: "Regeneración" }
y querés cambiar solo el equipo.

PUT  → tenés que mandar el objeto COMPLETO:
       { "nombre": "Wolverine", "poder": "Regeneración", "equipo": "Avengers" }
       Si no mandás "nombre" y "poder", quedan como undefined y se pierden.

PATCH → mandás solo lo que cambia:
        { "equipo": "Avengers" }
        El controller busca el personaje actual y completa el resto desde la BD.
```

En la implementación actual, `actualizarPersonaje` (PATCH) hace esto:

```js
// Para cada campo: si vino en el body usá ese valor, si no usá el que ya tenía el personaje
"equipo": req.body?.equipo ? req.body?.equipo : personajeAntiguo.equipo
```

---

## Soft delete con campo `eliminado`

Al igual que los productos tienen `borrado: true`, los personajes usan `eliminado: true`. El documento nunca se borra físicamente de MongoDB.

```js
// En el service — deletePersonaje:
db.collection("personajes").updateOne(
    { _id: new ObjectId(idPersonaje) },
    { $set: { eliminado: true } }   // agrega o sobreescribe ese campo; el resto del documento queda igual
)
```

Esto permite recuperar personajes eliminados con un filtro:

```
GET /api/personajes?eliminado=true   → solo los marcados como eliminados
GET /api/personajes                  → todos (incluyendo eliminados, porque no se filtra por defecto)
```

Si quisieras que los eliminados queden ocultos por defecto, habría que agregar al service:
```js
// Excluir siempre los eliminados del listado general:
filterMongo.eliminado = { $ne: true }   // $ne = "not equal"
```

---

## `$push` vs `$addToSet` — evitar duplicados

En `asignarFavorito`, la clase anterior usaba `$push` y esta clase lo reemplazó por `$addToSet`:

```js
// ANTES (clase 09):
{ $push: { cafes: { ...cafe } } }
// → agrega el café al array siempre, aunque ya estuviera. Podía generar duplicados.

// AHORA (clase 10):
{ $addToSet: { cafes: { ...cafe } } }
// → agrega el café SOLO si no existe ya en el array. Si ya está, no hace nada.
```

| Operador     | Comportamiento si el elemento ya existe | Uso típico                        |
|--------------|----------------------------------------|-----------------------------------|
| `$push`      | Lo agrega igual (permite duplicados)   | Logs, historial, listas ordenadas |
| `$addToSet`  | No lo agrega (actúa como un Set)       | Tags, favoritos, relaciones únicas |

Para que `$addToSet` pueda comparar si el café ya existe, necesita comparar el documento completo (todos sus campos). Por eso se usa `{ ...cafe }` (spread): copia plana del objeto con todos sus campos.

---

## Swagger — documentación automática de la API

### ¿Qué es Swagger?

Swagger (ahora llamado OpenAPI) es un estándar para describir APIs REST. En lugar de que cada desarrollador tenga que leer el código para entender qué endpoints existen, qué parámetros reciben y qué responden, Swagger genera una interfaz visual interactiva donde podés ver y probar todos los endpoints desde el navegador.

Es como Postman pero integrado dentro de tu propia API, y generado automáticamente a partir del código.

### Las dos partes de Swagger en este proyecto

```
swagger-autogen      → lee tu código de rutas y genera el archivo swagger.json
swagger-ui-express   → toma ese swagger.json y lo sirve como interfaz visual en /api-docs
```

Analogía: `swagger-autogen` es como un escribano que lee tus contratos (rutas) y los transcribe a un formato estándar. `swagger-ui-express` es la oficina que exhibe esos contratos para que cualquiera los consulte.

### El archivo `swagger.js`

`swagger.js` **no es parte del servidor**. Es un script independiente que se corre una sola vez (o cada vez que agregás rutas nuevas) para generar el archivo `swagger.json`.

```js
const doc = {
    info: {
        title: "Api de personajes y cafes",
        description: "Esta es una api de pruebas"
    },
    host: "localhost:2026",    // dónde corre la API
    basePath: "/api",          // prefijo base de todos los endpoints
    schemes: ["http"]
}

const endpointsFiles = [
    "./api/routes/products.routes.js",
    "./api/routes/personajes.routes.js"
]

// Escanea los archivos de rutas, aplica el doc de metadata y genera swagger.json
const swagger = swaggerAutogen()
swagger("swagger.json", endpointsFiles, doc)
```

### El archivo `swagger.json`

Es el resultado de correr el script. Contiene la especificación completa de la API en formato OpenAPI (JSON). `main.js` lo importa y lo usa para armar la interfaz visual. No hay que editarlo a mano.

---

## Cómo activar Swagger paso a paso

**Paso 1 — Generar el swagger.json**

Desde la carpeta `clase-10`, corré:

```bash
node swagger.js
```

Esto va a crear (o actualizar) el archivo `swagger.json` en la misma carpeta. Deberías ver algo así en la consola:

```
[swagger-autogen]: Success! output: swagger.json
```

**Paso 2 — Descomentar las líneas en `main.js`**

Buscá estas tres líneas en `main.js` y quitales el `//`:

```js
// ANTES (comentadas):
//import swaggerFile from "./swagger.json" with {type: "json"}
//import swaggerUI from "swagger-ui-express"
// ...
//app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerFile))

// DESPUÉS (descomentadas):
import swaggerFile from "./swagger.json" with {type: "json"}
import swaggerUI from "swagger-ui-express"
// ...
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerFile))
```

**Paso 3 — Reiniciar el servidor**

```bash
npm start
```

**Paso 4 — Abrir en el navegador**

```
http://localhost:2026/api-docs
```

Deberías ver la interfaz de Swagger UI con todos los endpoints listados. Desde ahí podés:
- Ver los parámetros que acepta cada endpoint.
- Probar requests directamente desde el navegador (como Postman, pero embebido).

### Cuándo hay que volver a correr `node swagger.js`

Cada vez que agregues una ruta nueva, una ruta cambie de URL, o modifiques los archivos listados en `endpointsFiles`. El `swagger.json` no se actualiza automáticamente; hay que regenerarlo a mano.

---

## Referencia rápida de endpoints

### Personajes (`/api/personajes`)

| Método   | URL                             | Body esperado                                              | Respuesta exitosa |
|----------|---------------------------------|------------------------------------------------------------|-------------------|
| GET      | `/api/personajes`               | —                                                          | 200 + array       |
| GET      | `/api/personajes?equipo=X-Men`  | —                                                          | 200 + array       |
| GET      | `/api/personajes?eliminado=true`| —                                                          | 200 + array       |
| GET      | `/api/personajes/:id`           | —                                                          | 200 + `{ data: personaje }` |
| POST     | `/api/personajes`               | `{ "nombre", "nombreReal", "poder", "universo", "equipo" }` | 201 + insertedId |
| POST     | `/api/personajes/:id`           | `{ "idCafe": "..." }`                                      | 201 + updateResult |
| DELETE   | `/api/personajes/:id`           | —                                                          | 202 + updateResult |
| PATCH    | `/api/personajes/:id`           | Cualquier subconjunto de campos                            | 202 + _id         |
| PUT      | `/api/personajes/:id`           | Todos los campos del personaje                             | 202 + _id         |

---

## Cómo probarlo en Postman

### Crear un personaje nuevo

```
POST http://localhost:2026/api/personajes
Content-Type: application/json

{
    "nombre": "Iron Man",
    "nombreReal": "Tony Stark",
    "poder": "Armadura tecnológica",
    "universo": "Marvel",
    "equipo": "Avengers"
}
```

Respuesta esperada (201):
```json
{
    "acknowledged": true,
    "insertedId": "68e1f2a3b4c5d6e7f8a9b0c1"
}
```

### Buscar un personaje por id

```
GET http://localhost:2026/api/personajes/68e1f2a3b4c5d6e7f8a9b0c1
```

Respuesta esperada (200):
```json
{
    "data": {
        "_id": "68e1f2a3b4c5d6e7f8a9b0c1",
        "nombre": "Iron Man",
        "equipo": "Avengers",
        "cafes": []
    }
}
```

### Asignar un café favorito

```
POST http://localhost:2026/api/personajes/68e1f2a3b4c5d6e7f8a9b0c1
Content-Type: application/json

{
    "idCafe": "69e40f088095d79c7a5a0dd3"
}
```

### Actualizar solo el equipo (PATCH)

```
PATCH http://localhost:2026/api/personajes/68e1f2a3b4c5d6e7f8a9b0c1
Content-Type: application/json

{
    "equipo": "S.H.I.E.L.D."
}
```

El resto de los campos (nombre, poder, cafes, etc.) se conservan sin cambios.

### Borrar un personaje (soft delete)

```
DELETE http://localhost:2026/api/personajes/68e1f2a3b4c5d6e7f8a9b0c1
```

El personaje sigue existiendo en MongoDB pero con `eliminado: true`. Para verlo:

```
GET http://localhost:2026/api/personajes?eliminado=true
```
