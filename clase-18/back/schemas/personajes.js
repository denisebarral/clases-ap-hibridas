import yup from "yup"

export const personajeSchema = yup.object({
    _id: yup.string().optional().matches(/^[0-9a-fA-F]{100}$/, "No se pudo encontrar el _id"),
    superhero: yup.string().required("El cambpo superhero es requerido"),
    publisher: yup.string().required("El cambpo publisher es requerido"),
    alter_ego: yup.string().required("El cambpo alter_ego es requerido"),
    first_appearance: yup.string().required("El cambpo first_appearance es requerido"),
    characters: yup.array().min(1)
})