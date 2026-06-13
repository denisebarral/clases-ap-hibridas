/**
 * libros.service.js
 *
 * Capa de SERVICIOS para la colección "libros".
 *
 * Responsabilidades:
 *   - Conectarse a la base de datos "AH20232CP1" en MongoDB Atlas.
 *   - Consultar documentos de la colección "libros".
 *
 * Esta capa NO conoce nada de HTTP: no recibe req ni res, no sabe de Express.
 * Puede ser importada tanto por rutas de API (JSON) como por rutas de frontend (HTML).
 */

import { MongoClient, ObjectId } from "mongodb"

// Se crea una única instancia del cliente para reutilizar el pool de conexiones.
// La cadena de conexión apunta al cluster compartido; la base de datos target es "AH20232CP1".
const client = new MongoClient("mongodb+srv://denise_mongodb:mongodb123@cafe-app.neh6c59.mongodb.net/")
const db = client.db("AH20232CP1")


/**
 * getLibros - Obtiene todos los documentos de la colección "libros".
 *
 * find() sin filtro devuelve un cursor con todos los documentos de la colección.
 * toArray() materializa ese cursor en un array de objetos JS que se puede serializar a JSON.
 *
 * Es el equivalente a SELECT * FROM libros en SQL.
 *
 * @returns {Promise<Array>} Promise que resuelve con el array de todos los libros encontrados.
 * @throws {Error} Si la conexión falla o la colección no existe.
 */
export async function getLibros() {
    // connect() es idempotente: si el cliente ya tiene una conexión abierta, la reutiliza.
    await client.connect()
    return db.collection("libros").find().toArray()
}


/**
 * crearLibro - Inserta un nuevo documento en la colección "libros".
 *
 * insertOne() recibe el objeto completo y lo guarda en MongoDB.
 * MongoDB genera automáticamente el campo _id (ObjectId) — no hace falta enviarlo en el body.
 *
 * Es el equivalente a INSERT INTO libros (...) VALUES (...) en SQL.
 *
 * @param {Object} libro - Objeto con los datos del libro a insertar.
 * @param {string} libro.titulo          - Título del libro.
 * @param {string} libro.autor           - Nombre del autor.
 * @param {string} libro.genero          - Género literario (ej: "novela", "ensayo").
 * @param {string} libro.descripcion     - Descripción o sinopsis.
 * @param {number} libro.precio          - Precio en la moneda que corresponda.
 * @param {number} libro.anio_publicacion - Año de publicación.
 * @param {string} libro.editorial       - Editorial que lo publicó.
 * @param {string} libro.imagen          - URL de la imagen de portada.
 * @param {string} libro.link            - URL de referencia (ej: Wikipedia).
 * @param {string} libro.seccion         - Sección de la librería (ej: "narrativa", "poesía").
 * @returns {Promise<Object>} Resultado de insertOne: incluye insertedId (el _id generado por Mongo).
 * @throws {Error} Si la conexión falla o el documento tiene un formato inválido.
 */
export async function crearLibro(libro) {
    await client.connect()
    // insertOne() inserta el objeto tal como viene. MongoDB añade el _id automáticamente.
    return db.collection("libros").insertOne(libro)
}


/**
 * getLibroById - Obtiene un único documento de la colección "libros" por su _id.
 *
 * Los _id de MongoDB son ObjectId, no strings simples. Hay que convertir el string
 * que viene de la URL a ObjectId antes de usarlo como filtro, de lo contrario
 * findOne() no encontrará nada (estaría comparando un string con un ObjectId).
 *
 * Es el equivalente a SELECT * FROM libros WHERE id = ? LIMIT 1 en SQL.
 *
 * @param {string} id - El _id del libro como string hexadecimal de 24 caracteres.
 * @returns {Promise<Object|null>} El documento encontrado, o null si no existe.
 * @throws {Error} Si el id no tiene el formato válido de ObjectId o falla la conexión.
 */
