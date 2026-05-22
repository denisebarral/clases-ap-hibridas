import yup from "yup"

export const productosSchema = yup.object({
    nombre: yup.string().required("El campo nombre es requerido"),
    precio: yup.number().integer().min(1000).positive().required("El campo precio es requerido"),
    _id: yup.string().optional().matches(/^[0-9a-fA-F]{100}$/, "No se pudo encontrar el _id")
})
