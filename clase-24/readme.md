# Clase 24 — CRUD completo de libros: back y front conectados

## Índice

- [¿Qué se hizo esta clase?](#qué-se-hizo-esta-clase)
- [Estructura de archivos](#estructura-de-archivos)
- [Conceptos nuevos — Back](#conceptos-nuevos--back)
  - [CRUD completo: los 5 verbos HTTP](#crud-completo-los-5-verbos-http)
  - [PUT vs PATCH: ¿cuál es la diferencia real?](#put-vs-patch-cuál-es-la-diferencia-real)
  - [replaceOne() vs updateOne()](#replaceone-vs-updateone)
  - [deleteOne()](#deleteone)
  - [El _id de MongoDB es inmutable](#el-_id-de-mongodb-es-inmutable)
  - [Destructuring para excluir el _id antes del $set](#destructuring-para-excluir-el-_id-antes-del-set)
- [Conceptos nuevos — Front](#conceptos-nuevos--front)
  - [reset() de React Hook Form para pre-llenar formularios](#reset-de-react-hook-form-para-pre-llenar-formularios)
  - [shouldValidate: true — el problema con mode onChange y reset](#shouldvalidate-true--el-problema-con-mode-onchange-y-reset)
  - [valueAsNumber — forzar tipo numérico en inputs](#valueasnumber--forzar-tipo-numérico-en-inputs)
  - [navigate state — pasar mensajes entre rutas](#navigate-state--pasar-mensajes-entre-rutas)
  - [useLocation — leer el state en la ruta destino](#uselocation--leer-el-state-en-la-ruta-destino)
- [Flujo completo del CRUD](#flujo-completo-del-crud)
- [Referencia rápida de endpoints](#referencia-rápida-de-endpoints)
- [Cómo probarlo](#cómo-probarlo)

---

## ¿Qué se hizo esta clase?

Se completó el CRUD de libros: hasta la clase anterior la API solo tenía GET y POST. Esta clase agrega PUT, PATCH y DELETE en el back, y conecta esas operaciones con tres vistas nuevas en el front.

| Archivo | Cambio | Por qué |
|---|---|---|
| `back/schemas/libros.js` | Se agregaron todos los campos del documento al schema de Yup | El schema anterior solo validaba 3 de los 10 campos reales de la BD |
| `back/services/libros.service.js` | Se agregaron `reemplazarLibro`, `modificarLibro`, `eliminarLibro` | Completar el CRUD |
| `back/api/controllers/libros.controllers.js` | Se agregaron los 3 controladores nuevos y se convirtieron todos a `async/await` | Consistencia de estilo y completar el CRUD |
| `back/api/routes/libros.routes.js` | Se agregaron rutas PUT, PATCH y DELETE | Exponer los nuevos endpoints de la API |
| `front/services/libros.service.jsx` | Se actualizó `createLibros` y `updateLibros` para recibir el objeto completo | El form manda todos los campos, no tiene sentido enumerarlos uno por uno |
| `front/pages/crud/Home.jsx` | Botones Editar y Borrar en la tabla, alert de confirmación, `useLocation` | Navegar a las operaciones del CRUD desde la lista |
| `front/pages/crud/NuevoLibro.jsx` | Formulario completo con Bootstrap, los 10 campos con validación | La versión anterior solo tenía 3 campos sin estilos |
| `front/pages/crud/ModificarLibro.jsx` | Vista nueva: carga el libro, pre-llena el form con `reset()`, envía vía PATCH | Implementar la operación de edición |
| `front/pages/crud/EliminarLibro.jsx` | Vista nueva: muestra datos del libro y pide confirmación antes de DELETE | No se elimina sin que el usuario confirme |

---

## Estructura de archivos

```
clase-24/
├── back/
│   ├── schemas/
│   │   └── libros.js                  → Validación Yup con los 10 campos del documento
│   ├── services/
│   │   └── libros.service.js          → CRUD completo: get, getById, crear, reemplazar, modificar, eliminar
│   ├── api/
│   │   ├── controllers/
│   │   │   └── libros.controllers.js  → 6 controladores (uno por operación)
│   │   └── routes/
│   │       └── libros.routes.js       → GET, POST, PUT, PATCH, DELETE /api/libros
│   └── main.js
│
└── front/
    └── src/
        ├── services/
        │   ├── api.service.jsx         → Capa de transporte (fetch + token + 401)
        │   └── libros.service.jsx      → Funciones de libros que usan api.service
        └── pages/crud/
            ├── Home.jsx                → Lista + botones Ver/Editar/Borrar + alert de confirmación
            ├── NuevoLibro.jsx          → Formulario de creación (POST)
            ├── ModificarLibro.jsx      → Formulario de edición pre-llenado (PATCH)  ← nuevo
            └── EliminarLibro.jsx       → Confirmación antes de eliminar (DELETE)    ← nuevo
```

---

## Conceptos nuevos — Back

### CRUD completo: los 5 verbos HTTP

CRUD es el acrónimo de las 4 operaciones básicas sobre datos: **C**reate, **R**ead, **U**pdate, **D**elete. En una API REST, cada operación tiene un verbo HTTP asignado. La particularidad es que HTTP distingue dos tipos de Update:

| Operación | Verbo HTTP | Endpoint | Qué hace en MongoDB | Equivalente SQL |
|---|---|---|---|---|
| **C**reate | `POST` | `/api/libros` | `insertOne()` | `INSERT INTO` |
| **R**ead (todos) | `GET` | `/api/libros` | `find().toArray()` | `SELECT *` |
| **R**ead (uno) | `GET` | `/api/libros/:id` | `findOne()` | `SELECT * WHERE id=?` |
| **U**pdate completo | `PUT` | `/api/libros/:id` | `replaceOne()` | `UPDATE` (todos los campos) |
| **U**pdate parcial | `PATCH` | `/api/libros/:id` | `updateOne()` con `$set` | `UPDATE` (campos puntuales) |
| **D**elete | `DELETE` | `/api/libros/:id` | `deleteOne()` | `DELETE WHERE id=?` |

---

### PUT vs PATCH: ¿cuál es la diferencia real?

Esta distinción no existe en SQL (ahí es siempre `UPDATE`) pero es importante en REST:

| | PUT | PATCH |
|---|---|---|
| **Qué manda el cliente** | El documento **completo** | Solo los campos que quiere cambiar |
| **Qué hace el back** | Reemplaza todo el documento | Toca solo los campos recibidos |
| **Si falta un campo** | Ese campo **desaparece** de la BD | El campo queda **intacto** |
| **Cuándo usarlo** | Formulario de edición completa | Botón "cambiar precio", toggle activo/inactivo |
| **Operación MongoDB** | `replaceOne()` | `updateOne({ $set: datos })` |

**En esta clase:** el formulario de edición manda los 10 campos completos, así que técnicamente ambos verbos funcionarían. Se eligió **PATCH** por consistencia semántica: "modificar" un libro existente es una actualización parcial, incluso cuando se mandan todos los campos.

---

### replaceOne() vs updateOne()

```js
// PUT → replaceOne: sustituye el documento entero (excepto _id, que MongoDB protege siempre)
db.collection("libros").replaceOne(
    { _id: new ObjectId(id) },   // 1er arg: filtro (qué documento buscar)
    libro                         // 2do arg: el objeto que reemplaza al documento
)

// PATCH → updateOne con $set: toca solo los campos indicados, el resto queda intacto
db.collection("libros").updateOne(
    { _id: new ObjectId(id) },      // 1er arg: filtro
    { $set: campos }                // 2do arg: operador $set + los campos a actualizar
)
```

Ambos devuelven un objeto de resultado con propiedades clave:
- `matchedCount`: cuántos documentos coincidieron con el filtro (0 o 1 en nuestro caso)
- `modifiedCount`: cuántos se modificaron efectivamente
- Con estas propiedades podemos responder 404 si el libro no existe:

```js
if (resultado.matchedCount === 0) return res.status(404).json({ message: "Libro no encontrado" })
```

---

### deleteOne()

```js
// Elimina el primer documento que coincida con el filtro
db.collection("libros").deleteOne({ _id: new ObjectId(id) })
```

El resultado tiene `deletedCount`: vale `1` si encontró y eliminó el documento, `0` si no encontró ninguno. Se usa para responder 404:

```js
if (resultado.deletedCount === 0) return res.status(404).json({ message: "Libro no encontrado" })
```

**Equivalencia SQL:** `DELETE FROM libros WHERE id = ?`

---

### El _id de MongoDB es inmutable

El `_id` de un documento MongoDB **nunca se puede cambiar** una vez que el documento fue creado. Esta regla aplica en ambas operaciones:

- **`replaceOne`**: aunque no incluyas `_id` en el reemplazo, MongoDB lo conserva automáticamente. Si lo incluís con un valor diferente, MongoDB lanza un error.
- **`updateOne` con `$set`**: si incluís `_id` en el `$set`, MongoDB también lanza un error, aunque el valor sea el mismo.

Este fue exactamente el bug de esta clase: cuando React Hook Form carga un libro con `reset(libro)`, el objeto incluye `_id`. Al hacer submit, `formData` tenía `_id` dentro y llegaba al `$set` → el back respondía 500.

---

### Destructuring para excluir el _id antes del $set

La solución fue descartar `_id` en el service antes de pasarlo a MongoDB, usando el **rest operator** del destructuring:

```js
export async function modificarLibro(id, datos) {
    await client.connect()

    // El rest operator (...) agrupa todo lo que NO fue nombrado explícitamente.
    // _id queda como variable aparte (la ignoramos).
    // campos tiene todo el objeto original MENOS _id.
    const { _id, ...campos } = datos

    return db.collection("libros").updateOne(
        { _id: new ObjectId(id) },
        { $set: campos }    // campos nunca incluye _id → MongoDB no explota
    )
}
```

Este patrón `const { campoAExcluir, ...resto } = objeto` es equivalente a hacer `delete objeto.campoAExcluir` pero sin mutar el objeto original. Es muy común para "limpiar" objetos antes de persistirlos.

---

## Conceptos nuevos — Front

### reset() de React Hook Form para pre-llenar formularios

En el formulario de creación (`NuevoLibro`) el form arranca vacío. Pero en el de edición (`ModificarLibro`) necesitamos mostrar los datos actuales del libro para que el usuario pueda modificarlos.

Para eso, React Hook Form tiene la función `reset(valores)`: recibe un objeto y usa sus propiedades para rellenar los campos del form. Los nombres de las keys tienen que coincidir exactamente con los nombres usados en `register()`.

```jsx
const { register, handleSubmit, reset } = useForm({ mode: "onChange" })

useEffect(() => {
    getLibrosById(idLibro).then(libro => {
        // libro = { titulo: "Cien años de soledad", autor: "García Márquez", precio: 4800, ... }
        // reset() toma cada key y la pone en el campo que tenga ese mismo nombre en register()
        reset(libro, { shouldValidate: true })
    })
}, [])
```

Es como si el usuario hubiera tipeado todos los valores manualmente al entrar a la página.

---

### shouldValidate: true — el problema con mode onChange y reset

Este fue un bug sutil de esta clase que vale la pena entender.

Con `mode: "onChange"`, React Hook Form calcula `isValid` en tiempo real. Pero `isValid` empieza en `false` y solo pasa a `true` cuando el usuario interactúa con el form y todas las validaciones pasan.

**El problema:** cuando se llama `reset(libro)`, RHF carga los valores pero **no ejecuta las validaciones automáticamente**. Entonces `isValid` se queda en `false` aunque todos los campos tengan datos válidos. Como el botón tiene `disabled={!isValid}`, el botón quedaba permanentemente bloqueado.

**La solución:** `{ shouldValidate: true }` como segundo argumento de `reset()`:

```jsx
// ❌ Sin shouldValidate: isValid sigue en false, botón bloqueado
reset(libro)

// ✅ Con shouldValidate: RHF valida inmediatamente después de cargar los valores
reset(libro, { shouldValidate: true })
```

| | `reset(libro)` | `reset(libro, { shouldValidate: true })` |
|---|---|---|
| Carga los valores en los inputs | ✓ | ✓ |
| Ejecuta las validaciones | ✗ | ✓ |
| `isValid` queda en `true` | ✗ | ✓ |
| Botón habilitado al entrar | ✗ | ✓ |

---

### valueAsNumber — forzar tipo numérico en inputs

Los inputs HTML **siempre devuelven strings**, incluso los de `type="number"`. Entonces si el usuario escribe `4800` en un campo de precio, React Hook Form lo captura como `"4800"` (string), no como `4800` (number).

Esto causa problemas en MongoDB: si `precio` se guarda como string, las consultas numéricas (`precio > 1000`) dejarían de funcionar.

La solución es la opción `valueAsNumber: true` en el `register()`:

```jsx
// ❌ Sin valueAsNumber: precio llega como "4800" (string) al body
<input type="number" {...register("precio", { required: "..." })} />

// ✅ Con valueAsNumber: precio llega como 4800 (number) al body
<input type="number" {...register("precio", { required: "...", valueAsNumber: true })} />
```

Se aplica a `precio` y `anio_publicacion`, los dos campos numéricos del documento.

---

### navigate state — pasar mensajes entre rutas

Después de editar o eliminar un libro, la app navega al home. Pero ¿cómo le avisa al home que "acaba de pasar algo"?

La solución es el **segundo argumento de `navigate()`**: un objeto `{ state: { ... } }` que viaja junto con la navegación y puede ser leído en la ruta destino con `useLocation()`.

```jsx
// En ModificarLibro.jsx — al confirmar la edición exitosa:
navigate("/", { state: { mensaje: "Libro modificado con éxito" } })

// En EliminarLibro.jsx — al confirmar el borrado exitoso:
navigate("/", { state: { mensaje: "Libro eliminado con éxito" } })
```

Este mecanismo es como una "variable de sesión de un solo uso": existe mientras el usuario no recargue la página, y se borra sola cuando navega a otra ruta.

**¿Por qué no usar `localStorage`?**

| Opción | Problema |
|---|---|
| `localStorage` | Persiste entre recargas, habría que borrarlo manualmente |
| Context global | Requiere crear un context nuevo solo para esto |
| URL query params (`?msg=...`) | Queda visible en la URL y persiste en el historial |
| **navigate state** | Temporal, invisible en URL, se borra solo ✓ |

---

### useLocation — leer el state en la ruta destino

`useLocation()` es el hook de React Router que da acceso al objeto `location` de la ruta actual. Dentro está `location.state`, que es exactamente el `state` que mandó el `navigate()`.

```jsx
import { useLocation } from 'react-router-dom'

const location = useLocation()

// Optional chaining (?.) por si el usuario llegó al home de forma normal,
// sin venir de editar ni eliminar. En ese caso location.state es null
// y location.state?.mensaje devuelve undefined (sin errores).
const mensaje = location.state?.mensaje
```

Luego en el JSX se combina con un estado local `alertaVisible` que permite cerrar el alert con la X:

```jsx
{mensaje && alertaVisible && (
    <div className="alert alert-success d-flex justify-content-between align-items-center">
        {mensaje}
        {/* onClick setea alertaVisible en false, el alert desaparece sin recargar */}
        <button className="btn-close" onClick={() => setAlertaVisible(false)} />
    </div>
)}
```

---

## Flujo completo del CRUD

```
CREAR un libro
  /nuevo-libro → NuevoLibro.jsx
  → usuario completa los 10 campos → submit
  → createLibros(formData) → POST /api/libros
  → libroValidate (Yup) → validateToken → crearLibro (controller)
  → service.crearLibro(libro) → insertOne() → MongoDB
  → 201 Created → navigate("/")

EDITAR un libro
  /modificar-libro/:id → ModificarLibro.jsx
  → useEffect → getLibrosById(id) → GET /api/libros/:id → findOne()
  → reset(libro, { shouldValidate: true }) → form pre-llenado con datos actuales
  → usuario modifica campos → submit
  → updateLibros(id, formData) → PATCH /api/libros/:id
  → validateToken → modificarLibro (controller)
  → service.modificarLibro(id, datos)
    → const { _id, ...campos } = datos   ← descarta _id antes del $set
    → updateOne({ $set: campos }) → MongoDB
  → 200 OK → navigate("/", { state: { mensaje: "Libro modificado con éxito" } })
  → Home muestra alert verde

ELIMINAR un libro
  /eliminar-libro/:id → EliminarLibro.jsx
  → useEffect → getLibrosById(id) → carga datos para mostrar al usuario
  → usuario lee los datos y hace clic en "Sí, eliminar"
  → deleteLibro(id) → DELETE /api/libros/:id
  → validateToken → eliminarLibro (controller)
  → service.eliminarLibro(id) → deleteOne() → MongoDB
  → 200 OK → navigate("/", { state: { mensaje: "Libro eliminado con éxito" } })
  → Home muestra alert verde, libro ya no aparece en la tabla
```

---

## Referencia rápida de endpoints

| Verbo | URL | Auth requerida | Body | Respuesta exitosa |
|---|---|---|---|---|
| `GET` | `/api/libros` | Token | — | `200` array de libros |
| `GET` | `/api/libros/:idLibro` | Token | — | `200` objeto libro / `404` |
| `POST` | `/api/libros` | Token + Yup | Los 10 campos | `201` con `insertedId` |
| `PUT` | `/api/libros/:idLibro` | Token + Yup | Los 10 campos | `200` / `404` |
| `PATCH` | `/api/libros/:idLibro` | Token | Campos a modificar | `200` / `404` |
| `DELETE` | `/api/libros/:idLibro` | Token | — | `200` / `404` |

---

## Cómo probarlo

**1. Levantar el back** (desde `clase-24/back/`):
```
pnpm run dev
```
El servidor queda en `http://localhost:2026`.

**2. Levantar el front** (desde `clase-24/front/`):
```
pnpm run dev
```
El front queda en `http://localhost:5173`.

**3. Flujo de prueba completo:**

| Paso | Acción | Resultado esperado |
|---|---|---|
| 1 | Abrir `http://localhost:5173` sin sesión | Redirige a `/login` |
| 2 | Hacer login | Redirige a `/` con la tabla de libros |
| 3 | Clic en **Nuevo libro** | Va a `/nuevo-libro` con el form vacío |
| 4 | Intentar guardar con campos vacíos | Botón deshabilitado, no pasa nada |
| 5 | Completar los 10 campos y guardar | Vuelve al home, libro aparece en la tabla |
| 6 | Clic en **Editar** (botón amarillo) de cualquier libro | Va a `/modificar-libro/:id` con todos los campos pre-llenados |
| 7 | Modificar el precio y hacer "Guardar cambios" | Vuelve al home con alert verde "Libro modificado con éxito" |
| 8 | Clic en **Borrar** (botón rojo) de cualquier libro | Va a `/eliminar-libro/:id` con la card de confirmación |
| 9 | Clic en "Sí, eliminar" | Vuelve al home con alert verde "Libro eliminado con éxito" |
| 10 | Clic en "Cancelar" | Vuelve al home sin cambios |
| 11 | Cerrar el alert verde con la X | Desaparece sin recargar |
| 12 | Verificar en MongoDB Atlas | Los cambios deben reflejarse en la colección `libros` |
