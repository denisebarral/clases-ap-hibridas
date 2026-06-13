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
 *   GET    /api/libros             →  devuelve el array de libros (requiere token)
 *   GET    /api/libros/:idLibro    →  devuelve un libro por id (requiere token)
 *   POST   /api/libros             →  crea un nuevo libro (requiere token + validación de body)
 *   PUT    /api/libros/:idLibro    →  reemplaza un libro completo (requiere token + validación de body)
 *   PATCH  /api/libros/:idLibro    →  modifica campos puntuales de un libro (requiere token)
 *   DELETE /api/libros/:idLibro    →  elimina un libro por su _id (requiere token)
 */

import { Router } from "express"
import { getLibros, getLibro, crearLibro, reemplazarLibro, modificarLibro, eliminarLibro } from "../controllers/libros.controllers.js"
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


/**
 * PUT /api/libros/:idLibro
 * Reemplaza un libro completo. El body debe incluir TODOS los campos del documento.
 * Si un campo falta, el documento queda sin ese campo en la BD (no hay merge).
 * libroValidate garantiza que vengan todos los campos antes de ejecutar el controller.
 *
 * Body esperado: igual al de POST (todos los campos obligatorios, sin _id).
 */
router.put("/libros/:idLibro", [libroValidate, validateToken], reemplazarLibro)


/**
 * PATCH /api/libros/:idLibro
 * Modifica solo los campos enviados en el body. El resto del documento queda intacto.
 * No usa libroValidate porque PATCH acepta un body parcial — no todos los campos son requeridos.
 *
 * Body esperado: uno o más campos del libro. Ejemplo:
 *   { "precio": 5500 }
 *   { "precio": 5500, "seccion": "clásicos" }
 */
router.patch("/libros/:idLibro", [validateToken], modificarLibro)


/**
 * DELETE /api/libros/:idLibro
 * Elimina un libro por su _id. No recibe body — el id viene en la URL.
 */
router.delete("/libros/:idLibro", [validateToken], eliminarLibro)


export default router
