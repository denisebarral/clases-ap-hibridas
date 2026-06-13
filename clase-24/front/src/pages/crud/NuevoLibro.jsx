/**
 * NuevoLibro.jsx — Formulario para crear un nuevo libro.
 *
 * Responsabilidad: renderizar el formulario, validar los campos con React Hook Form
 * y enviar los datos al service para insertarlo en la API.
 *
 * No hace fetch directamente ni conoce la URL de la API: eso es trabajo del service.
 */

import { useForm } from "react-hook-form"
import { useLibrosService } from "../../services/libros.service"
import { useNavigate } from "react-router-dom"

const NuevoLibro = () => {
    const {
        register,
        handleSubmit,
        formState: { isValid, errors }
    } = useForm({
        // mode: "onChange" hace que la validación corra mientras el usuario escribe,
        // no recién al hacer submit. Necesario para que `isValid` sea preciso en tiempo real
        // y el botón Guardar se habilite/deshabilite a medida que se completan los campos.
        mode: "onChange"
    })

    const navigate = useNavigate()
    const { createLibros } = useLibrosService()

    const onSubmit = (formData) => {
        // formData tiene exactamente los mismos nombres que los campos de la BD,
        // por lo que se pasa el objeto completo sin desestructurar.
        // precio y anio_publicacion llegan como Number gracias a valueAsNumber (ver register abajo).
        console.log("formData:", formData)
        createLibros(formData)
            .then(() => navigate("/"))
            .catch(err => console.log(err))
    }

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Nuevo libro</h2>

            <form onSubmit={handleSubmit(onSubmit)}>

                <div className="mb-3">
                    <label className="form-label">Título</label>
                    <input
                        type="text"
                        // is-invalid activa el borde rojo de Bootstrap cuando hay error en el campo
                        className={`form-control ${errors.titulo ? "is-invalid" : ""}`}
                        {...register("titulo", { required: "El título es requerido" })}
                    />
                    {/* invalid-feedback es la clase de Bootstrap para el mensaje de error rojo */}
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
                    {/* textarea para texto largo: más cómodo que un input de una sola línea */}
                    <textarea
                        rows={3}
                        className={`form-control ${errors.descripcion ? "is-invalid" : ""}`}
                        {...register("descripcion", { required: "La descripción es requerida" })}
                    />
                    {errors.descripcion && <div className="invalid-feedback">{errors.descripcion.message}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label">Precio</label>
                    {/* valueAsNumber: true convierte el valor del input a Number antes de incluirlo
                        en formData. Sin esto, precio llegaría como string "4800" en lugar de 4800,
                        y la BD lo guardaría con tipo incorrecto. */}
                    <input
                        type="number"
                        className={`form-control ${errors.precio ? "is-invalid" : ""}`}
                        {...register("precio", { required: "El precio es requerido", valueAsNumber: true })}
                    />
                    {errors.precio && <div className="invalid-feedback">{errors.precio.message}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label">Año de publicación</label>
                    {/* El nombre del campo debe coincidir exactamente con el de la BD: anio_publicacion.
                        En la versión anterior estaba registrado como "anio" y no se guardaba. */}
                    <input
                        type="number"
                        className={`form-control ${errors.anio_publicacion ? "is-invalid" : ""}`}
                        {...register("anio_publicacion", { required: "El año de publicación es requerido", valueAsNumber: true })}
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

                {/* disabled={!isValid} deshabilita el botón si algún campo obligatorio está vacío o inválido.
                    Funciona gracias a mode: "onChange" definido arriba en useForm. */}
                <button type="submit" className="btn btn-primary" disabled={!isValid}>
                    Guardar libro
                </button>

            </form>
        </div>
    )
}

export default NuevoLibro
