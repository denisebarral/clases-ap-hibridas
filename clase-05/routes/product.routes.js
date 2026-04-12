/**
 * product.routes.js
 *
 * Capa de RUTAS (Router) de Express.
 *
 * Responsabilidad de esta capa:
 *   - Definir qué función del controlador se ejecuta según la URL y el método HTTP
 *     de cada solicitud entrante.
 *   - Actúa como "tabla de despacho": recibe la solicitud y la dirige al controlador
 *     correcto, sin ocuparse de la lógica ni de los datos.
 *
 * ¿Por qué usar Router en lugar de poner todo en main.js?
 *   - Separación de responsabilidades: main.js solo configura la app;
 *     las rutas viven en su propio archivo.
 *   - Escalabilidad: si el proyecto crece, podés tener product.routes.js,
 *     user.routes.js, order.routes.js, etc., y registrarlos todos en main.js
 *     con un simple app.use().
 *
*/

//Importaciones:
 /*   - express:             framework HTTP de Node.js.
 *   - productsController:  todas las funciones controladoras de productos.
 */
import express from "express"
import * as productsController from "../controllers/products.controllers.js"

// express.Router() crea una instancia de router "mini-app" que puede tener
// sus propias rutas y middlewares, y luego se monta en la app principal (main.js).
const route = express.Router()

// GET /productos → muestra el listado completo de productos
route.get("/productos", productsController.getProductos)

// GET /productos/agregar → muestra el formulario para agregar un nuevo producto
// ⚠️  IMPORTANTE: esta ruta debe estar ANTES de /productos/:id.
// Si estuviera después, Express interpretaría "agregar" como un :id y
// llamaría a getProductosById con id = "agregar", lo cual devolvería un 404.
route.get("/productos/agregar", productsController.productForm)

// POST /productos/agregar → recibe los datos del formulario y guarda el nuevo producto
// Usa POST porque está enviando datos para crear un recurso (no solo consultando).
route.post("/productos/agregar", productsController.productSave)

// GET /productos/:id → muestra el detalle de un producto específico
// :id es un parámetro dinámico: /productos/1, /productos/2, etc.
// Express lo captura y lo pone disponible en req.params.id dentro del controlador.
route.get("/productos/:id", productsController.getProductosById)

// Se exporta el router para que main.js lo registre con app.use(ProductRoutes)
export default route
