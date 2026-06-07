/**
 * api.service.jsx — Servicio base de comunicación con la API.
 *
 * Centraliza toda la lógica de fetch para que los demás services
 * no tengan que repetir la URL base, los headers ni el manejo del token.
 *
 * ¿Por qué un service y no fetch directo en cada componente?
 * Antes (clase-20), cada componente hacía su propio fetch con la URL completa,
 * el header Authorization hardcodeado, etc. Si cambiaba la URL base o la forma
 * de autenticar, había que cambiar N archivos. Ahora se cambia uno solo.
 *
 * Este hook es el único lugar de toda la app que sabe que:
 *   - la API vive en http://localhost:2026/api
 *   - se autentifica con Bearer token en el header Authorization
 *   - un 401 redirige al login
 */

import { useNavigate } from "react-router-dom";
import { useToken } from "../contexts/Session.context";

/**
 * useApi — Hook que devuelve la función call() lista para usar.
 *
 * Lee el token del contexto (no de localStorage directo) para que si
 * el token cambia (login/logout), call() use siempre el valor actualizado.
 */
export function useApi() {

    const token = useToken()      // token JWT del contexto global de sesión
    const navigate = useNavigate()

    /**
     * call — Ejecuta un fetch a la API con autenticación automática.
     *
     * @param {string} uri    - Ruta relativa: "/libros", "/login", "/libros/abc123"
     * @param {string} method - Método HTTP: "GET", "POST", "PUT", "DELETE" (default GET)
     * @param {Object} body   - Datos a enviar en el body (solo para POST/PUT)
     * @returns {Promise<any>} El JSON de la respuesta si fue exitosa
     */
    const call = (uri, method = "GET", body) => {
        return fetch("http://localhost:2026/api" + uri, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                // call() SIEMPRE manda este header, para cualquier ruta.
                //
                // Para rutas PROTEGIDAS (ej: GET /api/libros):
                //   token = "eyJhbGci..." → el backend lo valida con validateToken → OK
                //
                // Para rutas PÚBLICAS (ej: POST /api/login, POST /api/):
                //   token = null → el header queda "Authorization: Bearer null"
                //   Pero esas rutas NO tienen el middleware validateToken, así que
                //   el backend directamente ignora ese header. Mandar null no rompe nada.
                //   Es como escribir en un campo de un formulario que nadie va a leer.
                "Authorization": `Bearer ${token}`
            },
            // JSON.stringify(undefined) → undefined, que fetch ignora para GET.
            // Para POST/PUT, body es el objeto con los datos del form.
            body: JSON.stringify(body)
        })
            .then(res => {
                if (res.ok) return res.json()
                // Si el token venció o es inválido, el backend responde 401.
                // Redirigimos al login para que el usuario se vuelva a autenticar.
                if (res.status == 401) navigate("/login")
                throw new Error("Error en la llamada a la API")
            })
    }

    return { call }
}
