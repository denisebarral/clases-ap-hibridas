/**
 * api/controllers/libros.controllers.js
 *
 * Controladores de la API REST para el recurso "libros".
 *
 * Responsabilidades:
 *   - Recibir el req, extraer los datos necesarios y pasarlos al service.
 *   - Traducir el resultado del service a una respuesta HTTP con el status code correcto.
 *
 * Lo que NO hace:
 *   - No accede directamente a la base de datos (eso es trabajo del service).
 *   - No genera HTML (la API siempre responde JSON).
 */

import * as service from "../../services/libros.service.js"


/**
 * getLibro - Devuelve un único libro por su _id.
 *
 * GET /api/libros/:idLibro
 *
 * El _id viene como parámetro en la URL (/api/libros/507f1f77bcf86cd799439011).
 * El service se encarga de convertirlo a ObjectId y buscarlo en la BD.
 *
 * Respuestas:
 *   200 OK  → el documento del libro encontrado
 *   404     → el id tiene formato válido pero no existe ningún libro con ese _id
 *   500     → id con formato inválido (no es un ObjectId de 24 chars) o fallo de conexión
 *
 * @param {import('express').Request}  req - req.params.idLibro contiene el _id de la URL
 * @param {import('express').Response} res
 */
export function getLibro(req, res) {
    // req.params.idLibro coincide con el segmento :idLibro definido en la ruta
    service.getLibroById(req.params.idLibro)
        .then(libro => {
            // findOne() devuelve null si no encuentra ningún documento con ese _id
            if (!libro) return res.status(404).json({ message: "Libro no encontrado" })
            res.status(200).json(libro)
        })
        .catch(err => res.status(500).json({ message: "Error al buscar el libro" }))
}


/**
 * getLibros - Devuelve el listado completo de libros en formato JSON.
 *
 * GET /api/libros
 *
 * Respuestas:
 *   200 OK    → array con todos los libros de la colección
 *   500 Error → fallo de conexión o error interno
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
export function getLibros(req, res) {
    return service.getLibros()
        .then(libros => res.status(200).json(libros))
        .catch(err => res.status(500).json({ message: "No se pueden obtener los libros" }))
}


/**
 * crearLibro - Crea un nuevo libro en la colección a partir de los datos del body.
 *
 * POST /api/libros
 *
 * Body esperado (JSON):
 *   {
 *     "titulo":           "Cien años de soledad",
 *     "autor":            "Gabriel García Márquez",
 *     "genero":           "novela",
 *     "descripcion":      "La saga de los Buendía...",
 *     "precio":           4800,
 *     "anio_publicacion": 1967,
 *     "editorial":        "Sudamericana",
 *     "imagen":           "https://picsum.photos/seed/cienanos/400/600",
 *     "link":             "https://es.wikipedia.org/wiki/Cien_a%C3%B1os_de_soledad",
 *     "seccion":          "narrativa"
 *   }
 *
 * El _id NO se incluye en el body: MongoDB lo genera solo al hacer el insertOne.
 *
 * Respuestas:
 *   201 Created → libro insertado, devuelve el resultado de insertOne (incluye el insertedId)
 *   500 Error   → fallo al insertar (error de conexión, documento inválido, etc.)
 *
 * @param {import('express').Request}  req - Contiene los campos del libro en req.body
 * @param {import('express').Response} res
 */
export function crearLibro(req, res) {
    // Se construye el objeto explícitamente para controlar qué campos entran a la BD.
    // Esto evita que el cliente pueda "inyectar" campos extra que no pertenecen al modelo
    // (por ejemplo: si el body incluyera un campo "admin: true", este bloque lo descartaría).
    const libro = {
        titulo:           req.body.titulo,
        autor:            req.body.autor,
        genero:           req.body.genero,
        descripcion:      req.body.descripcion,
        // Number() convierte el valor a número por si viene como string desde el body.
        // precio y anio_publicacion se guardan como números en la BD, no como strings.
        precio:           Number(req.body.precio),
        anio_publicacion: Number(req.body.anio_publicacion),
        editorial:        req.body.editorial,
        imagen:           req.body.imagen,
        link:             req.body.link,
        seccion:          req.body.seccion
    }

    return service.crearLibro(libro)
        .then(resultado => res.status(201).json(resultado))
        .catch(err => res.status(500).json({ message: "Error al intentar guardar el libro" }))
}