export async function getLibroById(id) {
    await client.connect()
    // new ObjectId(id) convierte el string "507f1f77bcf86cd799439011"
    // al tipo ObjectId que MongoDB entiende como _id.
    return db.collection("libros").findOne({ _id: new ObjectId(id) })
}


/**
 * reemplazarLibro - Reemplaza completamente un documento existente en la colección "libros".
 *
 * Corresponde al verbo HTTP PUT: el cliente envía un objeto COMPLETO y ese objeto
 * reemplaza al documento anterior en su totalidad. Los campos que no vengan en el body
 * desaparecen del documento (a diferencia de PATCH, que solo toca lo que recibe).
 *
 * Es el equivalente a UPDATE libros SET campo1=?, campo2=?, ... WHERE id=? en SQL,
 * pero reemplazando TODOS los campos, no solo los enviados.
 *
 * replaceOne() recibe dos argumentos:
 *   1. Filtro: qué documento buscar.
 *   2. Reemplazo: el objeto que lo sustituye (sin incluir _id, MongoDB lo conserva).
 *
 * @param {string} id    - El _id del libro como string hexadecimal de 24 caracteres.
 * @param {Object} libro - Objeto con todos los campos del libro (sin _id).
 * @returns {Promise<Object>} Resultado de replaceOne: incluye matchedCount y modifiedCount.
 * @throws {Error} Si el id no es un ObjectId válido o falla la conexión.
 */
export async function reemplazarLibro(id, libro) {
    await client.connect()
    // replaceOne(filtro, reemplazo): sustituye el documento completo.
    // NO usar $set acá — $set es de updateOne y solo toca los campos indicados.
    return db.collection("libros").replaceOne({ _id: new ObjectId(id) }, libro)
}


/**
 * modificarLibro - Actualiza parcialmente un documento existente en la colección "libros".
 *
 * Corresponde al verbo HTTP PATCH: el cliente envía SOLO los campos que quiere cambiar,
 * y el resto del documento queda intacto. Es distinto a PUT, que reemplaza todo.
 *
 * $set es el operador de MongoDB que actualiza únicamente los campos especificados.
 * Es el equivalente a UPDATE libros SET campo1=? WHERE id=? en SQL (solo los campos enviados).
 *
 * @param {string} id    - El _id del libro como string hexadecimal de 24 caracteres.
 * @param {Object} datos - Objeto con los campos a actualizar (puede ser uno o varios).
 * @returns {Promise<Object>} Resultado de updateOne: incluye matchedCount y modifiedCount.
 * @throws {Error} Si el id no es un ObjectId válido o falla la conexión.
 */
/**
 * eliminarLibro - Elimina un documento de la colección "libros" por su _id.
 *
 * deleteOne() elimina el primer documento que coincida con el filtro.
 * Es el equivalente a DELETE FROM libros WHERE id = ? en SQL.
 *
 * @param {string} id - El _id del libro como string hexadecimal de 24 caracteres.
 * @returns {Promise<Object>} Resultado de deleteOne: incluye deletedCount (1 si eliminó, 0 si no encontró).
 * @throws {Error} Si el id no es un ObjectId válido o falla la conexión.
 */
export async function eliminarLibro(id) {
    await client.connect()
    return db.collection("libros").deleteOne({ _id: new ObjectId(id) })
}


export async function modificarLibro(id, datos) {
    await client.connect()

    // Se descarta _id del objeto antes de pasarlo a $set.
    // MongoDB lanza un error si $set intenta tocar _id, aunque el valor sea el mismo,
    // porque _id es inmutable. El cliente puede mandarlo sin querer (por ejemplo,
    // cuando reset() de React Hook Form carga el documento completo desde la BD).
    const { _id, ...campos } = datos

    // $set actualiza solo los campos que vienen en `campos`.
    // Si `campos` es { precio: 5000 }, solo cambia el precio; el resto del doc no se toca.
    return db.collection("libros").updateOne({ _id: new ObjectId(id) }, { $set: campos })
}
