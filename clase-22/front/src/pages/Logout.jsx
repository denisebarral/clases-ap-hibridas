/**
 * Logout.jsx — Página de cierre de sesión.
 *
 * No renderiza ninguna UI: su único trabajo es limpiar la sesión del contexto
 * (y del localStorage) y redirigir al login inmediatamente.
 *
 * Cambios respecto a clase-20:
 *   - Ya no limpia localStorage directamente
 *   - Usa onLogout() del contexto, que además actualiza el estado global
 *     (lo que hace que NavBar se re-renderice mostrando "Login" de nuevo)
 *
 * ¿Por qué useEffect y no llamar logout() directamente?
 * En React, no se puede producir un side effect (como modificar estado) durante
 * el render. Llamar logout() directo causaría un error de "Cannot update state
 * during render". useEffect() difiere la ejecución a después del render.
 */

import { Navigate } from "react-router-dom"
import { useLogout } from "../contexts/Session.context"
import { useEffect } from "react"

const Logout = () => {
    // useLogout() devuelve la función onLogout del contexto.
    // Al llamarla, limpia localStorage Y actualiza email/token a null en el estado global.
    const logout = useLogout()

    // useEffect con [] corre logout() una sola vez, justo después de que el componente se monta.
    // Esto garantiza que el estado ya existe (el Provider está montado) antes de modificarlo.
    useEffect(() => {
        logout()
    }, [])

    // <Navigate> redirige al login inmediatamente durante el render.
    // El efecto del logout (limpiar estado) ocurre justo después del primer render.
    return <Navigate to="/login" />
}

export default Logout
