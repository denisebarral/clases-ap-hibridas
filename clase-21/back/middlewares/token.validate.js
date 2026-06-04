/**
 * middlewares/token.validate.js — Middleware de autenticación por JWT.
 *
 * Protege las rutas que requieren que el usuario esté logueado.
 * Verifica que la request traiga un token JWT válido en el header Authorization.
 *
 * Novedad respecto a clase-20: ya no llama a jwt.verify() directamente.
 * Delega esa responsabilidad a validateToken() de token.service.js,
 * que es quien conoce la clave secreta (desde .env).
 *
 * Si el token es válido → llama a next() y adjunta los datos del usuario en req.usuario.
 * Si el token es inválido, expiró o no existe → responde 401 Unauthorized y corta la cadena.
 */

// validateToken del service se importa con alias "validarToken" para evitar
// conflicto de nombres con la función local que también se llama validateToken.
import { validateToken as validarToken } from "../services/token.service.js"

/**
 * validateToken - Verifica que el header Authorization contenga un Bearer token válido.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {Function} next
 */
export function validateToken(req, res, next){
    try {
        // req.headers.authorization contiene el valor del header como string.
        // Si el cliente no mandó ese header, auth es undefined → split() lanza excepción → catch.
        const auth = req.headers.authorization
        console.log(auth)

        // El header tiene la forma "Bearer <token>", separado por un espacio.
        // split(" ") devuelve ["Bearer", "<token>"] y desestructuramos en dos variables.
        const [ bearer, token ] = auth.split(" ")

        if( bearer != "Bearer" || !token ) return res.status(401).json({ message: "token invalido" })

        // validarToken() llama a jwt.verify() con la clave del .env.
        // Si el token es válido devuelve el payload; si no, lanza una excepción.
        const usuario = validarToken(token)

        // Adjuntamos el payload al objeto req para que el controller pueda
        // saber quién está haciendo la acción (req.usuario.email, etc.).
        req.usuario = usuario
        next()
    } catch (error) {
        // Captura: token malformado, firma inválida, token expirado, header ausente.
        res.status(401).json({ message: "token invalido" })
    }
}
