/**
 * ModificarLibro.jsx — Formulario para editar un libro existente.
 *
 * Responsabilidad: cargar los datos actuales del libro desde la API,
 * pre-llenar el formulario con esos datos y, al hacer submit, enviar
 * el libro completo actualizado vía PUT.
 *
 * No hace fetch directamente ni conoce la URL de la API: eso es trabajo del service.
 */

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useLibrosService } from "../../services/libros.service"

const ModificarLibro = () => {
    // useParams extrae el :idLibro dinámico de la URL (ej: /modificar-libro/507f...)
    const { idLibro } = useParams()
    const navigate = useNavigate()
    const { getLibrosById, updateLibros } = useLibrosService()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const {
        register,
        handleSubmit,
        reset,           // reset(valores) pre-llena todos los campos del form de una vez
        formState: { isValid, errors }
    } = useForm({ mode: "onChange" })

    useEffect(() => {
        getLibrosById(idLibro)
            .then(libro => {
                // reset() recibe un objeto con los valores iniciales de cada campo.
                // Los nombres de las keys deben coincidir exactamente con los nombres
                // usados en register() más abajo, de lo contrario el campo queda vacío.
                //
                // { shouldValidate: true } le ordena a RHF que corra la validación
                // inmediatamente después de cargar los valores. Sin esto, con
                // mode: "onChange", isValid queda en false aunque todos los campos
                // tengan datos — y el botón "Guardar cambios" nunca se habilita.
                reset(libro, { shouldValidate: true })
                setLoading(false)
            })
            .catch(() => {
                setError("No se pudo cargar el libro")
                setLoading(false)
            })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    // getLibrosById y reset se recrean en cada render (vienen de hooks).
    // Agregarlos al array causaría un loop infinito, igual que en Home.jsx.

    const onSubmit = (formData) => {
        console.log("formData (PUT):", formData)
        // PUT reemplaza el documento completo: se manda todo el objeto.
        updateLibros(idLibro, formData)
            // El segundo argumento de navigate() permite pasar estado entre rutas.
            // Home lo leerá con useLocation() para mostrar el mensaje de éxito.
            .then(() => navigate("/", { state: { mensaje: "Libro modificado con éxito" } }))
            .catch(err => console.log(err))
    }

    if (loading) return <div className="container mt-4"><p>Cargando libro...</p></div>
    if (error)   return <div className="container mt-4"><p className="text-danger">{error}</p></div>

    return (
        <div className="container mt-4">
            <div className="d-flex align-items-center gap-3 mb-4">
                <h2 className="mb-0">Editar libro</h2>
                {/* Botón de escape rápido por si el usuario decide no editar */}
                <Link to="/" className="btn btn-outline-secondary btn-sm">Cancelar</Link>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>

                <div className="mb-3">
                    <label className="form-label">Título</label>
                    <input
                        type="text"
                        className={`form-control ${errors.titulo ? "is-invalid" : ""}`}
                        {...register("titulo", { required: "El título es requerido" })}
                    />
                    {errors.titulo && <div className="invalid-feedback">{errors.titulo.message}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label">Autor</label>
                    <input
                        type="text"
                        className={`form-control ${errors.autor ? "is-invalid" : ""}`}
                        {...register("autor", { required: "El autor es requerido" })}
                    />
                    {errors.autor && <div className="invalid-feedback">{errors.autor.message}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label">Género</label>
                    <input
                        type="text"
                        className={`form-control ${errors.genero ? "is-invalid" : ""}`}
                        {...register("genero", { required: "El género es requerido" })}
                    />
                    {errors.genero && <div className="invalid-feedback">{errors.genero.message}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                        rows={3}
                        className={`form-control ${errors.descripcion ? "is-invalid" : ""}`}
                        {...register("descripcion", { required: "La descripción es requerida" })}
                    />
                    {errors.descripcion && <div className="invalid-feedback">{errors.descripcion.message}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label">Precio</label>
                    {/* valueAsNumber: true → el valor llega como Number en formData, no como string */}
                    <input
                        type="number"
                        className={`form-control ${errors.precio ? "is-invalid" : ""}`}
                        {...register("precio", { required: "El precio es requerido", valueAsNumber: true })}
                    />
                    {errors.precio && <div className="invalid-feedback">{errors.precio.message}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label">Año de publicación</label>
                    <input
                        type="number"
                        className={`form-control ${errors.anio_publicacion ? "is-invalid" : ""}`}
                        {...register("anio_publicacion", { required: "El año es requerido", valueAsNumber: true })}
                    />
                    {errors.anio_publicacion && <div className="invalid-feedback">{errors.anio_publicacion.message}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label">Editorial</label>
                    <input
                        type="text"
                        className={`form-control ${errors.editorial ? "is-invalid" : ""}`}
                        {...register("editorial", { required: "La editorial es requerida" })}
                    />
                    {errors.editorial && <div className="invalid-feedback">{errors.editorial.message}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label">URL de imagen</label>
                    <input
                        type="url"
                        className={`form-control ${errors.imagen ? "is-invalid" : ""}`}
                        {...register("imagen", { required: "La URL de imagen es requerida" })}
                    />
                    {errors.imagen && <div className="invalid-feedback">{errors.imagen.message}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label">Link</label>
                    <input
                        type="url"
                        className={`form-control ${errors.link ? "is-invalid" : ""}`}
                        {...register("link", { required: "El link es requerido" })}
                    />
                    {errors.link && <div className="invalid-feedback">{errors.link.message}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label">Sección</label>
                    <input
                        type="text"
                        className={`form-control ${errors.seccion ? "is-invalid" : ""}`}
                        {...register("seccion", { required: "La sección es requerida" })}
                    />
                    {errors.seccion && <div className="invalid-feedback">{errors.seccion.message}</div>}
                </div>

                {/* disabled={!isValid}: el botón queda bloqueado si algún campo está vacío o inválido */}
                <button type="submit" className="btn btn-warning" disabled={!isValid}>
                    Guardar cambios
                </button>

            </form>
        </div>
    )
}

export default ModificarLibro
