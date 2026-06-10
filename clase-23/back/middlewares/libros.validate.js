/**
 * middlewares/libros.validate.js — Middleware de validación para el recurso "libros".
 *
 * Un middleware es una función que Express ejecuta ANTES de llegar al controller.
 * Recibe (req, res, next): si la validación pasa, llama a next() para continuar la cadena.
 * Si falla, responde con 400 y corta — el controller nunca se ejecuta.
 *
 * Este middleware solo valida formato y tipos; no accede a la BD ni aplica lógica de negocio.
 */

import { libroSchema } from "../schemas/libros.js";

/**
 * libroValidate - Valida que el body de la request cumpla el libroSchema.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {Function} next - Función de Express para pasar al siguiente eslabón de la cadena
 */
export function libroValidate(req, res, next){
    console.log("Validando...")

    // validate() devuelve una Promise: resuelve si los datos son válidos, rechaza si no.
    // req.body contiene el JSON que mandó el cliente, parseado por express.json() en main.js.
    libroSchema.validate( req.body, {
        // abortEarly: false → NO para en el primer error; recorre TODOS los campos
        // y acumula todos los mensajes antes de rechazar.
        // Sin esta opción (abortEarly: true por defecto) solo se vería el primer error.
        abortEarly: false,

        // stripUnknown: true → elimina del objeto cualquier campo que no esté en el schema.
        // Si el cliente manda { titulo: "x", campoRaro: true }, "campoRaro" se descarta
        // antes de pasar al controller. Protege contra inyección de campos no esperados.
        stripUnknown: true
    } )
        .then( () => next() )                                          // válido → sigue al controller
        .catch( err => res.status(400).json({message: err.errors}) )  // inválido → 400 con lista de errores
}
