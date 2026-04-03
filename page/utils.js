// Función que crea una página HTML a partir de un contenido dado
export function createPage(content){
    let html = ""
    html += `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Document</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"></head><body class="container-fluid p-0">`
    html += `<header class="bg-dark text-white p-3"><p class=" h4 m-0">Mi espectacular pagina web</p></header>`
    html += content
    html += "<body></html>"
    return html
}

// Función que crea una lista HTML de productos a partir de un array de cafés
export function createProductList(cafes){
    let html = ""
    html += "<h1>Listado de productos</h1>"
    html += "<ul>"
    cafes.forEach( cafe => html += "<li>"+ cafe.nombre +"</li>" )
    html += "</ul>"
    return html
}

// module.exports = { createPage, createProductList } // Esto es lo que se usaba antes para exportar el módulo en CommonJS
//export default { createPage, createProductList } // Esto es lo que se usa ahora para exportar el módulo en ES Modules