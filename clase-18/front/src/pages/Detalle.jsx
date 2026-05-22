/**
 * Detalle.jsx — Página de detalle de un personaje.
 *
 * Lee el ID del personaje desde la URL usando useParams,
 * fetchea su info individual de la API y la muestra en una tarjeta.
 * Solo accesible si hay sesión activa (protegida por ProtectedRoute).
 */

import { useEffect } from "react"
import { useState } from "react"
import { Link, useParams } from "react-router-dom"

const Detalle = () => {
    const [personaje, setPersonaje] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // useParams() lee los segmentos dinámicos de la URL.
    // La ruta está definida como "/detalle/:idPersonaje" en Router.jsx,
    // así que useParams() devuelve { idPersonaje: "valor-de-la-url" }.
    const { idPersonaje } = useParams()

    // Array de dependencias vacío []: el fetch corre UNA sola vez al montar el componente.
    // Funciona porque idPersonaje viene de la URL y no cambia mientras estás en esta página.
    useEffect(() => {
        fetch("https://rickandmortyapi.com/api/character/" + idPersonaje)
            .then(res => {
                // fetch no lanza error en 4xx (ej: 404 Not Found), hay que chequearlo.
                if (res.ok) return res.json()
                throw new Error("No se encontro el personaje.")
            })
            .then(character => setPersonaje(character))
            .catch(err => setError(err))
            .finally( () => setLoading(false) )
    }, [])

    if (loading) return <div className="h1">Cargando..</div>
    if (error) return <div className="h1">No se encontro el personaje</div>

    return (
        <div className="card mb-3 p-1 border-0" >
            <div className="row g-0">
                <div className="col-md-4">
                    <img src={personaje.image} className="img-fluid rounded-start" alt="..." />
                </div>
                <div className="col-md-8">
                    <div className="card-body">
                        <h5 className="card-title">{personaje.name}</h5>
                        {/* location es un objeto { name, url }; se muestra solo el nombre */}
                        <p className="card-text">Ubicacion: {personaje.location.name}</p>
                        {/* episode es un array de URLs; .length da la cantidad de episodios */}
                        <p className="card-text"><small className="text-body-secondary">Aparecio en: </small> {personaje.episode.length}</p>
                    </div>
                    <div>
                        <Link className="btn btn-info" to="/">Volver</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Detalle
