/**
 * api/controllers/products.controllers.js
 *
 * Controladores de la API REST de productos.
 *
 * Diferencias clave respecto a los controladores del frontend (controllers/products.controllers.js):
 *
 *   1. No usan vistas: en lugar de res.send(html), usan res.status(código).json(datos).
 *      La respuesta siempre es JSON puro, no HTML.
 *
 *   2. Usan status codes HTTP explícitos y semánticamente correctos:
 *      200 OK, 201 Created, 202 Accepted, 404 Not Found, 500 Internal Server Error.
 *
 *   3. Implementan todos los verbos REST: GET, POST, PUT, PATCH, DELETE.
 *
 *   4. PUT y PATCH hacen cosas distintas (ver detalle en cada función).
 *
 * Reutilizan el mismo service del frontend (../../services/products.services.js),
 * lo que demuestra que la capa de datos es independiente de quién la consume.
 */
import * as service from "../../services/products.services.js"

/**
 * getProductos - Devuelve todos los productos en formato JSON.
 * Acepta filtros opcionales de precio mínimo y máximo via query params (ej: /api/productos?precio_min=100&precio_max=500).
 * Respuestas:
 *   200 OK    → array de productos (puede ser [] si no hay ninguno)
 *   500 Error → no se pudo leer el archivo
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
export function getProductos(req, res) {
    return service.getProductos(req.query) // Se pasan los query params al service para filtrar por precio
        // 200 OK: todo bien, devuelve el array de productos como JSON
        .then(productos => res.status(200).json(productos))
        // 500: error inesperado del servidor (falla de lectura, etc.)
        .catch(err => res.status(500).json({ message: "No se pueden obtener los productos" }))
}

/**
 * getProductoById - Devuelve un producto específico por su id.
 *
 * Respuestas:
 *   200 OK    → { data: producto } — se envuelve en "data" por convención de APIs
 *   404       → el producto no existe (find() devolvió undefined)
 *   500 Error → error inesperado del servidor
 *
 * @param {import('express').Request}  req - Contiene req.params.id
 * @param {import('express').Response} res
 */
export function getProductoById(req, res) {
    const id = req.params.id;
    return service.getProductosById(id)
        .then(producto => {
            // Si find() no encontró el produdcto que le pasamos en el id, devuelve undefined → respondemos 404
            if (!producto) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }
            // 200 OK: producto encontrado, se devuelve dentro de un objeto { data: ... }
            // Envolver en "data" es una convención común en APIs para dejar espacio
            // a metadata futura (paginación, links, etc.) sin romper el contrato
            res.status(200).json({ data: producto });
        })
        .catch(err => res.status(500).json({ message: "Error interno del servidor" }))
}

/**
 * guardarProducto - Crea un nuevo producto con los datos recibidos en el body JSON.
 *
 * A diferencia del controlador del frontend que usa req.body directamente,
 * acá se construye el objeto explícitamente con solo los campos esperados.
 * Esto evita que el cliente inyecte campos no deseados (ej: req.body.id, req.body.borrado).
 *
 * Respuestas:
 *   201 Created → producto creado, se devuelve el objeto guardado
 *   500 Error   → no se pudo guardar
 *
 * @param {import('express').Request}  req - Contiene req.body.nombre y req.body.precio
 * @param {import('express').Response} res
 */
export function guardarProducto(req, res) {
    // Se construye el objeto explícitamente en lugar de pasar req.body directo,
    // para aceptar solo los campos que corresponden (nombre y precio)
    const producto = {
        nombre: req.body.nombre,
        precio: req.body.precio
    }
    service.productSave(producto)
        // 201 Created: se creó el recurso correctamente
        .then(producto => res.status(201).json(producto))
        .catch(err => res.status(500).json({ message: "Error a interntar guardar el producto" }))
}

/**
 * borrarProducto - Elimina un producto por su id (soft delete).
 *
 * IMPORTANTE — Soft Delete:
 * El producto NO se borra físicamente del archivo JSON. En cambio,
 * el service le agrega la propiedad `borrado: true`.
 * getProductos() filtra los productos con `borrado: true`, por lo que
 * dejan de aparecer en el listado sin perder el registro histórico.
 *
 * Para detectar si el producto existía, se verifica que el objeto
 * devuelto por el service NO esté vacío (Object.keys != 0).
 *
 * Respuestas:
 *   202 Accepted → producto marcado como borrado, se devuelve el objeto
 *   404          → el id no corresponde a ningún producto existente
 *   500 Error    → no se pudo procesar
 *
 * @param {import('express').Request}  req - Contiene req.params.id
 * @param {import('express').Response} res
 */
