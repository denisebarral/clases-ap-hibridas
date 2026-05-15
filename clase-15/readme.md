# Clase 15 — Rutas dinámicas y el hook useParams

## Índice

- [¿Qué se hizo esta clase?](#qué-se-hizo-esta-clase)
- [Archivos modificados y nuevos](#archivos-modificados-y-nuevos)
- [Rutas dinámicas: el segmento `:id`](#rutas-dinámicas-el-segmento-id)
- [El hook useParams()](#el-hook-useparams)
- [Cómo se conectan ItemLibro, la URL y Detalle](#cómo-se-conectan-itemlibro-la-url-y-detalle)
- [Tabla comparativa de todos los hooks usados hasta ahora](#tabla-comparativa-de-todos-los-hooks-usados-hasta-ahora)
- [Flujo completo: del click en "Ver" al detalle en pantalla](#flujo-completo-del-click-en-ver-al-detalle-en-pantalla)

---

## ¿Qué se hizo esta clase?

En clase-14 teníamos una sola vista para libros: la tabla con todos los títulos. En esta clase se agregó la posibilidad de clickear un libro y ver su detalle individual en una URL propia.

El cambio introduce un concepto nuevo de React Router: las **rutas dinámicas** (rutas con parámetros en la URL) y el hook **`useParams()`** que permite leer esos parámetros desde dentro del componente.

Cambios respecto a clase-14:

| Archivo | Tipo de cambio | Qué se modificó |
|---|---|---|
| `pages/Detalle.jsx` | Nuevo | Página de detalle de un libro; usa `useParams()` |
| `components/ItemLibro.jsx` | Modificado | Agregada celda con `<Link to={"/detalle/" + libro._id}>` |
| `components/TableLibros.jsx` | Modificado | Agregada columna `<th>Acciones</th>` |
| `routes/Routes.jsx` | Modificado | Nueva ruta `"/detalle/:id"` + import lazy de Detalle |

---

## Archivos modificados y nuevos

```
clase-15/front/
├── pages/
│   └── Detalle.jsx          ← NUEVO: muestra el detalle de un libro por id
├── components/
│   ├── ItemLibro.jsx         ← MODIFICADO: agrega <Link> "Ver" en columna Acciones
│   └── TableLibros.jsx       ← MODIFICADO: agrega <th>Acciones</th>
└── routes/
    └── Routes.jsx            ← MODIFICADO: nueva ruta dinámica "/detalle/:id"
```

---

## Rutas dinámicas: el segmento `:id`

Hasta clase-14, todas las rutas eran **estáticas**: la URL siempre era la misma.

```
"/"        → siempre muestra Libros
"/chat"    → siempre muestra Chat
"/dogs"    → siempre muestra Fetch
```

En esta clase se agrega una ruta **dinámica**: la URL cambia según el libro que se quiera ver.

```jsx
// routes/Routes.jsx
{ path: "/detalle/:id", element: <Suspense ...><Detalle /></Suspense> }
```

El `:id` es un **segmento dinámico**: los dos puntos le dicen a React Router que esa parte de la URL puede ser cualquier valor. React Router lo captura y lo pone disponible para el componente que se renderiza en esa ruta.

Ejemplos de URLs que coinciden con `/detalle/:id`:

```
/detalle/687a3f2c1b4e9d0a12345678   → id = "687a3f2c1b4e9d0a12345678"
/detalle/abc123                     → id = "abc123"
/detalle/cualquier-cosa             → id = "cualquier-cosa"
```

Es el equivalente en Express al parámetro de ruta `req.params.id`:

```js
// Express (backend)        React Router (frontend)
router.get("/libros/:id")   { path: "/detalle/:id" }
req.params.id               useParams().id
```

---

## El hook useParams()

### ¿Qué es?

`useParams()` es un hook de React Router que devuelve un objeto con los segmentos dinámicos de la URL activa. Es la forma que tiene un componente de saber "¿en qué URL estoy parado?".

### Uso en Detalle.jsx

```jsx
import { useParams } from "react-router"

const Detalle = () => {
    const { id } = useParams()
    //      ↑↑
    //  nombre debe coincidir EXACTAMENTE con el ":id" declarado en Routes.jsx

    // Si la URL es "/detalle/687a3f2c1b4e9d0a12345678"
    // entonces id = "687a3f2c1b4e9d0a12345678"
}
```

El nombre de la variable que se desestructura (`id`) debe coincidir exactamente con el nombre del segmento dinámico en la ruta (`":id"`). Si en Routes estuviera `"/detalle/:libroId"`, habría que desestructurar `{ libroId }`.

### ¿Cómo sabe useParams() el valor?

React Router intercepta todas las navegaciones. Cuando el usuario va a `/detalle/687a3f2c...`, React Router:
1. Compara la URL con las rutas definidas en `createBrowserRouter`.
2. Detecta que `/detalle/687a3f2c...` coincide con el patrón `/detalle/:id`.
3. Extrae `{ id: "687a3f2c..." }` y lo pone en el contexto interno del router.
4. Cuando `Detalle.jsx` se renderiza y llama a `useParams()`, el hook lee ese contexto y devuelve `{ id: "687a3f2c..." }`.

### No es lo mismo que una prop

Una prop viene del componente padre y hay que pasarla explícitamente. `useParams()` lee directamente de la URL, sin necesidad de que ningún padre pase nada:

```jsx
// Con prop: el padre tiene que saber el id y pasarlo
<Detalle id="687a3f2c..." />

// Con useParams: el componente lo lee solo de la URL, sin depender del padre
const { id } = useParams()
```

Esto es importante en las rutas dinámicas: `Detalle` se renderiza por React Router (no por otro componente), así que nadie puede pasarle props directamente. `useParams()` es el mecanismo que llena ese hueco.

---

## Cómo se conectan ItemLibro, la URL y Detalle

El flujo completo involucra tres pasos que se encadenan:

### Paso 1: ItemLibro construye la URL de destino

```jsx
// components/ItemLibro.jsx
<Link to={"/detalle/" + libro._id}>Ver</Link>
```

Cada fila de la tabla genera su propio link con el `_id` de su libro. Si un libro tiene `_id = "687a3f2c1b4e9d0a12345678"`, el link apunta a `/detalle/687a3f2c1b4e9d0a12345678`.

### Paso 2: React Router activa la ruta y monta Detalle

Cuando el usuario clickea "Ver", React Router compara la URL con los patrones registrados y activa la ruta `/detalle/:id`, montando `<Detalle />`.

### Paso 3: Detalle lee el id y hace el fetch

```jsx
// pages/Detalle.jsx
const { id } = useParams()
// id = "687a3f2c1b4e9d0a12345678"

useEffect(() => {
    fetch("http://localhost:2026/api/libros/" + id)
        .then(res => res.json())
        .then(libro => setLibro(libro.data || {}))
}, [])
```

El `id` extraído de la URL se usa como parámetro del fetch. El backend busca ese ObjectId en MongoDB y devuelve `{ data: { _id, titulo, autor, ... } }`. El componente extrae `libro.data` y lo guarda en estado para mostrarlo.

---

## Tabla comparativa de todos los hooks usados hasta ahora

| Hook | ¿Qué hace? | ¿Cuándo se usa? | ¿De dónde viene? | Ejemplo en la clase |
|---|---|---|---|---|
| `useState` | Guarda un valor que, al cambiar, dispara un re-render del componente | Cuando el componente necesita "recordar" algo entre renders: datos de una API, input del usuario, toggles | `react` | `const [libros, setLibros] = useState([])` en `Libros.jsx` |
| `useEffect` | Ejecuta un efecto secundario en momentos específicos del ciclo de vida | Para hacer fetch al montar, reaccionar a cambios de estado, o limpiar timers/listeners | `react` | `useEffect(() => { fetch(...) }, [])` en `Libros.jsx` y `Detalle.jsx` |
| `useParams` | Lee los segmentos dinámicos (`:param`) de la URL activa | Cuando un componente necesita saber el valor de un parámetro de ruta para hacer fetch o filtrar | `react-router` | `const { id } = useParams()` en `Detalle.jsx` |

### ¿Cómo decidir cuál usar?

```
¿Necesito guardar un dato que cambia y que se muestre en pantalla?
  → useState

¿Necesito ejecutar código al montarse, o cuando cambia algo, o al desmontarse?
  → useEffect

¿Necesito leer un segmento de la URL (ej: el id del libro que estoy viendo)?
  → useParams  (viene de React Router, no de React)
```

### Cuándo trabajan juntos

En `Detalle.jsx` los tres trabajan en conjunto:

```jsx
const { id } = useParams()          // 1. Lee el id de la URL

const [libro, setLibro] = useState({})  // 2. Crea el estado para guardar el libro

useEffect(() => {                    // 3. Al montarse, hace el fetch con ese id
    fetch(".../" + id)
        .then(res => res.json())
        .then(data => setLibro(data.libro || {}))  // 4. setLibro → re-render → pantalla
}, [])
```

Sin `useParams`: no sabría qué libro buscar.  
Sin `useState`: no tendría dónde guardar el libro cuando llega.  
Sin `useEffect`: el fetch se haría en cada re-render y generaría un loop infinito.

---

## Flujo completo: del click en "Ver" al detalle en pantalla

```
Usuario ve la tabla de libros en "/"
        │
        ▼
Clickea el <Link to="/detalle/687a3f2c..."> de una fila
        │
        ▼
React Router intercepta el click (sin recargar la página)
Actualiza la URL: http://localhost:5173/detalle/687a3f2c...
        │
        ▼
Compara la URL con las rutas → coincide con "/detalle/:id"
Monta el componente <Detalle /> dentro del <Outlet /> de Layout
        │
        ▼
Detalle se renderiza por primera vez con libro = {}
→ Object.keys({}) == 0 → muestra "Error al encontrar el libro"
   (estado temporal mientras llega el fetch)
        │
        ▼
useEffect se dispara ([] vacío = solo al montar)
useParams() devuelve { id: "687a3f2c..." }
fetch("http://localhost:2026/api/libros/687a3f2c...")
        │
        ▼
El backend recibe GET /api/libros/687a3f2c...
Busca en MongoDB: db.collection("libros").findOne({ _id: ObjectId("687a3f2c...") })
Responde: { data: { _id, titulo, autor, descripcion, ... } }
        │
        ▼
setLibro(libro.data) → actualiza el estado → React re-renderiza
        │
        ▼
Object.keys(libro) > 0 → se muestra el detalle del libro
```

> **Nota sobre el estado inicial:** La condición `Object.keys(libro) == 0` se evalúa dos veces:
> 1. Al primer render (antes del fetch): `libro = {}` → muestra el mensaje de error brevemente.
> 2. Después del fetch: `libro = { titulo, autor... }` → muestra el detalle.
>
> En una app de producción se usaría un estado `cargando` (boolean) para mostrar un spinner en vez del mensaje de error durante la espera.
