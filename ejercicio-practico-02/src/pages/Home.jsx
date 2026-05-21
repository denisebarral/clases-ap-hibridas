/**
 * Home.jsx — Página principal de la aplicación.
 *
 * Lista personajes de la API de Rick & Morty en una tabla paginada.
 * Maneja tres estados locales: datos (personajes), carga (loading) y error.
 * El fetch se re-ejecuta automáticamente cada vez que cambia `page`.
 */

import React from 'react'
import { Activity } from 'react'   // API experimental de React 19 — ver comentario abajo
import { useEffect } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  const [personajes, setPersonajes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)   // página actual; cambiarla dispara el useEffect

  // `page` en el array de dependencias: cada vez que el usuario cambia de página,
  // useEffect vuelve a ejecutarse y trae los personajes de esa nueva página.
  useEffect(() => {
    fetch("https://rickandmortyapi.com/api/character?page=" + page)
      .then(res => {
        // fetch() NO lanza error automáticamente en respuestas 4xx/5xx.
        // res.ok es false cuando el status HTTP está fuera del rango 200-299,
        // así que hay que chequearlo manualmente y lanzar el error nosotros.
        if (res.ok) return res.json()
        throw new Error("Error al traer los personajes")
      })
      .then(data => {
        console.log("Respuesta completa de la API:", data)
        console.log("Primer personaje:", data.results[0])
        setPersonajes(data.results)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))  // se ejecuta siempre, con o sin error
  }, [page])

  // ─── Versión alternativa: mismo fetch con async/await + try/catch ─────────────
  //
  // IMPORTANTE: useEffect NO puede recibir una función async directamente.
  // Una función async siempre devuelve una Promise, pero useEffect espera que
  // la función retorne una función de cleanup (o nada). Si le pasás una Promise,
  // React la ignora silenciosamente pero puede generar memory leaks o warnings.
  //
  // Solución: definir la función async ADENTRO del useEffect y llamarla.
  //
  // useEffect(() => {
  //   const fetchPersonajes = async () => {
  //     try {
  //       const res = await fetch("https://rickandmortyapi.com/api/character?page=" + page)
  //
  //       // Igual que con .then(): fetch no lanza error en 4xx/5xx, hay que chequearlo.
  //       if (!res.ok) throw new Error("Error al traer los personajes")
  //
  //       const data = await res.json()
  //       setPersonajes(data.results)
  //     } catch (err) {
  //       // Captura tanto errores de red (sin conexión) como el throw manual de arriba.
  //       setError(err.message)
  //     } finally {
  //       // Se ejecuta siempre, éxito o error: apaga el spinner de carga.
  //       setLoading(false)
  //     }
  //   }
  //
  //   fetchPersonajes()  // se llama, pero NO se awaita (useEffect no es async)
  // }, [page])
  // ─────────────────────────────────────────────────────────────────────────────

  // Early returns: si todavía estamos cargando o hubo error, cortamos acá
  // y no llegamos al JSX de la tabla. Esto evita intentar renderizar un array vacío.
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
        ── ¿Qué es <Activity>? ──────────────────────────────────────────────────
        Activity es un componente experimental de React 19 que controla
        la visibilidad de sus hijos SIN desmontarlos del árbol de React.

        Acepta una prop `mode` con dos valores:
          - "visible" → los hijos se renderizan y son visibles normalmente.
          - "hidden"  → los hijos se OCULTAN de la pantalla, pero React los
                        mantiene montados en memoria y preserva su estado interno.

        ── ¿En qué se diferencia de un condicional normal? ─────────────────────
        Con { condicion && <Componente /> } o ternario, React DESMONTA el componente
        cuando la condición es false: pierde su estado, sus efectos se limpian, etc.
        Con Activity mode="hidden", el componente sigue vivo, solo invisible.

        ── ¿Para qué sirve eso? ─────────────────────────────────────────────────
        Es útil para preservar el estado de tabs, listas, formularios parcialmente
        completados, etc., sin volver a fetchear o recalcular cuando vuelven a aparecer.

        ── ¿Por qué acá? ────────────────────────────────────────────────────────
        Acá se usa para ocultar "Prev" en la primera página y "Next" en la última.
        Para un simple botón sin estado propio no hay diferencia práctica respecto
        a un condicional, pero el código ilustra el uso del componente.
        ────────────────────────────────────────────────────────────────────────
      */}
      <Activity mode={page > 1 ? 'visible' : "hidden"} >
        <button className='btn' onClick={() => setPage(page - 1)} >Prev</button>
      </Activity>

      {/*
        [...Array(42)] crea un array de 42 posiciones vacías (con valor undefined).
        El 42 es el total de páginas de la API de Rick & Morty (hardcodeado).
        Se mapea usando el índice para generar un botón por cada página.

        El className ternario cambia el estilo del botón activo (relleno)
        vs. los demás (solo borde), para indicar en qué página está el usuario.

        Limitación: el 42 es un número fijo. Si la API cambiara la cantidad de
        páginas, habría que actualizar este número a mano. La mejora sería guardar
        también `data.info.pages` en un estado y usarlo acá en lugar de 42.
      */}
      {
        [...Array(42)].map((valor, indice) => (
          // Por cada índice de 0 a 41, se genera un botón con número de página (índice + 1).
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
