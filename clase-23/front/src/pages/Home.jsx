/**
 * Home.jsx — Página principal de la aplicación.
 *
 * Lista los libros de la API en una tabla paginada.
 * Cambios respecto a clase-20:
 *   - El fetch y el token ya no están acá: se delegan a useLibrosService()
 *   - Si el token expiró, api.service redirige al login automáticamente
 *   - El componente solo maneja el estado de UI: loading, error, datos
 */

import { useEffect } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLibrosService } from '../services/libros.service'

const Home = () => {
  const [libros, setLibros] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // getLibros es la función del service que hace GET /api/libros con el token incluido.
  // No necesitamos leer el token acá: api.service lo toma del contexto internamente.
  const { getLibros } = useLibrosService()

  useEffect(() => {
    getLibros()
      .then(data => setLibros(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Early returns: si todavía está cargando o hubo error, cortamos el render acá.
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
            libros.map((libro, index) => (
              <tr key={libro._id}>
                <td>{index + 1}</td>
                <td>{libro.titulo}</td>
                <td>{libro.autor}</td>
                <td>{libro.genero}</td>
                <td>
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
