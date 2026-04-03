// IMPORTO LOS MÓDULOS QUE NECESITO:

// 1- Módulo HTTP que viene incorporado en Node.js
// Este módulo es el que nos permite crear un servidor web
//const http = require("http"); //Antes: Common JS
import { createServer } from "http" // Ahora: ES Modules

// 2- Módulo de cafés
// const cafes = require("./data/productos.js") // Antes:CommonJS
import cafes from "./data/productos.js" // Ahora: ES Modules

// 3- Módulo de utilidades (funciones) para crear páginas HTML
// const page = require("./page/utils.js") // Antes: CommonJS
import { createPage, createProductList } from "./page/utils.js" // Ahora: ES Modules

// 4- Módulo para leer archivos
// const fs = require("fs") // Antes: CommonJS
import { readFile } from "fs"
 
//--------------------------------------------------------------------------------------------//
// Creamos el servidor
// Cada vez que alguien hace una petición, se ejecuta esta función
// "request" es lo que el cliente PIDE (URL, método HTTP, etc.)
// "response" es lo que el servidor RESPONDE
const server = createServer((request, response) => {
    console.log(request.url)
    // Aquí es donde vamos a manejar las diferentes rutas (URLs) que el cliente puede pedir
    switch (request.url) {
        case "/":
            response.write(createPage("<h1>Home</h1>"))
            break;
        case "/materia":
            response.write(createPage("<h1>Aplicaciones híbridas</h1>"))
            break;
        case "/profesor":
            response.write(createPage("<h1>El profeee!!</h1>"))
            break;
        case "/productos":
            response.write(createPage(createProductList(cafes)))
            break;
        case "/archivo":
            // readFile() es una función de Node.js que nos permite leer archivos de forma asíncrona;
            // El primer argumento es la ruta del archivo que queremos leer, el segundo argumento es una función que se ejecuta cuando se termina de leer el archivo, y recibe dos argumentos: "err" (si hubo un error al leer el archivo) y "data" (el contenido del archivo)
            readFile("./public/products.json", (err, data) => {
                if (err) response.write(createPage("No se pudo leer el archivo."))
                // Si no hubo error, "data" es un buffer (un tipo de dato que representa datos binarios), así que lo convertimos a string, mediante las etiquetas <pre> para poder mostrarlo en la página.
                response.write(createPage("<pre>" + data + "</pre>"))
                response.end()
            })
            break;
        case "/index.html":
            readFile("./public/index.html", (err, data) => {
                if (err) response.write(createPage("No se pudo leer el archivo."))
                response.write(data)
                response.end()
            })
            break
        case "/contacto.html":
            readFile("./public/contacto.html", (err, data) => {
                if (err) response.write(createPage("No se pudo leer el archivo."))
                response.write(data)
                response.end()
            })
            break
        case "/productos.html":
            readFile("./public/productos.html", (err, data) => {
                if (err) response.write(createPage("No se pudo leer el archivo."))
                response.write(data)
                response.end()
            })
            break
        case "/cafe.jpg":
            readFile("./public/cafe.jpg", (err, data) => {
                if (err) response.write(createPage("No se pudo leer el archivo."))
                response.write(data)
                response.end()
            })
            break
        case "/favicon.ico":
            readFile("./public/cafe.jpg", (err, data) => {
                if (err) response.write(createPage("No se pudo leer el archivo."))
                response.write(data)
                response.end()
            })
            break
        default:
            response.write(createPage("<h1>Página no encontrada - 404</h1>"))
            break;
    }
    //response.end()
})

//--------------------------------------------------------------------------------------------//

// Ponemos a escuchar el servidor en el puerto 2026, y cuando esté listo, mostramos un mensaje en la consola
server.listen(2026, () => console.log("Funcionando..."))