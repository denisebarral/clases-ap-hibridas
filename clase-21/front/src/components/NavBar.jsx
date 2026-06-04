/**
 * NavBar.jsx — Barra de navegación con estado de sesión.
 *
 * Lee la sesión de localStorage al renderizarse y muestra el link
 * de "Login" o "Salir" según si el usuario está autenticado o no.
 *
 * Limitación: si la sesión cambia mientras NavBar está montado (ej: otro tab),
 * NavBar no se re-renderiza automáticamente porque no usa useState.
 * Funciona correctamente para el flujo normal: login/logout navegan a otra ruta,
 * lo que hace que NavBar se vuelva a renderizar con el estado actualizado.
 */

import { Link } from "react-router-dom"

const NavBar = () => {
    // Lee la sesión en cada render. Como NavBar se re-monta al cambiar de ruta,
    // siempre refleja el estado actual de localStorage.
    const session = JSON.parse(localStorage.getItem("session"))

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
                        {
                            // Si no hay sesión → mostrar Login; si hay sesión → mostrar Salir.
                            // Salir navega a /logout, que limpia localStorage y redirige a /login.
                            !session ? <Link className="nav-link" to="/login">Login</Link>
                                     : <Link className="nav-link" to="/logout">Salir</Link>
                        }
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default NavBar
