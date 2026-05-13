/**
 * libros.routes.js  (API)
 *
 * Define los endpoints REST de la colección "libros".
 * Responde siempre con JSON — no genera HTML.
 *
 * Montada en main.js bajo el prefijo /api, por lo que la URL final es:
 *   GET /api/libros  →  devuelve el array completo de libros
 */

import { Router } from "express"
import { getLibros } from "../../services/libros.service.js"

const router = Router()


/**
 * GET /api/libros
 * Devuelve todos los documentos de la colección "libros" como JSON.
 */
router.get("/libros", async (req, res) => {
    try {
        const libros = await getLibros()
        res.json(libros)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

export default router
