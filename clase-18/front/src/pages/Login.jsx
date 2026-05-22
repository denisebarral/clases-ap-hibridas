/**
 * Login.jsx — Página de inicio de sesión.
 *
 * Maneja el formulario de login: lee los valores del form, guarda la sesión
 * en localStorage y redirige al home mediante useNavigate().
 * Esta es la "redirección programada": se decide cuándo redirigir dentro
 * de una función (handleSubmit), no en el render.
 *
 * No valida credenciales contra una API real: cualquier email/pass es aceptado.
 */

import { useNavigate } from 'react-router-dom'

const Login = () => {
  // useNavigate() devuelve una función que permite navegar a otra ruta
  // de forma imperativa (llamándola desde código, no renderizando un componente).
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()  // evita que el formulario recargue la página

    // e.target es el <form>; e.target.email accede al input con name="email"
    const email = e.target.email.value
    const pass = e.target.pass.value

    // TODO validar ingreso de usuario
    // TODO Deberiamos llamar a la api

    // Simula una sesión guardando los datos del usuario en localStorage.
    // JSON.stringify convierte el objeto a string porque localStorage solo guarda strings.
    // En una app real, acá se guardaría el token JWT que devuelve la API, no la contraseña.
    localStorage.setItem( "session", JSON.stringify({ email, pass }) )

    // Redirección programada: navegar a "/" después de hacer login.
    // Esto es equivalente a <Navigate to="/" /> pero se llama DENTRO de una función,
    // no durante el render. Ideal para redirigir DESPUÉS de una acción (submit, fetch, etc).
    navigate("/")
  }

  return (
    <div className='container d-flex justify-content-center align-items-center vh-100' >
      <div className='card p-4 shadow' style={{ width: '350px' }} >
        <h2 className='text-center mb-4' > Iniciar Session </h2>
        <form onSubmit={ handleSubmit } >
          <div className='mb-3'>
            <label className='form-label' >Email: </label>
            <input type="email" placeholder='Ingrese su mail' className='form-control' name='email' />
          </div>
          <div className='mb-3'>
            <label className='form-label' >Contraseña: </label>
            <input type="text" placeholder='Ingrese su password' className='form-control' name='pass' />
          </div>
          <button type='submit' className='btn btn-primary w-100' >Ingresar</button>
        </form>
      </div>
    </div>
  )
}

export default Login
