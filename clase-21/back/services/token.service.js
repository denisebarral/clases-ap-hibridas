/**
 * token.service.js — Servicio centralizado para la generación y verificación de JWT.
 *
 * Antes (clase-20), la lógica de tokens estaba duplicada:
 *   - jwt.sign() en usuarios.service.js (al hacer login)
 *   - jwt.verify() en middlewares/token.validate.js (al verificar cada request)
 *   - La clave secreta "1234" estaba hardcodeada en ambos lugares
 *
 * Ahora esta clase centraliza esa lógica acá y lee la clave secreta desde
 * una variable de entorno (.env), nunca desde el código fuente.
 *
 * ¿Qué es una variable de entorno?
 * Es un valor almacenado en el sistema operativo (o en un archivo .env),
 * fuera del código fuente. Permite cambiar configuraciones sensibles
 * (claves, URLs de BD, puertos) sin tocar el código y sin subirlas al repositorio.
 * En Node.js se accede con process.env.NOMBRE_VARIABLE.
 * Equivalente en Laravel: el archivo .env con env('KEY') o config('key').
 */

import jwt from "jsonwebtoken"

/**
 * createToken - Genera un JWT firmado con la clave secreta del .env.
 *
 * @param {Object} usuario - Datos del usuario a incluir en el payload del token.
 * @returns {string} El token JWT generado.
 */
export function createToken(usuario){
    // process.env.SECRET_PASSWORD lee la variable SECRET_PASSWORD del archivo .env.
    // dotenv (cargado en main.js) es quien parsea el .env y lo pone en process.env.
    // Si SECRET_PASSWORD no está en el .env, este valor será undefined y jwt.sign fallará.
    const token = jwt.sign(
        { ...usuario, password: undefined, _id: undefined },  // payload: datos del usuario sin datos sensibles
        process.env.SECRET_PASSWORD,                           // clave secreta desde .env
        { expiresIn: "2h" }                                   // el token vence en 2 horas
    )
    return token
}

/**
 * validateToken - Verifica un JWT y devuelve su payload si es válido.
 *
 * jwt.verify() hace dos verificaciones en una sola llamada:
 *   1. Que la firma sea correcta (el token no fue adulterado).
 *   2. Que el token no haya expirado (compara el campo exp con la hora actual).
 * Si cualquiera falla, lanza una excepción que el middleware captura con try/catch.
 *
 * @param {string} token - El JWT a verificar (sin el prefijo "Bearer ").
 * @returns {Object} El payload decodificado: { email, age, iat, exp }.
 * @throws {Error} Si el token es inválido, fue adulterado o expiró.
 */
export function validateToken(token){
    const payload = jwt.verify(token, process.env.SECRET_PASSWORD)
    return payload
}
