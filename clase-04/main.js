// 1- Importo el módulo de Express y creo una instancia de la aplicación
import express from 'express';
const app = express();
// 2- Creo un array para almacenar los mensajes recibidos desde el formulario. Este array se utilizará para guardar los datos de los mensajes enviados por los usuarios a través del formulario en la página de contacto. Cada vez que se reciba un nuevo mensaje, se agregará un objeto con el email y el mensaje al array "mensajes".
const mensajes = [];

// 3- Configuro la aplicación para servir archivos estáticos desde la carpeta "public"
// stattic() es un middleware nativo de Express que se encarga de servir archivos estáticos, como HTML, CSS, JavaScript, imágenes, etc. En este caso, le indicamos que sirva los archivos desde la carpeta "public". Esto significa que cualquier archivo que coloquemos dentro de la carpeta "public" estará disponible para ser accedido a través de la URL raíz ("/") del servidor.
app.use("/", express.static('public'));

// 4- Configuro la aplicación para parsear el cuerpo de las solicitudes POST con formato URL-encoded.
// urlencoded() es un middleware de Express que se encarga de parsear el cuerpo de las solicitudes POST que tienen el formato URL-encoded, es decir, aquellas que envían datos a través de formularios HTML. Al configurar este middleware, Express podrá interpretar los datos enviados desde el formulario y acceder a ellos a través del objeto req.body en las rutas correspondientes.
app.use(express.urlencoded({extended: true}));
// app.use(express.json()); // para parsear el cuerpo de las solicitudes POST con formato JSON

// 5- Recibiendo datos del form (ejemplo con POST y GET)

// GET - URL (QUERY) - No necesito middleware
app.get("/mensaje", (req, res) => {
    console.log(req.query) // con query accedo a los datos enviados desde el formulario
    mensajes.push({name: req.query.name, email: req.query.email, mensaje: req.query.mensaje});
    res.send("Mensaje recibido!"); // con send() renderizo una respuesta al cliente en formato texto, sin necesidad de crear una vista HTML. 
    console.log(mensajes);
} )

// POST - body - Necesito middleware, app.use(express.urlencoded({extended: true})) o app.use(express.json())
app.post("/mensaje", (req, res) => {
    console.log(req.body) // con body accedo a los datos enviados desde el formulario
    mensajes.push({name: req.body.name, email: req.body.email, mensaje: req.body.mensaje})
    res.send("Mensaje recibido!")
    console.log(mensajes)
} )


//6- Escucho en el puerto 2026 y muestro un mensaje en la consola cuando el servidor esté funcionando.
//listen() es un método de Express que se utiliza para iniciar el servidor y hacer que escuche en un puerto específico. En este caso, le indicamos que escuche en el puerto 2026. El segundo argumento es una función de callback que se ejecuta cuando el servidor ha comenzado a escuchar en el puerto especificado. En este caso, simplemente mostramos un mensaje en la consola indicando que el servidor está funcionando y proporcionando la URL para acceder a él (http://localhost:2026).
app.listen(2026, () => console.log('Servidor funcionando en http://localhost:2026'));