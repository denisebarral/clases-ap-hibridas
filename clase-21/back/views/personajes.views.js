/**
 * views/personajes.views.js
 *
 * Capa de VISTAS para "personajes".
 *
 * Responsabilidad: construir el HTML que se envía al navegador.
 * No sabe nada de HTTP ni de la base de datos: solo recibe datos y devuelve strings HTML.
 *
 * Usa createPage() de utils.js para envolver el contenido en la estructura base
 * (navbar, Bootstrap, etc.), igual que las demás vistas de la app.
 */

import { createPage } from "../page/utils.js"


/**
 * createPersonajesList - Construye la página HTML con el listado de personajes.
 *
 * Incluye links de filtro por equipo (X-Men / Avengers) que redirigen
 * a GET /personajes?equipo=X-Men y GET /personajes?equipo=Avengers.
 * Cuando el usuario hace clic, Express recibe el query param y el service filtra.
 *
 * @param {Array} personajes - Array de documentos de personajes desde MongoDB.
 * @returns {string} Página HTML completa como string.
 */
export function createPersonajesList(personajes) {
    let html = ""

    html += "<h1>Listado de personajes</h1>"

    // Links de filtro rápido por equipo — generan query params en la URL
    html += "<a href='/personajes?equipo=X-Men'>X-MEN</a> | <a href='/personajes?equipo=Avengers'>AVENGERS</a>"

    // Lista de nombres de personajes
    html += "<ul>"
    personajes.forEach(personaje => html += "<li>" + personaje.nombre + "</li>")
    html += "</ul>"

    // Envuelve el HTML en la estructura base (navbar, Bootstrap, etc.)
    return createPage(html)
}
