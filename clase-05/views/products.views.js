/**
 * products.views.js
 *
 * Capa de VISTAS dentro del patrón MVC.
 *
 * Responsabilidad de esta capa:
 *   - Construir y devolver el HTML que se enviará al navegador.
 *   - Recibe datos puros (objetos, arrays) y los convierte en strings HTML.
 *   - NO sabe de dónde vienen los datos ni cómo se guardan: eso es trabajo
 *     del service. Tampoco sabe nada de la solicitud HTTP: eso es del controller.
 *
 * Todas las funciones devuelven un string HTML completo (página entera),
 * gracias a que delegan la estructura base a createPage() de utils.js.
*/


 //Importaciones:
 /*   - createPage: función de utils.js que envuelve el contenido HTML en una
 *     estructura de página completa (con <html>, <head>, <body>, etc.).
 */
import { createPage } from "../page/utils.js"

/**
 * createProductList - Genera la página con el listado de todos los productos.
 *
 * Recibe el array de productos y construye una lista <ul> con cada producto,
 * incluyendo un link para ver el detalle de cada uno.
 * También incluye un link para ir al formulario de nuevo producto.
 *
 * @param {Array<Object>} cafes - Array de objetos producto (cada uno con al menos .id y .nombre).
 * @returns {string} HTML completo de la página con el listado.
 */
export function createProductList(cafes) {
    let html = ""
    html += "<h1>Listado de productos</h1>"
    // Link para ir al formulario de alta
    html += "<a href='/productos/agregar'>Nuevo producto</a>"
    html += "<ul>"
    // Itera cada producto y construye un <li> con su nombre y un link al detalle
    // El link usa template literal para armar la URL dinámica: /productos/1, /productos/2, etc.
    cafes.forEach(cafe => html += "<li>" + cafe.nombre + `<a href="/productos/${cafe.id}" >Ver</a>` + "</li>")
    html += "</ul>"
    // Envuelve el contenido en la estructura base de página
    return createPage(html)
}

/**
 * createProductPage - Genera la página de detalle de un producto específico.
 *
 * Muestra el id, nombre y precio del producto, más un link para volver al listado.
 *
 * @param {Object} producto - Objeto con los datos del producto (.id, .nombre, .precio).
 * @returns {string} HTML completo de la página de detalle.
 */
export function createProductPage(producto) {
    let html = ""
    html += "<h1>Productos</h1>"
    // Muestra el id del producto
    html += "<p>"+ producto.id +"</p>"
    // Muestra el nombre
    html += "<h2>" + producto.nombre +"</h2>"
    // Muestra el precio con el símbolo $
    html += "<p>$" + producto.precio +"</p>"
    // Link para volver al listado
    html += "<a href='/productos' >Volver</a>"
    return createPage(html)
}

/**
 * create404Page - Genera la página de error 404 (producto no encontrado).
 *
 * Se llama desde el controlador cuando getProductosById() no encuentra
 * el producto solicitado (find() devuelve undefined).
 *
 * @returns {string} HTML completo de la página 404.
 */
export function create404Page() {
    let html = ""
    html += "<h1>404 page not found</h1>"
    // Link para volver al listado
    html += "<a href='/productos' >Volver</a>"
    return createPage(html)
}

/**
 * createProductForm - Genera la página con el formulario para agregar un nuevo producto.
 *
 * Construye un formulario HTML con:
 *   - action='/productos/agregar': a dónde se envían los datos (ruta POST en el router).
 *   - method='post': método HTTP que se usa al hacer submit.
 *   - Dos campos: "nombre" y "precio" (los name deben coincidir con lo que lee req.body en el controller).
 *   - Un botón de submit para enviar el formulario.
 *
 * @returns {string} HTML completo de la página con el formulario.
 */
export function createProductForm(){
    let html = ""
    html += "<h2>Agregar nuevo producto</h2>"
    // El action y method del form determinan a qué ruta y con qué método HTTP se envían los datos
    html += "<form action='/productos/agregar' method='post'>"
    html += "<div>"
    html += "<label>Nombre</label>"
    // name='nombre' → llega como req.body.nombre
    html += "<input type='text' name='nombre' />"
    html += "</div>"
    html += "<div>"
    html += "<label>Precio</label>"
    // name='precio' → llega como req.body.precio
    html += "<input type='text' name='precio' />"
    html += "</div>"
    // Botón que dispara el POST
    html += "<input type='submit' value='agregar' />"
    html += "</form>"
    // Link para cancelar y volver al listado
    html += "<a href='/productos' >Volver</a>"
    return createPage(html)
}
