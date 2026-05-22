import express from "express"
import * as controllers from "../controllers/usuarios.controllers.js"
import { validateLogin, validateRegister } from "../../middlewares/usuarios.validate.js"

const router = express.Router()

router.post("/",[validateRegister], controllers.createUser)
router.post("/login",[validateLogin], controllers.login)

export default router