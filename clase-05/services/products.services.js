/**
 * products.services.js
 *
 * Capa de SERVICIOS dentro del patrón MVC.
 *
 * Responsabilidad de esta capa:
 *   - Contener toda la lógica de acceso y manipulación de datos.
 *   - En este caso los datos viven en un archivo JSON local, pero en un proyecto
 *     real aquí iría la lógica de consultas a una base de datos, llamadas a APIs, etc.
 *   - Devolver Promises para que el controlador pueda encadenar .then() / .catch()
 *     o usar async/await.
 *
 * Esta capa NO conoce nada de HTTP: no sabe de req, res, ni de Express.
 * Solo trabaja con datos puros.
*/

//Importaciones:
 /*  - readFile:  lee el contenido completo de un archivo (devuelve Promise).
 *   - writeFile: escribe contenido en un archivo (devuelve Promise).
 *   - access:    verifica si un archivo existe y/o si tenemos permisos sobre él (devuelve Promise).
 *   - constants: objeto con constantes de modo de acceso (F_OK, R_OK, W_OK, etc.).
 *
 * NOTA: todas vienen del módulo nativo "fs/promises" de Node.js (no de Express).
 */
import { readFile, writeFile, access } from "fs/promises"
import { constants } from "fs" 

/**
 * Ruta del archivo JSON que actúa como "base de datos" de productos.
 *
 * ⚠️  ATENCIÓN: el nombre "productossssssssssss.json" tiene las "s" de más A PROPÓSITO.
 * El profe lo dejó así para forzar un error y demostrar cómo se maneja:
 *  - En getProductos()  → el catch devuelve [] (array vacío) en vez de explotar.
 *  - En productSave()   → el access() lanza error y lo captura el catch del try/catch.
 * Cuando quieras que funcione de verdad, cambiá el nombre a "productos.json".
 */
const archivo = "./data/productos.json"
//const archivo = "./data/productossssssssssss.json"


/**
 * getProductos - Lee todos los productos del archivo JSON.
 *
 * Usa readFile() para leer el archivo de texto, luego JSON.parse() para
 * convertir ese texto en un array de objetos JavaScript.
 *
 * Si el archivo no existe o hay cualquier error de lectura, el catch
 * devuelve un array vacío [] para que la app no se rompa.
 *
 * @returns {Promise<Array>} Promise que resuelve con el array de productos,
 *                           o con [] si hubo un error.
 */
export function getProductos() {
    // Lee el archivo como texto en codificación UTF-8
    return readFile(archivo, "utf-8")
        // Convierte el string JSON → array de objetos JS   
        .then(cafes => JSON.parse(cafes)) 
        // Si falla (ej: archivo no existe), devuelve array vacío  
        .catch(err => [])                   
}

/**
 * getProductosById - Busca un producto por su ID.
 *
 * Reutiliza getProductos() para obtener todos los productos y luego
 * usa Array.find() para buscar el que tenga el id coincidente.
 *
 * Usa == (doble igual) en lugar de === para comparar sin importar el tipo,
 * ya que el id que viene de la URL es un string ("3") y el del JSON puede
 * ser un número (3).
 *
 * Si no encuentra nada, find() devuelve undefined → el controlador lo
 * trata con el catch y muestra la página 404.
 *
 * @param {string|number} id - El ID del producto a buscar.
 * @returns {Promise<Object|undefined>} Promise que resuelve con el producto encontrado,
 *                                      o undefined si no existe.
 */
export function getProductosById(id) {
    // Primero trae todos los productos
    return getProductos()     
            // Luego busca el que tenga ese id (== sin importar tipo)                                  
            .then( cafes => cafes.find( cafe => cafe.id == id ) )   
}

