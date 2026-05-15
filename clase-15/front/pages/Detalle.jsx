/**
 * Detalle.jsx
 *
 * Componente de PÁGINA que muestra el detalle completo de un libro individual.
 *
 * Responsabilidades:
 *   - Leer el parámetro ":id" de la URL mediante el hook useParams().
 *   - Hacer fetch al backend con ese id para traer los datos del libro.
 *   - Mostrar los campos del libro o un mensaje de error si no se encontró.
 *
 * Lo que NO hace:
 *   - No sabe de qué libro se trata hasta que lee la URL.
 *   - No recibe props: toda la información la obtiene de la URL y la API.
 *
 * Flujo de navegación que llega aquí:
 *   Tabla de libros → el usuario clickea "Ver" en una fila
 *   → <Link to={"/detalle/" + libro._id}> actualiza la URL a "/detalle/abc123..."
 *   → React Router activa esta ruta y renderiza <Detalle />
 *   → useParams() lee el "abc123..." de la URL
 *   → useEffect hace fetch a /api/libros/abc123...
 *   → setLibro() actualiza el estado → se muestra el detalle
 */

import { useEffect, useState } from "react"
import { Link, useParams } from "react-router"

/**
 * Detalle - Página de detalle de un libro.
 *
 * No recibe ninguna prop: toda la información viene de la URL (via useParams)
 * y de la API (via fetch dentro del useEffect).
 *
 * @returns {JSX.Element} Detalle del libro, o mensaje de error si no se encontró.
 */
const Detalle = () => {

    // useParams() lee los segmentos dinámicos de la URL activa y los devuelve como objeto.
    // Si la ruta declarada en Routes.jsx es "/detalle/:id"
    // y la URL del navegador es      "/detalle/687a3f2c1b4e9d0a12345678",
    // entonces useParams() devuelve  { id: "687a3f2c1b4e9d0a12345678" }.
    // Se desestructura directamente para tener la variable "id" lista para usar.
    const { id } = useParams()

    // Estado inicial vacío ({}): hasta que la API responda, libro no tiene campos.
    // Cuando setLibro() recibe los datos, React re-renderiza y muestra el detalle.
    const [ libro, setLibro ] = useState({})

    // useEffect con [] vacío = "ejecutá esto una sola vez al montarse".
    // Se pasa [] y no [id] porque el id de la URL no cambia mientras estamos en esta página:
    // cada visita a "/detalle/:id" monta un componente Detalle nuevo.
    useEffect( () => {
        // El id extraído de la URL se concatena directamente a la URL del fetch.
        // Ejemplo: si id = "687a3f2c1b4e9d0a12345678"
        //          → fetch("http://localhost:2026/api/libros/687a3f2c1b4e9d0a12345678")
        fetch( "http://localhost:2026/api/libros/"+ id )
            .then( res => res.json() )
            // El backend responde con { data: { _id, titulo, autor, ... } }.
            // libro.data extrae el objeto del libro del wrapper { data: ... }.
            // El || {} es un fallback: si data es undefined (libro no encontrado),
            // setLibro recibe {} en vez de undefined, evitando errores de renderizado.
            .then( libro => setLibro(libro.data || {}) )
            .catch( err => console.error(err) )
    }, [] )

    // Guarda de error: si el objeto libro está vacío después del fetch,
    // significa que el id no existe en la base de datos o hubo un error.
    // Object.keys({}) devuelve [] (array vacío), y [] == 0 es true en JS
    // porque el array se convierte a string "" y luego a número 0.
    if(Object.keys( libro ) == 0){
        return <div>Error al encontrar el libro</div>
    }

    return (
        <div>
            <h1 className="text-4xl" >{libro.titulo}</h1>
            <p><strong>Autor:</strong> {libro.autor}</p>
            <p><strong>Descripción:</strong> {libro.descripcion}</p>
            <p><strong>Publicación:</strong> {libro.anio_publicacion}</p>
            {/* <Link> en lugar de <a> para navegar sin recargar la página */}
            <Link to="/">Volver</Link>
        </div>
    )
}

export default Detalle
