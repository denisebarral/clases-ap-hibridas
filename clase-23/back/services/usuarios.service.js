/**
 * usuarios.service.js
 *
 * Capa de servicios para la colección "usuarios".
 *
 * Responsabilidades:
 *   - Conectarse a la base de datos "AH20232CP1" en MongoDB Atlas.
 *   - Insertar nuevos usuarios (con contraseña hasheada) y verificar credenciales.
 *   - Generar un token JWT al hacer login exitoso.
 *
 * Lo que NO hace:
 *   - No conoce Express: no recibe req ni res.
 *   - No guarda el token en la base de datos (JWT es stateless).
 */

import { MongoClient, ObjectId } from "mongodb"
import bcrypt from "bcryptjs"
import { createToken } from "./token.service.js"

const client = new MongoClient("mongodb+srv://denise_mongodb:mongodb123@cafe-app.neh6c59.mongodb.net/")
const db = client.db("AH20232CP1")


/**
 * createUser - Inserta un nuevo usuario en la colección con la contraseña hasheada.
 *
 * Novedades respecto a clase-20:
 *   1. Verifica si el email ya existe antes de insertar (evita duplicados).
 *   2. Hashea la contraseña con bcrypt antes de guardarla.
 *   3. Excluye passwordConfirm del documento que se guarda en MongoDB.
 *
 * @param {Object} usuario - Datos del usuario provenientes del body (ya validados por el middleware).
 * @returns {Promise<Object>} El usuario insertado, con password omitida para no exponerla.
 * @throws {Error} Si el email ya existe o si la conexión a MongoDB falla.
 */
export async function createUser(usuario){
    await client.connect()

    // Verificamos si ya existe un usuario con ese email antes de insertar.
    // findOne() devuelve null si no hay ningún documento con ese filtro.
    // Sin esta validación, podrían existir dos usuarios con el mismo email.
    const existe = await db.collection("usuarios").findOne({ email: usuario.email })
    if( existe ) throw new Error("No se pudo registra, mail existente")

    // bcrypt.hash(texto, saltRounds) → genera el hash de la contraseña.
    // El segundo argumento (11) es el "costo": cuántas veces se aplica el algoritmo.
    // Cada nivel duplica el tiempo de cómputo. 11 es un valor seguro para producción.
    // Una vez hasheada, la contraseña NUNCA puede revertirse al texto original.
    // Equivalente en PHP: password_hash($password, PASSWORD_BCRYPT)
    usuario.password = await bcrypt.hash(usuario.password, 11)

    // Spread + passwordConfirm: undefined para no guardar la confirmación en la BD.
    // Solo interesa guardar email, password (ya hasheada) y age si existe.
    await db.collection("usuarios").insertOne({...usuario, passwordConfirm: undefined})

    return { ...usuario, password: undefined }
}

/**
 * login - Busca un usuario por email, verifica la contraseña hasheada y genera un JWT.
 *
 * Flujo:
 *   1. Busca el usuario en la BD por email.
 *   2. Compara la contraseña recibida con el hash guardado usando bcrypt.compare().
 *   3. Genera un token JWT con createToken() del token.service.js.
 *   4. Devuelve los datos del usuario + el token.
 *
 * @param {Object} usuario - Objeto con email y password provenientes del body.
 * @returns {Promise<Object>} Datos del usuario (sin password ni _id) + token JWT.
 * @throws {Error} Si el email no existe o la contraseña no coincide.
 */
export async function login(usuario){
   await client.connect()
   const existe = await db.collection("usuarios").findOne({ email: usuario.email })

    if (!existe) throw new Error("No se pudo ingresar, usuario inexistente")

    // bcrypt.compare(textoPlano, hash) → devuelve true si coinciden, false si no.
    // No es posible comparar con != porque la contraseña en BD está hasheada.
    // bcrypt recalcula el hash del texto recibido con el mismo salt y los compara.
    // Equivalente en PHP: password_verify($password, $hash)
    const passwordOk = await bcrypt.compare(usuario.password, existe.password)
    if( !passwordOk ) throw new Error("No se pudo ingresar, contraseña incorrecta")

    // Usamos createToken() del token.service.js para centralizar la lógica de tokens.
    // La clave secreta vive en .env (process.env.SECRET_PASSWORD), no hardcodeada.
    const token = createToken(existe)

    return { ...existe, password: undefined, _id: undefined, token: token }
}
