/**
 * utils.js
 *
 * Utilidad que genera la estructura base de una página HTML completa.
 * Todas las views la usan para envolver su contenido con el <head>, navbar,
 * Bootstrap y scripts, igual que los archivos HTML estáticos de /public.
 */

/**
 * createPage - Envuelve un fragmento de HTML en una página completa.
 *
 * Incluye:
 *  - Bootstrap 5.3.3 (CSS + JS)
 *  - Navbar idéntica a la de los archivos estáticos (bg-dark, CaféApp)
 *  - Contenedor con el mismo layout (row m-0 p-4) que usan los HTML estáticos
 *
 * @param {string} content - Fragmento HTML que irá dentro del contenedor principal.
 * @returns {string} Página HTML completa como string.
 */
export function createPage(content) {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CaféApp</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
</head>
<body class="container-fluid p-0">

    <nav class="navbar navbar-expand-lg navbar-dark bg-dark px-3">
        <a class="navbar-brand" href="/index.html">CaféApp</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navMenu">
            <ul class="navbar-nav ms-auto">
                <li class="nav-item"><a class="nav-link" href="/index.html">Home</a></li>
                <li class="nav-item"><a class="nav-link active" href="/productos">Productos</a></li>
                <li class="nav-item"><a class="nav-link" href="/contacto.html">Contacto</a></li>
                <li class="nav-item"><a class="nav-link" href="/quienes-somos.html">Quiénes somos</a></li>
            </ul>
        </div>
    </nav>

    <div class="row m-0 p-4">
        ${content}
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`
}

export default { createPage }
