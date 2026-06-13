/**
 * Login.jsx — Página de inicio de sesión con validación en tiempo real.
 *
 * Clase-23: se incorpora react-hook-form para manejar el estado del formulario
 * y mostrar feedback visual (is-valid / is-invalid de Bootstrap) mientras el
 * usuario escribe.
 */

import { Activity } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '../../contexts/Session.context'
import { useUsuariosService } from '../../services/usuarios.service'
import { useForm, useWatch } from "react-hook-form"

const Login = () => {
  const navigate = useNavigate()
  const onLogin = useLogin()
  const { loginService } = useUsuariosService()

  // useForm() centraliza: registro de campos, validación, estado de errores.
  // mode: "onChange" → valida mientras el usuario escribe (no solo al hacer submit).
  const {
    register,                          // conecta cada <input> con RHF
    handleSubmit,                      // envuelve onSubmit: solo llama si el form es válido
    control,                           // objeto de control necesario para useWatch
    formState: { errors }              // objeto con los errores actuales de cada campo
  } = useForm({ mode: "onChange" })

  // watch() devuelve una función que el compilador no puede memoizar de forma segura,
  // lo que genera un warning. useWatch es un hook separado que resuelve eso.
  // Ambos hacen lo mismo: seguir el valor de un campo en tiempo real.
  const emailValue = useWatch({ control, name: "email", defaultValue: "" })
  const passValue  = useWatch({ control, name: "pass",  defaultValue: "" })

  // onSubmit solo se ejecuta si todos los campos pasaron validación.
  // formData contiene los valores finales validados (no los del watch).
  const onSubmit = (formData) => {
    loginService({ email: formData.email, password: formData.pass })
      .then(data => {
        // Se usa formData.email (valor validado del submit), no el watch
        onLogin(data.token, formData.email)
        navigate("/")
      })
      .catch(() => console.error("No se pudo loguear"))
  }

  return (
    <div className='container d-flex justify-content-center align-items-center vh-100'>
      <div className='card p-4 shadow' style={{ width: '350px' }}>
        <h2 className='text-center mb-4'>Iniciar Sesión</h2>

        {/* handleSubmit(onSubmit) intercepta el submit nativo:
            valida primero y solo llama a onSubmit si todo está bien */}
        <form onSubmit={handleSubmit(onSubmit)}>

          <div className='mb-3'>
            <label className='form-label'>Email: </label>
            <input
              type="email"
              placeholder='Ingrese su mail'
              // is-valid / is-invalid de Bootstrap: solo aplica si el campo tiene contenido
              className={`form-control ${emailValue.length > 0 ? (errors.email ? "is-invalid" : "is-valid") : ""}`}
              {...register("email", {
                required: "El campo email es obligatorio",
                // Para el email en login, solo validamos que tenga formato correcto.
                // type="email" del browser ya da una validación básica, pero RHF
                // necesita su propia regla para manejar el mensaje de error.
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "No es un mail válido"
                }
              })}
            />
            {/* Activity muestra el mensaje de error solo si errors.email existe */}
            <Activity mode={errors?.email ? "visible" : "hidden"}>
              <div className='invalid-feedback'>{errors?.email?.message}</div>
            </Activity>
          </div>

          <div className='mb-3'>
            <label className='form-label'>Contraseña: </label>
            <input
              type="password"
              placeholder='Ingrese su password'
              className={`form-control ${passValue.length > 0 ? (errors.pass ? "is-invalid" : "is-valid") : ""}`}
              {...register("pass", {
                // En LOGIN solo validamos que no esté vacío.
                // NO validamos fortaleza (mayúsculas, números, símbolos): si el usuario
                // se registró antes de que existieran esos requisitos, no podría loguearse.
                // La lógica de "contraseña correcta" la decide el backend con bcrypt.compare().
                required: "El campo contraseña es obligatorio"
              })}
            />
            <Activity mode={errors?.pass ? "visible" : "hidden"}>
              <div className='invalid-feedback'>{errors?.pass?.message}</div>
            </Activity>
          </div>

          <button type='submit' className='btn btn-primary w-100'>Ingresar</button>
        </form>
      </div>
    </div>
  )
}

export default Login


// ─────────────────────────────────────────────────────────────────────────────
// 📖 LO QUE HIZO EL PROFE vs LO QUE SIMPLIFICAMOS
// ─────────────────────────────────────────────────────────────────────────────
//
// El profe agregó en la contraseña:
//   pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-]).{8,}$/ }
//
// El problema: esa regex exige la misma fortaleza que en el registro.
// Si el usuario se creó la cuenta antes de que existieran esos requisitos
// (o si su contraseña no los cumple por alguna razón), el formulario le diría
// "contraseña inválida" y nunca podría loguearse, aunque sus credenciales sean correctas.
//
// El login NO valida fortaleza — solo verifica que no esté vacío.
// La fortaleza de la contraseña ya la validó el backend cuando el usuario se registró.
// Si la contraseña está mal, el backend responde 400 y el .catch() lo maneja.
//
// También simplificamos:
//   - import: quitamos React (no se usa en React moderno con Vite)
//   - onLogin(data.token, formData.email) en vez de onLogin(data.token, email)
//     donde email viene del watch(). Diferencia: formData.email es el valor
//     validado en el momento del submit; el watch puede tener un valor pendiente de validar.
