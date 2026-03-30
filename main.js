// Importamos el módulo HTTP que viene incorporado en Node.js
// Este módulo es el que nos permite crear un servidor web
const http = require("http");
 
// Creamos el servidor
// Cada vez que alguien hace una petición, se ejecuta esta función
// "request" es lo que el cliente PIDE (URL, método HTTP, etc.)
// "response" es lo que el servidor RESPONDE
const server = http.createServer( (request, response) => {
 
    // Mostramos en consola la URL que está pidiendo el cliente
    console.log(request.url);
 
    // Empezamos a escribir la respuesta con la estructura HTML base
    response.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>`);
 
    // Si la URL es "/materia", respondemos con este contenido
    if( request.url == "/materia" ){
        response.write("<h1>Aplicaciones Híbridas</h1>")
    }
 
    // Si la URL es "/profesor", respondemos con este otro contenido
    if( request.url == "/profesor" ){
        response.write("El profe")
    }
 
    // Cerramos las etiquetas HTML de la respuesta
    response.write(`</body></html>`)
 
    // Le decimos a Node que la respuesta terminó
    response.end()
 
} )
 
// El servidor empieza a escuchar en el puerto 2026
// Cuando esté listo, imprime "Funcionando..." en la consola
server.listen(2026, () => console.log("Funcionando..."));