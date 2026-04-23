/**
 * personajes.service.js
 *
 * Capa de SERVICIOS para la colección "personajes".
 *
 * Responsabilidades:
 *   - Consultar y modificar documentos de la colección "personajes" en MongoDB.
 *   - Implementar la lógica de "asignar café favorito": busca el café por id
 *     y lo incrusta como subdocumento dentro del array "cafes" del personaje.
 *
 * Esta capa NO conoce nada de HTTP: no sabe de req, res, ni de Express.
 */

import { MongoClient, ObjectId } from "mongodb"
import { getProductosById } from "./products.services.js"

const client = new MongoClient("mongodb+srv://denise_mongodb:mongodb123@cafe-app.neh6c59.mongodb.net/")
const db = client.db("cafeapp")


/**
 * getPersonajes - Obtiene personajes de la colección, con filtros opcionales.
 *
 * Soporta dos tipos de filtro via query params:
 *  - nombre: búsqueda de texto completo usando el operador $text de MongoDB.
 *            Requiere que la colección tenga creado un índice de tipo "text" en el campo "nombre".
 *  - equipo: filtro exacto por el campo "equipo" del documento. Ej: "X-Men", "Avengers".
 *
 * @param {Object} [filter={}]     - Filtros opcionales.
 * @param {string} [filter.nombre] - Término de búsqueda de texto libre.
 * @param {string} [filter.equipo] - Nombre exacto del equipo a filtrar.
 * @returns {Promise<Array>} Promise que resuelve con el array de personajes encontrados.
 */
export async function getPersonajes(filter = {}) {
    const filterMongo = {}

    // $text + $search: búsqueda de texto completo sobre los campos indexados como "text".
    // Es el equivalente a LIKE '%valor%' en SQL, pero más eficiente porque usa un índice invertido.
    // Requiere haber creado el índice previamente en Atlas o Compass:
    //   db.personajes.createIndex({ nombre: "text" })
    if (filter?.nombre) filterMongo.$text = { $search: filter.nombre }

    // Filtro exacto por equipo: solo devuelve personajes cuyo campo "equipo" coincida exactamente.
    if (filter?.equipo) filterMongo.equipo = filter.equipo

    return db.collection("personajes").find(filterMongo).toArray()
}


/**
 * asignarFavorito - Agrega un café como favorito de un personaje (documento embebido).
 *
 * En lugar de guardar solo el id del café (como haría una base relacional con una FK),
 * MongoDB permite "embeber" el documento completo del café dentro del personaje.
 * Esto se llama DOCUMENTO EMBEBIDO y es un patrón común en NoSQL:
 * evita tener que hacer JOINs posteriores para obtener los datos del café.
 *
 * Flujo:
 *  1. Se conecta a MongoDB.
 *  2. Busca el documento completo del café en la colección "cafes" (via getProductosById).
 *  3. Usa $push para insertar ese objeto café en el array "cafes" del personaje.
 *
 * @param {string} idPersonaje - ObjectId (string) del personaje a modificar.
 * @param {string} idCafe      - ObjectId (string) del café a asignar como favorito.
 * @returns {Promise<UpdateResult>} Resultado de la operación updateOne de MongoDB.
 * @throws {Error} Si la conexión falla o alguno de los ids es inválido.
 */
export async function asignarFavorito(idPersonaje, idCafe) {
    try {
        await client.connect()

        // 1. Busca el documento completo del café en la colección "cafes".
        //    No guardamos solo el id: traemos el objeto entero para embeber sus datos en el personaje.
        const cafe = await getProductosById(idCafe)

        // 2. updateOne con $push: agrega el café al array "cafes" dentro del documento del personaje.
        //
        //    DESGLOSE DE: $push: { cafes: { ...cafe } }
        //
        //    → $push              : operador de MongoDB que agrega un elemento al final de un array.
        //                          Si el campo "cafes" no existe en el documento, MongoDB lo crea como array.
        //
        //    → cafes              : nombre del campo array dentro del documento personaje donde se inserta.
        //
        //    → { ...cafe }        : spread operator de JS. Crea una copia plana del objeto cafe.
        //                          Es equivalente a escribir manualmente:
        //                          { _id: cafe._id, nombre: cafe.nombre, precio: cafe.precio, ... }
        //                          Se usa el spread para desacoplar el objeto del café de su referencia original.
        //
        //    Resultado en la colección "personajes" luego de la operación:
        //      {
        //        _id: ObjectId("69e95e23..."),
        //        nombre: "Wolverine",
        //        equipo: "X-Men",
        //        cafes: [
        //          { _id: ObjectId("69e40f08..."), nombre: "Espresso", precio: 350 },
        //          { _id: ObjectId("69e42968..."), nombre: "Latte",    precio: 400 }
        //        ]
        //      }
        return await db.collection("personajes").updateOne(
            { _id: new ObjectId(idPersonaje) },  // filtro: encontrá este personaje por su _id
            { $push: { cafes: { ...cafe } } }     // operación: agregá el café al array "cafes"
        )
    } catch (error) {
        throw new Error(error)
    }
}
