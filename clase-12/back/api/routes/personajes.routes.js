/**
 * api/routes/personajes.routes.js
 *
 * Rutas de la API REST para el recurso "personajes".
 *
 * Se montan bajo el prefijo "/api" en main.js, así que las URLs reales son:
 *   GET    /api/personajes        → listado completo (acepta ?equipo=X-Men, ?nombre=..., ?eliminado=true)
 *   GET    /api/personajes/:id    → un personaje por su ObjectId
 *   POST   /api/personajes        → crea un nuevo personaje con los datos del body
 *   POST   /api/personajes/:id    → asigna un café favorito al personaje con ese _id
 *   DELETE /api/personajes/:id    → soft delete: marca el personaje como eliminado (no lo borra físicamente)
 *   PATCH  /api/personajes/:id    → actualización parcial: solo sobreescribe los campos enviados
 *   PUT    /api/personajes/:id    → reemplazo total: reemplaza TODOS los campos del personaje
 *
 * ATENCIÓN — orden de rutas con el mismo verbo:
 * Express evalúa las rutas en el orden en que están definidas. Para GET, la ruta base
 * "/personajes" debe estar ANTES de "/personajes/:id" para que Express no intente
 * interpretar una URL sin id como si el id fuera undefined.
 * Para verbos distintos (POST "/personajes" vs POST "/personajes/:id") no hay conflicto
 * de orden porque Express los diferencia por el método HTTP.
 *
 * El id en la URL es el ObjectId del personaje en MongoDB (string de 24 caracteres hex).
 * El id del café para POST /:id se manda en el body JSON: { "idCafe": "..." }
 */

import express from 'express'
import * as controllers from "../controllers/personajes.controllers.js"

const router = express.Router()

// GET /api/personajes → devuelve todos los personajes (acepta ?equipo=X-Men, ?nombre=..., ?eliminado=true)
router.get("/personajes", controllers.getPersonajes)

// POST /api/personajes/:id → agrega el café del body al array "cafes" del personaje indicado
router.post("/personajes/:id", controllers.asignarFavorito)

// GET /api/personajes/:id → devuelve un único personaje buscándolo por su ObjectId
router.get("/personajes/:id", controllers.getPersonajeById)

// POST /api/personajes → crea un nuevo personaje; el array "cafes" siempre inicia vacío
router.post("/personajes", controllers.guardarPersonaje)

// DELETE /api/personajes/:id → soft delete: setea { eliminado: true } sin borrar el documento
router.delete("/personajes/:id", controllers.borrarPersonaje)

// PATCH /api/personajes/:id → actualización parcial: busca primero el personaje y sobreescribe solo los campos recibidos
router.patch("/personajes/:id", controllers.actualizarPersonaje)

// PUT /api/personajes/:id → reemplazo total: todos los campos del body reemplazan los existentes
router.put("/personajes/:id", controllers.reemplazarPersonaje)





export default router
