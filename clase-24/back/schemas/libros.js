/**
 * schemas/libros.js — Define las reglas de validación para el recurso "libros".
 *
 * Usa la librería Yup para describir la "forma" esperada del body de la request.
 * Este archivo no accede a la BD ni conoce Express: solo declara reglas.
 * El middleware (libros.validate.js) es quien ejecuta este schema contra el req.body.
 */

import yup from "yup"

// Schema para POST (crear) y PUT (reemplazar): todos los campos son obligatorios.
// El _id no se incluye porque lo genera MongoDB automáticamente al hacer insertOne().
export const libroSchema = yup.object({
    titulo: yup.string().required("El campo titulo es requerido"),
    autor: yup.string().required("El campo autor es requerido"),
    genero: yup.string().required("El campo genero es requerido"),
    descripcion: yup.string().required("El campo descripcion es requerido"),

    // .number() convierte automáticamente strings numéricos ("4800" → 4800) antes de validar.
    // Si el valor no puede convertirse a número, Yup rechaza con un typeError.
    precio: yup.number().required("El campo precio es requerido"),
    anio_publicacion: yup.number().required("El campo anio_publicacion es requerido"),

    editorial: yup.string().required("El campo editorial es requerido"),
    imagen: yup.string().url("El campo imagen debe ser una URL válida").required("El campo imagen es requerido"),
    link: yup.string().url("El campo link debe ser una URL válida").required("El campo link es requerido"),
    seccion: yup.string().required("El campo seccion es requerido"),
})
