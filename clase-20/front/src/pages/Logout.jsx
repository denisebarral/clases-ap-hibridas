/**
 * Logout.jsx — Página de cierre de sesión.
 *
 * No renderiza ninguna UI: su único trabajo es limpiar la sesión de localStorage
 * y redirigir al login inmediatamente.
 *
 * Esta es la "redirección por componente": en lugar de llamar a navigate(),
 * se retorna <Navigate /> directamente desde el render. React lo procesa
 * como un componente y ejecuta la redirección en ese mismo instante.
 *
 * ¿Por qué <Navigate> y no useNavigate() acá?
 * Porque no hay ningún evento o acción que esperar: el solo hecho de
 * renderizar este componente (navegar a /logout) YA ES la acción de logout.
 * No hay botón, no hay form, no hay fetch. La redirección ocurre durante el render.
 */

import { Navigate } from "react-router-dom"

const Logout = () => {
    // Elimina todos los datos de localStorage, incluyendo la sesión del usuario.
    localStorage.clear()

    // <Navigate> es un componente que, cuando React lo renderiza, inmediatamente
    // redirige al usuario a la ruta indicada. No muestra nada en pantalla.
    return <Navigate to="/login" />
}

export default Logout
