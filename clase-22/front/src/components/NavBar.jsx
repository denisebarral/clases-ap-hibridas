/**
 * NavBar.jsx — Barra de navegación con estado de sesión reactivo.
 *
 * Cambios respecto a clase-20:
 *   - Ya no lee localStorage directamente
 *   - Usa useEmail() del contexto: cuando el usuario hace login/logout, el estado
 *     del contexto cambia y NavBar se re-renderiza automáticamente con los links correctos
 *
 * Usa el componente Activity de React 19 para mostrar/ocultar links según la sesión.
 * Activity es una API experimental que controla la visibilidad de sus hijos según el modo.
 */

import { Activity } from "react"
import { Link } from "react-router-dom"
import { useEmail } from "../contexts/Session.context"

const NavBar = () => {

    // useEmail() lee el email del contexto global.
    // Si el usuario está logueado, email tiene un valor. Si no, es null.
    // Cuando cambia (login/logout), NavBar se re-renderiza automáticamente
    // porque el contexto dispara un re-render en todos los componentes suscriptos.
    const email = useEmail()

    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid">
                <a className="navbar-brand" href="#">Navbar</a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div className="navbar-nav">
                        <Link className="nav-link" to="/">Home</Link>

                        {/* Activity mode="visible" muestra sus hijos, mode="hidden" los oculta.
                            Cuando NO hay email (usuario no logueado), muestra Login y Registro. */}
                        <Activity mode={!email ? "visible" : "hidden"} >
                            <Link className="nav-link" to="/login">Login</Link>
                            <Link className="nav-link" to="/register">Registro</Link>
                        </Activity>

                        {/* Cuando SÍ hay email (usuario logueado), muestra Salir. */}
                        <Activity mode={email ? "visible" : "hidden"} >
                            <Link className="nav-link" to="/logout">Salir</Link>
                        </Activity>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default NavBar
