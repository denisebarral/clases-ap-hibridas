/**
 * Libros.jsx
 *
 * Componente de PÁGINA que orquesta la vista del listado de libros.
 *
 * Responsabilidades:
 *   - Traer los datos de la API al montarse (useEffect + fetch).
 *   - Guardar los datos en estado local (useState).
 *   - Pasar el array al componente presentacional TableLibros como prop.
 *
 * Lo que NO hace:
 *   - No sabe cómo renderizar la tabla: eso lo delega a TableLibros.
 *   - No maneja rutas ni navegación.
 *
 * Patrón "Smart / Dumb components":
 *   - Libros (Smart): tiene lógica y estado, orquesta la data.
 *   - TableLibros (Dumb): solo recibe datos y sabe cómo mostrarlos.
 *   Separar ambas responsabilidades hace que TableLibros sea reutilizable
 *   desde cualquier otro componente que tenga un array de libros.
 */

import { useEffect, useState } from "react"
import TableLibros from "../components/TableLibros"

/**
 * Libros - Página del listado de libros.
 *
 * Ciclo de vida:
 *   1. Se renderiza con libros = [] → TableLibros muestra una tabla vacía.
 *   2. useEffect dispara el fetch al backend al montarse.
 *   3. El backend responde con el array → setLibros() actualiza el estado.
 *   4. React re-renderiza → TableLibros recibe el array lleno y muestra las filas.
 *
 * @returns {JSX.Element} La tabla de libros via TableLibros.
 */
const Libros = () => {

    // Estado inicial vacío: hasta que la API responda, libros es un array sin elementos.
    // Cuando setLibros() recibe los datos, React re-renderiza y TableLibros
    // recibe el array lleno y construye las filas.
    const [libros, setLibros] = useState([])

    // useEffect con [] vacío = "ejecutá este efecto UNA SOLA VEZ, cuando el componente se monta".
    // Si el fetch estuviera fuera del useEffect, se ejecutaría en cada re-renderizado,
    // generando un loop infinito: fetch → setLibros → re-render → fetch → ...
    useEffect(() => {
        fetch("http://localhost:2026/api/libros")
            .then(res => res.json())
            // setLibros actualiza el estado con el array de libros y dispara un re-render.
            .then(data => setLibros(data))
            .catch(err => console.error(err))
    }, [])

    // Se pasa el estado "libros" como prop al componente presentacional.
    // Cuando libros = [] → tabla vacía. Cuando tiene datos → una fila por libro.
    return (
        <TableLibros libros={libros}></TableLibros>
    )
}

export default Libros
