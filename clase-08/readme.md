# Clase 08 — Integración con MongoDB

## Índice

- [¿Qué se hizo esta clase?](#qué-se-hizo-esta-clase)
- [¿Qué es MongoDB?](#qué-es-mongodb)
- [MongoDB Atlas y Compass](#mongodb-atlas-y-compass)
- [El `_id` y ObjectId — ¿qué pasó con el `id` que teníamos antes?](#el-_id-y-objectid--qué-pasó-con-el-id-que-teníamos-antes)
- [Operadores de consulta de MongoDB](#operadores-de-consulta-de-mongodb)
- [Métodos de MongoDB — ¿ORM? ¿Eloquent?](#métodos-de-mongodb--orm-eloquent)
- [El filtro de precio en `getProductos` — ¿de dónde viene?](#el-filtro-de-precio-en-getproductos--de-dónde-viene)
- [Destructuring de objetos en JavaScript — y por qué lo usamos en `editProduct`](#destructuring-de-objetos-en-javascript--y-por-qué-lo-usamos-en-editproduct)
- [Resumen del flujo completo con MongoDB](#resumen-del-flujo-completo-con-mongodb)
- [Referencia rápida de endpoints de la API](#referencia-rápida-de-endpoints-de-la-api)

---

## ¿Qué se hizo esta clase?

Hasta la clase anterior, los datos de la aplicación vivían en un **archivo JSON local** (`productos.json`). Cada vez que se creaba, editaba o borraba un producto, se leía y reescribía ese archivo en disco.

En esta clase se reemplazó esa capa de persistencia por una **base de datos real: MongoDB**. El cambio fue quirúrgico: solo se modificó la capa de servicios (`services/products.services.js`). El resto de la aplicación (controladores, rutas, vistas) no tuvo que cambiar, lo que demuestra en la práctica el valor del patrón MVC y la separación de responsabilidades.

En concreto:
- Se conectó la app a **MongoDB Atlas** (base de datos en la nube).
- Se usa **MongoDB Compass** como cliente visual para inspeccionar los datos.
- Todos los métodos del servicio (`getProductos`, `getProductosById`, `productSave`, `editProduct`, `deleteProduct`) fueron reescritos para operar contra la colección `cafes` de la base de datos `cafeapp`.

---

## ¿Qué es MongoDB?

MongoDB es una **base de datos NoSQL orientada a documentos**. En lugar de guardar los datos en tablas con filas y columnas (como MySQL o PostgreSQL), los guarda en **documentos** con formato similar a JSON (técnicamente BSON, Binary JSON).

### Analogía con MySQL

| Concepto MySQL     | Concepto MongoDB    | Descripción                                           |
|--------------------|---------------------|-------------------------------------------------------|
| Base de datos      | Base de datos        | El contenedor principal. Ej: `cafeapp`               |
| Tabla              | Colección            | Agrupa documentos del mismo tipo. Ej: `cafes`        |
| Fila / Registro    | Documento            | Un objeto individual con sus campos. Ej: un café     |
| Columna            | Campo                | Un atributo dentro del documento. Ej: `nombre`       |
| `id` (entero)      | `_id` (ObjectId)     | Identificador único, pero generado diferente (ver abajo) |
| `SELECT`           | `find()`             | Consultar datos                                       |
| `INSERT`           | `insertOne()`        | Insertar un registro                                  |
| `UPDATE`           | `updateOne()`        | Modificar un registro                                 |
| `DELETE`           | `deleteOne()`        | Eliminar un registro                                  |

### ¿Qué es un Proyecto y un Cluster?

Cuando creás una cuenta en MongoDB Atlas, la organización es así:

- **Proyecto**: un espacio de trabajo que agrupa recursos. Por ejemplo, el proyecto `cafe-app`.
- **Cluster**: dentro del proyecto, un cluster es el **servidor de base de datos** en sí. Es la infraestructura que corre MongoDB en la nube (puede ser un servidor o un conjunto de servidores replicados). En el plan gratuito de Atlas, tenés un cluster compartido.
- **Base de datos**: dentro del cluster, podés tener múltiples bases de datos. En este caso: `cafeapp`.
- **Colección**: dentro de la base de datos, la colección `cafes` guarda los documentos de productos.

```
Atlas
 └── Proyecto: cafe-app
      └── Cluster: cafe-app.neh6c59.mongodb.net
           └── Base de datos: cafeapp
                └── Colección: cafes
                     ├── { _id: ..., nombre: "Espresso", precio: 350 }
                     ├── { _id: ..., nombre: "Latte", precio: 420 }
                     └── { _id: ..., nombre: "Cappuccino", precio: 390 }
```

---

## MongoDB Atlas y Compass

### Atlas
**MongoDB Atlas** es el servicio cloud oficial de MongoDB. Permite crear y administrar clusters en la nube sin instalar nada localmente. Desde la interfaz web podés:
- Ver y editar documentos directamente.
- Monitorear el rendimiento del cluster.
- Gestionar usuarios y permisos de acceso.
- Obtener el **connection string** para conectarte desde Node.js.

El connection string que se usa en el código es justamente el que Atlas provee:

```js
// services/products.services.js
const client = new MongoClient("mongodb+srv://denise_mongodb:mongodb123@cafe-app.neh6c59.mongodb.net/")
```

### Compass
**MongoDB Compass** es una aplicación de escritorio (GUI) para conectarse a una base de datos MongoDB y explorarla visualmente. Es el equivalente a **phpMyAdmin** o **TablePlus** para MySQL: te permite ver colecciones, documentos, ejecutar queries, y verificar que los datos están como esperás, sin escribir código.

En el flujo de desarrollo es muy útil para confirmar que un `insertOne()` realmente guardó el documento, o que el soft delete marcó el campo `borrado: true`.

---

## El `_id` y ObjectId — ¿qué pasó con el `id` que teníamos antes?

### El `id` anterior (JSON)
Cuando los datos vivían en el archivo JSON, nosotros asignábamos el `id` a mano:

```js
// Así se asignaba el id antes (con el archivo JSON):
producto.id = productos.length + 1  // 1, 2, 3, 4...
```

Era un número entero que nosotros controlábamos. Simple, pero con problemas: si borrás el producto 3, el próximo sería 4, y el id 3 queda "hueco". Además, si dos usuarios guardaran al mismo tiempo podría haber colisiones.

### El `_id` de MongoDB (ObjectId)
MongoDB genera automáticamente un identificador único para cada documento: el campo `_id` de tipo **ObjectId**.

Un ObjectId se ve así: `683e40f088095d79c7a5a0dd3`

Tiene 24 caracteres hexadecimales y **no es un número aleatorio**: está construido a partir de:
- Los primeros 8 caracteres → timestamp Unix (segundos desde 1970). Podés saber cuándo fue creado el documento solo mirando el id.
- Los siguientes 10 caracteres → identificador único de la máquina y el proceso que lo generó.
- Los últimos 6 caracteres → un contador incremental.

Esto garantiza que sea **globalmente único** sin necesidad de consultar la base de datos para saber cuál es el próximo número disponible.

### ¿El campo `id` que teníamos sigue existiendo?
Técnicamente, si los documentos en la colección todavía tienen el campo `id` (número), ese campo sigue estando ahí. Pero **ya no tiene ningún uso en el código**: el servicio ahora busca, actualiza y borra por `_id` (el ObjectId de Mongo). El campo `id` numérico quedó como dato histórico en los documentos que se migraron, pero los documentos nuevos que se insertan con `insertOne()` ya no lo tienen.

 MongoDB siempre genera el _id automáticamente en cada documento que insertás, sin que vos hagas nada. Desde ahora, **no tiene sentido crear un campo id manual** porque:

-> Sería redundante — ya tenés un identificador único garantizado con _id.
-> Tendrías que administrarlo vos — calcular el próximo número, evitar colisiones, etc. Todo trabajo innecesario.
-> El código lo ignoraría — como viste, el servicio busca por _id, no por id.
-> El campo id numérico que tienen algunos documentos en tu colección cafes es simplemente una herencia de cuando los datos vivían en el JSON. Los documentos nuevos que insertes desde ahora con insertOne() ya no lo van a tener, y está perfecto así.

### ¿Por qué en la URL de la API ahora paso el ObjectId?

Antes: `GET /api/productos/3` → buscaba por el campo `id: 3` del JSON.

Ahora: `GET /api/productos/683e40f088095d79c7a5a0dd3` → busca por el campo `_id` de MongoDB.

El servicio recibe ese string desde `req.params.id` y lo convierte al tipo `ObjectId` que MongoDB entiende internamente:

```js
// services/products.services.js
return db.collection("cafes").findOne({ _id: new ObjectId(id) })
//                                                  ↑
//                           Convierte el string "683e40f..." al tipo ObjectId
```
Aquí lo que se hace es:
1. new ObjectId(id) — convierte el string que llega por la URL ("683e40f088095d79c7a5a0dd3") al tipo de dato interno que usa MongoDB (ObjectId). Es una conversión de tipo, como un parseInt() pero para IDs de Mongo.

2. { _id: new ObjectId(id) } — ese ObjectId convertido se usa como filtro de búsqueda: "buscame el documento cuyo _id sea este".

La razón por la que hay que convertirlo es que en la URL todo llega como string, pero MongoDB guarda el _id como tipo ObjectId. Si no lo convertís y buscás { _id: "683e40f..." } (string), MongoDB compara string contra ObjectId y no matchea nada, aunque el documento exista.
Sin `new ObjectId(id)`, MongoDB compararía un string contra un ObjectId y nunca encontraría nada.

---

## Operadores de consulta de MongoDB

En MongoDB los filtros se expresan como objetos JavaScript. Algunos campos del filtro pueden usar **operadores especiales** que empiezan con `$`. Son el equivalente a los operadores de SQL (`>`, `<`, `!=`, etc.) pero con otra sintaxis.

### Los operadores usados en este proyecto

```js
// $ne — "not equal": excluye documentos donde el campo sea igual al valor
{ borrado: { $ne: true } }
// SQL equivalente: WHERE borrado != true

// $lt — "less than": documentos donde el campo sea menor al valor
{ precio: { $lt: 500 } }
// SQL equivalente: WHERE precio < 500

// $gt — "greater than": documentos donde el campo sea mayor al valor
{ precio: { $gt: 100 } }
// SQL equivalente: WHERE precio > 100

// $set — modifica solo los campos indicados, sin tocar el resto del documento
{ $set: { nombre: "Nuevo nombre", precio: 999 } }
// SQL equivalente: UPDATE ... SET nombre = "Nuevo nombre", precio = 999
```

### Tabla de operadores más usados

| Operador   | Significado          | SQL equivalente         | Ejemplo MongoDB                           |
|------------|----------------------|-------------------------|-------------------------------------------|
| `$eq`      | igual a              | `= valor`               | `{ precio: { $eq: 350 } }`               |
| `$ne`      | distinto de          | `!= valor`              | `{ borrado: { $ne: true } }`             |
| `$gt`      | mayor que            | `> valor`               | `{ precio: { $gt: 100 } }`               |
| `$gte`     | mayor o igual que    | `>= valor`              | `{ precio: { $gte: 100 } }`              |
| `$lt`      | menor que            | `< valor`               | `{ precio: { $lt: 500 } }`               |
| `$lte`     | menor o igual que    | `<= valor`              | `{ precio: { $lte: 500 } }`              |
| `$in`      | dentro de una lista  | `IN (...)`              | `{ nombre: { $in: ["Latte","Moka"] } }`  |
| `$nin`     | fuera de una lista   | `NOT IN (...)`          | `{ nombre: { $nin: ["Moka"] } }`         |
| `$set`     | actualizar campos    | `SET campo = valor`     | `{ $set: { precio: 400 } }`              |
| `$unset`   | eliminar un campo    | `SET campo = NULL`      | `{ $unset: { descuento: "" } }`          |
| `$push`    | agregar a un array   | *(no tiene directo)*    | `{ $push: { tags: "nuevo" } }`           |
| `$pull`    | quitar de un array   | *(no tiene directo)*    | `{ $pull: { tags: "viejo" } }`           |

---

## Métodos de MongoDB — ¿ORM? ¿Eloquent?

### ¿Qué es un ORM?
Un **ORM (Object Relational Mapper)** es una capa de abstracción que permite interactuar con una base de datos usando objetos del lenguaje, en lugar de escribir SQL directamente.

**Eloquent** (de Laravel/PHP) es un ORM clásico. Te permite hacer:
```php
// Eloquent (PHP/Laravel):
Product::find(3);
Product::where('precio', '>', 100)->get();
Product::create(['nombre' => 'Espresso', 'precio' => 350]);
```

### ¿Y MongoDB tiene ORM?
MongoDB no es relacional, por eso técnicamente se habla de **ODM (Object Document Mapper)**. El ODM más popular para Node.js es **Mongoose**. En este proyecto usamos el **driver oficial de MongoDB** (`mongodb`) directamente, que es más bajo nivel que Mongoose pero más explícito y sin abstracciones extra.

### Métodos del driver oficial usados en este proyecto

```js
// Obtener múltiples documentos que cumplan un filtro
db.collection("cafes").find({ borrado: { $ne: true } }).toArray()
// Eloquent equivalente: Product::where('borrado', '!=', true)->get()

// Obtener un único documento por criterio
db.collection("cafes").findOne({ _id: new ObjectId(id) })
// Eloquent equivalente: Product::find($id)

// Insertar un documento nuevo
db.collection("cafes").insertOne(producto)
// Eloquent equivalente: Product::create($datos)

// Actualizar un documento (solo los campos indicados con $set)
db.collection("cafes").updateOne({ _id: new ObjectId(id) }, { $set: datos })
// Eloquent equivalente: $product->update($datos)

// Eliminar físicamente un documento
db.collection("cafes").deleteOne({ _id: new ObjectId(id) })
// Eloquent equivalente: $product->delete()
```

### Tabla de métodos más usados

| Método             | Qué hace                                              | SQL / Eloquent equivalente           |
|--------------------|-------------------------------------------------------|--------------------------------------|
| `find(filtro)`     | Trae todos los documentos que cumplan el filtro       | `SELECT * WHERE ...` / `::where()`   |
| `findOne(filtro)`  | Trae el primer documento que cumpla el filtro         | `SELECT * WHERE ... LIMIT 1`         |
| `insertOne(doc)`   | Inserta un documento                                  | `INSERT INTO ...` / `::create()`     |
| `insertMany(arr)`  | Inserta múltiples documentos de una vez               | `INSERT INTO ... (múltiples filas)`  |
| `updateOne(f, u)`  | Actualiza el primer documento que cumpla el filtro    | `UPDATE ... WHERE ... LIMIT 1`       |
| `updateMany(f, u)` | Actualiza todos los documentos que cumplan el filtro  | `UPDATE ... WHERE ...`               |
| `deleteOne(f)`     | Elimina el primer documento que cumpla el filtro      | `DELETE WHERE ... LIMIT 1`           |
| `deleteMany(f)`    | Elimina todos los documentos que cumplan el filtro    | `DELETE WHERE ...`                   |
| `countDocuments()` | Cuenta documentos que cumplan un filtro               | `SELECT COUNT(*) WHERE ...`          |

---

## El filtro de precio en `getProductos` — ¿de dónde viene?

Esta es la firma del servicio:

```js
// services/products.services.js
export async function getProductos( filter = {} ) {
```

El parámetro `filter` es un objeto opcional. Por defecto es `{}` (vacío), o sea, sin filtro adicional. Si viene con datos, el servicio los usa para construir el filtro de MongoDB:

```js
const filterMongo = { borrado: { $ne: true } }

if( filter?.precio_max ) filterMongo.precio = { $lt: parseInt( filter?.precio_max ) }
if( filter?.precio_min ) filterMongo.precio = { $gt: parseInt( filter?.precio_min ) }
```

### ¿De dónde viene ese objeto?

Del controlador de la API, que lo arma a partir de los **query params** de la URL. Un query param es lo que va después del `?` en una URL:

```
GET /api/productos?precio_max=500
GET /api/productos?precio_min=100
GET /api/productos?precio_min=100&precio_max=500
```

Express los pone disponibles en `req.query`. Por ejemplo, si la URL es `/api/productos?precio_max=500`, entonces `req.query` es `{ precio_max: "500" }`.

> **Nota:** actualmente el controlador `getProductos` llama al servicio sin pasarle `req.query`:
> ```js
> service.getProductos()  // ← no pasa el filtro
> ```
> Para que los filtros de precio funcionen desde Postman, habría que cambiarlo a:
> ```js
> service.getProductos(req.query)  // ← le pasa los query params como filtro
> ```

### ¿Cómo probarlo en Postman?

Una vez hecho ese ajuste, en Postman:

1. Método: **GET**
2. URL: `http://localhost:2026/api/productos?precio_max=500`
3. No hace falta body ni headers especiales.
4. Respuesta: solo los productos con precio menor a 500.

O combinado:
```
http://localhost:2026/api/productos?precio_min=100&precio_max=400
```
Devuelve productos con precio entre 100 y 400 (exclusivo en ambos extremos).

### ¿Cómo se usaría desde el frontend en un caso real?

En una app real (React, Vue, app mobile), el frontend construye la URL con los parámetros que el usuario eligió en un formulario de filtros y hace un `fetch`:

```js
// Ejemplo desde el frontend (React, Vue, app mobile, etc.)
const precioMax = 500
const response = await fetch(`/api/productos?precio_max=${precioMax}`)
const productos = await response.json()
```

El servidor recibe esa petición, el controlador extrae `req.query.precio_max`, se lo pasa al servicio, y el servicio arma el filtro de MongoDB. El frontend nunca sabe nada de MongoDB: solo manda parámetros HTTP y recibe JSON.

---

## Destructuring de objetos en JavaScript — y por qué lo usamos en `editProduct`

### ¿Qué es el destructuring?

El **destructuring** es una sintaxis de JavaScript que permite "desarmar" un objeto y extraer sus propiedades en variables separadas, en una sola línea.

Sin destructuring, harías esto:

```js
const producto = { _id: "69e42968b3a10bf5dc28cc19", nombre: "Latte", precio: 400 }

const id     = producto._id     // "69e42968b3a10bf5dc28cc19"
const nombre = producto.nombre  // "Latte"
const precio = producto.precio  // 400
```

Con destructuring, lo mismo en una línea:

```js
const { _id, nombre, precio } = producto
// _id    → "69e42968b3a10bf5dc28cc19"
// nombre → "Latte"
// precio → 400
```

### El operador `...rest` (spread/rest)

Dentro del destructuring podés usar `...` para capturar "todo lo que sobre" en una nueva variable:

```js
const { _id, ...productoSinId } = producto
// _id          → "69e42968b3a10bf5dc28cc19"
// productoSinId → { nombre: "Latte", precio: 400 }   ← todo excepto _id
```

`productoSinId` es un objeto nuevo que tiene todas las propiedades del original **excepto** la que extrajiste (`_id`).

### ¿Por qué es necesario en `editProduct`?

En el servicio, `editProduct` recibe un objeto `producto` que contiene `_id`, `nombre` y `precio`:

```js
// Lo que llega al servicio:
producto = {
    _id: "69e42968b3a10bf5dc28cc19",
    nombre: "Latte",
    precio: 400
}
```

`updateOne` necesita dos cosas separadas:
1. **Un filtro** para encontrar el documento: `{ _id: new ObjectId("69e42...") }`
2. **Los datos a actualizar** con `$set`: `{ nombre: "Latte", precio: 400 }`

El problema es que **no podés pasarle el objeto completo al `$set`**, porque el objeto incluye `_id`, y MongoDB no permite modificar el `_id` de un documento existente. Si lo intentás, tira error.

```js
// SIN destructuring — esto falla:
await db.collection("cafes").updateOne(
    { _id: new ObjectId(producto._id) },
    { $set: producto }  // ❌ ERROR: producto tiene _id adentro, y MongoDB no deja modificarlo
)
```

```js
// CON destructuring — correcto:
const { _id, ...productoSinId } = producto
//  _id          → se usa solo para el filtro
//  productoSinId → { nombre, precio } — va al $set sin el _id

await db.collection("cafes").updateOne(
    { _id: new ObjectId(_id) },       // filtra por _id
    { $set: productoSinId }           // actualiza solo nombre y precio
)
```

### ¿Se podría hacer sin destructuring?

Sí. Una alternativa válida es referenciar cada campo del objeto explícitamente:

```js
// Opción A — sin destructuring, campos explícitos:
await db.collection("cafes").updateOne(
    { _id: new ObjectId(producto._id) },
    { $set: { nombre: producto.nombre, precio: producto.precio } }
)

// Opción B — con destructuring (lo que usa el código actual):
const { _id, ...productoSinId } = producto
await db.collection("cafes").updateOne(
    { _id: new ObjectId(_id) },
    { $set: productoSinId }
)
```

Ambas hacen exactamente lo mismo. La diferencia es de **escalabilidad**:

- **Opción A** es más explícita y fácil de leer para alguien nuevo. Pero si mañana el producto tiene 10 campos (`descripcion`, `categoria`, `stock`, `imagen`...), tenés que listarlos todos a mano en el `$set`. Si agregás un campo nuevo al modelo y te olvidás de agregarlo acá, ese campo nunca se actualiza.
- **Opción B** con destructuring es genérica: no importa cuántos campos tenga el objeto, `...productoSinId` siempre captura todo excepto `_id`. Agregás un campo nuevo al modelo y el servicio lo actualiza solo, sin tocar este código.

### El flujo completo con valores reales

Suponiendo que hacés `PUT /api/productos/69e42968b3a10bf5dc28cc19` con body `{ nombre: "Latte", precio: 400 }`:

```js
// 1. El controlador arma el objeto:
producto = {
    _id: "69e42968b3a10bf5dc28cc19",  // viene de req.params.id
    nombre: "Latte",                   // viene de req.body
    precio: 400                        // viene de req.body
}

// 2. El servicio recibe ese objeto y lo desarma:
const { _id, ...productoSinId } = producto
// _id          = "69e42968b3a10bf5dc28cc19"
// productoSinId = { nombre: "Latte", precio: 400 }

// 3. updateOne usa cada parte donde corresponde:
await db.collection("cafes").updateOne(
    { _id: new ObjectId("69e42968b3a10bf5dc28cc19") },  // filtro: encontrá este doc
    { $set: { nombre: "Latte", precio: 400 } }           // actualizá estos campos
)
```

---

## Resumen del flujo completo con MongoDB

```
Postman / Frontend
      │
      │  GET /api/productos?precio_max=500
      ▼
api/routes/products.routes.js
      │  router.get("/productos", controllers.getProductos)
      ▼
api/controllers/products.controllers.js
      │  const filter = req.query  →  { precio_max: "500" }
      │  service.getProductos(filter)
      ▼
services/products.services.js
      │  filterMongo = { borrado: { $ne: true }, precio: { $lt: 500 } }
      │  db.collection("cafes").find(filterMongo).toArray()
      ▼
MongoDB Atlas (nube)
      │  Ejecuta la consulta y devuelve los documentos
      ▼
services → controllers → res.status(200).json(productos)
      ▼
Postman / Frontend recibe el JSON
```

---

## Referencia rápida de endpoints de la API

| Método   | URL                   | Acción                                      | Body requerido              |
|----------|-----------------------|---------------------------------------------|-----------------------------|
| `GET`    | `/api/productos`      | Lista todos los productos (no borrados)     | —                           |
| `GET`    | `/api/productos/:id`  | Detalle de un producto por ObjectId         | —                           |
| `POST`   | `/api/productos`      | Crea un nuevo producto                      | `{ nombre, precio }`        |
| `PUT`    | `/api/productos/:id`  | Reemplaza el producto completo              | `{ nombre, precio }`        |
| `PATCH`  | `/api/productos/:id`  | Actualiza solo los campos enviados          | `{ nombre }` o `{ precio }` |
| `DELETE` | `/api/productos/:id`  | Soft delete (marca `borrado: true`)         | —                           |

El `:id` en todos los casos es el **ObjectId de MongoDB** (24 caracteres hex), visible en Compass o en la respuesta del `POST`.
