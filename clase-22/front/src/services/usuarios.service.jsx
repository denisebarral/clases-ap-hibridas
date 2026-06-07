/**
 * usuarios.service.jsx — Servicio para las operaciones de autenticación.
 *
 * Encapsula las llamadas a la API relacionadas con usuarios:
 * login y registro. Usa useApi() como capa de transporte para no
 * repetir headers, URL base ni manejo de errores.
 */

import { useApi } from "./api.service";

export const useUsuariosService = () => {
    const { call } = useApi()

    // loginService hace POST /api/login con email y password, y devuelve el token JWT si es exitoso.
    //En este punto está la conexión entre usuarios.service y api.service: el service de usuarios no hace fetch directo, sino que delega en call() toda la lógica de comunicación.
    const loginService = (datos) => call("/login", "POST", datos)

    // registroService hace POST /api/ con email, password y passwordConfirm, y devuelve el nuevo usuario si es exitoso.
    // En este punto también se conecta usuarios.service con api.service a través de call(), igual que loginService.
    const registroService = (datos) => call("/", "POST", datos)

    return { loginService, registroService }
}


// ─────────────────────────────────────────────────────────────────────────────
// 📖 EXPLICACIÓN DE SINTAXIS
// ─────────────────────────────────────────────────────────────────────────────
//
// Las dos funciones tienen exactamente la misma forma:
//
//   const loginService    = (datos) => call("/login", "POST", datos)
//   const registroService = (datos) => call("/",      "POST", datos)
//
// "datos" es el nombre del parámetro — un casillero vacío que se llena
// cuando alguien llama a la función y le pasa un valor.
//
// En Login.jsx se llama así:
//   loginService({ email: "denise@mail.com", password: "Clave123!" })
//   → datos = { email: "denise@mail.com", password: "Clave123!" }
//   → call("/login", "POST", { email: "denise@mail.com", password: "Clave123!" })
//
// En Register.jsx se llama así:
//   registroService({ email: "...", password: "...", passwordConfirm: "..." })
//   → datos = { email: "...", password: "...", passwordConfirm: "..." }
//   → call("/", "POST", { email: "...", password: "...", passwordConfirm: "..." })
//
//
// Forma tradicional equivalente (sin arrow function):
//
//   function loginService(datos) {
//       return call("/login", "POST", datos)
//   }
//   function registroService(datos) {
//       return call("/", "POST", datos)
//   }
