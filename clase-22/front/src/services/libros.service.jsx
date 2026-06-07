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

    return { getLibros, getLibrosById }
}
