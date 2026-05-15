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
import { getLibros, getLibroById } from "../../services/libros.service.js"

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

/**
 * GET /api/libros/:id
 * Devuelve un único libro por su ObjectId.
 * Responde con { data: libro } si se encontró, o 404 si no existe.
 * El frontend (Detalle.jsx) lee la respuesta como libro.data.
 */
router.get("/libros/:id", async (req, res) => {
    try {
        const libro = await getLibroById(req.params.id)
        if (!libro) return res.status(404).json({ error: "Libro no encontrado" })
        res.json({ data: libro })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

export default router
