/**
 * Home.jsx — Página principal de la aplicación.
 *
 * Lista los libros de nuestra propia API REST en una tabla.
 * Para acceder a la API, incluye el token JWT guardado en localStorage
 * en el header Authorization de cada fetch.
 * Maneja tres estados: datos (libros), carga (loading) y error.
 * Solo accesible si hay sesión activa (protegida por ProtectedRoute).
 */

import { useEffect } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Home = () => {
  const [libros, setLibros] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // useNavigate permite redirigir al login si el token expiró o es inválido
  const navigate = useNavigate()

  // page como dependencia: si en el futuro se agrega paginación, cambiar page
  // disparará automáticamente un nuevo fetch con la nueva página.
  useEffect(() => {
    // El token JWT se guarda en localStorage al hacer login.
    // Se incluye en el header Authorization de cada request a rutas protegidas.
    // Sin este header, el middleware validateToken responde 401 y la API rechaza el request.
    fetch("http://localhost:2026/api/libros", {
      headers: {
        // El formato es siempre: "Bearer <token>" — la palabra Bearer seguida de un espacio
        authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => {
        if (res.ok) return res.json()
        // Si el servidor responde 401, el token venció o es inválido.
        // Redirigimos al login para que el usuario se vuelva a autenticar.
        if (res.status == 401) navigate("/login")
        throw new Error("Error al traer los libros")
      })
      .then(data => setLibros(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Early returns: si todavía está cargando o hubo error, cortamos el render acá.
  // El JSX de la tabla solo se ejecuta cuando ya tenemos los datos.
  if (loading) return <div className='h1'>Cargando...</div>
  if (error) return <div className='h1'>No se pueden traer los libros</div>

  return (
    <>
      <table className='table mt-3'>
        <thead>
          <tr>
            <th>#</th>
            <th>Título</th>
            <th>Autor</th>
            <th>Género</th>
            <th>Ver</th>
          </tr>
        </thead>
        <tbody>
          {
            // El segundo parámetro del callback (index) es la posición en el array (0, 1, 2...).
            // Se usa para mostrar el número de fila en la columna "#".
            libros.map((libro, index) => (
              // MongoDB usa _id (con guión bajo), no id. Es el identificador único del documento.
              <tr key={libro._id}>
                <td>{index + 1}</td>
                <td>{libro.titulo}</td>
                <td>{libro.autor}</td>
                <td>{libro.genero}</td>
                <td>
                  {/* Link de React Router: navega a la página de detalle sin recargar.
                      Se pasa el _id del libro en la URL para que Detalle pueda fetchearlo. */}
                  <Link className='btn btn-info' to={"/detalle/" + libro._id}>Ver</Link>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </>
  )
}

export default Home
