/**
 * Layout.jsx
 *
 * Componente de ESTRUCTURA COMPARTIDA que actúa como "marco" visual de toda la app.
 *
 * Responsabilidades:
 *   - Renderizar la barra de navegación (<nav>) con los <Link> a cada sección.
 *   - Renderizar el <Outlet>: el "hueco" donde React Router inyecta el componente
 *     de página que corresponde a la URL activa (Libros, Chat, Fetch...).
 *   - Renderizar el <footer> que siempre está visible sin importar la ruta.
 *
 * Lo que NO hace:
 *   - No maneja lógica de negocio ni estado propio.
 *   - No hace fetch a ninguna API.
 *   - No sabe qué ruta está activa: React Router se encarga de eso.
 */

import { Link, Outlet } from "react-router"

/**
 * Layout - Componente padre que envuelve todas las páginas de la app.
 *
 * Se configura en Routes.jsx como el elemento de la ruta raíz "/".
 * Todos los componentes de página (Libros, Chat, Fetch) son "children" de esa
 * ruta y se renderizan donde está el <Outlet />, dentro de este componente.
 *
 * @returns {JSX.Element} Estructura completa: nav + contenido dinámico + footer.
 */
const Layout = () => {
    return (
        <div>
            {/* El <nav> se muestra siempre, en cualquier ruta activa */}
            <nav>
                {/* <Link> es el equivalente de React Router al <a href="">.
                    La diferencia clave:
                    - <a href>  : hace un HTTP request nuevo → la página recarga completa.
                    - <Link to> : navegación del lado del cliente → actualiza la URL en el
                                  navegador y re-renderiza solo el <Outlet />, sin recargar.
                                  El estado de la app (variables, contexto) se preserva. */}
                <Link to="/">Home</Link>
                <Link to="/chat">Chat</Link>
                <Link to="/dogs">Dogs</Link>
            </nav>

            {/* <Outlet /> es el "hueco" donde React Router inserta la página activa.
                Si la URL es "/"      → renderiza <Libros />.
                Si la URL es "/chat" → renderiza <Chat />.
                Si la URL es "/dogs" → renderiza <Fetch />.
                Sin este tag, los componentes hijo nunca aparecerían en pantalla
                aunque estén declarados como "children" en Routes.jsx. */}
            <Outlet />

            <footer>nada</footer>
        </div>
    )
}

export default Layout
