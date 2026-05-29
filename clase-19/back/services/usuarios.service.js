/**
 * usuarios.service.js
 *
 * Capa de servicios para la colección "usuarios".
 *
 * Responsabilidades:
 *   - Conectarse a la base de datos "AH20232CP1" en MongoDB Atlas.
 *   - Insertar nuevos usuarios y verificar credenciales en la colección "usuarios".
 *
 * Lo que NO hace:
 *   - No conoce Express: no recibe req ni res.
 *   - No hashea contraseñas (en producción esto sería obligatorio con bcrypt o argon2).
 *   - No genera tokens JWT (en producción el login devolvería un token, no los datos del usuario).
 */

import { MongoClient, ObjectId } from "mongodb"

const client = new MongoClient("mongodb+srv://denise_mongodb:mongodb123@cafe-app.neh6c59.mongodb.net/")
const db = client.db("AH20232CP1")


/**
 * createUser - Inserta un nuevo documento en la colección "usuarios".
 *
 * Si la colección "usuarios" no existe todavía en MongoDB, se crea automáticamente
 * la primera vez que se ejecuta insertOne(). No hace falta crearla a mano en Compass.
 * MongoDB es "schema-less": crea colecciones y acepta cualquier estructura al vuelo.
 *
 * @param {Object} usuario - Datos del usuario provenientes del body (ya validados por el middleware).
 * @returns {Promise<Object>} El usuario insertado, con password omitida para no exponerla.
 * @throws {Error} Si la conexión a MongoDB falla.
 */
export async function createUser(usuario){
    await client.connect()

    await db.collection("usuarios").insertOne(usuario)

    // Spread + sobreescritura para devolver el objeto sin la contraseña.
    // { ...usuario } copia todas las propiedades; password: undefined las elimina al serializar a JSON.
    // En producción aquí se generaría y devolvería un token JWT en lugar del objeto del usuario.
    return { ...usuario, password: undefined }
}

/**
 * login - Busca un usuario por email y verifica que la contraseña coincida.
 *
 * findOne() con un filtro es equivalente a:
 *   SELECT * FROM usuarios WHERE email = '...' LIMIT 1
 *
 * Lanza Error en dos casos: email no encontrado o contraseña incorrecta.
 * Ambos lanzan el mismo mensaje para no revelar cuál de los dos datos falló.
 *
 * @param {Object} usuario - Objeto con email y password provenientes del body.
 * @returns {Promise<Object>} Datos del usuario sin password ni _id.
 * @throws {Error} Si el email no existe en la colección o la contraseña no coincide.
 */
export async function login(usuario){
    await client.connect()
    const existe = await db.collection("usuarios").findOne( {email: usuario.email} )

    // findOne() devuelve null si no encuentra nada. El throw corta la ejecución
    // y lo captura el .catch() del controller, que responde 400.
    if(!existe) throw new Error("No se pudo ingresar")

    // Comparación directa de strings (contraseña en texto plano — solo para clase).
    // En producción: bcrypt.compare(usuario.password, existe.password)
    if( usuario.password != existe.password ) throw new Error("No se pudo ingresar")

    // Se devuelve el usuario sin password ni _id para no exponer datos sensibles al cliente.
    return  { ...existe, password: undefined, _id: undefined }
}
