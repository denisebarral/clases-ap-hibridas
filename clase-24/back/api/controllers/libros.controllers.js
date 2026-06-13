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
export async function getLibro(req, res) {
    try {
        // req.params.idLibro coincide con el segmento :idLibro definido en la ruta
        const libro = await service.getLibroById(req.params.idLibro)
        // findOne() devuelve null si no encuentra ningún documento con ese _id
        if (!libro) return res.status(404).json({ message: "Libro no encontrado" })
        res.status(200).json(libro)
    } catch (err) {
        res.status(500).json({ message: "Error al buscar el libro" })
    }
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
export async function getLibros(req, res) {
    try {
        const libros = await service.getLibros()
        res.status(200).json(libros)
    } catch (err) {
        res.status(500).json({ message: "No se pueden obtener los libros" })
    }
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
export async function crearLibro(req, res) {
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

    try {
        const resultado = await service.crearLibro(libro)
        res.status(201).json(resultado)
    } catch (err) {
        res.status(500).json({ message: "Error al intentar guardar el libro" })
    }
}


/**
 * reemplazarLibro - Reemplaza un documento completo en la colección "libros".
 *
 * PUT /api/libros/:idLibro
 *
 * A diferencia de PATCH, PUT sustituye el documento entero. Si el cliente
 * omite un campo, ese campo desaparece del documento en la BD.
 * Por eso la ruta lo protege con libroValidate: garantiza que vengan todos los campos.
 *
 * Respuestas:
 *   200 OK  → libro reemplazado, devuelve el resultado de replaceOne (matchedCount, modifiedCount)
 *   404     → no existe ningún libro con ese _id
 *   500     → id inválido o fallo de conexión
 *
 * @param {import('express').Request}  req - req.params.idLibro + req.body con todos los campos
 * @param {import('express').Response} res
 */
export async function reemplazarLibro(req, res) {
    // Se construye el objeto igual que en crearLibro para evitar campos inyectados.
    const libro = {
        titulo:           req.body.titulo,
        autor:            req.body.autor,
        genero:           req.body.genero,
        descripcion:      req.body.descripcion,
        precio:           Number(req.body.precio),
        anio_publicacion: Number(req.body.anio_publicacion),
        editorial:        req.body.editorial,
        imagen:           req.body.imagen,
        link:             req.body.link,
        seccion:          req.body.seccion
    }

    try {
        const resultado = await service.reemplazarLibro(req.params.idLibro, libro)
        // matchedCount === 0 significa que el _id no existe en la BD
        if (resultado.matchedCount === 0) return res.status(404).json({ message: "Libro no encontrado" })
        res.status(200).json(resultado)
    } catch (err) {
        res.status(500).json({ message: "Error al intentar reemplazar el libro" })
    }
}


/**
 * modificarLibro - Actualiza parcialmente un documento de la colección "libros".
 *
 * PATCH /api/libros/:idLibro
 *
 * El cliente envía solo los campos que quiere cambiar. El service usa $set
 * para tocar únicamente esos campos; el resto del documento queda intacto.
 *
 * Respuestas:
 *   200 OK  → libro modificado, devuelve el resultado de updateOne (matchedCount, modifiedCount)
 *   404     → no existe ningún libro con ese _id
 *   500     → id inválido o fallo de conexión
 *
 * @param {import('express').Request}  req - req.params.idLibro + req.body con los campos a cambiar
 * @param {import('express').Response} res
 */
/**
 * eliminarLibro - Elimina un documento de la colección "libros" por su _id.
 *
 * DELETE /api/libros/:idLibro
 *
 * Respuestas:
 *   200 OK  → libro eliminado, devuelve el resultado de deleteOne (deletedCount: 1)
 *   404     → no existe ningún libro con ese _id
 *   500     → id inválido o fallo de conexión
 *
 * @param {import('express').Request}  req - req.params.idLibro contiene el _id a eliminar
 * @param {import('express').Response} res
 */
export async function eliminarLibro(req, res) {
    try {
        const resultado = await service.eliminarLibro(req.params.idLibro)
        // deletedCount === 0 significa que el _id no existía en la BD
        if (resultado.deletedCount === 0) return res.status(404).json({ message: "Libro no encontrado" })
        res.status(200).json(resultado)
    } catch (err) {
        res.status(500).json({ message: "Error al intentar eliminar el libro" })
    }
}


export async function modificarLibro(req, res) {
    try {
        const resultado = await service.modificarLibro(req.params.idLibro, req.body)
        if (resultado.matchedCount === 0) return res.status(404).json({ message: "Libro no encontrado" })
        res.status(200).json(resultado)
    } catch (err) {
        res.status(500).json({ message: "Error al intentar modificar el libro" })
    }
}
