/**
 * Session.context.jsx — Contexto global de sesión del usuario.
 *
 * ¿Qué es un Contexto de React?
 * Es un mecanismo para compartir datos entre componentes sin tener que pasarlos
 * manualmente como props de padre a hijo a nieto (lo que se llama "prop drilling").
 * Funciona como una "variable global controlada": cualquier componente que esté
 * dentro del Provider puede leer y modificar esos datos.
 *
 * ¿Qué problema resuelve acá?
 * La sesión (token + email) se necesita en múltiples componentes:
 *   - NavBar la necesita para mostrar Login/Logout
 *   - api.service la necesita para enviar el token en cada request
 *   - Logout la necesita para limpiarla
 *   - Login la necesita para guardarla
 * Sin Context, habría que pasar props por todos los niveles del árbol de componentes.
 *
 * ¿Cómo funciona?
 *   1. createContext() crea el "canal" de comunicación.
 *   2. SessionProvider envuelve la app y pone los datos en el canal.
 *   3. Cualquier componente usa useSession() (o los hooks específicos) para leerlos.
 */

import { createContext, useContext, useState } from "react";

// createContext() crea el objeto contexto. El valor que se le pasa (nada acá)
// es el valor por defecto si no hay ningún Provider en el árbol — normalmente null o {}.
export const Session = createContext()

// Hook genérico: devuelve todo el objeto del contexto.
// No se suele usar directamente — se prefieren los hooks específicos de abajo.
export function useSession() {
    return useContext(Session)
}

// Hooks específicos: cada uno extrae una sola propiedad del contexto.
// Simplifican el código en los componentes: en vez de:
//   const { email } = useContext(Session)
// se escribe simplemente:
//   const email = useEmail()

// Devuelve el email del usuario logueado (o null si no hay sesión)
export function useEmail() {
    const { email } = useSession()
    return email
}

// Devuelve la función onLogin para iniciar sesión desde cualquier componente
export function useLogin(){
    const { onLogin } = useSession()
    return onLogin
}

// Devuelve la función onLogout para cerrar sesión desde cualquier componente
export function useLogout(){
    const { onLogout } = useSession()
    return onLogout
}

// Devuelve el token JWT actual (o null si no hay sesión)
// Lo usa api.service.jsx para incluirlo en el header Authorization de cada fetch.
export function useToken(){
    const { token } = useSession()
    return token
}

/**
 * SessionProvider — Componente que envuelve la app y provee el contexto de sesión.
 *
 * Se coloca en main.jsx rodeando al RouterProvider para que TODOS los componentes
 * de la app puedan acceder al contexto.
 *
 * Guarda el estado en dos lugares en paralelo:
 *   - useState → para que React re-renderice cuando cambie (ej: NavBar actualiza el link)
 *   - localStorage → para que la sesión sobreviva a recargar la página
 *
 * Props:
 *   children → todo el árbol de componentes que puede acceder al contexto
 */
export function SessionProvider({ children }) {

    // Inicializa el email desde localStorage al cargar la app.
    // localStorage solo guarda strings, y el email ya ES un string,
    // así que se guarda y se lee directamente sin JSON.stringify/parse.
    const [email, setEmail] = useState( localStorage.getItem("email") )
    const [token, setToken] = useState( localStorage.getItem("token") )

    // onLogin: se llama cuando el login es exitoso.
    // Recibe el token (string) y el email (string) del usuario.
    // Guarda ambos en localStorage (para persistir al recargar) Y en el estado (para re-renderizar).
    const onLogin = (jwt, email) => {
        // El email es un string puro → se guarda directo, sin JSON.stringify.
        // Antes era JSON.stringify({ usuario }) que guardaba un objeto innecesariamente
        // y creaba inconsistencia al leer: el estado era un string pero localStorage daba un objeto.
        localStorage.setItem("email", email)
        localStorage.setItem("token", jwt)
        setEmail(email)   // actualiza el estado → React re-renderiza NavBar, etc.
        setToken(jwt)
    }

    // onLogout: limpia todo.
    // localStorage.clear() borra TODAS las claves del storage, no solo session y token.
    const onLogout = () => {
        localStorage.clear()
        setEmail(null)
        setToken(null)
    }

    // Session.Provider envuelve los children y les inyecta el objeto value.
    // Cualquier componente hijo que use useSession() va a recibir este objeto.
    return (
        <Session.Provider value={{ email, token, onLogin, onLogout }} >
            {children}
        </Session.Provider>
    )
}
