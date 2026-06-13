/**
 * Layout.jsx — Componente contenedor que envuelve todas las páginas.
 *
 * Renderiza la NavBar una sola vez (arriba) y luego <Outlet />, que es el
 * "hueco" donde React Router inserta el componente hijo de la ruta activa.
 * Así la barra de navegación persiste entre cambios de ruta sin volver a montarse.
 */

import { Outlet } from "react-router-dom"
import NavBar from "./NavBar"

const Layout = () => {
    return (
        <>
            <NavBar />
            {/* Outlet: React Router inserta acá el componente de la ruta activa */}
            <Outlet />
        </>
    )
}

export default Layout
