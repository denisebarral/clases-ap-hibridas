/**
 * routes/personajes.routes.js
 *
 * Rutas del FRONTEND para el recurso "personajes".
 *
 * A diferencia de las rutas de la API (api/routes/personajes.routes.js),
 * estas rutas devuelven HTML construido por la vista, no JSON.
 *
 * URL disponible:
 *   GET /personajes          → lista todos los personajes
 *   GET /personajes?equipo=X-Men   → filtra por equipo
 */

import express from "express"
import * as controller from "../controllers/personajes.controllers.js"

const route = express.Router()

// GET /personajes → renderiza el listado de personajes en HTML
route.get("/personajes", controller.getPersonajes)

export default route
