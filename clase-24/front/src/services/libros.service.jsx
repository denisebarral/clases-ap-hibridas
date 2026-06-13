/**
 * libros.service.jsx — Servicio para las operaciones de libros.
 *
 * Encapsula las llamadas a la API relacionadas con libros.
 * Usa useApi() como capa de transporte.
 *
 * El token se maneja automáticamente dentro de useApi:
 * no hace falta leerlo de localStorage ni pasarlo como parámetro.
 */

import { useApi } from "./api.service";

export function useLibrosService(){
    const { call } = useApi()

    // GET /api/libros → devuelve el array de todos los libros
    // En este caso a call() solo tenemos que pasarle el valor de uri, porque el método por defecto es GET y no hay body.
    const getLibros = () => call("/libros")

    // GET /api/libros/:idLibro → devuelve un único libro por su _id de MongoDB
    // En este caso a call() solo tenemos que pasarle el valor de uri, porque el método por defecto es GET y no hay body.
    const getLibrosById = (idLibro) => call("/libros/" + idLibro)

    // Recibe el objeto completo que arma React Hook Form en el onSubmit.
    // Los nombres de los campos del form coinciden exactamente con los de la BD,
    // así que se pasa directo sin mapear campo por campo.
    const createLibros = (libro) => call("/libros", "POST", libro)
    
    // PATCH: actualiza solo los campos enviados en el body, el resto queda intacto.
    // Para el form de edición mandamos todos los campos igualmente, pero usamos PATCH
    // para consistencia con lo definido en el back (updateOne + $set).
    const updateLibros = (idLibro, libro) => call("/libros/" + idLibro, "PATCH", libro)
    const deleteLibro = (idLibro) => call("/libros/" + idLibro, "DELETE")
    


    return { getLibros, getLibrosById, createLibros, updateLibros, deleteLibro }
}
