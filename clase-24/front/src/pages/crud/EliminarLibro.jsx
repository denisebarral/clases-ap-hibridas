/**
 * EliminarLibro.jsx — Página de confirmación para eliminar un libro.
 *
 * Responsabilidad: mostrar los datos del libro a eliminar y pedir confirmación
 * al usuario antes de hacer el DELETE. Si confirma, llama al service y vuelve al home.
 * Si cancela, vuelve al home sin hacer nada.
 *
 * No elimina directamente sin confirmación: una acción destructiva siempre
 * necesita un paso de validación por parte del usuario.
 */

import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useLibrosService } from "../../services/libros.service"

const EliminarLibro = () => {
    // useParams extrae el :idLibro dinámico de la URL (ej: /eliminar-libro/507f...)
    const { idLibro } = useParams()
    const navigate = useNavigate()
    const { getLibrosById, deleteLibro } = useLibrosService()

    const [libro, setLibro] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Cargamos los datos del libro para mostrárselos al usuario antes de confirmar.
    // El usuario necesita ver QUÉ está por borrar: no se puede confirmar a ciegas.
    useEffect(() => {
        getLibrosById(idLibro)
            .then(data => {
                setLibro(data)
                setLoading(false)
            })
            .catch(() => {
                setError("No se pudo cargar el libro")
                setLoading(false)
            })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    // getLibrosById se recrea en cada render (viene de un hook).
    // Agregarla al array causaría un loop infinito: fetch → setState → re-render → fetch...

    const handleEliminar = () => {
        deleteLibro(idLibro)
            // El segundo argumento de navigate() permite pasar estado entre rutas.
            // Home lo leerá con useLocation() para mostrar el mensaje de éxito.
            .then(() => navigate("/", { state: { mensaje: "Libro eliminado con éxito" } }))
            .catch(err => console.log(err))
    }

    if (loading) return <div className="container mt-4"><p>Cargando libro...</p></div>
    if (error)   return <div className="container mt-4"><p className="text-danger">{error}</p></div>

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Eliminar libro</h2>

            {/* Tarjeta de confirmación: muestra los datos del libro para que el usuario
                pueda verificar que está eliminando el correcto antes de confirmar */}
            <div className="card border-danger">
                <div className="card-header bg-danger text-white">
                    ¿Estás segura de que querés eliminar este libro?
                </div>
                <div className="card-body">
                    <h5 className="card-title">{libro.titulo}</h5>
                    <p className="card-text mb-1"><strong>Autor:</strong> {libro.autor}</p>
                    <p className="card-text mb-1"><strong>Género:</strong> {libro.genero}</p>
                    <p className="card-text mb-3"><strong>Editorial:</strong> {libro.editorial}</p>

                    <p className="text-danger fw-bold">
                        Esta acción no se puede deshacer.
                    </p>

                    <div className="d-flex gap-2">
                        {/* onClick llama a handleEliminar, que hace el DELETE y redirige al home */}
                        <button className="btn btn-danger" onClick={handleEliminar}>
                            Sí, eliminar
                        </button>
                        {/* Cancelar es un Link, no un button: no hace nada en la BD,
                            solo navega de vuelta al home */}
                        <Link to="/" className="btn btn-secondary">
                            Cancelar
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EliminarLibro
