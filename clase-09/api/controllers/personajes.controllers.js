/**
 * api/controllers/personajes.controllers.js
 *
 * Controladores de la API REST para el recurso "personajes".
 *
 * Responden siempre con JSON (no con HTML).
 * Reutilizan el mismo service que el frontend, lo que demuestra que la capa
 * de datos es independiente de quién la consume.
 */

import * as service from "../../services/personajes.service.js"


/**
 * getPersonajes - Devuelve el listado de personajes en formato JSON.
 *
 * Acepta filtros opcionales via query params:
 *   GET /api/personajes?equipo=X-Men
 *   GET /api/personajes?nombre=wolverine
 *
 * Respuestas:
 *   200 OK    → array de personajes (puede ser [] si no hay coincidencias)
 *   500 Error → fallo interno al consultar la base de datos
 *
 * @param {import('express').Request}  req - Puede contener req.query.equipo y/o req.query.nombre
 * @param {import('express').Response} res
 */
export function getPersonajes(req, res) {
    // Pasa todos los query params al service para que filtre según corresponda
    const filter = req.query
    return service.getPersonajes(filter)
        .then(personajes => res.status(200).json(personajes))
        .catch(err => res.status(500).json({ message: "No se pueden obtener los personajes" }))
}


/**
 * asignarFavorito - Asigna un café favorito a un personaje (POST /api/personajes/:id).
 *
 * Recibe el id del personaje en la URL y el id del café en el body JSON.
 * El service busca el documento completo del café y lo embebe dentro del array
 * "cafes" del personaje (documento embebido, patrón NoSQL).
 *
 * Body esperado:
 *   { "idCafe": "69e40f088095d79c7a5a0dd3" }
 *
 * Respuestas:
 *   201 Created → café asignado correctamente, devuelve el resultado de updateOne
 *   500 Error   → fallo al asignar (id inválido, error de conexión, etc.)
 *
 * @param {import('express').Request}  req - Contiene req.params.id (personaje) y req.body.idCafe (café)
 * @param {import('express').Response} res
 */
export function asignarFavorito(req, res) {
    // El id del personaje viene en la URL: POST /api/personajes/:id
    const idPersonaje = req.params.id
    // El id del café viene en el body JSON: { "idCafe": "..." }
    const idCafe = req.body.idCafe
    return service.asignarFavorito(idPersonaje, idCafe)
        .then(respuesta => res.status(201).json(respuesta))
        .catch(err => res.status(500).json({ message: "No se puede asignar el cafe" }))
}
