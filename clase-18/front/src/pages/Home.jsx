/**
 * Home.jsx — Página principal de la aplicación.
 *
 * Lista personajes de la API de Rick & Morty en una tabla paginada.
 * Maneja tres estados locales: datos (personajes), carga (loading) y error.
 * El fetch se re-ejecuta automáticamente cada vez que cambia `page`.
 * Solo accesible si hay sesión activa (protegida por ProtectedRoute).
 */

import { Activity } from 'react'   // API experimental de React 19 — ver comentario abajo
import { useEffect } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  const [personajes, setPersonajes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)   // página actual; cambiarla dispara el useEffect

  // `page` como dependencia: cada vez que el usuario cambia de página,
  // useEffect vuelve a ejecutarse y trae los personajes de esa nueva página.
  useEffect(() => {
    fetch("https://rickandmortyapi.com/api/character?page=" + page)
      .then(res => {
        // fetch() NO lanza error en respuestas 4xx/5xx; hay que chequear res.ok manualmente.
        if (res.ok) return res.json()
        throw new Error("Error al traer los personajes")
      })
      .then(data => setPersonajes(data.results))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))  // se ejecuta siempre, con o sin error
  }, [page])

  // Early returns: si loading o error, cortamos acá sin llegar al JSX de la tabla.
  if (loading) return <div className='h1' >Cargando...</div>
  if (error) return <div className='h1' >No se pueden traer los personajes</div>

  return (
    <>
      <table className='table mt-3'>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Episodios</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {
            personajes.map(personaje => (
              <tr key={personaje.id} >
                <td>
                  <img
                    src={personaje.image}
                    className='img-fluid'
                    style={{ maxWidth: "100px" }}
                    alt=""
                  />
                </td>
                <td>
                  {personaje.name}
                </td>
                <td>
                  {/* episode es un array de URLs de episodios; .length da el conteo */}
                  {
                    personaje.episode.length
                  }
                </td>
                <td>
                  {/* Link de React Router: navega sin recargar la página (SPA) */}
                  <Link className='btn btn-info' to={"/detalle/" + personaje.id} >Ver</Link>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>

      {/*
        Activity (React 19, experimental):
        - mode="visible" → renderiza los hijos normalmente.
        - mode="hidden"  → oculta los hijos pero los mantiene montados (estado preservado).
        Diferencia con { condicion && <Btn> }: el && desmontaría el componente;
        Activity lo mantiene en el árbol de React, solo cambia su visibilidad.
        Acá se usa para ocultar "Prev" en la primera página y "Next" en la última.
      */}
      <Activity mode={page > 1 ? 'visible' : "hidden"} >
        <button className='btn' onClick={() => setPage(page - 1)} >Prev</button>
      </Activity>

      {/*
        [...Array(42)] crea un array de 42 posiciones vacías para poder mapearlo.
        El 42 es el total de páginas de la API (hardcodeado).
        El className ternario marca visualmente el botón de la página activa.
      */}
      {
        [...Array(42)].map((valor, indice) => (
          <button onClick={ () => setPage( indice + 1 ) } className={page == (indice + 1)
            ? "btn btn-primary"          // página actual: botón relleno
            : "btn btn-outline-primary"} // otras páginas: solo borde
            key={indice} >
            {indice + 1}
          </button>
        ))
      }

      <Activity mode={page < 42 ? 'visible' : 'hidden'}>
        <button className='btn' onClick={() => setPage(page + 1)} >Next</button>
      </Activity>
    </>
  )
}

export default Home
