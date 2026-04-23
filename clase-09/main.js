// Importo el módulo de Express y creo una instancia de la aplicación
import express from "express"

// Importo rutas del frontend (responden con HTML, para el navegador)
import ProductRoutes from "./routes/product.routes.js"
import PersonajesRoutes from "./routes/personajes.routes.js"

// Importo rutas de la API REST (responden con JSON, para ser consumidas por Postman, fetch, apps mobile, etc.)
import ProductRoutesApi from "./api/routes/products.routes.js"
import PersonajesRoutesApi from "./api/routes/personajes.routes.js"

// Creo una instancia de la aplicación Express, que es el objeto principal que se utiliza para configurar y manejar el servidor web. Esta instancia nos permitirá definir rutas, middleware y otras configuraciones necesarias para que nuestro servidor funcione correctamente.
const app = express()

// Configuro la aplicación para servir archivos estáticos desde la carpeta "public"
// static() es un middleware nativo de Express que se encarga de servir archivos estáticos, como HTML, CSS, JavaScript, imágenes, etc. En este caso, le indicamos que sirva los archivos desde la carpeta "public". Esto significa que cualquier archivo que coloquemos dentro de la carpeta "public" estará disponible para ser accedido a través de la URL raíz ("/") del servidor.
app.use("/", express.static('public'))

// Uso el middleware express.urlencoded() para parsear el cuerpo de las solicitudes POST con formato HTML. Esto es necesario para manejar los datos enviados desde formularios HTML, ya que estos datos se envían en formato URL-encoded. Al usar este middleware, los datos enviados desde un formulario HTML estarán disponibles en req.body como un objeto JavaScript, lo que facilita su manejo en las rutas del servidor.
app.use(express.urlencoded({ extended: true }))

// Uso el middleware express.json() para parsear el cuerpo de las solicitudes POST con formato JSON.
// Necesario para la API: cuando un cliente (Postman, fetch, app mobile) manda datos
// en el body como JSON, este middleware los convierte a objeto JS y los pone en req.body.
app.use(express.json())

// Importo las rutas del frontend y las uso en la aplicación (igual que antes)
app.use(ProductRoutes)
app.use(PersonajesRoutes)

// Importo las rutas de la API REST y las uso en la aplicación, con el prefijo "/api" para diferenciarlas de las rutas del frontend. Esto significa que todas las rutas definidas en ProductRoutesApi y PersonajesRoutesApi estarán disponibles bajo el prefijo "/api". Por ejemplo, si ProductRoutesApi tiene una ruta definida como "/products", esta ruta estará disponible en el servidor como "/api/products".
app.use("/api", ProductRoutesApi)
app.use("/api", PersonajesRoutesApi)

//Escucho en el puerto 2026 y muestro un mensaje en la consola cuando el servidor esté funcionando.
//listen() es un método de Express que se utiliza para iniciar el servidor y hacer que escuche en un puerto específico. En este caso, le indicamos que escuche en el puerto 2026. El segundo argumento es una función de callback que se ejecuta cuando el servidor ha comenzado a escuchar en el puerto especificado. En este caso, simplemente mostramos un mensaje en la consola indicando que el servidor está funcionando y proporcionando la URL para acceder a él (http://localhost:2026).
app.listen(2026, () => console.log("Servidor funcionando en http://localhost:2026"))
