/**
 * api/routes/personajes.routes.js
 *
 * Rutas de la API REST para el recurso "personajes".
 *
 * Se montan bajo el prefijo "/api" en main.js, así que las URLs reales son:
 *   GET  /api/personajes          → listado de personajes (con filtros opcionales por query params)
 *   POST /api/personajes/:id      → asigna un café favorito al personaje con ese _id
 *
 * El id en la URL de POST es el ObjectId del personaje en MongoDB.
 * El id del café se manda en el body JSON: { "idCafe": "..." }
 */

import express from 'express'
import * as controllers from "../controllers/personajes.controllers.js"

const router = express.Router()

// GET /api/personajes → devuelve todos los personajes (acepta ?equipo=X-Men o ?nombre=...)
router.get("/personajes", controllers.getPersonajes)

// POST /api/personajes/:id → agrega el café del body al array "cafes" del personaje indicado
router.post("/personajes/:id", controllers.asignarFavorito)

export default router
