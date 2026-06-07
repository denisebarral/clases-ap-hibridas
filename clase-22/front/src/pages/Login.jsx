/**
 * Login.jsx — Página de inicio de sesión.
 *
 * Usa dos hooks con nombres claros y sin conflictos:
 *   - onLogin       → función del CONTEXTO para guardar la sesión globalmente
 *   - loginService  → función del SERVICE para llamar a la API
 */

import { useNavigate } from 'react-router-dom'
import { useLogin } from '../contexts/Session.context'
import { useUsuariosService } from '../services/usuarios.service'

const Login = () => {
  const navigate = useNavigate()

  // onLogin viene del Contexto: al llamarla guarda el token en localStorage, y actualiza el estado global (NavBar se re-renderiza mostrando "Salir"). El nombre "onLogin" coincide con cómo se llama en Session.context.jsx.
  const onLogin = useLogin()

  // loginService viene del service: es la función que hace el fetch POST /api/login. Como en el service ya se llama "loginService", la desestructuración no necesita alias y queda limpia: { loginService } en vez de { login: loginService }.
  const { loginService } = useUsuariosService()

  const handleSubmit = (e) => {
    e.preventDefault()
    const email = e.target.email.value
    const pass = e.target.pass.value

    // loginService recibe el objeto con los datos del form.
    // Cuando el back responde 200, data tiene { email, token, ... }.
    loginService({ email: email, password: pass })
      .then(data => {
        onLogin(data.token, email)   // guarda sesión en contexto + localStorage
        navigate("/")
      })
      .catch(err => console.error("No se pudo loguear"))
  }

  return (
    <div className='container d-flex justify-content-center align-items-center vh-100'>
      <div className='card p-4 shadow' style={{ width: '350px' }}>
        <h2 className='text-center mb-4'>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className='mb-3'>
            <label className='form-label'>Email: </label>
            <input type="email" placeholder='Ingrese su mail' className='form-control' name='email' />
          </div>
          <div className='mb-3'>
            <label className='form-label'>Contraseña: </label>
            <input type="password" placeholder='Ingrese su password' className='form-control' name='pass' />
          </div>
          <button type='submit' className='btn btn-primary w-100'>Ingresar</button>
        </form>
      </div>
    </div>
  )
}

export default Login
