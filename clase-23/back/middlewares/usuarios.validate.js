/**
 * middlewares/usuarios.validate.js — Middlewares de validación para el recurso "usuarios".
 *
 * Exporta dos middlewares separados porque login y registro usan schemas distintos
 * (ver schemas/usuarios.js). La lógica de cuándo usar cada uno la define el router.
 */

import { loginSchema, registerSchema } from "../schemas/usuarios.js";

/**
 * validateLogin - Valida que el body tenga email y password con formato correcto.
 *
 * No usa abortEarly:false porque el loginSchema solo tiene dos campos; no hay tanto
 * que acumular. El primer error ya es suficiente para saber qué falta.
 */
export function validateLogin(req, res, next){
    loginSchema.validate( req.body )
        .then( () => next() )
        .catch( (err) => res.status(400).json({message: err.errors}) )
}


/**
 * validateRegister - Valida que el body cumpla todas las reglas del registro:
 * email válido, contraseña fuerte, confirmación coincidente, age opcional.
 *
 * abortEarly: false → acumula TODOS los errores (el registro tiene muchos campos;
 *             mejor mostrarlos todos juntos que uno por uno)
 * stripUnknown: true → descarta campos extra que no estén en el registerSchema
 */
export function validateRegister(req, res, next){
    registerSchema.validate( req.body, { abortEarly:false, stripUnknown: true } )
        // validate() devuelve el objeto ya limpio (sin campos extra) como argumento del .then().
        // Si no lo usamos y llamamos next() sin más, req.body llega al controller sin limpiar
        // y los campos extra (ej: zaraza: "valor") se guardan en MongoDB.
        // Al reasignar req.body con el valor stripeado, el service solo ve los campos del schema.
        .then( validData => { req.body = validData; next() } )
        .catch( (err) => res.status(400).json({message: err.errors}) )
}
