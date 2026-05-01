/**
 * products.controllers.js
 *
 * Capa de CONTROLADORES dentro del patrón MVC (Modelo - Vista - Controlador).
 *
 * Responsabilidad de esta capa:
 *   - Recibir la solicitud HTTP que llega desde el router (req, res).
 *   - Delegar la lógica de datos al SERVICE (products.services.js).
 *   - Delegar la construcción del HTML a la VIEW (products.views.js).
 *   - Devolver la respuesta al cliente con res.send().
 *
 * El controlador NO sabe cómo se leen los datos ni cómo se arma el HTML;
 * sólo "orquesta" a quién pedirle cada cosa.
*/

//Importaciones:
/*   - productsService: funciones que acceden/modifican los datos (archivos, BD, etc.)
*   - productsView:    funciones que construyen el HTML que se envía al navegador.
*/
import * as productsService from "../services/products.services.js"
import * as productsView from "../views/products.views.js"

/**
 * getProductos - Devuelve el listado completo de productos.
 *
 * Flujo:
 *  1. El router llama a esta función cuando llega GET /productos.
 *  2. Se llama al servicio para obtener todos los productos (devuelve una Promise).
 *  3. Si la Promise resuelve (then): se genera el HTML con la view y se envía al cliente.
 *  4. Si la Promise rechaza (catch): se envía un mensaje de error genérico.
 *
 * @param {import('express').Request}  req - Objeto de solicitud de Express.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 */
export function getProductos(req, res){
    // Pide todos los productos al service, llegan en un array llamado "cafes" (aunque podrían ser "productos", el nombre es arbitrario)
    productsService.getProductos()
        // Construye el HTML con la lista y lo envía                             
        .then(cafes => res.send(productsView.createProductList(cafes)))
        // Si algo falla, avisa al cliente  
        .catch(err => res.send("No se pudo leer el archivo"))            
}

/**
 * getProductosById - Devuelve un producto específico según su ID.
 *
 * Flujo:
 *  1. El router llama a esta función cuando llega GET /productos/:id.
 *  2. Se extrae el parámetro dinámico :id de la URL con req.params.id.
 *     Ejemplo: si la URL es /productos/3, entonces id = "3".
 *  3. Se llama al servicio pasándole el id para que busque ese producto.
 *  4. Si se encuentra (then): se arma la página del producto con la view.
 *  5. Si no se encuentra o hay error (catch): se muestra la página 404.
 *
 * @param {import('express').Request}  req - Contiene req.params.id con el ID del producto.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 */
export function getProductosById(req, res){
    // Extrae el :id de la URL (ej: /productos/3 → id = "3")
    const id = req.params.id                                    
    productsService.getProductosById(id)
        // Construye y envía la página del producto
        .then( cafe => res.send(productsView.createProductPage(cafe)))
        // Si no existe, muestra la página 404   
        .catch( err => res.send(productsView.create404Page()))           
}

/**
 * productForm - Devuelve el formulario HTML para agregar un nuevo producto.
 *
 * Flujo:
 *  1. El router llama a esta función cuando llega GET /productos/agregar.
 *  2. No necesita consultar el servicio porque sólo muestra un formulario vacío.
 *  3. La view construye el HTML del formulario y se envía directamente.
 *
 * @param {import('express').Request}  req - Objeto de solicitud (no se usa aquí).
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 */
export function productForm(req, res){
    // Construye el formulario HTML y lo envía al navegador
    res.send( productsView.createProductForm() )    
}

/**
 * productSave - Guarda un nuevo producto recibido desde el formulario.
 *
 * Flujo:
 *  1. El router llama a esta función cuando llega POST /productos/agregar.
 *  2. Los datos del formulario HTML llegan en req.body (gracias al middleware
 *     express.urlencoded que está configurado en main.js).
 *     Ejemplo: { nombre: "Espresso", precio: "500" }
 *  3. Se llama al servicio para que persista el nuevo producto.
 *  4. Si se guarda bien (then): se muestra la página del producto recién creado.
 *  5. Si hay un error (catch): se avisa al cliente con un mensaje genérico.
 *
 * @param {import('express').Request}  req - Contiene req.body con los datos del formulario.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 */
