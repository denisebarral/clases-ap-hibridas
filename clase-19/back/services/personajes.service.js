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

    // Filtro por personajes eliminados: si se incluye ?eliminado=true, devuelve solo los marcados con soft delete.
    // Sin este parámetro, los personajes eliminados siguen apareciendo en el listado general.
    // Para ocultarlos por defecto habría que agregar { eliminado: { $ne: true } } al filterMongo base.
    if (filter?.eliminado) filterMongo.eliminado = true

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
            //{ $push: { cafes: { ...cafe } } }
            // $addToSet en lugar de $push para evitar duplicados: solo agrega el café si no está ya presente en el array.
            { $addToSet: { cafes: { ...cafe } }}
        )
    } catch (error) {
        throw new Error(error)
    }
}

/**
 * getPersonajeById - Busca un único personaje por su ObjectId.
 *
 * findOne devuelve el primer documento que coincida con el filtro,
 * o null si no existe ninguno. Es el equivalente a SELECT ... WHERE id = X LIMIT 1 en SQL.
 *
 * @param {string} idPersonaje - ObjectId del personaje como string (24 chars hex).
 * @returns {Promise<Object|null>} El documento del personaje, o null si no se encontró.
 * @throws {Error} Si el id no es un ObjectId válido o si falla la conexión.
 */
export async function getPersonajeById(idPersonaje) {
    try {
        await client.connect()
        // new ObjectId(string) convierte el string a tipo ObjectId de MongoDB.
        // Sin esta conversión, el filtro { _id: string } no matchea porque los _id son ObjectId, no strings.
        return db.collection("personajes").findOne({ _id: new ObjectId(idPersonaje) })
    } catch (error) {
        throw new Error(error)
    }
}


/**
 * deletePersonaje - Soft delete: marca el personaje como eliminado sin borrarlo de la BD.
 *
 * En lugar de deleteOne (que sería irreversible), se usa updateOne con $set para agregar
 * la bandera { eliminado: true }. El documento sigue existiendo y puede consultarse
 * filtrando por ?eliminado=true en el endpoint GET /api/personajes.
 *
 * Esto es útil para auditoría, historial, o si se necesita "restaurar" un personaje después.
 *
 * @param {string} idPersonaje - ObjectId del personaje a marcar como eliminado.
 * @returns {Promise<UpdateResult>} Resultado de updateOne con matchedCount y modifiedCount.
 */
export async function deletePersonaje(idPersonaje) {
    await client.connect()
    return db.collection("personajes").updateOne(
        { _id: new ObjectId(idPersonaje) },
        // $set solo modifica los campos especificados; el resto del documento queda intacto.
        { $set: { eliminado: true } }
    )
}


/**
 * savePersonaje - Inserta un nuevo personaje en la colección.
 *
 * insertOne agrega el documento y MongoDB le asigna automáticamente un campo _id
 * de tipo ObjectId si el objeto no lo tiene. El resultado incluye ese _id generado.
 *
 * @param {Object} personaje - Objeto con los datos del personaje (sin _id; MongoDB lo genera).
 * @returns {Promise<InsertOneResult>} Resultado con acknowledged: true y insertedId (el nuevo ObjectId).
 * @throws {Error} Si falla la conexión o el documento viola alguna restricción de la colección.
 */
export async function savePersonaje(personaje) {
    try {
        await client.connect()
        return db.collection("personajes").insertOne(personaje)
    } catch (error) {
        throw new Error(error)
    }
}


/**
 * editPersonajeById - Actualiza los campos de un personaje existente (usado por PUT y PATCH).
 *
 * Usa $set con los campos del objeto recibido, excluyendo el _id.
 * La exclusión del _id es necesaria porque MongoDB no permite modificar el campo _id
 * de un documento ya existente; intentarlo lanza un error.
 *
 * Flujo:
 *  1. Desestructura el objeto para separar _id del resto de los campos.
 *  2. Busca el documento por _id y le aplica $set con los campos restantes.
 *  3. Devuelve el _id del personaje modificado (para que el controller pueda responder con él).
 *
 * @param {Object} personaje      - Objeto con _id y los campos a actualizar.
 * @param {string} personaje._id  - ObjectId del personaje como string.
 * @returns {Promise<string>} El _id del personaje modificado.
 * @throws {Error} Si el id es inválido o falla la conexión.
 */
export async function editPersonajeById(personaje) {
    try {
        await client.connect()

        // Destructuring para separar _id del resto: si se incluyera _id en el $set, MongoDB lanzaría un error
        // porque los identificadores de documento no pueden modificarse una vez creados.
        const { _id, ...personajeSinId } = personaje

        await db.collection("personajes").updateOne({ _id: new ObjectId(_id) }, {
            // $set reemplaza solo los campos de personajeSinId; los campos no incluidos no se tocan.
            $set: personajeSinId
        })

        // Devuelve el _id para que el controller pueda incluirlo en la respuesta JSON.
        return personaje._id
    } catch (error) {
        throw new Error(error)
    }
}