/**
 * productSave - Agrega un nuevo producto al archivo JSON.
 *
 * Usa async/await en lugar de .then()/.catch() para hacer el código
 * más legible cuando hay múltiples operaciones asíncronas encadenadas.
 *
 * Pasos:
 *  1. Obtiene todos los productos existentes con getProductos().
 *  2. Asigna un id nuevo al producto (longitud del array + 1).
 *  3. Agrega el nuevo producto al array.
 *  4. Verifica que el archivo exista y sea accesible con access() + constants.F_OK.
 *  5. Si el archivo existe, lo sobreescribe con todos los productos (incluido el nuevo).
 *  6. Devuelve el producto recién guardado para que el controlador pueda mostrarlo.
 *
 * @param {Object} producto - Objeto con los datos del nuevo producto (nombre, precio, etc.)
 * @returns {Promise<Object>} Promise que resuelve con el producto guardado.
 * @throws {Error} Si el archivo no existe o no se puede escribir.
 */
export async function productSave(producto){
    try {
        // 1. Trae todos los productos del archivo
        const productos = await getProductos() 
        // 2. Asigna un id nuevo (cantidad actual + 1)         
        producto.id = productos.length + 1
        // 3. Agrega el nuevo producto al array en memoria              
        productos.push(producto)
        // 4. Verifica que el archivo exista (lanza error si no existe)                        
        await access(archivo, constants.F_OK)
        // 5. Sobreescribe el archivo con el array actualizado           
        await writeFile( archivo, JSON.stringify(productos) )
        // 6. Devuelve el producto guardado al controlador   
        return producto                                
    } catch (error) {
        // Si algo falló (archivo no existe, sin permisos, etc.), relanza el error
        throw new Error(error)                          
    }
}


// =============================================================================
// REFERENCIA: funciones y constantes usadas en este archivo
// =============================================================================
//
// Todas las siguientes vienen del módulo nativo "fs" de Node.js (File System).
// No son de Express. Node.js las provee para interactuar con el sistema de archivos
// del sistema operativo.
//
// --- readFile(path, encoding) ---
//   Módulo: "fs/promises"
//   Lee el contenido completo de un archivo de forma ASÍNCRONA.
//   Devuelve una Promise que resuelve con el contenido del archivo como string
//   (si se pasa "utf-8") o como Buffer (si no se pasa encoding).
//   Ejemplo:
//     const contenido = await readFile("./archivo.txt", "utf-8")
//     // contenido → "[{\"id\":1,\"nombre\":\"Espresso\"}]"
//
// --- writeFile(path, data) ---
//   Módulo: "fs/promises"
//   Escribe (o sobreescribe) un archivo con el contenido indicado, de forma ASÍNCRONA.
//   Si el archivo no existe lo crea. Si ya existe, lo pisa completamente.
//   Devuelve una Promise que resuelve con undefined cuando termina de escribir.
//   Ejemplo:
//     await writeFile("./archivo.txt", JSON.stringify(arrayDeObjetos))
//
// --- access(path, mode) ---
//   Módulo: "fs/promises"
//   Verifica si Node.js puede acceder al archivo en la ruta indicada, según el
//   modo de acceso especificado. Devuelve una Promise:
//     - Resuelve (sin valor) si el acceso es posible.
//     - Rechaza con un error si NO es posible (archivo no existe, sin permisos, etc.)
//   Se usa como "guardia" antes de intentar leer o escribir un archivo.
//   Ejemplo:
//     await access("./archivo.json", constants.F_OK)
//     // Si llega acá, el archivo existe. Si no, salta al catch.
//
// --- constants (objeto de fs) ---
//   Módulo: "fs" (no de "fs/promises", aunque en Node moderno también está ahí)
//   Es un objeto que contiene constantes numéricas usadas como "modos" para
//   indicarle a access() qué tipo de permiso queremos verificar:
//
//     constants.F_OK  → "File OK": ¿existe el archivo? (no importa si tenemos permisos de lectura/escritura)
//     constants.R_OK  → "Read OK": ¿podemos leer el archivo?
//     constants.W_OK  → "Write OK": ¿podemos escribir en el archivo?
//     constants.X_OK  → "eXecute OK": ¿podemos ejecutar el archivo? (más usado en Linux/Mac)
//
//   En este código se usa F_OK para simplemente chequear que el archivo exista
//   antes de intentar sobreescribirlo con writeFile.
//   Si el archivo no existe (como ocurre con el nombre "productossssssssssss.json"),
//   access() rechaza la Promise → salta al catch → se lanza el error.
