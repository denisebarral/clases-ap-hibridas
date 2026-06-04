/**
 * ProtectedRoute.jsx — Componente guardia para rutas protegidas.
 *
 * Recibe el componente de página que se quiere proteger como prop `element`.
 * Verifica si hay una sesión activa en localStorage:
 *   - Si HAY sesión  → renderiza el elemento (la página pedida).
 *   - Si NO hay sesión → redirige a /login con <Navigate />.
 *
 * Se usa en Router.jsx envolviendo las rutas que requieren autenticación.
 * El componente protegido nunca llega a montarse si no hay sesión.
 *
 * Esta es otra aplicación de la "redirección por componente": la decisión
 * de redirigir se toma DURANTE el render, no como respuesta a un evento.
 */

import { Navigate } from "react-router-dom"

const ProtectedRoute = ({element}) => {
    // Lee la sesión de localStorage y la parsea de string a objeto.
    // Si no hay nada guardado, getItem devuelve null, y JSON.parse(null) también devuelve null.
    const session = JSON.parse( localStorage.getItem("session") )

    // Si hay sesión, renderiza la página que se pasó como prop.
    if( session ) return element

    // Si no hay sesión, <Navigate> redirige a /login sin mostrar nada.
    // El usuario ni siquiera llega a ver el contenido protegido por un instante.
    return <Navigate to="/login" />
}

export default ProtectedRoute
