/**
 * TableLibros.jsx
 *
 * Componente PRESENTACIONAL que renderiza una tabla HTML con el listado de libros.
 *
 * Responsabilidades:
 *   - Recibir el array de libros como prop desde su padre (Libros.jsx).
 *   - Renderizar el encabezado fijo de la tabla.
 *   - Delegar el renderizado de cada fila al componente hijo ItemLibro.
 *
 * Lo que NO hace:
 *   - No hace fetch ni conoce la API: recibe los datos ya procesados.
 *   - No maneja estado propio: es un componente "puro" (mismas props → mismo output).
 *
 * Posición en la jerarquía de componentes:
 *   Libros (tiene los datos) → TableLibros (arma la tabla) → ItemLibro (fila por fila)
 */

import ItemLibro from "./ItemLibro"

/**
 * TableLibros - Tabla de libros con encabezados fijos y filas dinámicas.
 *
 * Recibe el array via destructuring directamente en los parámetros: { libros }.
 * Es equivalente a escribir (props) y luego usar props.libros adentro,
 * pero más limpio porque deja claro qué props espera el componente.
 *
 * @param {Object}  props        - Props del componente.
 * @param {Array}   props.libros - Array de objetos libro provenientes de la API.
 *                                 Cada objeto tiene: _id, titulo, autor, genero,
 *                                 anio_publicacion, editorial, precio.
 * @returns {JSX.Element} Elemento <table> con thead fijo y tbody dinámico.
 */
const TableLibros = ( {libros} ) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Titulo </th>
                    <th>Autor </th>
                    <th>Genero </th>
                    <th>Año de publicacion </th>
                    <th>Editorial </th>
                    <th>Precio </th>
                    {/* Columna nueva: contiene el <Link> "Ver" que renderiza ItemLibro */}
                    <th>Acciones </th>
                </tr>
            </thead>
            <tbody>
                {
                    /* .map() transforma cada objeto del array en un componente <ItemLibro>.
                       Por cada libro, React llama a ItemLibro pasándole ese libro como prop.

                       La prop "key" es obligatoria en listas: React la usa internamente
                       para rastrear qué elementos cambiaron, se agregaron o se eliminaron
                       sin tener que re-renderizar toda la tabla.
                       Se usa libro._id porque es único por naturaleza (lo genera MongoDB). */
                    libros.map( libro => <ItemLibro libro={libro} key={libro._id}/> )
                }
            </tbody>
        </table>
    )
}

export default TableLibros
