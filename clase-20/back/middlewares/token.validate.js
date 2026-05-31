/**
 * middlewares/token.validate.js — Middleware de autenticación por JWT.
 *
 * Protege las rutas que requieren que el usuario esté logueado.
 * Verifica que la request traiga un token JWT válido en el header Authorization.
 *
 * Si el token es válido → llama a next() y adjunta los datos del usuario en req.usuario.
 * Si el token es inválido, expiró o no existe → responde 401 Unauthorized y corta la cadena.
 *
 * Este middleware no accede a la BD: la verificación del token es puramente matemática
 * (el servidor recalcula la firma con su clave secreta y la compara con la del token).
 */

import jwt from "jsonwebtoken"

/**
 * validateToken - Verifica que el header Authorization contenga un Bearer token válido.
 *
 * El header esperado tiene este formato exacto:
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 *                  ↑ palabra fija  ↑ el token JWT
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {Function} next
 */
export function validateToken(req, res, next){
    try {
        // req.headers.authorization contiene el valor del header Authorization como string.
        // Si el cliente no mandó ese header, auth es undefined y el catch captura el error.
        const auth = req.headers.authorization
        console.log(auth) // nota: auth ya es el string; auth.authorization sería undefined

        // El header tiene la forma "Bearer <token>", separado por un espacio.
        // Con split(" ") obtenemos ["Bearer", "<token>"] y desestructuramos en dos variables.
        const [ bearer, token ] = auth.split(" ")

        // Verificación doble: que la primera palabra sea exactamente "Bearer"
        // y que haya algo después. Cualquier otro formato rechaza la request.
        if( bearer != "Bearer" || !token ) return res.status(401).json({ message: "token invalido" })

        // jwt.verify(token, secreto) hace dos cosas en una sola llamada:
        //   1. Verifica que la firma del token sea correcta (que no fue adulterado).
        //   2. Verifica que el token no haya expirado (compara exp con la hora actual).
        // Si alguna de las dos falla, lanza una excepción que cae al catch de abajo.
        // Si todo está bien, devuelve el payload decodificado (los datos del usuario).
        const usuario = jwt.verify(token, "1234")
        console.log(usuario)

        // Adjuntamos los datos del usuario al objeto req para que el controller pueda
        // acceder a ellos si los necesita (por ejemplo, saber quién está haciendo la acción).
        req.usuario = usuario
        next()
    } catch (error) {
        // Cualquier error llega acá: token malformado, firma inválida, token expirado,
        // o auth undefined (el cliente no mandó el header). Siempre responde 401.
        res.status(401).json({ message: "token invalido" })
    }
}
