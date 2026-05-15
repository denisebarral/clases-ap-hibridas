/**
 * Routes.jsx
 *
 * Define y exporta el árbol de rutas de la aplicación usando React Router v7.
 *
 * Responsabilidades:
 *   - Crear el objeto "router" con createBrowserRouter y exportarlo para que
 *     main.jsx lo pase al <RouterProvider />.
 *   - Declarar qué componente se renderiza en cada URL.
 *   - Configurar Layout como componente padre: sus rutas hijas ("children") son
 *     las páginas que se renderizan dentro del <Outlet /> de Layout.
 *   - Usar lazy() + <Suspense> para cargar cada página solo cuando se necesita.
 *
 * Lo que NO hace:
 *   - No renderiza nada directamente: solo configura el router.
 *   - No maneja estado ni efectos.
 *
 * ¿Por qué en una carpeta "routes/" separada?
 *   Si la configuración de rutas viviera en main.jsx o App.jsx, esos archivos
 *   crecerían rápido con cada nueva ruta. Tenerla en su propia carpeta mantiene
 *   main.jsx limpio (solo inicializa React) y hace que sea trivial encontrar
 *   o agregar rutas nuevas sin tocar otros archivos.
 */

import { createBrowserRouter } from "react-router"
import { lazy, Suspense } from "react"
import Layout from "../components/Layout"

// lazy() convierte la importación en "diferida": el código de cada página
// se descarga en un bundle separado y SOLO cuando el usuario navega a esa ruta.
//
// Sin lazy: cuando la app carga, Vite descarga el código de Chat + Libros + Fetch
//           todo junto, aunque el usuario solo vaya a ver la página de libros.
// Con lazy: al abrir la app solo llega el bundle de Libros (la ruta "/").
//           El código de Chat se descarga recién cuando alguien navega a "/chat".
//           En apps grandes (docenas de páginas) esto reduce el tiempo de carga inicial.
const Chat   = lazy( () => import("../pages/Chat")   )
const Libros = lazy( () => import("../pages/Libros") )
const Fetch  = lazy( () => import("../pages/Fetch")  )
// Detalle: página nueva que muestra el detalle de un libro por id.
// Se carga con lazy() igual que el resto: el bundle se descarga al navegar a "/detalle/:id".
const Detalle = lazy(() => import("../pages/Detalle"))


// createBrowserRouter recibe un array de objetos de ruta.
// Cada objeto define: la URL (path), el componente a renderizar (element),
// y opcionalmente rutas hijas (children).
export const router = createBrowserRouter([
    {
        // La ruta raíz "/" tiene a <Layout /> como elemento.
        // Layout renderiza el nav + el <Outlet /> + el footer.
        // Los "children" son las páginas que se muestran dentro del <Outlet />.
        //
        // Piensen en Layout como el "template" y los children como el "contenido"
        // que se inyecta en el hueco (<Outlet />) según la URL activa.
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "/",
                // <Suspense fallback={...}> es OBLIGATORIO cuando se usa lazy().
                // Mientras el bundle de la página viaja por la red,
                // React muestra el contenido del "fallback" (acá un <p>Cargando...</p>).
                // Sin Suspense, React lanzaría un error al intentar renderizar
                // un componente cuyo código todavía no llegó.
                element: <Suspense fallback={ <p>Cargando...</p> } ><Libros /></Suspense>,
            },
            {
                path: "/chat",
                element: <Suspense fallback={ <p>Cargando...</p> } ><Chat /></Suspense>,
            },
            {
                path: "/dogs",
                element: <Suspense fallback={ <p>Cargando...</p> } ><Fetch /></Suspense>,
            },
            {
                // ":id" es un segmento dinámico: coincide con cualquier valor en esa posición.
                // URL "/detalle/687a3f2c..." → React Router activa esta ruta y
                // pone { id: "687a3f2c..." } disponible para useParams() en Detalle.jsx.
                path: "/detalle/:id",
                element: <Suspense fallback={<p>Cargando...</p>} ><Detalle /></Suspense>,
            },
        ]
    }
])
