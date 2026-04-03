// Función que crea una página HTML a partir de un contenido dado
export function createPage(content){
    let html = ""
    html += `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Document</title></head><body>`
    html += `<header>Mi espectacular pagina web</header>`
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