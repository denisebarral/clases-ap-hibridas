/**
 * api/routes/libros.routes.js  (API REST)
 *
 * Define los endpoints REST de la colección "libros".
 * Responde siempre con JSON — no genera HTML.
 *
 * Montada en main.js bajo el prefijo /api, por lo que las URLs finales son:
 *   GET  /api/libros  →  devuelve el array completo de libros
 *   POST /api/libros  →  crea un nuevo libro con los datos enviados en el body
 *
 * La lógica de cada endpoint vive en el controller, no acá.
 * Las rutas solo se encargan de "escuchar" y delegar.
 */

import { Router } from "express"
// Importo ambas funciones del controller, que a su vez delega en el service
import { getLibros, crearLibro } from "../controllers/libros.controllers.js"
import { libroValidate } from "../../middlewares/libros.validate.js"

const router = Router()


/**
 * GET /api/libros
 * Devuelve todos los documentos de la colección "libros" como JSON.
 */
router.get("/libros", getLibros)


/**
 * POST /api/libros
 * Crea un nuevo libro en la base de datos con los datos recibidos en el body JSON.
 *
 * Body esperado:
 *   {
 *     "titulo":           "...",
 *     "autor":            "...",
 *     "genero":           "...",
 *     "descripcion":      "...",
 *     "precio":           1500,
 *     "anio_publicacion": 2001,
 *     "editorial":        "...",
 *     "imagen":           "https://...",
 *     "link":             "https://...",
 *     "seccion":          "..."
 *   }
 *
 * Para que el body llegue parseado como objeto JS, el middleware express.json()
 * debe estar activo en main.js — y ya lo está.
 */
router.post("/libros", [libroValidate], crearLibro)


export default router
