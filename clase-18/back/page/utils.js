export function createPage(content) {
    let html = ""
    html += `<!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
    </head>
    <body>`
    html += "<div class='container' >" + `<header>Mi espectacular pagina web</header>`
    html += content + "</div>"
    html += "<body></html>"
    return html
}


// module.exports = { createPage, createProductList }
export default { createPage }