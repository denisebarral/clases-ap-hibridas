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
    // Lee el email de localStorage. Es un string puro (o null si no hay sesión).
    // localStorage.getItem() devuelve null cuando la clave no existe.
    const email = localStorage.getItem("email")

    // Si hay email, hay sesión → renderiza la página protegida.
    if( email ) return element

    // Si no hay sesión, <Navigate> redirige a /login sin mostrar nada.
    // El usuario ni siquiera llega a ver el contenido protegido por un instante.
    return <Navigate to="/login" />
}

export default ProtectedRoute
