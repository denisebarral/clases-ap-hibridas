# Clase 14 — React Router, componentes padre-hijo y lazy loading

## Índice

- [¿Qué se hizo esta clase?](#qué-se-hizo-esta-clase)
- [Nuevos archivos y su rol](#nuevos-archivos-y-su-rol)
- [Organización: pages vs components](#organización-pages-vs-components)
- [Relación padre-hijo y props: TableLibros + ItemLibro](#relación-padre-hijo-y-props-tableLibros--itemlibro)
- [React Router: navegación sin recargar la página](#react-router-navegación-sin-recargar-la-página)
- [El componente Layout y la etiqueta Outlet](#el-componente-layout-y-la-etiqueta-outlet)
- [lazy() y Suspense: carga diferida de páginas](#lazy-y-suspense-carga-diferida-de-páginas)
- [Flujo completo de una navegación](#flujo-completo-de-una-navegación)

---

## ¿Qué se hizo esta clase?

Hasta la clase anterior (13) teníamos toda la UI dentro de `App.jsx` y cada componente nuevo se sumaba ahí dentro. En esta clase reorganizamos el proyecto en capas separadas y le agregamos navegación real entre vistas con React Router.

Los cambios clave respecto a clase-13:

| Aspecto | Clase 13 | Clase 14 |
|---|---|---|
| Organización de vistas | Todo en `src/App.jsx` | Separado en `pages/` y `components/` |
| Navegación entre secciones | No había | React Router con URLs reales |
| Carga de páginas | Todas cargan al inicio | Carga diferida con `lazy()` |
| Estructura HTML compartida | Copiada en cada vista | Un único `Layout.jsx` con `<Outlet />` |
| Punto de entrada del router | No había router | `RouterProvider` en `main.jsx` |

La única capa que se tocó es el **frontend de React**: no hay cambios en el backend de Express (salvo el nuevo endpoint `/api/libros`).

---

## Nuevos archivos y su rol

```
clase-14/front/
├── pages/
│   ├── Libros.jsx          → Página del listado de libros (fetch a API + estado)
│   ├── Chat.jsx            → Página de chat con IA (ya existía en clase-13)
│   └── Fetch.jsx           → Página de perros (ya existía en clase-12)
├── components/
│   ├── Layout.jsx          → Marco compartido: nav + Outlet + footer
│   ├── TableLibros.jsx     → Tabla que renderiza la lista de libros
│   └── ItemLibro.jsx       → Una fila de la tabla (un libro)
└── routes/
    └── Routes.jsx          → Configuración de todas las rutas de la app
```

---

## Organización: pages vs components

### ¿Por qué dos carpetas distintas?

No hay una regla técnica en React, pero es una convención muy extendida separar los archivos en dos categorías:

**`pages/`** — Componentes de página  
Son los que representan una vista completa accesible por una URL. Tienen lógica propia: hacen fetch, manejan estado con `useState`, coordinan varios componentes menores. Cada uno se vincula directamente a una ruta en `Routes.jsx`.

```
/         → pages/Libros.jsx
/chat     → pages/Chat.jsx
/dogs     → pages/Fetch.jsx
```

**`components/`** — Componentes de presentación  
Son piezas reutilizables de UI. No saben de rutas ni de APIs: reciben datos por props y los muestran. Pueden usarse desde cualquier página.

```
components/Layout.jsx      → el "marco" de todas las páginas
components/TableLibros.jsx → la tabla que muestra libros
components/ItemLibro.jsx   → una fila de esa tabla
```

### ¿Por qué esta separación es útil?

Si mañana se necesita mostrar libros también en otra página (por ejemplo, una sección de recomendaciones), `TableLibros` e `ItemLibro` ya están listos para reutilizarse. Solo hay que pasarles el array de libros como prop. La lógica de fetch queda en la nueva página, los componentes visuales no cambian.

---

## Relación padre-hijo y props: TableLibros + ItemLibro

Esta clase muestra el patrón central de React: **un componente padre tiene datos y los pasa a sus hijos a través de props**.

### La cadena completa

```
Libros.jsx            (tiene el array, hace el fetch)
  └── TableLibros.jsx     (recibe el array, arma la <table>)
        └── ItemLibro.jsx     (recibe un objeto libro, renderiza una <tr>)
```

### Paso 1: Libros le pasa los datos a TableLibros

```jsx
// pages/Libros.jsx
const [libros, setLibros] = useState([])

return (
    <TableLibros libros={libros} />
    //           ↑↑↑↑↑↑↑↑↑↑↑↑↑↑
    //  "libros" es el nombre de la prop.
    //  {libros} es el valor: el array del estado local.
)
```

`TableLibros` recibe ese array como si fuera un parámetro de función. En React, a esos parámetros se les llama **props** (abreviatura de *properties*).

### Paso 2: TableLibros recibe la prop y la usa

```jsx
// components/TableLibros.jsx
//
// { libros } entre llaves: destructuring del objeto "props".
// Es equivalente a escribir (props) y luego usar props.libros adentro,
// pero más limpio porque deja explícito qué props espera el componente.
const TableLibros = ( {libros} ) => {
    return (
        <table>
            <tbody>
                {libros.map( libro => <ItemLibro libro={libro} key={libro._id}/> )}
                //     ↑↑↑↑↑                     ↑↑↑↑↑↑↑↑↑
                // el array de la prop   le pasa CADA objeto libro a ItemLibro
            </tbody>
        </table>
    )
}
```

`libros.map()` genera un `<ItemLibro />` por cada elemento del array. A cada uno le pasa el objeto libro como prop. La prop `key` no va a `ItemLibro`; es una instrucción interna para React.

### Paso 3: ItemLibro recibe un único libro y lo muestra

```jsx
// components/ItemLibro.jsx
const ItemLibro = ({ libro }) => {
    return (
        <tr>
            <td>{libro.titulo}</td>
            <td>{libro.autor}</td>
            <td>{libro.precio}</td>
            {/* ... */}
        </tr>
    )
}
```

`ItemLibro` no sabe nada del array ni de la API. Solo recibe un objeto con los campos de un libro y los coloca en celdas. Eso lo hace fácilmente reemplazable o modificable sin tocar el resto.

### ¿Por qué `key={libro._id}`?

Cuando React renderiza una lista con `.map()`, necesita poder identificar cada elemento de forma única para saber qué cambió cuando el estado se actualiza. `key` es esa identidad. Sin ella, React muestra un warning y puede tener comportamientos incorrectos al actualizar, reordenar o eliminar elementos de la lista.

Se usa `libro._id` porque MongoDB garantiza que ese valor es único en toda la colección. No se usa el índice del array (`0, 1, 2...`) salvo que la lista nunca se reordene ni se filtre.

---

## React Router: navegación sin recargar la página

### El problema que resuelve

En una app web tradicional (como la de Express + EJS que vimos antes), cada vez que el usuario hace click en un link, el navegador hace un nuevo request HTTP al servidor, este devuelve HTML nuevo y la página recarga completa. Eso destruye todo el estado de React.

React Router resuelve esto con **navegación del lado del cliente** (*client-side routing*):

1. El usuario hace click en `<Link to="/chat">`.
2. React Router intercepta el evento y **cancela** la recarga.
3. Actualiza la URL en la barra del navegador (usando la History API del navegador).
4. Re-renderiza solo el componente correspondiente a esa URL.
5. El resto de la app (el nav, el footer, el estado global) no se toca.

### Cómo se configura: createBrowserRouter

El router se define en `routes/Routes.jsx` con un array de objetos:

```jsx
// routes/Routes.jsx
import { createBrowserRouter } from "react-router"

export const router = createBrowserRouter([
    {
        path: "/",            // URL que activa esta ruta
        element: <Layout />, // componente que se renderiza
        children: [          // rutas hijas (se muestran dentro del <Outlet /> de Layout)
            { path: "/",      element: <Libros /> },
            { path: "/chat",  element: <Chat />   },
            { path: "/dogs",  element: <Fetch />  },
        ]
    }
])
```

### Cómo se activa: RouterProvider en main.jsx

El objeto `router` se le pasa al componente `<RouterProvider />` en `main.jsx`. A partir de ahí, React Router toma control de la navegación:

```jsx
// src/main.jsx
import { RouterProvider } from "react-router"
import { router } from '../routes/Routes'

createRoot(document.getElementById('root')).render(
    <RouterProvider router={router} />
)
```

`RouterProvider` reemplaza a `<App />` como el componente raíz: ya no hace falta `App.jsx`. El router sabe qué renderizar según la URL.

### La etiqueta Link

`<Link>` es el reemplazo de `<a href="">` dentro de una app con React Router:

```jsx
// components/Layout.jsx
import { Link } from "react-router"

<Link to="/">Home</Link>
<Link to="/chat">Chat</Link>
<Link to="/dogs">Dogs</Link>
```

| | `<a href="">` | `<Link to="">` |
|---|---|---|
| Hace request al servidor | Sí | No |
| Recarga la página | Sí | No |
| Pierde el estado de React | Sí | No |
| Actualiza la URL | Sí | Sí |
| Funciona con el botón Atrás | Sí | Sí |

`<Link>` se comporta igual al `<a>` desde el punto de vista del usuario (actualiza la URL, el botón atrás funciona), pero por adentro no hace ningún request HTTP.

### ¿Por qué el profe organizó las rutas en su propia carpeta?

Si la configuración del router viviera en `main.jsx`, ese archivo crecería con cada nueva ruta. Tenerla en `routes/Routes.jsx` significa:

- `main.jsx` hace una sola cosa: montar React en el DOM y darle el router.
- `routes/Routes.jsx` es el único lugar donde se agregan o modifican rutas.
- Es inmediatamente obvio dónde buscar si algo con la navegación no funciona.

Es el mismo principio que en el backend: si `main.js` de Express declarara todas las rutas ahí dentro, sería un caos. Por eso se separaron en `routes/productos.routes.js`, `routes/personajes.routes.js`, etc. React sigue la misma lógica.

---

## El componente Layout y la etiqueta Outlet

### El problema que resuelve Layout

Sin `Layout.jsx`, el nav y el footer habría que repetirlos en cada página:

```jsx
// SIN Layout: repetición en cada página
const Libros = () => (
    <div>
        <nav>...</nav>       {/* ← copiado */}
        <tabla de libros />
        <footer>...</footer> {/* ← copiado */}
    </div>
)

const Chat = () => (
    <div>
        <nav>...</nav>       {/* ← copiado */}
        <formulario de chat />
        <footer>...</footer> {/* ← copiado */}
    </div>
)
```

Si el nav cambia (se agrega un link, se le pone estilo), habría que modificar todos los archivos.

### La solución: Layout + Outlet

`Layout.jsx` es el "marco" con todo lo que es igual en todas las páginas. `<Outlet />` es el hueco donde React Router inyecta el componente de la página activa:

```jsx
// components/Layout.jsx
const Layout = () => (
    <div>
        <nav>
            <Link to="/">Home</Link>
            <Link to="/chat">Chat</Link>
            <Link to="/dogs">Dogs</Link>
        </nav>

        <Outlet />   {/* ← acá aparece Libros, Chat o Fetch según la URL */}

        <footer>nada</footer>
    </div>
)
```

Y en `Routes.jsx`, las páginas se declaran como `children` de la ruta de Layout:

```jsx
{
    path: "/",
    element: <Layout />,  // el marco
    children: [
        { path: "/",      element: <Libros /> },  // va al <Outlet />
        { path: "/chat",  element: <Chat />   },  // va al <Outlet />
        { path: "/dogs",  element: <Fetch />  },  // va al <Outlet />
    ]
}
```

Cuando la URL es `/chat`, React Router renderiza `<Layout />` y dentro del `<Outlet />` coloca `<Chat />`. El resultado en pantalla:

```
┌─────────────────────────────────────────┐
│  nav: Home | Chat | Dogs               │  ← Layout (siempre presente)
├─────────────────────────────────────────┤
│                                         │
│   [formulario de Chat]                  │  ← Outlet (contenido dinámico)
│                                         │
├─────────────────────────────────────────┤
│  footer: nada                           │  ← Layout (siempre presente)
└─────────────────────────────────────────┘
```

Si el usuario hace click en "Home", el nav y el footer no se tocan. Solo se reemplaza el contenido del `<Outlet />` con `<Libros />`.

---

## lazy() y Suspense: carga diferida de páginas

### El problema

Cuando Vite compila la app, por defecto mete todo el código JavaScript en un único bundle. Si la app tiene 20 páginas, el usuario descarga el código de las 20 páginas aunque solo vaya a visitar 1.

### La solución: lazy loading

`lazy()` le dice a React que un componente se debe importar de forma diferida: el código se descarga solo cuando el componente se va a renderizar por primera vez.

```jsx
// SIN lazy: todo el código se descarga al abrir la app
import Chat   from "../pages/Chat"
import Libros from "../pages/Libros"
import Fetch  from "../pages/Fetch"

// CON lazy: cada página es un bundle separado que llega solo cuando se necesita
const Chat   = lazy( () => import("../pages/Chat")   )
const Libros = lazy( () => import("../pages/Libros") )
const Fetch  = lazy( () => import("../pages/Fetch")  )
```

La sintaxis `() => import(...)` es una **importación dinámica**: retorna una Promise que resuelve con el módulo cuando el archivo llega de la red. `lazy()` sabe cómo manejar esa Promise.

Al abrir la app en `/`, solo baja el bundle de `Libros.jsx`. El código de `Chat.jsx` y `Fetch.jsx` se descarga recién cuando el usuario navega a `/chat` o `/dogs`. En apps grandes (docenas de páginas) esto reduce el tiempo de carga inicial de forma significativa.

### El problema del lazy: hay un instante donde el código no llegó todavía

Cuando el usuario navega a `/chat` por primera vez, React intenta renderizar `<Chat />` pero el código todavía está viajando por la red. Si React intentara renderizarlo igual, tiraría un error.

### La solución: Suspense

`<Suspense>` es un componente de React que captura ese "todavía no está listo" y muestra un contenido alternativo mientras espera:

```jsx
// routes/Routes.jsx
{
    path: "/chat",
    element: (
        <Suspense fallback={ <p>Cargando...</p> }>
            <Chat />
        </Suspense>
    )
}
```

| Momento | Lo que pasa |
|---|---|
| Usuario navega a `/chat` | React Router activa la ruta |
| El bundle de Chat **no llegó** | `<Suspense>` muestra `<p>Cargando...</p>` |
| El bundle de Chat **llegó** | React descarta el fallback y renderiza `<Chat />` |

El `fallback` puede ser cualquier JSX: un spinner, un skeleton, un mensaje de texto. En esta clase es un simple `<p>Cargando...</p>`.

**Regla importante**: todo componente importado con `lazy()` **debe** estar envuelto en un `<Suspense>`. Si no, React lanza un error en tiempo de ejecución.

---

## Flujo completo de una navegación

Situación: el usuario está en `/` y hace click en "Chat".

```
Usuario clickea <Link to="/chat">
        │
        ▼
React Router intercepta el click
(NO hace ningún request HTTP al servidor)
        │
        ▼
Actualiza la URL: http://localhost:5173/chat
        │
        ▼
Busca en el árbol de rutas qué corresponde a "/chat"
→ Encuentra: Layout > children > { path: "/chat", element: <Chat /> }
        │
        ▼
Layout ya está montado (no se re-renderiza)
Solo se actualiza el contenido del <Outlet />
        │
        ▼
¿El bundle de Chat.jsx ya está descargado?
        │
      NO │                        SÍ │
        ▼                            ▼
<Suspense> muestra          React renderiza
<p>Cargando...</p>          <Chat /> directo
        │
        ▼
Bundle de Chat llega de Vite
        │
        ▼
<Suspense> descarta el fallback
React renderiza <Chat />
        │
        ▼
El usuario ve el formulario de chat.
El nav y el footer nunca se tocaron.
```
