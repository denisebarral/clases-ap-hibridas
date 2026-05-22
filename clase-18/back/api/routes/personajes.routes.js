import express from 'express'
import * as controllers from "../controllers/personajes.controllers.js"
import { personajeValidate } from '../../middlewares/personajes.validate.js'

const router = express.Router()
router.get("/api/personajes", controllers.getPersonajes)
router.post("/api/personajes/:id", controllers.asignarFavorito)
router.post("/api/personajes/:id/cafe", controllers.crearCafe)
router.get("/api/personajes/:id/cafe", controllers.getCafeCreado)
router.get("/api/personajes/:id", controllers.getPersonajeById)
router.post("/api/personajes",  [personajeValidate],controllers.guardarPersonaje)
router.delete("/api/personajes/:id", controllers.borrarPersonaje)
router.patch("/api/personajes/:id", [personajeValidate], controllers.actualizarPersonaje)
router.put("/api/personajes/:id",  [personajeValidate],controllers.reemplazarPersonaje)

export default router