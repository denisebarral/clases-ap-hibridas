/**
 * Login.jsx — Página de inicio de sesión.
 *
 * Hace un POST a la API propia (/api/login) con email y contraseña.
 * Si las credenciales son correctas, guarda la sesión y el token JWT en
 * localStorage y redirige al home. Si fallan, loguea el error en consola.
 *
 * No tiene validación de formato en el frontend: eso lo hace el middleware
 * Yup en el backend (loginSchema).
 */

import { useNavigate } from 'react-router-dom'

const Login = () => {
  // useNavigate() devuelve una función para navegar a otra ruta de forma
  // imperativa (desde código), a diferencia de <Navigate> que se renderiza.
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    const email = e.target.email.value
    const pass = e.target.pass.value

    // POST a nuestra propia API de usuarios.
    // Nota: la URL es /api/login (NO /api/usuarios/login).
    // En main.js está montado como app.use("/api", UsuariosRoutesApi)
    // y la ruta dentro del router es router.post("/login"), → /api/login.
    fetch("http://localhost:2026/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: pass
      })
    })
    .then(res => {
      // fetch no lanza error en 4xx/5xx automáticamente, hay que chequearlo.
      // res.ok es true si el status está entre 200–299.
      if (res.ok) return res.json()
      throw new Error("No se pudo loguear")
    })
    .then(data => {
      // Guardamos dos cosas en localStorage:
      // 1. "session": datos básicos del usuario (solo el email) para mostrarlos en la UI.
      // 2. "token": el JWT que el backend generó. Se necesita enviarlo en el header
      //    Authorization en cada request a rutas protegidas (GET /api/libros, etc.).
      localStorage.setItem("session", JSON.stringify({ email }))
      localStorage.setItem("token", data.token)
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
            {/* type="password" oculta los caracteres mientras se tipea */}
            <input type="password" placeholder='Ingrese su password' className='form-control' name='pass' />
          </div>
          <button type='submit' className='btn btn-primary w-100'>Ingresar</button>
        </form>
      </div>
    </div>
  )
}

export default Login
