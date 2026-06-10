/**
 * api/routes/libros.routes.js  (API REST)
 *
 * Define los endpoints REST de la colección "libros".
 * Responde siempre con JSON — no genera HTML.
 *
 * A partir de esta clase, AMBOS endpoints requieren un token JWT válido.
 * El cliente debe enviar el token en el header Authorization de cada request:
 *   Authorization: Bearer <token>
 *
 * Montada en main.js bajo el prefijo /api, las URLs finales son:
 *   GET  /api/libros  →  devuelve el array de libros (requiere token)
 *   POST /api/libros  →  crea un nuevo libro (requiere token + validación de body)
 */

import { Router } from "express"
import { getLibros, getLibro, crearLibro } from "../controllers/libros.controllers.js"
import { libroValidate } from "../../middlewares/libros.validate.js"

// El middleware de token vive en back/middlewares/, no en back/api/middlewares/
import { validateToken } from "../../middlewares/token.validate.js"

const router = Router()


/**
 * GET /api/libros
 * Devuelve todos los documentos de la colección "libros" como JSON.
 * validateToken verifica el JWT antes de ejecutar getLibros.
 */
router.get("/libros", [validateToken], getLibros)


/**
 * GET /api/libros/:idLibro
 * Devuelve un único libro por su _id de MongoDB.
 * :idLibro es un parámetro dinámico de la URL — Express lo pone en req.params.idLibro.
 * Ejemplo: GET /api/libros/507f1f77bcf86cd799439011
 */
router.get("/libros/:idLibro", [validateToken], getLibro)


/**
 * POST /api/libros
 * Crea un nuevo libro. Pasa por dos middlewares en orden:
 *   1. libroValidate → valida que el body tenga los campos requeridos y con el tipo correcto
 *   2. validateToken → verifica que el usuario esté autenticado
 * Si cualquiera de los dos falla, el controller crearLibro nunca se ejecuta.
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
 */
router.post("/libros", [libroValidate, validateToken], crearLibro)


export default router
