/**
 * ItemLibro.jsx
 *
 * Componente PRESENTACIONAL que renderiza una única fila <tr> de la tabla de libros.
 *
 * Responsabilidades:
 *   - Recibir un objeto libro como prop y mostrar cada campo en su celda.
 *
 * Lo que NO hace:
 *   - No maneja estado ni efectos secundarios.
 *   - No conoce la API ni MongoDB: solo muestra lo que le pasan.
 *   - No sabe que existen otros libros: solo procesa el suyo.
 *
 * Relación con TableLibros (componente padre):
 *   TableLibros llama a ItemLibro una vez por cada libro del array con .map().
 *   Este es el patrón "padre con datos → hijo que muestra un elemento":
 *   el padre orquesta la lista, el hijo se especializa en renderizar un ítem.
 */

/**
 * ItemLibro - Fila <tr> con los campos de un libro.
 *
 * Recibe el objeto libro via destructuring: { libro }.
 * No recibe el array completo, solo el objeto de un libro individual.
 * TableLibros se encarga de llamarlo una vez por cada elemento del array.
 *
 * @param {Object} props                        - Props del componente.
 * @param {Object} props.libro                  - Objeto con los datos de un libro.
 * @param {string} props.libro._id              - ObjectId de 24 chars (asignado por MongoDB).
 * @param {string} props.libro.titulo           - Título del libro.
 * @param {string} props.libro.autor            - Nombre del autor.
 * @param {string} props.libro.genero           - Género literario.
 * @param {number} props.libro.anio_publicacion - Año de publicación.
 * @param {string} props.libro.editorial        - Nombre de la editorial.
 * @param {number} props.libro.precio           - Precio del libro.
 * @returns {JSX.Element} Elemento <tr> con una <td> por campo.
 */
const ItemLibro = ({ libro }) => {
    return (
        /* Cada campo del objeto libro se interpola con { } dentro de su celda.
           { libro.titulo } es una expresión JS: evalúa la propiedad y la convierte a texto. */
        <tr>
            <td>{libro._id}</td>
            <td>{libro.titulo}</td>
            <td>{libro.autor}</td>
            <td>{libro.genero}</td>
            <td>{libro.anio_publicacion}</td>
            <td>{libro.editorial}</td>
            <td>{libro.precio}</td>
        </tr>)
}

export default ItemLibro
