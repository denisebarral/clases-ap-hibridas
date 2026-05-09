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


/**
 * getPersonajeById - Devuelve un único personaje buscado por su ObjectId.
 *
 * GET /api/personajes/:id
 *
 * Respuestas:
 *   200 OK       → personaje encontrado, devuelve { data: personaje }
 *   404 Not Found → ningún documento con ese id en la colección
 *   500 Error    → id con formato inválido o fallo de conexión
 *
 * @param {import('express').Request}  req - req.params.id: ObjectId del personaje (string hex de 24 chars)
 * @param {import('express').Response} res
 */
export function getPersonajeById(req, res) {
    const id = req.params.id;
    return service.getPersonajeById(id)
        .then(personaje => {
            // findOne devuelve null si no encuentra el documento; en ese caso respondemos 404
            if (!personaje) {
                return res.status(404).json({ message: 'personaje no encontrado' });
            }
            res.status(200).json({ data: personaje });
        })
        .catch(err => res.status(500).json({ message: "Error interno del servidor" }))
}


/**
 * guardarPersonaje - Crea un nuevo personaje en la colección.
 *
 * POST /api/personajes
 * Body esperado (JSON):
 *   { "nombre": "...", "nombreReal": "...", "poder": "...", "universo": "...", "equipo": "..." }
 *
 * El campo "cafes" NO se recibe del body: siempre se inicializa como array vacío [].
 * Los cafés favoritos se asignan después via POST /api/personajes/:id.
 *
 * Respuestas:
 *   201 Created → personaje insertado, devuelve el resultado de insertOne (con el _id generado)
 *   500 Error   → fallo al insertar
 *
 * @param {import('express').Request}  req - Contiene los campos del personaje en req.body
 * @param {import('express').Response} res
 */
export function guardarPersonaje(req, res) {
    // Se construye el objeto explícitamente para controlar qué campos entran a la BD.
    // Esto evita que el cliente inyecte campos arbitrarios pasando datos extra en el body.
    const personaje = {
        "nombre": req.body.nombre,
        "nombreReal": req.body.nombreReal,
        "poder": req.body.poder,
        // Nota: "universso" es el nombre del campo tal como está en la colección de MongoDB.
        // El body debe enviarse con la clave "universo" (sin doble s); acá se mapea al nombre real.
        "universso": req.body.universo,
        "equipo": req.body.equipo,
        // El array de cafés favoritos siempre arranca vacío al crear un personaje nuevo.
        // Se puebla después via el endpoint POST /api/personajes/:id (asignarFavorito).
        "cafes": []
    }
    service.savePersonaje(personaje)
        .then(personaje => res.status(201).json(personaje))
        .catch(err => res.status(500).json({ message: "Error al intentar guardar el personaje" }))
}


/**
 * borrarPersonaje - Soft delete: marca el personaje como eliminado sin borrarlo físicamente.
 *
 * DELETE /api/personajes/:id
 *
 * En lugar de eliminar el documento, el service setea { eliminado: true }.
 * Esto permite recuperar el historial de personajes eliminados filtrando por ?eliminado=true.
 *
 * Respuestas:
 *   202 Accepted  → operación ejecutada, devuelve el resultado de updateOne
 *   404 Not Found → ningún documento con ese id (el resultado de updateOne está vacío)
 *   500 Error     → fallo al actualizar
 *
 * @param {import('express').Request}  req - req.params.id: ObjectId del personaje a eliminar
 * @param {import('express').Response} res
 */
export function borrarPersonaje(req, res) {
    const id = req.params.id
    service.deletePersonaje(id)
        .then((personaje) => {
            // Object.keys(personaje).length != 0 comprueba que el resultado de updateOne no esté vacío.
            // Un resultado vacío indicaría que no se encontró el documento con ese id.
            if (Object.keys(personaje).length != 0) {
                res.status(202).json(personaje)
                return
            }
            res.status(404).json({ message: "No se pudo encontrar el personaje" })
        })
        .catch(err => res.status(500).json({ message: "No se pudo borrar el personaje" }))
}