export function productSave(req, res){
    // req.body trae los campos del formulario: { nombre, precio }
    const producto = req.body
    // Se imprime en consola para depuración (ver qué llega)                       
    console.log(producto)                           
    productsService.productSave(producto)
        // Muestra el producto ya guardado (con el id asignado, pero es el mismo objeto "producto" que se le pasó al servicio, sólo que con el id agregado)
        .then( (productoGuardado) => res.send(productsView.createProductPage(productoGuardado)))
        // Si falla, avisa al cliente  
        .catch( (err) => res.send("No se pudo guardar el archivo") )                             
}


/**
 * editProductForm - Devuelve el formulario HTML pre-rellenado para editar un producto.
 *
 * Flujo:
 *  1. El router llama a esta función cuando llega GET /productos/editar/:id.
 *  2. Se extrae el :id de la URL.
 *  3. Se llama al servicio para obtener el producto actual (para pre-rellenar el form).
 *  4. Si se encuentra (then): se arma el formulario de edición con los datos actuales.
 *  5. Si falla (catch): se avisa al cliente con un mensaje de error.
 *
 * @param {import('express').Request}  req - Contiene req.params.id con el ID del producto.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 */
export function editProductForm(req, res) {
    // Extrae el :id de la URL (ej: /productos/editar/3 → id = "3")
    const id = req.params.id
    productsService.getProductosById(id)
        // Construye y envía el formulario con los datos actuales del producto
        .then(producto => res.send(productsView.editProductForm(producto)))
        .catch((err) => res.send("No se pudo editar el archivo"))
}

/**
 * productEdit - Guarda los cambios de un producto editado.
 *
 * Flujo:
 *  1. El router llama a esta función cuando llega POST /productos/editar/:id.
 *  2. Se extrae el :id de la URL y los campos nuevos de req.body.
 *  3. Se arma un objeto producto con nombre y precio actualizados.
 *  4. Se llama al servicio para que aplique los cambios en el archivo JSON.
 *  5. Si se guarda bien (then): se muestra la página de detalle del producto editado.
 *  6. Si falla (catch): se avisa al cliente con un mensaje de error.
 *
 * @param {import('express').Request}  req - Contiene req.params.id y req.body con los datos.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 */
export function productEdit(req, res) {
    // Extrae el :id de la URL
    const id = req.params.id
    // Arma el objeto con los campos editados que llegan del formulario
    const producto = {
        nombre: req.body.nombre,
        precio: req.body.precio
    }
    productsService.editProduct(id, producto)
        // El servicio devuelve { nombre, precio } sin id → se lo agregamos desde el closure
        // para que createProductPage pueda mostrar el badge con el número correcto
        .then( productoEditado => res.send(productsView.createProductPage({ ...productoEditado, id })) )
        .catch( err => res.send("No se pudo editar") )
}

/**
 * deleteProductform - Devuelve la página de confirmación para eliminar un producto.
 *
 * Flujo:
 *  1. El router llama a esta función cuando llega GET /productos/borrar/:id.
 *  2. Se extrae el :id de la URL.
 *  3. Se llama al servicio para obtener el producto (para mostrárselo al usuario).
 *  4. Si se encuentra (then): se muestra el formulario de confirmación de borrado.
 *  5. Si falla (catch): se avisa al cliente con un mensaje de error.
 *
 * @param {import('express').Request}  req - Contiene req.params.id con el ID del producto.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 */
export function deleteProductform(req, res){
    // Extrae el :id de la URL
    const id = req.params.id
    productsService.getProductosById(id)
        // Construye y envía la página de confirmación de borrado
        .then(producto => res.send(productsView.deleleProductForm(producto)))
        .catch((err) => res.send("No se pudo obtener el producto"))
}

/**
 * productDelete - Elimina un producto y redirige al listado.
 *
 * Flujo:
 *  1. El router llama a esta función cuando llega POST /productos/borrar/:id.
 *  2. Se extrae el :id de la URL.
 *  3. Se llama al servicio para marcar el producto como borrado (soft delete).
 *  4. Si se elimina bien (then): redirige al listado completo con res.redirect().
 *  5. Si falla (catch): se avisa al cliente con un mensaje de error.
 *
 * @param {import('express').Request}  req - Contiene req.params.id con el ID a eliminar.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 */
export function productDelete(req, res){
    // Extrae el :id de la URL
    const id = req.params.id
    productsService.deleteProduct( id )
        // Una vez borrado, redirige al listado de productos
        .then(() => res.redirect("/productos"))
        .catch( err => res.send("No se pudo borrar") )
}