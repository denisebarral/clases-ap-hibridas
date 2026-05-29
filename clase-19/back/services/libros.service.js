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

import { MongoClient } from "mongodb"

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
