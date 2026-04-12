// 1- Importo el módulo de Express y creo una instancia de la aplicación
import express from "express"
import ProductRoutes from "./routes/product.routes.js"
const app = express()

// 2- Configuro la aplicación para servir archivos estáticos desde la carpeta "public"
// static() es un middleware nativo de Express que se encarga de servir archivos estáticos, como HTML, CSS, JavaScript, imágenes, etc. En este caso, le indicamos que sirva los archivos desde la carpeta "public". Esto significa que cualquier archivo que coloquemos dentro de la carpeta "public" estará disponible para ser accedido a través de la URL raíz ("/") del servidor.
app.use("/", express.static('public'))

// 3- Configuro la aplicación para parsear el cuerpo de las solicitudes POST con formato URL-encoded.
// urlencoded() es un middleware de Express que se encarga de parsear el cuerpo de las solicitudes POST que tienen el formato URL-encoded, es decir, aquellas que envían datos a través de formularios HTML. Al configurar este middleware, Express podrá interpretar los datos enviados desde el formulario y acceder a ellos a través del objeto req.body en las rutas correspondientes.
app.use(express.urlencoded({ extended: true }))
// app.use(express.json())

// 4- Importo las rutas de productos y las uso en la aplicación
app.use(ProductRoutes)

//5- Escucho en el puerto 2026 y muestro un mensaje en la consola cuando el servidor esté funcionando.
//listen() es un método de Express que se utiliza para iniciar el servidor y hacer que escuche en un puerto específico. En este caso, le indicamos que escuche en el puerto 2026. El segundo argumento es una función de callback que se ejecuta cuando el servidor ha comenzado a escuchar en el puerto especificado. En este caso, simplemente mostramos un mensaje en la consola indicando que el servidor está funcionando y proporcionando la URL para acceder a él (http://localhost:2026).
app.listen(2026, () => console.log("Servidor funcionando en http://localhost:2026"))