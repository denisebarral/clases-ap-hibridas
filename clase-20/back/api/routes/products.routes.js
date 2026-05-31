/**
 * api/routes/products.routes.js
 *
 * Rutas de la API REST de productos.
 *
 * A diferencia de las rutas del frontend (routes/product.routes.js), estas rutas:
 *   - Usan los 5 verbos HTTP completos: GET, POST, PUT, PATCH, DELETE.
 *   - No devuelven HTML: los controladores responden con JSON.
 *   - Se montan bajo el prefijo "/api" en main.js, así que las URLs reales son:
 *       GET    /api/productos
 *       GET    /api/productos/:id
 *       POST   /api/productos
 *       DELETE /api/productos/:id
 *       PATCH  /api/productos/:id
 *       PUT    /api/productos/:id
 *
 * Esta es la estructura estándar de una API REST: mismo recurso (/productos),
 * distintas acciones según el verbo HTTP.
 *
 * Se pueden testear todas estas rutas desde Postman sin necesidad de un frontend.
 */
import express from 'express'
import * as controllers from "../controllers/products.controllers.js"

const router = express.Router()

// GET /api/productos → devuelve el listado completo de productos en JSON
router.get("/productos", controllers.getProductos)

// GET /api/productos/:id → devuelve un producto específico por id en JSON
router.get("/productos/:id", controllers.getProductoById)

// POST /api/productos → crea un nuevo producto con los datos del body JSON
router.post("/productos", controllers.guardarProducto)

// DELETE /api/productos/:id → elimina (soft delete) el producto con ese id
router.delete("/productos/:id", controllers.borrarProducto)

// PATCH /api/productos/:id → actualiza SOLO los campos que se manden en el body
// (si no mandás "precio", el precio existente se conserva)
router.patch("/productos/:id", controllers.actualizarProducto)

// PUT /api/productos/:id → REEMPLAZA el producto completo con los datos del body
// (sobreescribe todos los campos, incluso los que no se manden)
router.put("/productos/:id", controllers.reemplazarProducto)

export default router
