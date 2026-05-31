/**
 * usuarios.service.js
 *
 * Capa de servicios para la colección "usuarios".
 *
 * Responsabilidades:
 *   - Conectarse a la base de datos "AH20232CP1" en MongoDB Atlas.
 *   - Insertar nuevos usuarios y verificar credenciales.
 *   - Generar un token JWT al hacer login exitoso.
 *
 * Lo que NO hace:
 *   - No conoce Express: no recibe req ni res.
 *   - No hashea contraseñas (en producción esto sería obligatorio con bcrypt o argon2).
 *   - No guarda el token en la base de datos (JWT es stateless: el servidor no necesita guardarlo).
 */

import { MongoClient, ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

const client = new MongoClient("mongodb+srv://denise_mongodb:mongodb123@cafe-app.neh6c59.mongodb.net/")
const db = client.db("AH20232CP1")


/**
 * createUser - Inserta un nuevo documento en la colección "usuarios".
 *
 * Si la colección "usuarios" no existe todavía en MongoDB, se crea automáticamente
 * la primera vez que se ejecuta insertOne(). No hace falta crearla a mano en Compass.
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
    return { ...usuario, password: undefined }
}

/**
 * login - Busca un usuario por email, verifica la contraseña y genera un token JWT.
 *
 * Flujo:
 *   1. Busca el usuario en la BD por email.
 *   2. Verifica que la contraseña coincida.
 *   3. Genera un token JWT firmado con la clave secreta "1234".
 *   4. Devuelve los datos del usuario + el token.
 *
 * El token NO se guarda en la base de datos. El cliente lo recibe, lo guarda
 * (en localStorage o en memoria) y lo manda en cada request posterior.
 *
 * @param {Object} usuario - Objeto con email y password provenientes del body.
 * @returns {Promise<Object>} Datos del usuario (sin password ni _id) + token JWT.
 * @throws {Error} Si el email no existe o la contraseña no coincide.
 */
export async function login(usuario){
   await client.connect()
   const existe = await db.collection("usuarios").findOne({ email: usuario.email })

    if (!existe) throw new Error("No se pudo ingresar")
    if (usuario.password != existe.password) throw new Error("No se pudo ingresar")

    // jwt.sign(payload, secreto, opciones) → genera el token JWT.
    //
    // payload: los datos que queremos "guardar dentro" del token.
    //   Se usa spread para copiar los datos del usuario y se omiten password y _id
    //   para no exponerlos (cualquiera puede decodificar el payload del token).
    //
    // "1234": la clave secreta con la que se firma el token. En producción debe ser
    //   una cadena larga y aleatoria guardada en una variable de entorno (.env),
    //   NUNCA hardcodeada en el código.
    //
    // expiresIn: "2h" → el token vence en 2 horas. Después de ese tiempo,
    //   jwt.verify() lo rechaza automáticamente aunque la firma sea válida.
    const token = jwt.sign({ ...existe, password: undefined, _id: undefined }, "1234", { expiresIn: "2h" })

    console.log(token)

    // Se devuelve el token junto con los datos del usuario.
    // El cliente debe guardar este token y enviarlo en el header Authorization
    // de cada request a rutas protegidas.
    return { ...existe, password: undefined, _id: undefined, token: token }
}
