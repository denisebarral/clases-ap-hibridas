import express from "express"
import * as controller from "../controllers/personajes.controllers.js"

const route = express.Router()

route.get("/personajes", controller.getPersonajes)
// route.get("/productos/agregar", productsController.productForm)
// route.post("/productos/agregar", productsController.productSave)
// route.get("/productos/editar/:id", productsController.editProductForm)
// route.post("/productos/editar/:id", productsController.productEdit)
// route.get("/productos/borrar/:id", productsController.deleteProductform)
// route.post("/productos/borrar/:id", productsController.deleteProduct)

// route.get("/productos/:id", productsController.getProductosById)

export default route