/**
 * Detalle.jsx — Página de detalle de un libro.
 *
 * Lee el _id del libro desde la URL usando useParams,
 * fetchea su información individual de la API y la muestra en una tarjeta.
 * Solo accesible si hay sesión activa (protegida por ProtectedRoute).
 *
 * PENDIENTE: el endpoint GET /api/libros/:id no está implementado en el backend.
 * Actualmente solo existen GET /api/libros (lista) y POST /api/libros (crear).
 * Hasta que se agregue ese endpoint, esta página siempre mostrará el error.
 */

import { useEffect } from "react"
import { useState } from "react"
import { Link, useParams } from "react-router-dom"

const Detalle = () => {
    const [libro, setLibro] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // useParams() lee los segmentos dinámicos de la URL.
    // La ruta está definida como "/detalle/:idLibro" en Router.jsx,
    // así que useParams() devuelve { idLibro: "el-id-de-la-url" }.
    const { idLibro } = useParams()

    // Array de dependencias vacío []: el fetch corre UNA sola vez al montar el componente.
    // idLibro viene de la URL y no cambia mientras estás en esta página.
    useEffect(() => {
        // Se incluye el token en Authorization porque el endpoint (cuando exista)
        // también requerirá autenticación, igual que GET /api/libros.
        fetch("http://localhost:2026/api/libros/" + idLibro, {
            headers: {
                authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })
            .then(res => {
                // fetch no lanza error en 4xx — hay que chequear res.ok manualmente.
                if (res.ok) return res.json()
                throw new Error("No se encontro el libro.")
            })
            .then(libro => setLibro(libro))
            .catch(err => setError(err))
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
                        {/* Link de React Router: navega sin recargar la página */}
                        <Link className="btn btn-info" to="/">Volver</Link>
                        {/* <a> no entiende la prop "to" (eso es de Link). Se usa href en su lugar. */}
                        <a className="btn btn-success" href="#">Comprar</a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Detalle
