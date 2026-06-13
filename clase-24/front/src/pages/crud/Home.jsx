/**
 * Home.jsx — Página principal de la aplicación.
 *
 * Lista los libros de la API en una tabla paginada.
 * Cambios respecto a clase-20:
 *   - El fetch y el token ya no están acá: se delegan a useLibrosService()
 *   - Si el token expiró, api.service redirige al login automáticamente
 *   - El componente solo maneja el estado de UI: loading, error, datos
 */

import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLibrosService } from '../../services/libros.service'

const Home = () => {
  const [libros, setLibros] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // useLocation da acceso al objeto location de la ruta actual.
  // location.state contiene el objeto que pasaron ModificarLibro o EliminarLibro
  // al hacer navigate("/", { state: { mensaje: "..." } }).
  // Si el usuario llegó al home por navegación normal (sin venir de editar/eliminar),
  // location.state es null y el alert simplemente no se muestra.
  const location = useLocation()
  const mensaje = location.state?.mensaje

  // alertaVisible controla si el usuario ya cerró el alert manualmente.
  // Se inicializa en true para que aparezca apenas llega el mensaje.
  const [alertaVisible, setAlertaVisible] = useState(true)

  // getLibros es la función del service que hace GET /api/libros con el token incluido.
  // No necesitamos leer el token acá: api.service lo toma del contexto internamente.
  const { getLibros } = useLibrosService()

  useEffect(() => {
    getLibros()
      .then(data => setLibros(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  // getLibros viene de un custom hook y se recrea en cada render.
  // Agregarla al array causaría un loop infinito: fetch → setState → re-render → fetch...
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Early returns: si todavía está cargando o hubo error, cortamos el render acá.
  if (loading) return <div className='h1'>Cargando...</div>
  if (error) return <div className='h1'>No se pueden traer los libros</div>

  return (
    <div className="container mt-4">

      {/* El alert solo se renderiza si hay un mensaje de estado Y el usuario no lo cerró.
          mensaje viene de navigate("/", { state: { mensaje: "..." } }) en Modificar/Eliminar.
          Si el usuario llegó al home por navegación normal, mensaje es undefined y esto no aparece. */}
      {mensaje && alertaVisible && (
        <div className="alert alert-success d-flex justify-content-between align-items-center mb-3">
          {mensaje}
          {/* onClick cierra el alert seteando alertaVisible en false, sin recargar la página */}
          <button className="btn-close" onClick={() => setAlertaVisible(false)} />
        </div>
      )}

     <Link to="/nuevo-libro" className='btn btn-primary mb-3'>Nuevo libro</Link>
      <table className='table'>
        <thead>
          <tr>
            <th>#</th>
            <th>Título</th>
            <th>Autor</th>
            <th>Género</th>
            <th>Acciones</th>
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
                <td className="d-flex gap-2">
                  <Link className='btn btn-info btn-sm' to={"/detalle/" + libro._id}>Ver</Link>
                  <Link className='btn btn-warning btn-sm' to={"/modificar-libro/" + libro._id}>Editar</Link>
                  <Link className='btn btn-danger btn-sm' to={"/eliminar-libro/" + libro._id}>Borrar</Link>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  )
}

export default Home
