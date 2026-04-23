# Clase 09 — Colección "Personajes" y documentos embebidos

## Índice

- [¿Qué se hizo esta clase?](#qué-se-hizo-esta-clase)
- [Archivos nuevos y su rol](#archivos-nuevos-y-su-rol)
- [Documentos embebidos vs. referencias (NoSQL vs. SQL)](#documentos-embebidos-vs-referencias-nosql-vs-sql)
- [El operador $push — agregar elementos a un array](#el-operador-push--agregar-elementos-a-un-array)
- [Desglose completo de `$push: { cafes: { ...cafe } }`](#desglose-completo-de-push--cafes---cafe-)
- [El operador $text y búsqueda full-text](#el-operador-text-y-búsqueda-full-text)
- [Filtros disponibles en `getPersonajes`](#filtros-disponibles-en-getpersonajes)
- [Referencia rápida de endpoints — Personajes](#referencia-rápida-de-endpoints--personajes)

---

## ¿Qué se hizo esta clase?

Se incorporó una segunda colección a la app: **"personajes"**. Cada personaje tiene nombre, equipo (X-Men, Avengers, etc.) y un array de cafés favoritos.

Lo nuevo respecto a clase-08:

- Se creó el **servicio** `personajes.service.js` con dos métodos:
  - `getPersonajes(filter)` — lista personajes con filtros opcionales por nombre o equipo.
  - `asignarFavorito(idPersonaje, idCafe)` — agrega un café como favorito de un personaje usando un **documento embebido** (patrón NoSQL).
- Se crearon **rutas y controladores del frontend** (`/personajes`) que devuelven HTML con la lista y links de filtro por equipo.
- Se crearon **rutas y controladores de la API REST** (`/api/personajes`) que devuelven JSON.
- Se creó la **vista** `personajes.views.js` que renderiza el listado con links de filtro rápido.
- Se registraron todas las rutas nuevas en `main.js`.

---

## Archivos nuevos y su rol

```
clase-09/
 ├── services/
 │    └── personajes.service.js        ← lógica de datos (MongoDB)
 ├── controllers/
 │    └── personajes.controllers.js    ← controlador frontend (devuelve HTML)
 ├── routes/
 │    └── personajes.routes.js         ← rutas frontend (/personajes)
 ├── views/
 │    └── personajes.views.js          ← construye el HTML del listado
 └── api/
      ├── controllers/
      │    └── personajes.controllers.js ← controlador API (devuelve JSON)
      └── routes/
           └── personajes.routes.js    ← rutas API (/api/personajes)
```

El **service** es compartido: tanto el controlador del frontend como el de la API lo importan y usan los mismos métodos. Esto confirma que la capa de datos es independiente de quién la consume.

---

## Documentos embebidos vs. referencias (NoSQL vs. SQL)

En una base relacional (MySQL), la relación "un personaje tiene cafés favoritos" se modelaría con una tabla intermedia y claves foráneas:

```sql
-- SQL — tres tablas separadas, JOIN para obtener los datos
personajes (id, nombre, equipo)
cafes      (id, nombre, precio)
favoritos  (id_personaje, id_cafe)   ← tabla pivot

SELECT p.nombre, c.nombre
FROM personajes p
JOIN favoritos f ON f.id_personaje = p.id
JOIN cafes c     ON c.id = f.id_cafe
WHERE p.id = 1
```

En MongoDB, se puede usar el patrón de **documento embebido**: en lugar de guardar solo el id del café, se guarda el objeto completo dentro del array `cafes` del personaje:

```js
// MongoDB — todo en un solo documento, sin JOINs
{
  _id: ObjectId("69e95e23..."),
  nombre: "Wolverine",
  equipo: "X-Men",
  cafes: [
    { _id: ObjectId("69e40f08..."), nombre: "Espresso", precio: 350 },
    { _id: ObjectId("69e42968..."), nombre: "Latte",    precio: 400 }
  ]
}
```

**Ventaja:** leer el personaje con sus cafés es una sola consulta, sin JOINs.

**Desventaja:** si el precio del café cambia, el dato embebido dentro de cada personaje queda desactualizado. Hay que decidir si la consistencia o la velocidad de lectura es más importante. En muchos casos de apps reales (favoritos, historial, carritos) se acepta este tradeoff.

---

## El operador `$push` — agregar elementos a un array

`$push` es el operador de MongoDB que **agrega un elemento al final de un array** dentro de un documento. Si el campo array no existe, MongoDB lo crea automáticamente.

```js
// Agrega el string "nuevo" al array "tags" del documento con ese _id
db.collection("items").updateOne(
    { _id: new ObjectId(id) },
    { $push: { tags: "nuevo" } }
)
// Antes:  { tags: ["viejo"] }
// Después: { tags: ["viejo", "nuevo"] }
```

Se diferencia de `$set` en que `$set` reemplaza el valor del campo, mientras que `$push` lo agrega al array sin tocar los elementos existentes.

| Operador  | Qué hace                                       |
|-----------|------------------------------------------------|
| `$set`    | Reemplaza el valor del campo                   |
| `$push`   | Agrega un elemento al final del array          |
| `$pull`   | Elimina elementos del array que cumplan el filtro |
| `$addToSet` | Como `$push` pero no agrega duplicados       |

---

## Desglose completo de `$push: { cafes: { ...cafe } }`

Esta es la línea clave de `asignarFavorito` en el servicio:

```js
const cafe = await getProductosById(idCafe)

return await db.collection("personajes").updateOne(
    { _id: new ObjectId(idPersonaje) },  // 1. filtro: encontrá este personaje
    { $push: { cafes: { ...cafe } } }    // 2. operación: agregá el café al array
)
```

Parte por parte:

**`{ _id: new ObjectId(idPersonaje) }`**
Filtro que le dice a MongoDB qué documento actualizar: el personaje cuyo `_id` coincida con el id recibido desde la URL.

**`$push`**
Operador de actualización. Le dice a MongoDB "no reemplaces el documento, solo agregá un elemento al array".

**`cafes`**
Nombre del campo array dentro del documento personaje. Si no existe, MongoDB lo crea como array vacío y agrega el primer elemento.

**`{ ...cafe }`**
El spread operator de JavaScript. `cafe` es el objeto que devolvió `getProductosById()` — el documento completo del café desde la colección "cafes". El spread crea una copia plana de ese objeto:

```js
// Si cafe es:
{ _id: ObjectId("69e40f08..."), nombre: "Espresso", precio: 350 }

// { ...cafe } produce exactamente lo mismo (una copia):
{ _id: ObjectId("69e40f08..."), nombre: "Espresso", precio: 350 }
```

Se usa el spread para pasar una copia del objeto en lugar de la referencia original. En la práctica para MongoDB no hace diferencia, pero es una buena costumbre para evitar mutaciones inesperadas del objeto original en el código JavaScript.

**Resultado en MongoDB después de dos llamadas:**

```js
// Primer POST /api/personajes/69e95e23.../  body: { idCafe: "69e40f08..." }
// Segundo POST /api/personajes/69e95e23.../ body: { idCafe: "69e42968..." }

// Documento resultante en la colección "personajes":
{
  _id: ObjectId("69e95e23..."),
  nombre: "Wolverine",
  equipo: "X-Men",
  cafes: [
    { _id: ObjectId("69e40f08..."), nombre: "Espresso", precio: 350 },
    { _id: ObjectId("69e42968..."), nombre: "Latte",    precio: 400 }
  ]
}
```

---

## El operador `$text` y búsqueda full-text

```js
if (filter?.nombre) filterMongo.$text = { $search: filter.nombre }
```

`$text` es el operador de búsqueda de texto completo de MongoDB. Es el equivalente a `LIKE '%valor%'` en SQL, pero más eficiente porque usa un **índice invertido** (similar a cómo funcionan los buscadores).

**Requisito:** la colección debe tener creado un índice de tipo `"text"` sobre el campo a buscar. Sin el índice, MongoDB tira error. Se crea una sola vez desde Compass o Atlas:

```js
db.personajes.createIndex({ nombre: "text" })
```

Una vez creado, la búsqueda funciona así:

```
GET /api/personajes?nombre=wolverine
// Encuentra documentos cuyo campo "nombre" contenga "wolverine" (case-insensitive)
```

---

## Filtros disponibles en `getPersonajes`

| Query param | Operador MongoDB | Ejemplo de URL                          | Descripción                        |
|-------------|------------------|-----------------------------------------|------------------------------------|
| `equipo`    | campo exacto     | `/api/personajes?equipo=X-Men`          | Solo personajes de ese equipo      |
| `nombre`    | `$text $search`  | `/api/personajes?nombre=wolverine`      | Búsqueda de texto libre por nombre |

Ambos filtros se pueden combinar:
```
GET /api/personajes?equipo=X-Men&nombre=wolverine
```

---

## Referencia rápida de endpoints — Personajes

| Método | URL                      | Acción                                           | Body requerido          |
|--------|--------------------------|--------------------------------------------------|-------------------------|
| `GET`  | `/personajes`            | Listado HTML (frontend)                          | —                       |
| `GET`  | `/api/personajes`        | Listado JSON (acepta ?equipo= y ?nombre=)        | —                       |
| `POST` | `/api/personajes/:id`    | Asigna un café favorito al personaje indicado    | `{ "idCafe": "..." }`   |

El `:id` es el **ObjectId del personaje** en MongoDB. El `idCafe` en el body es el **ObjectId del café** a asignar.
