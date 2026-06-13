/**
 * Detalle.jsx — Página de detalle de un libro.
 *
 * Lee el _id del libro desde la URL usando useParams,
 * lo busca en la API a través del service y muestra la información completa.
 * Solo accesible si hay sesión activa (protegida por ProtectedRoute).
 *
 * Cambios respecto a clase-20:
 *   - El fetch se delega a useLibrosService().getLibrosById
 *   - No necesita leer el token: api.service lo incluye automáticamente
 */

import { useEffect } from "react"
import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useLibrosService } from "../../services/libros.service"

const Detalle = () => {
    const [libro, setLibro] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // useParams() lee el segmento dinámico :idLibro de la URL.
    // Si la URL es /detalle/507f1f77bcf86cd799439011, idLibro = "507f1f77bcf86cd799439011"
    const { idLibro } = useParams()

    // getLibrosById es la función del service que hace GET /api/libros/:idLibro
    const { getLibrosById } = useLibrosService()

    // Array de dependencias vacío []: el fetch corre UNA sola vez al montar el componente.
    useEffect(() => {
        getLibrosById(idLibro)
            // La API devuelve el objeto del libro directamente (no envuelto en { data: ... })
            .then(data => setLibro(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="h1">Cargando..</div>
    if (error) return <div className="h1">No se encontro el libro</div>

    return (
        <div className="card mb-3 p-1 border-0">
            <div className="row g-0">
                <div className="col-md-8">
                    <div className="col-md-2">
                        <img
                            src={libro.imagen}
                            className="img-fluid rounded-start"
                            alt={libro.titulo}
                        />
                    </div>
                    <div className="card-body">
                        <h5 className="card-title">{libro.titulo}</h5>
                        <p className="card-text">Autor: {libro.autor}</p>
                        <p className="card-text">Género: {libro.genero}</p>
                        <p className="card-text">Descripción: {libro.descripcion}</p>
                        {/* toFixed(2) formatea el número con 2 decimales: 4800 → "4800.00" */}
                        <p className="card-text">Precio: ${libro.precio.toFixed(2)}</p>
                        <p className="card-text">Editorial: {libro.editorial}</p>
                        <p className="card-text">
                            <small className="text-body-secondary">Año publicación: </small>
                            {libro.anio_publicacion}
                        </p>
                    </div>
                    <div>
                        <Link className="btn btn-info" to="/">Volver</Link>
                        <a className="btn btn-success" href="#">Comprar</a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Detalle