export function borrarProducto(req, res) {
    const id = req.params.id
    service.deleteProduct(id)
        .then((producto) => {
            // El service devuelve {} si no encontró el producto con ese id, etonces, pregunto si el objeto no está vacío para saber si se pudo marcar como borrado o no se encontró el producto.
            //Si el objeto no está vacío, se marcó como borrado → 202 Accepted
            if (Object.keys(producto).length != 0) {
                // 202 Accepted: la operación fue aceptada y procesada
                res.status(202).json(producto)
                return
            }
            // Si el objeto está vacío, el producto no existía
            res.status(404).json({ message: "El producto solicitado para borrar no existe" })
        })
        .catch(err => res.status(500).json({ message: "No se pudo borrar el producto" }))
}

/**
 * reemplazarProducto - Reemplaza COMPLETAMENTE un producto (verbo PUT).
 *
 * PUT significa "reemplazar el recurso entero".
 * Se construye un objeto nuevo con los datos del body y se sobreescribe
 * el producto existente. Si no mandás algún campo, ese campo queda
 * como undefined en el registro — no se conserva el valor anterior.
 *
 * Usá req.body?.nombre (optional chaining) porque el campo puede no venir
 * en el body; en ese caso queda undefined en lugar de lanzar un error.
 *
 * Respuestas:
 *   202 Accepted → producto reemplazado
 *   404          → no se encontró el producto con ese id
 *   500 Error    → no se pudo procesar
 *
 * @param {import('express').Request}  req - Contiene req.params.id, req.body.nombre, req.body.precio
 * @param {import('express').Response} res
 */
export function reemplazarProducto(req, res) {
    const id = req.params.id
    // Se construye el objeto con solo los campos del body; si falta algún campo queda undefined
    const producto = {
        _id: id, // El _id se toma de req.params, no del body
        nombre: req.body?.nombre,   // ?. (optional chaining): si req.body es undefined, no lanza error y lo guarda como undefined
        precio: req.body?.precio
    }
    //console.log(producto)
   
    service.editProduct(producto)
        .then(producto => {
            if (Object.keys(producto) != 0) {
                res.status(202).json(producto)
                return 
            }
            res.status(404).json({ message: "No pude encontrar el producto" })
        })
        .catch(err => res.status(500).json({ message: "No se puede reemplazar el producto" }))
}

/**
 * actualizarProducto - Actualiza SOLO los campos enviados en el body (verbo PATCH).
 *
 * PATCH vs PUT:
 *   PUT   → reemplaza el objeto entero (lo que no mandás queda undefined)
 *   PATCH → solo modifica los campos que mandás; el resto se conserva del original
 *
 * Para lograr esto, primero se busca el producto existente con getProductosById(),
 * y luego se construye el objeto final usando un ternario:
 *   si el campo viene en el body → usá el nuevo valor
 *   si no viene                  → conservá el valor que ya tenía
 *
 * Por eso esta función es async/await: necesita esperar el resultado de
 * getProductosById antes de poder construir el objeto actualizado.
 *
 * Respuestas:
 *   202 Accepted → producto actualizado
 *   404          → no se encontró el producto con ese id
 *   500 Error    → no se pudo procesar
 *
 * @param {import('express').Request}  req - Contiene req.params.id y los campos a actualizar en req.body
 * @param {import('express').Response} res
 */
export async function actualizarProducto(req, res) {
    const id = req.params.id

    // Primero busca el producto actual para conservar los campos que no se manden
    const productoAntiguo = await service.getProductosById(id)

    const producto = {
        _id: id, // El _id se toma de req.params, no del body
        nombre: req.body?.nombre || productoAntiguo.nombre, // Si viene nombre en el body, lo uso; si no, conservo el nombre antiguo
        precio: req.body?.precio || productoAntiguo.precio,
    }


    service.editProduct(producto)
        .then(producto => {
            // El service devuelve {} si no encontró el producto con ese id, entonces, pregunto si el objeto no está vacío para saber si se pudo actualizar o no se encontró el producto.
            // Si el objeto no está vacío, se actualizó → 202 Accepted
            if (Object.keys(producto) != 0) {
                res.status(202).json(producto)
                return
            }
            // Si el objeto está vacío, el producto no existía
            res.status(404).json({ message: "El producto solicitado para actualizar no existe" })
        })
        .catch(err => res.status(500).json({ message: "No se puede actualizar el producto" }))
}
