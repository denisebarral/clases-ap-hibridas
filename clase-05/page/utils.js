export function createPage(content) {
    let html = ""
    html += `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Document</title></head><body>`
    html += `<header>Mi espectacular pagina web</header>`
    html += content
    html += "<body></html>"
    return html
}


// module.exports = { createPage, createProductList }
export default { createPage }