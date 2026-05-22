import express from "express"
import ProductRoutes from "./routes/product.routes.js"
import PersonajesRoutes from "./routes/personajes.routes.js"
import ProductRoutesApi from "./api/routes/products.routes.js"
import PersonajesRoutesApi from "./api/routes/personajes.routes.js"
import ChatRoutesApi from "./api/routes/chat.routes.js"
import UsuariosRoutesApi from "./api/routes/usuarios.routes.js"
import cors from 'cors'
import swaggerFile from "./swagger.json" with {type: "json"}
import swaggerUI from "swagger-ui-express"

const app = express()
app.use("/", express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

app.use( "/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerFile) )

app.use(ProductRoutes)
app.use(PersonajesRoutes)
app.use("/api", ProductRoutesApi)
app.use("/", PersonajesRoutesApi)
app.use("/", ChatRoutesApi)
app.use("/api/usuarios", UsuariosRoutesApi)

app.listen(2026, () => console.log("Servidor funcionando en http://localhost:2026"))