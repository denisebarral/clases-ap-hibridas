/**
 * products.services.js
 *
 * Capa de SERVICIOS dentro del patrón MVC.
 *
 * Responsabilidad de esta capa:
 *   - Contener toda la lógica de acceso y manipulación de datos.
 *   - A partir de clase-08, los datos viven en MongoDB Atlas (antes en un JSON local).
 *   - Devolver Promises para que el controlador pueda usar async/await.
 *
 * Esta capa NO conoce nada de HTTP: no sabe de req, res, ni de Express.
 * Solo trabaja con datos puros.
 */

import { MongoClient, ObjectId } from "mongodb"

// Conexión a MongoDB Atlas. La base de datos utilizada es "cafeapp".
const client = new MongoClient("mongodb+srv://denise_mongodb:mongodb123@cafe-app.neh6c59.mongodb.net/")
const db = client.db("cafeapp")


/**
 * getProductos - Obtiene todos los productos de la colección "cafes".
 *
 * Aplica un filtro para excluir los documentos marcados como borrados (soft delete).
 * Opcionalmente acepta filtros de precio mínimo y/o máximo via query params.
 *
 * @param {Object} [filter={}]           - Filtros opcionales de la query.
 * @param {string} [filter.precio_max]   - Precio máximo (exclusivo). Ej: "500"
 * @param {string} [filter.precio_min]   - Precio mínimo (exclusivo). Ej: "100"
 * @returns {Promise<Array>} Promise que resuelve con el array de productos, o [] si hubo error.
 */
export async function getProductos( filter = {} ) {
    try {
        await client.connect()

        // Base del filtro: excluye los documentos con borrado: true
        const filterMongo = { borrado: { $ne: true } }

        // Si viene precio_max en la ruta, agrega condición $lt (less than) sobre el campo precio
        if( filter?.precio_max ) filterMongo.precio = { $lt: parseInt( filter?.precio_max ) }

        // Si viene precio_min en la ruta, agrega condición $gt (greater than) sobre el campo precio
        if( filter?.precio_min ) filterMongo.precio = { $gt: parseInt( filter?.precio_min ) }

        // Si vienen ambos filtros de precio, los combinamos con $and para que se apliquen simultáneamente (//https://www.mongodb.com/es/docs/manual/reference/operator/query/and/)
        if (filter?.precio_min && filter?.precio_max)
            filterMongo.$and = [
                {
                    precio: { $lte: parseInt(filter?.precio_max) }
                },
                {
                    precio: { $gte: parseInt(filter?.precio_min) }
                }
            ]                                                             

        return db.collection("cafes").find( filterMongo ).toArray()
    } catch (error) {
        return []
    }
}


/**
 * getProductosById - Busca un único producto por su _id de MongoDB.
 *
 * Usa ObjectId() para convertir el string del id (que llega desde la URL)
 * al tipo de dato que MongoDB espera internamente.
 *
 * @param {string} id - El _id del documento en MongoDB (string de 24 caracteres hex).
 * @returns {Promise<Object|null>} Promise que resuelve con el documento encontrado,
 *                                 null si no existe, o {} si hubo un error.
 */
export async function getProductosById(id) {
    try {
        await client.connect()

        // Aca busco en la colección "cafes" un documento (registro) cuyo _id sea igual al id que le pasamos y lo convierto a ObjectId para que MongoDB lo entienda. Si no encuentra nada, devuelve null.
        return db.collection("cafes").findOne({ _id: new ObjectId(id) })
    } catch (error) {
        return {}
    }
}


/**
 * productSave - Inserta un nuevo producto en la colección "cafes".
 *
 * @param {Object} producto - Objeto con los datos del nuevo producto (nombre, precio, etc.)
 * @returns {Promise<InsertOneResult>} Promise con el resultado de la operación de inserción.
 * @throws {Error} Si la conexión a MongoDB falla o la inserción no se puede completar.
 */
export async function productSave(producto) {
    try {
        await client.connect()
        return db.collection("cafes").insertOne(producto)
    } catch (error) {
        throw new Error(error)
    }
}


/**
 * editProduct - Actualiza los campos de un producto existente por su _id.
 *
 * Separa el _id del resto del objeto para usarlo como filtro de búsqueda,
 * y envía el resto de los campos con el operador $set (actualización parcial).
 *
 * @param {Object} producto     - Objeto con los datos a actualizar. Debe incluir _id.
 * @param {string} producto._id - El _id del documento a modificar.
 * @returns {Promise<string>} Promise que resuelve con el _id del producto editado.
 * @throws {Error} Si la operación de actualización falla.
 */
export async function editProduct(producto) {
    try {
        await client.connect()

        // Opción A — sin destructuring, campos explícitos en el $set:
        // await db.collection("cafes").updateOne(
        //     { _id: new ObjectId(producto._id) },
        //     { $set: { nombre: producto.nombre, precio: producto.precio } }
        // )
        // Funciona igual, pero si el modelo crece hay que agregar cada campo a mano acá.

        // Opción B (actual) — destructuring: separa _id del resto del objeto.
        // ...productoSinId captura todos los campos excepto _id, sin importar cuántos sean.
        const { _id, ...productoSinId } = producto

        // $set: actualiza solo los campos enviados, sin pisar el documento completo
        await db.collection("cafes").updateOne(
            { _id: new ObjectId(_id) },
            { $set: productoSinId }
        )

        return producto._id
    } catch (error) {
        throw new Error(error)
    }
}


/**
 * deleteProduct - Realiza un soft delete marcando el producto con borrado: true.
 *
 * En lugar de eliminar el documento de la colección, le agrega la propiedad
 * borrado: true usando $set. Esto conserva el historial y permite restaurar.
 * Los productos borrados quedan excluidos automáticamente en getProductos().
 *
 * @param {string} id - El _id del documento a marcar como borrado.
 * @returns {Promise<string>} Promise que resuelve con el id del producto borrado.
 * @throws {Error} Si la operación de actualización falla.
 */
export async function deleteProduct(id) {
    try {
        await client.connect()

        // Soft delete: no elimina el documento, solo setea borrado: true
        await db.collection("cafes").updateOne(
            { _id: new ObjectId(id) },// Filtro para encontrar el documento por su _id. Le pasamos el id de la ruta convertido a ObjectId para que MongoDB lo entienda.
            { $set: { borrado: true } } // Operación de actualización: setea la propiedad borrado a true para marcarlo como eliminado.
        )

        return id
    } catch (error) {
        throw new Error(error)
    }
}
