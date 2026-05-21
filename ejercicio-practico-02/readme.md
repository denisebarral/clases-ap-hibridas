# Ejercicio Práctico 02 — Rick & Morty API con React Router, paginación y detalle

## Índice

- [¿Qué se hizo en este ejercicio?](#qué-se-hizo-en-este-ejercicio)
- [Estructura de archivos](#estructura-de-archivos)
- [Conceptos teóricos](#conceptos-teóricos)
  - [React Router: rutas anidadas con Layout](#react-router-rutas-anidadas-con-layout)
  - [useParams — leer parámetros de la URL](#useparams--leer-parámetros-de-la-url)
  - [Manejo de estados: loading, error y datos](#manejo-de-estados-loading-error-y-datos)
  - [Activity y el prop mode (React 19)](#activity-y-el-prop-mode-react-19)
- [Paginación: cómo se implementó y alternativas](#paginación-cómo-se-implementó-y-alternativas)
- [Fetch con .then() vs async/await + try/catch](#fetch-con-then-vs-asyncawait--trycatch)
- [throw, catch y la clase Error](#throw-catch-y-la-clase-error)
- [Estructura de respuestas de APIs: ¿hay un estándar?](#estructura-de-respuestas-de-apis-hay-un-estándar)
- [Flujo completo de una navegación](#flujo-completo-de-una-navegación)
- [Cómo probarlo](#cómo-probarlo)

---

## ¿Qué se hizo en este ejercicio?

Se construyó una mini-aplicación SPA (Single Page Application) que consume la API pública de [Rick & Morty](https://rickandmortyapi.com/). El ejercicio integra los conceptos vistos hasta ahora:

| Concepto | Dónde se aplica |
|---|---|
| `useState` | Estados de datos, carga, error y página actual |
| `useEffect` | Fetch a la API al montar el componente o al cambiar de página |
| `fetch()` con `.then()` | Llamada HTTP a la API externa |
| React Router v7 | Navegación entre Home, Login y Detalle sin recargar la página |
| `useParams` | Leer el ID del personaje desde la URL en la página Detalle |
| `<Activity>` (React 19) | Mostrar/ocultar botones Prev/Next sin desmontar el componente |
| Bootstrap | Estilos de tabla, botones, navbar y tarjeta de detalle |

---

## Estructura de archivos

```
ejercicio-practico-02/
├── src/
│   ├── main.jsx              # Punto de entrada: monta la app con RouterProvider
│   ├── routes/
│   │   └── Router.jsx        # Define las rutas y sus componentes
│   ├── components/
│   │   ├── Layout.jsx        # Contenedor: NavBar + Outlet (slot de páginas)
│   │   └── NavBar.jsx        # Barra de navegación Bootstrap
│   └── pages/
│       ├── Home.jsx          # Lista paginada de personajes
│       ├── Detalle.jsx       # Detalle de un personaje por ID
│       └── Login.jsx         # Formulario de login (sin lógica real)
└── package.json
```

---

## Conceptos teóricos

### React Router: rutas anidadas con Layout

El router está configurado con **rutas anidadas**: hay una ruta raíz (`/`) cuyo elemento es `<Layout />`, y adentro de esa ruta se definen las páginas hijas.

```jsx
// Router.jsx
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,     // ← contenedor padre
    children: [
      { path: "/",                      element: <Home /> },
      { path: "/login",                 element: <Login /> },
      { path: "/detalle/:idPersonaje",  element: <Detalle /> },
    ]
  }
]);
```

`<Layout />` renderiza `<NavBar />` seguido de `<Outlet />`. El `<Outlet />` es el "hueco" donde React Router inserta el componente hijo que corresponde a la URL actual:

```
URL: /             → Layout renderiza: NavBar + Home
URL: /login        → Layout renderiza: NavBar + Login
URL: /detalle/826  → Layout renderiza: NavBar + Detalle
```

**¿Por qué esta estructura?**  
Para que la `NavBar` exista una sola vez y no se monte/desmonte en cada navegación. Sin Layout, habría que importar y renderizar `<NavBar />` en cada página por separado.

---

### useParams — leer parámetros de la URL

Cuando en el router se define una ruta con dos puntos (`:nombreParam`), ese segmento de la URL es dinámico y acepta cualquier valor:

```jsx
// Router.jsx
{ path: "/detalle/:idPersonaje", element: <Detalle /> }
```

El hook `useParams()` devuelve un objeto con todos los parámetros dinámicos de la URL actual. El nombre de la clave es el mismo que el que se escribió en la ruta con los dos puntos:

```jsx
// Detalle.jsx
const { idPersonaje } = useParams()

// Si la URL es /detalle/826 → idPersonaje === "826"
// Si la URL es /detalle/1   → idPersonaje === "1"
```

Ese valor se usa directamente para construir la URL del fetch:

```jsx
fetch("https://rickandmortyapi.com/api/character/" + idPersonaje)
```

**Importante:** el valor que devuelve `useParams` siempre es un `string`, aunque en la URL haya un número. Si la API esperara un número, habría que convertirlo: `Number(idPersonaje)` o `parseInt(idPersonaje)`.

---

### Manejo de estados: loading, error y datos

El patrón que se repite en Home y Detalle es siempre el mismo: tres estados, un efecto, dos early returns.

```jsx
const [personajes, setPersonajes] = useState([])  // los datos
const [loading, setLoading]       = useState(true) // ¿estamos esperando?
const [error, setError]           = useState(null) // ¿algo salió mal?

useEffect(() => {
  fetch(url)
    .then(...)
    .catch(err => setError(err.message))
    .finally(() => setLoading(false))   // siempre apaga el loading al terminar
}, [])

// Early returns: cortan el render antes de llegar al JSX principal
if (loading) return <div>Cargando...</div>
if (error)   return <div>Hubo un error</div>

return ( /* JSX con los datos */ )
```

**¿Por qué `loading` arranca en `true`?**  
Porque cuando el componente se monta por primera vez, el fetch todavía no terminó. Si arrancara en `false`, React intentaría renderizar `personajes.map(...)` sobre un array vacío, lo cual no rompería, pero mostraría una tabla vacía por un instante antes de que lleguen los datos.

**¿Es obligatorio hacer esto así?**  
No. Este patrón funciona pero tiene sus límites: si tenés 10 componentes que fetchean, repetís este código 10 veces. Las alternativas más limpias se explican al final de la sección de paginación.

---

### Activity y el prop `mode` (React 19)

`<Activity>` es un componente **experimental** de React 19 que controla la visibilidad de sus hijos sin desmontarlos.

```jsx
<Activity mode={page > 1 ? 'visible' : 'hidden'}>
  <button onClick={() => setPage(page - 1)}>Prev</button>
</Activity>
```

El prop `mode` acepta dos valores:

| `mode` | ¿Qué pasa con los hijos? |
|---|---|
| `"visible"` | Se renderizan y son visibles normalmente |
| `"hidden"` | Se **ocultan** de la pantalla, pero React los mantiene **montados** en memoria |

#### ¿En qué se diferencia de un condicional?

Con el operador `&&`, React **desmonta** el componente cuando la condición es `false`:

```jsx
// Con condicional: si page === 1, el botón se DESMONTA (estado perdido, efectos limpios)
{ page > 1 && <button>Prev</button> }
```

Con `Activity mode="hidden"`, el componente **sigue vivo** en el árbol de React, solo invisible al usuario. Esto preserva su estado interno, evita que sus efectos se limpien y evita tener que re-ejecutar su lógica de inicialización cuando vuelva a ser visible.

#### ¿Para qué sirve eso en la práctica?

Es útil cuando querés ocultar algo complejo que no querés "pagar el costo" de volver a montar:

- Tabs: ocultás el contenido de la tab inactiva pero conservás lo que el usuario había escrito
- Formularios en múltiples pasos: ocultás el paso anterior sin perder sus datos
- Listas con filtros: ocultás resultados filtrados pero sin volver a fetchear cuando se quita el filtro

En este ejercicio se usa para ocultar los botones Prev/Next en los extremos de la paginación. Como el botón en sí no tiene estado propio, el comportamiento es equivalente al `&&` condicional. El ejemplo sirve para ilustrar el componente.

---

## Paginación: cómo se implementó y alternativas

### Cómo está implementada

La API de Rick & Morty devuelve los personajes de a 20 por vez, distribuidos en 42 páginas. El estado `page` controla qué página se está viendo:

```jsx
const [page, setPage] = useState(1)

useEffect(() => {
  fetch("https://rickandmortyapi.com/api/character?page=" + page)
    ...
}, [page])  // se re-ejecuta cada vez que page cambia
```

Para renderizar los 42 botones, se usa un truco con `Array`:

```jsx
[...Array(42)].map((valor, indice) => (
  <button onClick={() => setPage(indice + 1)} ...>
    {indice + 1}
  </button>
))
```

`Array(42)` crea un array con 42 posiciones vacías (valor `undefined` en cada una). El spread `[...]` lo convierte en un array normal que puede ser mapeado. Como el valor de cada posición es `undefined` y no importa, se usa el `indice` para calcular el número de página (`indice + 1` porque los índices arrancan en 0).

**Limitaciones de esta implementación:**

1. **El `42` está hardcodeado.** Si la API tuviera más o menos páginas, habría que cambiarlo a mano. La API en realidad devuelve el total de páginas en la respuesta: `data.info.pages`. Lo correcto sería guardarlo en un estado:
   ```jsx
   const [totalPages, setTotalPages] = useState(0)
   // en el then:
   setTotalPages(data.info.pages)
   setPersonajes(data.results)
   // en el JSX:
   [...Array(totalPages)].map(...)
   ```

2. **Muestra todos los botones a la vez.** Con 42 páginas quedan 42 botones amontonados. En una API con 1000 páginas sería inutilizable.

3. **`loading` no se resetea al cambiar de página.** Una vez que la primera carga termina, `loading` queda en `false` para siempre. Al cambiar de página no hay indicador visual de que se están cargando los nuevos datos.

---

### Alternativa más limpia: `useState` con rango de páginas visible

Si no querés mostrar los 42 botones, podés mostrar solo un "ventana" de páginas alrededor de la actual:

```jsx
// Mostrar: [primera] ... [pagActual-1] [pagActual] [pagActual+1] ... [última]
const pagInicio = Math.max(1, page - 2)
const pagFin    = Math.min(totalPages, page + 2)
```

---

### Alternativa más limpia: custom hook `useFetch`

El patrón loading/error/datos se repite en cada componente que fetchea. Se puede encapsular en un hook propio:

```jsx
// hooks/useFetch.js
import { useState, useEffect } from 'react'

const useFetch = (url) => {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    setLoading(true)   // ← resetea el loading en cada nuevo url
    setError(null)

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error("Error en la petición")
        return res.json()
      })
      .then(data => setData(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [url])

  return { data, loading, error }
}

export default useFetch
```

Con esto, Home quedaría así:

```jsx
// Home.jsx — versión con custom hook
const url = `https://rickandmortyapi.com/api/character?page=${page}`
const { data, loading, error } = useFetch(url)

if (loading) return <div>Cargando...</div>
if (error)   return <div>Error: {error}</div>

const personajes   = data.results
const totalPages   = data.info.pages
```

Más limpio, más reutilizable, y el loading se resetea correctamente en cada cambio de URL.

---

### Alternativa profesional: TanStack Query (React Query)

Para proyectos reales, la librería estándar para manejo de datos remotos es **TanStack Query** (antes llamada React Query). Maneja caching, refetching automático, paginación, loading states, errores y mucho más:

```jsx
import { useQuery } from '@tanstack/react-query'

const { data, isLoading, error } = useQuery({
  queryKey: ['personajes', page],   // clave única; al cambiar page, refetchea
  queryFn: () =>
    fetch(`https://rickandmortyapi.com/api/character?page=${page}`)
      .then(res => res.json())
})
```

Ventajas respecto al fetch manual:
- Cachea los resultados: si volvés a la página 1, no vuelve a hacer el fetch
- Maneja loading, error y refetching automáticamente
- Viene con `isPreviousData` para saber si estás viendo datos viejos mientras carga la nueva página (ideal para paginación)
- Deduplica requests: si varios componentes piden los mismos datos, solo hace un fetch

---

## Fetch con `.then()` vs `async/await` + `try/catch`

Las dos versiones hacen exactamente lo mismo. Es solo una diferencia de sintaxis.

### Versión `.then()` (la del código)

```jsx
useEffect(() => {
  fetch(url)
    .then(res => {
      if (res.ok) return res.json()
      throw new Error("Error al traer los personajes")
    })
    .then(data => setPersonajes(data.results))
    .catch(err => setError(err.message))
    .finally(() => setLoading(false))
}, [page])
```

Es una **cadena de promesas**: cada `.then()` recibe el resultado del anterior. `.catch()` atrapa cualquier error que se lance en cualquier punto de la cadena. `.finally()` corre siempre al final, sea éxito o error.

### Versión `async/await` + `try/catch`

```jsx
useEffect(() => {
  // ⚠️ No se puede poner async directamente en useEffect:
  //    useEffect(() => async () => { ... }) <-- MAL: devuelve una Promise, no una función de cleanup
  // Solución: definir la función async adentro y llamarla.
  const fetchPersonajes = async () => {
    try {
      const res = await fetch(url)

      if (!res.ok) throw new Error("Error al traer los personajes")

      const data = await res.json()
      setPersonajes(data.results)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  fetchPersonajes()  // se llama, pero NO se awaita
}, [page])
```

`await` pausa la ejecución de la función async hasta que la promesa se resuelve, sin bloquear el hilo principal. El bloque `try/catch` reemplaza a `.catch()`, y `finally` funciona igual que en las promesas.

### ¿Cuál usar?

| Aspecto | `.then()` | `async/await` |
|---|---|---|
| Legibilidad con código lineal | Bien | Mejor (parece sincrónico) |
| Manejo de múltiples fetches encadenados | Se complica | Mucho más claro |
| Flujo condicional dentro del fetch | Engorroso | Natural |
| Diferencia en comportamiento | Ninguna | Ninguna |

Para la mayoría de los casos, `async/await` es más fácil de leer y mantener. Las dos versiones están comentadas juntas en [Home.jsx](src/pages/Home.jsx) para poder compararlas.

---

## throw, catch y la clase Error

### La clase `Error` y las instancias

`Error` (con mayúscula) es una **clase** de JavaScript, como un molde. `new Error("mensaje")` crea una **instancia** de esa clase: un objeto nuevo en memoria con sus propias propiedades.

```js
const instancia = new Error("Error al traer los personajes")

instancia.message  // "Error al traer los personajes"
instancia.name     // "Error"
instancia.stack    // "Error: Error al traer...\n    at ..."  (traza de la pila)
```

`Error.message` **no funciona** porque `Error` sin el `new` es la clase en sí, no el objeto que creaste. La propiedad `.message` vive en la instancia, no en la clase.

### throw lanza, catch atrapa

`throw` lanza el objeto hacia arriba buscando quién lo maneje. `.catch()` (o el bloque `catch` del `try/catch`) lo recibe y le asigna el nombre que vos quieras:

```js
throw new Error("Error al traer los personajes")
//      ↑ crea la instancia y la lanza

.catch(err => setError(err.message))
//     ↑ "err" es el nombre que elegimos para recibir lo que fue lanzado
//       podría llamarse "e", "error", "pepito" — es un parámetro cualquiera
```

El nombre `err` es completamente arbitrario, igual que los parámetros de cualquier función:

```js
.catch(e       => setError(e.message))       // igual
.catch(error   => setError(error.message))   // igual
.catch(pepito  => setError(pepito.message))  // igual, aunque raro
```

### ¿Siempre hay que usar un catch?

Sí. Si lanzás algo con `throw` y no hay nadie que lo atrape, el error sube por la cadena hasta el nivel global y aparece en consola como error no capturado:

```
// Con promesas sin .catch():
Unhandled promise rejection: Error al traer los personajes

// Con código sincrónico sin try/catch:
Uncaught Error: Error al traer los personajes
```

### ¿De dónde puede venir el `err`?

En el código del fetch, el `err` que llega al `.catch()` puede tener dos orígenes distintos:

| Origen | Quién lo lanza | Ejemplo de `err.message` |
|---|---|---|
| Error de red | JavaScript (fetch automáticamente) | `"Failed to fetch"` |
| `res.ok === false` | Nosotros con `throw new Error(...)` | `"Error al traer los personajes"` |

En ambos casos `err` es una instancia de `Error` con una propiedad `.message`.

### ¿La API devuelve el error?

No directamente. Lo que la API devuelve cuando algo falla es:
- Un **status HTTP** (404, 500, 401...) — se lee con `res.status` o `res.ok`
- Opcionalmente, un **JSON en el body** con detalles del error — pero el formato varía por API

Si quisieras usar el mensaje de error que *la API* incluye en el body, habría que leerlo explícitamente:

```js
.then(res => {
  if (res.ok) return res.json()
  // Leer el JSON del error que mandó el servidor
  return res.json().then(errData => {
    throw new Error(errData.error || errData.message || "Error desconocido")
  })
})
```

Esto solo funciona si la API documenta que devuelve esos campos. En la práctica, como no hay estándar, muchas APIs devuelven cosas distintas o no devuelven nada útil en el body del error. Por eso en la mayoría de los casos es más práctico poner tu propio mensaje descriptivo con `throw new Error("tu mensaje")`.

---

## Estructura de respuestas de APIs: ¿hay un estándar?

**No hay un estándar obligatorio.** Cada API diseña su propio formato de respuesta. El `info`/`results` de Rick & Morty es una convención de *esa* API, no algo universal.

### Ejemplos reales de cómo distintas APIs devuelven listas

| API | Estructura de la respuesta |
|---|---|
| Rick & Morty | `{ info: { pages, count, next, prev }, results: [...] }` |
| GitHub | `{ total_count: 42, items: [...] }` |
| Spotify | `{ href, limit, offset, total, items: [...] }` |
| Pokémon API | `{ count, next, previous, results: [...] }` |
| JSONPlaceholder | Devuelve el array directamente: `[...]` |
| APIs custom típicas | `{ data: [...], meta: { total, page, per_page } }` |

### ¿Hay algún intento de estandarizar?

Sí, existen especificaciones, pero pocas APIs las adoptan:

- **JSON:API** (jsonapi.org) — especificación completa para respuestas REST JSON. Muy estructurada, pero poco adoptada en APIs públicas.
- **GraphQL** — tiene su propio formato fijo: `{ data: {...}, errors: [...] }`. Si la API es GraphQL, siempre va a tener esa estructura.
- **OData** — estándar de Microsoft, común en ecosistemas .NET y APIs empresariales.

La realidad es que la mayoría de las APIs públicas y las APIs propias ignoran esos estándares y hacen lo que les parece.

### ¿Cómo sabés de antemano qué te va a devolver una API?

En orden de preferencia:

1. **La documentación oficial** — siempre es lo primero. Rick & Morty tiene la suya en `rickandmortyapi.com/documentation`. Ahí está documentado exactamente qué campos devuelve cada endpoint con ejemplos reales.

2. **Swagger / OpenAPI** — muchas APIs empresariales exponen un `/api-docs` o `/swagger` con una interfaz interactiva que muestra los esquemas de respuesta y permite hacer llamadas de prueba desde el navegador.

3. **Postman** — hacer una llamada de prueba y explorar la respuesta en el panel. Es lo más rápido para APIs sin buena documentación.

4. **`console.log(data)`** — lo que hicimos en este ejercicio. Ver el objeto entero antes de empezar a usarlo. Herramienta fundamental para entender cualquier API nueva.

---

## Flujo completo de una navegación

### Abrir `/` (Home)

```
Usuario abre /
  → RouterProvider activa la ruta "/"
  → Layout se monta: renderiza NavBar + Outlet
  → Home se monta en el Outlet
    → useState inicializa: personajes=[], loading=true, error=null, page=1
    → useEffect corre (primera vez, page=1)
      → fetch("...api/character?page=1")
      → "Cargando..." se muestra (loading=true)
      → La API responde con 20 personajes
      → setPersonajes(data.results) → re-render con la tabla
      → setLoading(false) → "Cargando..." desaparece
```

### Hacer click en "Ver" de un personaje

```
Click en <Link to="/detalle/826">
  → React Router actualiza la URL a /detalle/826 (sin recargar)
  → Outlet desmonta Home y monta Detalle
    → useParams() lee la URL: { idPersonaje: "826" }
    → useState inicializa: personaje=null, loading=true, error=null
    → useEffect corre
      → fetch("...api/character/826")
      → "Cargando..." se muestra
      → La API responde con los datos del personaje 826
      → setPersonaje(character) → re-render con la tarjeta
      → setLoading(false)
```

### Hacer click en "Volver"

```
Click en <Link to="/">
  → React Router vuelve a "/"
  → Outlet desmonta Detalle y monta Home nuevamente
  → Home se monta desde cero: el estado anterior (página, personajes) se pierde
```

---

## Cómo probarlo

```bash
# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

La app queda disponible en `http://localhost:5173` (o el puerto que muestre Vite).

**Rutas disponibles:**

| URL | Qué muestra |
|---|---|
| `/` | Tabla de personajes paginada |
| `/detalle/:id` | Detalle del personaje con ese ID (ej: `/detalle/1`) |
| `/login` | Formulario de login (sin lógica) |
