/**
 * Register.jsx — Página de registro con validación visual en tiempo real.
 *
 * Clase-23: se incorpora react-hook-form. El campo de contraseña muestra
 * un checklist que se va tildando mientras el usuario escribe.
 * El campo de confirmación solo necesita verificar que coincida con la contraseña.
 */

import { Activity } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUsuariosService } from '../services/usuarios.service'
import { useForm, useWatch } from "react-hook-form"

const Register = () => {
  const navigate = useNavigate()
  const { registroService } = useUsuariosService()

  // Aquí usamos useForm para manejar el estado del formulario, la validación y los errores. useForm es un hook que nos da varias funciones y objetos para trabajar con formularios de manera más sencilla. 
  const {
    register, // conecta cada <input> con RHF
    handleSubmit, // envuelve onSubmit: solo llama si el form es válido
    control, // objeto de control necesario para useWatch.
    formState: { errors, isValid } // objeto con los errores actuales de cada campo y el estado general de validez del formulario
  } = useForm({ mode: "onChange" })
  // mode: "onChange" → valida mientras el usuario escribe.
  // Sin esto, el checklist visual se actualiza (porque usa useWatch) pero RHF
  // no marcaría los campos como inválidos hasta el submit. Inconsistente.

  // useWhatch siempre debe recibir el control de useForm, el name del campo a seguir y un defaultValue. Iniciamos defaultValue con "" para evitar que el campo sea undefined al principio, lo que complica la lógica de validación visual.
  const emailValue   = useWatch({ control, name: "email",       defaultValue: "" })
  const pass         = useWatch({ control, name: "pass",        defaultValue: "" })
  const passConfirm  = useWatch({ control, name: "passConfirm", defaultValue: "" })

  // Reglas de fortaleza de la contraseña.
  // Se evalúan en cada keystroke gracias al watch() — alimentan el checklist visual.
  // test() devuelve true/false, ideal para marcar cada requisito como cumplido o no.
  const validaciones = {
    longitudMin: pass.length >= 8,
    mayuscula:   /[A-Z]/.test(pass), 
    minuscula:   /[a-z]/.test(pass),
    numero:      /[0-9]/.test(pass),
    simbolo:     /[@$!%*?&._-]/.test(pass)
  }

  // La confirmación solo tiene UN requisito: ser igual a pass.
  // No tiene sentido repetir las reglas de fortaleza: si passConfirm === pass
  // y pass ya cumple los requisitos, entonces passConfirm también los cumple.
  const confirmacionOk = pass === passConfirm && passConfirm.length > 0

  // iValidPass es un objeto al que le pasamos las validaciones y devuelve true solo si todas son true. Lo usamos para marcar el campo de contraseña como válido o inválido.
  // Un ejemplo de isValidPass sería: { longitudMin: true, mayuscula: true, minuscula: false, numero: true, simbolo: true } → isValidPass = false
  const isValidPass = Object.values(validaciones).every(v => v === true)

  const onSubmit = (formData) => {
    // registroService recibe un objeto (consistente con loginService)
    registroService({ email: formData.email, password: formData.pass, passwordConfirm: formData.passConfirm })
      .then(() => navigate("/login"))
      .catch(() => console.error("No se pudo registrar"))
  }

  return (
    <div className='container d-flex justify-content-center align-items-center vh-100'>
      <div className='card p-4 shadow' style={{ width: '350px' }}>
        <h2 className='text-center mb-4'>Registrar Cuenta</h2>
        <form onSubmit={handleSubmit(onSubmit)}>

          {/* ── EMAIL ── */}
          <div className='mb-3'>
            <label className='form-label'>Email: </label>
            <input
              type="email"
              placeholder='Ingrese su mail'
              // Acá se ve el uso de useWatch para decidir si mostrar is-valid o is-invalid: si el campo tiene contenido (emailValue.length > 0) y hay un error, mostramos is-invalid. Si no hay error, mostramos is-valid. Si el campo está vacío, no mostramos ningún color.
              className={`form-control ${emailValue.length > 0 ? (errors.email ? "is-invalid" : "is-valid") : ""}`}
              {...register("email", {
                required: "El campo email es obligatorio",
                pattern: { // pattern solo acepta en el value expresiones regulares, no funciones, por eso no podemos usar el mismo validate del pass.
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "No es un mail válido"
                }
              })}
            />
            <Activity mode={errors?.email ? "visible" : "hidden"}>
              <div className='invalid-feedback'>{errors?.email?.message}</div>
            </Activity>
          </div>

          {/* ── CONTRASEÑA ── */}
          <div className='mb-3'>
            <label className='form-label'>Contraseña: </label>
            <input
              type="password"
              placeholder='Ingrese su password'
              // is-invalid cuando el campo tiene contenido y no cumple los requisitos
              className={`form-control ${pass.length > 0 ? (!isValidPass ? "is-invalid" : "is-valid") : ""}`}
              {...register("pass", {
                required: "El campo contraseña es obligatorio",
                // validate recibe el valor actual y devuelve true si es válido
                // o un string con el mensaje de error si no lo es.
                // Ejemplo, si escribo "j" en el input, el value es == "j", por ende la única validación que habré pasado hasta el momento es la de que "debo tener al menos una minúscula".
                validate: value => {
                  if (value.length < 8)             return "Debe tener al menos 8 caracteres"
                  if (!/[A-Z]/.test(value))         return "Debe tener una mayúscula"
                  if (!/[a-z]/.test(value))         return "Debe tener una minúscula"
                  if (!/[0-9]/.test(value))         return "Debe tener al menos un número"
                  if (!/[@$!%*?&._-]/.test(value))  return "Debe tener al menos un símbolo"
                  return true  // todo ok → RHF marca el campo como válido
                }
              })}
            />
            {/* Checklist visual: cada ítem cambia de rojo a verde mientras el usuario escribe */}
            <Activity mode={pass.length > 0 ? "visible" : "hidden"}>
              <ul className='list-unstyled mt-2 small'>
                <li className={validaciones.longitudMin ? "text-success" : "text-danger"}>
                  {validaciones.longitudMin ? "✔" : "✗"} Mínimo 8 caracteres
                </li>
                <li className={validaciones.mayuscula ? "text-success" : "text-danger"}>
                  {validaciones.mayuscula ? "✔" : "✗"} Al menos una mayúscula
                </li>
                <li className={validaciones.minuscula ? "text-success" : "text-danger"}>
                  {validaciones.minuscula ? "✔" : "✗"} Al menos una minúscula
                </li>
                <li className={validaciones.numero ? "text-success" : "text-danger"}>
                  {validaciones.numero ? "✔" : "✗"} Al menos un número
                </li>
                <li className={validaciones.simbolo ? "text-success" : "text-danger"}>
                  {validaciones.simbolo ? "✔" : "✗"} Al menos un símbolo (@$!%*?&._-)
                </li>
              </ul>
            </Activity>
          </div>

          {/* ── CONFIRMAR CONTRASEÑA ── */}
          <div className='mb-3'>
            <label className='form-label'>Confirmar Contraseña: </label>
            <input
              type="password"
              placeholder='Ingrese su password nuevamente'
              className={`form-control ${passConfirm.length > 0 ? (!confirmacionOk ? "is-invalid" : "is-valid") : ""}`}
              {...register("passConfirm", {
                required: "Confirmá tu contraseña",
                // El único requisito de este campo es que coincida con pass.
                // Si coincide, automáticamente cumple los mismos requisitos de fortaleza.
                validate: value => value === pass || "Las contraseñas no coinciden"
                // Nota: "valor || mensaje" funciona porque si value === pass → devuelve true (válido).
                // Si no → devuelve el string del mensaje (inválido).
              })}
            />
            <Activity mode={passConfirm.length > 0 ? "visible" : "hidden"}>
              <ul className='list-unstyled mt-2 small'>
                <li className={confirmacionOk ? "text-success" : "text-danger"}>
                  {confirmacionOk ? "✔" : "✗"} Las contraseñas coinciden
                </li>
              </ul>
            </Activity>
          </div>

          {/* disabled={!isValid} deshabilita el botón funcionalmente (atributo HTML).
              Solo se puede hacer submit cuando todos los campos son válidos. */}
          <button type='submit' disabled={!isValid} className='btn btn-primary w-100'>
            Registrarse
          </button>

        </form>
      </div>
    </div>
  )
}

