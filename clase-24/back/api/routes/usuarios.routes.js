/**
 * api/routes/usuarios.routes.js (API REST)
 *
 * Define los endpoints REST del recurso "usuarios".
 * Responde siempre con JSON — no genera HTML.
 *
 * Estas rutas están montadas en main.js con app.use("/api", UsuariosRoutesApi),
 * sin un prefijo "/usuarios". Las URLs finales quedan:
 *   POST /api/       → registrar usuario (createUser)
 *   POST /api/login  → iniciar sesión (login)
 *
 * En una API REST convencional estarían en /api/usuarios y /api/usuarios/login,
 * pero el comportamiento es idéntico. Solo es una decisión de nomenclatura.
 */

import express from "express"
import * as controllers from "../controllers/usuarios.controllers.js"
import { validateLogin, validateRegister } from "../../middlewares/usuarios.validate.js"

const router = express.Router()

// El array [validateRegister] ejecuta el middleware ANTES de que llegue al controller.
// Si la validación falla, el controller nunca se ejecuta y se responde 400 al cliente.
router.post("/", [validateRegister], controllers.createUser)
router.post("/login", [validateLogin], controllers.login)

export default router