/**
 * reemplazarPersonaje - Reemplazo total del personaje (PUT).
 *
 * PUT /api/personajes/:id
 * Body esperado (JSON):
 *   { "nombre": "...", "nombreReal": "...", "poder": "...", "universo": "...", "equipo": "...", "cafes": [...] }
 *
 * PUT reemplaza TODOS los campos: si el cliente no manda un campo, ese campo queda como undefined
 * en el objeto y MongoDB lo omite del documento. Usar solo cuando se envía el personaje completo.
 * Para actualizaciones parciales, usar PATCH /api/personajes/:id.
 *
 * Respuestas:
 *   202 Accepted  → personaje reemplazado, devuelve el _id del personaje modificado
 *   404 Not Found → no se encontró el personaje con ese id
 *   500 Error     → fallo al actualizar
 *
 * @param {import('express').Request}  req - req.params.id + body con todos los campos del personaje
 * @param {import('express').Response} res
 */
export function reemplazarPersonaje(req, res) {
    const id = req.params?.id
    // Se construye el objeto con todos los campos; los que no vengan en el body quedarán undefined.
    // El service usa $set, así que MongoDB solo actualiza los campos presentes (no undefined).
    const personaje = {
        "_id": id,
        "nombre": req.body?.nombre,
        "nombreReal": req.body?.nombreReal,
        "poder": req.body?.poder,
        "universo": req.body?.universo,
        "equipo": req.body?.equipo,
        "cafes": req.body?.cafes
    }
    service.editPersonajeById(personaje)
        .then(personaje => {
            if (Object.keys(personaje) != 0) {
                res.status(202).json(personaje)
                return
            }
            res.status(404).json({ message: "No pude encontrar el personaje" })
        })
        .catch(err => res.status(500).json({ message: "No se puede reemplazar el personaje" }))
}


/**
 * actualizarPersonaje - Actualización parcial del personaje (PATCH).
 *
 * PATCH /api/personajes/:id
 * Body esperado (JSON): solo los campos que se quieren modificar.
 *   Ej: { "equipo": "Avengers" }  → solo cambia el equipo, el resto queda igual.
 *
 * Diferencia con PUT:
 *   PUT  → el cliente manda el personaje COMPLETO; lo que no manda se pierde.
 *   PATCH → el cliente manda solo lo que cambia; el resto se preserva del documento actual.
 *
 * Flujo:
 *  1. Busca el personaje actual en la BD (getPersonajeById).
 *  2. Para cada campo: si vino en el body lo usa, si no lo toma del personaje existente.
 *  3. Llama al service con el personaje completo resultante.
 *
 * Respuestas:
 *   202 Accepted  → personaje actualizado, devuelve el _id
 *   500 Error     → fallo al buscar o actualizar
 *
 * @param {import('express').Request}  req - req.params.id + body con los campos a modificar
 * @param {import('express').Response} res
 */
export async function actualizarPersonaje(req, res) {
    const id = req.params.id

    // Trae el documento actual ANTES de modificarlo para poder hacer el merge campo por campo.
    // Sin este paso, los campos no enviados en el body quedarían undefined.
    const personajeAntiguo = await service.getPersonajeById(id)

    // Por cada campo: si el body lo trae, usa el valor nuevo; si no, conserva el valor viejo.
    // Esto implementa la semántica PATCH sin necesidad de que el cliente envíe el objeto completo.
    const personaje = {
        "_id": id,
        "nombre":      req.body?.nombre      ? req.body?.nombre      : personajeAntiguo.nombre,
        "nombreReal":  req.body?.nombreReal  ? req.body?.nombreReal  : personajeAntiguo.nombreReal,
        "poder":       req.body?.poder       ? req.body?.poder       : personajeAntiguo.poder,
        "universo":    req.body?.universo    ? req.body?.universo    : personajeAntiguo.universo,
        "equipo":      req.body?.equipo      ? req.body?.equipo      : personajeAntiguo.equipo,
        "cafes":       req.body?.cafes       ? req.body?.cafes       : personajeAntiguo.cafes
    }
    service.editPersonajeById(personaje)
        .then(resultado => {
            if (Object.keys(resultado) != 0) {
                res.status(202).json(resultado)
                return
            }
            res.status(404).json({ message: "No pude encontrar el personaje" })
        })
        .catch(err => res.status(500).json({ message: "No se puede actualizar el personaje" }))
}