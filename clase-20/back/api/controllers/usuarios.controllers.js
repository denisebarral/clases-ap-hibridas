/**
 * api/controllers/usuarios.controllers.js
 *
 * Controladores de la API REST para el recurso "usuarios".
 *
 * Responsabilidades:
 *   - Recibir el req (ya validado por el middleware), pasarlo al service, y traducir
 *     el resultado a una respuesta HTTP con el status code correcto.
 *
 * Lo que NO hace:
 *   - No accede directamente a la base de datos (eso es trabajo del service).
 *   - No valida los datos del body (eso lo hace el middleware en usuarios.validate.js).
 */

import * as services from "../../services/usuarios.service.js"

/**
 * createUser - Registra un nuevo usuario en la base de datos.
 * POST /api/
 *
 * Cuando llega acá, el middleware validateRegister ya se ejecutó: req.body
 * está limpio y validado. Responde 201 Created con los datos del usuario creado
 * (sin la contraseña, que el service omite antes de devolver).
 */
export function createUser(req, res){
    services.createUser(req.body)
        .then( usuario => res.status(201).json(usuario) )
        // 500 porque si el service falla es un error del servidor, no del cliente
        .catch( err => res.status(500).json(err) )
}

/**
 * login - Verifica credenciales y devuelve los datos del usuario si son correctas.
 * POST /api/login
 *
 * Si el email no existe o la contraseña no coincide, el service lanza un Error.
 * El catch responde 400 con un mensaje genérico e intencionalmente vago:
 * no se revela si el email existe o no (buena práctica de seguridad).
 */
export function login(req, res){
    services.login(req.body)
        .then( usuario => res.status(200).json(usuario) )
        .catch( err => res.status(400).json({ message: "Usuario o contraseña incorrectos" }) )
}
