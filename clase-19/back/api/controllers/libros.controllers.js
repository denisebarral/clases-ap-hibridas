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
