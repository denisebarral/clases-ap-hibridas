/**
 * Register.jsx — Página de registro de nueva cuenta.
 *
 * Usa registroService del service para llamar a la API.
 * No toca el Contexto: el registro no inicia sesión automáticamente,
 * solo crea la cuenta y redirige al login para que el usuario se autentique.
 */

import { useNavigate } from 'react-router-dom'
import { useUsuariosService } from '../services/usuarios.service'

const Register = () => {
  const navigate = useNavigate()

  // registroService es la función del service que hace POST /api/ con los datos del usuario.
  // Se desestructura sin alias porque en el service ya se llama "registroService".
  const { registroService } = useUsuariosService()

  const handleSubmit = (e) => {
    e.preventDefault()

    const email = e.target.email.value
    const pass = e.target.pass.value
    const passConfirm = e.target.passConfirm.value

    // Se pasa un único objeto con todos los campos, igual que loginService.
    // registroService lo recibe como "datos" y lo manda al back tal cual.
    registroService({ email: email, password: pass, passwordConfirm: passConfirm })
      .then(() => {
        navigate("/login")   // registro exitoso → ir al login para autenticarse
      })
      .catch(() => console.error("No se pudo registrar"))
  }

  return (
    <div className='container d-flex justify-content-center align-items-center vh-100'>
      <div className='card p-4 shadow' style={{ width: '350px' }}>
        <h2 className='text-center mb-4'>Registrar Cuenta</h2>
        <form onSubmit={handleSubmit}>
          <div className='mb-3'>
            <label className='form-label'>Email: </label>
            <input type="email" placeholder='Ingrese su mail' className='form-control' name='email' />
          </div>
          <div className='mb-3'>
            <label className='form-label'>Contraseña: </label>
            <input type="password" placeholder='Ingrese su password' className='form-control' name='pass' />
          </div>
          <div className='mb-3'>
            <label className='form-label'>Confirmar Contraseña: </label>
            <input type="password" placeholder='Ingrese su password nuevamente' className='form-control' name='passConfirm' />
          </div>
          <button type='submit' className='btn btn-primary w-100'>Registrarse</button>
        </form>
      </div>
    </div>
  )
}

export default Register
