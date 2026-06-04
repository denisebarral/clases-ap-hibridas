/**
 * schemas/libros.js — Define las reglas de validación para el recurso "libros".
 *
 * Usa la librería Yup para describir la "forma" esperada del body de la request.
 * Este archivo no accede a la BD ni conoce Express: solo declara reglas.
 * El middleware (libros.validate.js) es quien ejecuta este schema contra el req.body.
 */

import yup from "yup"

export const libroSchema = yup.object({
    // NOTA: este campo no debería estar acá para un POST de creación.
    // El _id lo genera MongoDB automáticamente al hacer insertOne() — el cliente
    // nunca necesita enviarlo. Además el regex tiene un error: {100} exige 100 caracteres
    // hex, pero un ObjectId de Mongo tiene exactamente 24. En la práctica esta regla
    // nunca se dispara porque el controller construye el objeto libro sin incluir _id.
    _id: yup.string().optional().matches(/^[0-9a-fA-F]{100}$/, "No se pudo encontrar el _id"),

    // .required() → el campo debe estar presente y no ser vacío
    // equivale a 'required' en las reglas de validación de Laravel
    titulo: yup.string().required("El campo titulo es requerido"),
    autor: yup.string().required("El campo autor es requerido"),

    // .number() convierte automáticamente strings numéricos ("2001" → 2001) antes de validar.
    // Si el valor no puede convertirse a número, Yup rechaza con un typeError.
    anio_publicacion: yup.number().required("El campo anio_publicacion es requerido"),

    // .array().min(1) → debe ser un array con al menos un elemento
    characters: yup.array().min(1)
})