export default Register


// ─────────────────────────────────────────────────────────────────────────────
// 📖 LO QUE HIZO EL PROFE vs LO QUE SIMPLIFICAMOS
// ─────────────────────────────────────────────────────────────────────────────
//
// 1. VALIDACIONCONFIRM — el profe duplicó TODAS las reglas de fortaleza:
//
//    const validacionConfirm = {
//      igual: (pass == passConfirm) && ...,
//      longitudMin: passConfirm.length >= 8,
//      mayuscula: /[A-Z]/.test(passConfirm),
//      minuscula: /[a-z]/.test(passConfirm),
//      numero:    /[0-9]/.test(passConfirm),
//      simbolo:   /[@$!%*?&._-]/.test(passConfirm)
//    }
//
//    El problema: el campo de confirmación solo tiene UN requisito: ser igual a pass.
//    Si passConfirm === pass, y pass ya cumple todas las reglas, entonces
//    passConfirm las cumple también por ser idéntico. Verificarlo dos veces
//    no agrega seguridad ni UX — solo complica el código.
//    Simplificamos a: const confirmacionOk = pass === passConfirm && passConfirm.length > 0
//
// 2. VALIDATE DE PASSCONFIRM — el profe escribió:
//
//    validate: value => {
//      if (value == pass) return          // ← BUG: return sin valor = undefined = error en RHF
//      if (value.length < 8) return "..."
//      ...
//    }
//
//    Para react-hook-form, el validate debe devolver:
//      - true  → campo válido
//      - string → mensaje de error (campo inválido)
//    Devolver undefined (return sin valor) se interpreta como truthy pero no como true explícito,
//    lo que puede causar comportamiento inesperado.
//    Simplificamos a: validate: value => value === pass || "Las contraseñas no coinciden"
//
// 3. BOTÓN DISABLED — el profe usó:
//
//    className={`btn btn-primary w-100 ${ isValid ? "" : "disabled" }`}
//
//    La clase CSS "disabled" solo cambia el estilo visual pero NO deshabilita el
//    botón funcionalmente: el usuario puede hacer click igual y el form se intenta enviar.
//    El atributo HTML disabled={!isValid} sí deshabilita el comportamiento nativo del botón.
//
// 4. MODE: "ONCHANGE" — el profe lo puso en Login pero no en Register.
//    Sin mode: "onChange", RHF valida solo al submit, pero los checks visuales
//    (basados en watch) se actualizan en tiempo real. Esto da la impresión de
//    que la validación funciona pero el estado interno de RHF no coincide.
//    Agregamos mode: "onChange" para ser consistentes.
