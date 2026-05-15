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
 * getLibroById - Busca un único libro por su ObjectId.
 *
 * findOne devuelve el primer documento que coincida con el filtro,
 * o null si no existe ninguno.
 * Es el equivalente a SELECT * FROM libros WHERE _id = X LIMIT 1 en SQL.
 *
 * @param {string} id - ObjectId del libro como string (24 chars hex).
 * @returns {Promise<Object|null>} El documento del libro, o null si no se encontró.
 * @throws {Error} Si el id no es un ObjectId válido o si falla la conexión.
 */
export async function getLibroById(id) {
    await client.connect()
    // new ObjectId(string) convierte el string a tipo ObjectId de MongoDB.
    // Sin esta conversión, el filtro { _id: string } no matchea porque los _id
    // son ObjectId, no strings.
    return db.collection("libros").findOne({ _id: new ObjectId(id) })
}
