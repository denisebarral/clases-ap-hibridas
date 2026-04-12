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
 *
 * Importaciones:
 *   - createPage: función de utils.js que envuelve el contenido HTML en una
 *     estructura de página completa (con navbar, Bootstrap, etc.).
 */
import { createPage } from "../page/utils.js"

/**
 * createProductList - Genera la página con el listado de todos los productos.
 *
 * Recibe el array de productos y construye una grilla de cards Bootstrap,
 * una card por producto, con su nombre y un botón para ver el detalle.
 * También incluye un botón para ir al formulario de nuevo producto.
 *
 * @param {Array<Object>} cafes - Array de objetos producto (cada uno con al menos .id y .nombre).
 * @returns {string} HTML completo de la página con el listado.
 */
export function createProductList(cafes) {
    let html = ""

    // Encabezado de la sección con descripción
    html += `<div class="col-12 mb-4">`
    html += `<h1>Productos</h1>`
    html += `<p class="lead">Nuestros cafés disponibles.</p>`
    // Botón para ir al formulario de alta de nuevo producto
    html += `<a href="/productos/agregar" class="btn btn-dark">+ Nuevo producto</a>`
    html += `</div>`

    // Grilla de cards: 1 columna en mobile, 2 en tablet, 3 en desktop
    html += `<div class="col-12"><div class="row g-3">`

    cafes.forEach(cafe => {
        html += `<div class="col-12 col-md-6 col-lg-4">`
        html += `<div class="card h-100 shadow-sm">`
        html += `<div class="card-body d-flex flex-column">`
        html += `<h5 class="card-title">${cafe.nombre}</h5>`
        // El precio puede no estar en todos los productos del listado, se muestra solo si existe
        if (cafe.precio) {
            html += `<p class="card-text text-muted">$${cafe.precio}</p>`
        }
        // El link al detalle ocupa el espacio restante de la card (mt-auto lo empuja al fondo)
        html += `<a href="/productos/${cafe.id}" class="btn btn-outline-dark mt-auto">Ver detalle</a>`
        html += `</div></div></div>`
    })

    html += `</div></div>`

    // Envuelve el contenido en la estructura base de página
    return createPage(html)
}

/**
 * createProductPage - Genera la página de detalle de un producto específico.
 *
 * Muestra el id, nombre y precio del producto en una card centrada,
 * más un link para volver al listado.
 *
 * @param {Object} producto - Objeto con los datos del producto (.id, .nombre, .precio).
 * @returns {string} HTML completo de la página de detalle.
 */
export function createProductPage(producto) {
    let html = ""

    html += `<div class="col-12 col-md-6 col-lg-4">`
    html += `<div class="card shadow-sm">`
    html += `<div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">`
    // Badge con el id del producto en el encabezado de la card
    html += `<span>Detalle del producto</span>`
    html += `<span class="badge bg-secondary">#${producto.id}</span>`
    html += `</div>`
    html += `<div class="card-body">`
    // Nombre del producto como título principal
    html += `<h4 class="card-title">${producto.nombre}</h4>`
    html += `<p class="text-muted mb-1">Precio</p>`
    // Precio destacado con tamaño grande
    html += `<p class="fs-4 fw-bold">$${producto.precio}</p>`
    html += `</div>`
    html += `<div class="card-footer bg-white">`
    // Link para volver al listado
    html += `<a href="/productos" class="btn btn-outline-dark btn-sm">← Volver al listado</a>`
    html += `</div>`
    html += `</div>`
    html += `</div>`

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

    html += `<div class="col-12 text-center py-5">`
    html += `<h1 class="display-1 fw-bold text-secondary">404</h1>`
    html += `<h2 class="mb-3">Producto no encontrado</h2>`
    html += `<p class="lead text-muted mb-4">El producto que buscás no existe o fue eliminado.</p>`
    // Link para volver al listado
    html += `<a href="/productos" class="btn btn-dark">← Volver al listado</a>`
    html += `</div>`

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

    html += `<div class="col-12 mb-3">`
    html += `<h1>Agregar producto</h1>`
    html += `<p class="lead">Completá los datos del nuevo café.</p>`
    html += `</div>`

    html += `<div class="col-12 col-md-6 col-lg-4">`
    // El action y method del form determinan a qué ruta y con qué método HTTP se envían los datos
    html += `<form action="/productos/agregar" method="post">`

    html += `<div class="mb-3">`
    html += `<label class="form-label fw-semibold">Nombre</label>`
    html += `<p class="text-muted small mb-1">El nombre del café tal como aparecerá en el listado.</p>`
    // name='nombre' → llega como req.body.nombre
    html += `<input type="text" name="nombre" class="form-control" placeholder="Ej: Espresso, Cappuccino..." required />`
    html += `</div>`

    html += `<div class="mb-4">`
    html += `<label class="form-label fw-semibold">Precio</label>`
    html += `<p class="text-muted small mb-1">Ingresá el precio en pesos, sin símbolos.</p>`
    // name='precio' → llega como req.body.precio
    html += `<input type="number" name="precio" class="form-control" placeholder="Ej: 1500" min="0" required />`
    html += `</div>`

    // Botón que dispara el POST
    html += `<div class="d-flex gap-2">`
    html += `<input type="submit" value="Guardar producto" class="btn btn-dark" />`
    // Link para cancelar y volver al listado
    html += `<a href="/productos" class="btn btn-outline-secondary">Cancelar</a>`
    html += `</div>`

    html += `</form>`
    html += `</div>`

    return createPage(html)
}
