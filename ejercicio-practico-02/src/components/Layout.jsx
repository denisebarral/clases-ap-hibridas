/**
 * Layout.jsx — Componente "contenedor" que envuelve todas las páginas.
 *
 * Renderiza la NavBar una sola vez (arriba) y luego <Outlet />, que es el
 * "hueco" donde React Router inserta el componente hijo que corresponde
 * a la URL actual. Así la barra de navegación persiste entre páginas
 * sin volver a montarse con cada cambio de ruta.
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
