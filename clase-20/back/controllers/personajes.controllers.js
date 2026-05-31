/**
 * controllers/personajes.controllers.js
 *
 * Capa de CONTROLADORES del frontend para "personajes".
 *
 * Diferencia con los controladores de la API (api/controllers/personajes.controllers.js):
 *   - Estos responden con HTML, usando la vista (personajes.views.js).
 *   - Los de la API responden con JSON usando res.status().json().
 *
 * Ambos reutilizan el mismo service (personajes.service.js).
 */

import * as service from "../services/personajes.service.js"
import * as view from "../views/personajes.views.js"


/**
 * getPersonajes - Devuelve el listado de personajes como página HTML.
 *
 * Acepta filtros opcionales via query params:
 *   GET /personajes?equipo=X-Men
 *   GET /personajes?nombre=wolverine
 *
 * @param {import('express').Request}  req - Puede contener req.query.equipo y/o req.query.nombre
 * @param {import('express').Response} res
 */
export function getPersonajes(req, res) {
    // Pasa todos los query params al service para que filtre según corresponda
    const filter = req.query
    service.getPersonajes(filter)
        // Construye el HTML con la lista de personajes y lo envía al navegador
        .then(personajes => res.send(view.createPersonajesList(personajes)))
        .catch(err => res.send("No se pudo leer el archivo"))
}
