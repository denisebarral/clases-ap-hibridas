/**
 * schemas/usuarios.js — Define las reglas de validación para el recurso "usuarios".
 *
 * Exporta DOS schemas distintos porque login y registro tienen reglas diferentes:
 * al loguearse no tiene sentido validar que la contraseña sea fuerte (ya está guardada
 * como sea), ni pedir que la confirme. Dos operaciones distintas → dos schemas distintos.
 */

import yup from "yup"

// Schema para el LOGIN: solo verifica que email y password tengan el formato correcto.
export const loginSchema = yup.object({
    // .email() verifica que el string tenga la forma usuario@dominio.ext
    // .typeError() sobreescribe el mensaje genérico de Yup cuando el tipo no coincide
    email: yup.string().email().typeError("Debe ser un mail valido").required(),
    password: yup.string().required()
})

// Schema para el REGISTRO: valida fortaleza de contraseña y confirmación.
export const registerSchema = yup.object({
    email: yup.string().email().typeError("Debe ser un mail valido").required(),
    password: yup.string().required()
                .min(8, "La contraseña debe tener al menos 8 caracteres")
                // Cada .matches() agrega una regla independiente sobre el mismo campo.
                // El primer argumento es una regex, el segundo es el mensaje de error.
                // abortEarly: false en el middleware permite que se acumulen TODOS estos errores.
                .matches(/[0-9]/, "La contraseña debe tener al menos un numero")      // al menos un dígito
                .matches(/[A-Z]/, "La contraseña debe tener al menos una mayuscula")  // al menos una mayúscula
                .matches(/[a-z]/, "La contraseña debe tener al menos una minuscula")  // al menos una minúscula
                .matches(/[@!$%&?=]/, "La contraseña debe tener al menos un caracter especial"), // caracteres especiales permitidos

    // .oneOf([yup.ref("password")]) → este campo debe ser IGUAL al valor actual de "password".
    // yup.ref("password") es una referencia dinámica que Yup resuelve al momento de validar.
    // Equivale a 'confirmed' o 'same:password' en Laravel.
    passwordConfirm: yup.string().oneOf([ yup.ref("password") ], "Las contraseñas deben ser iguales").required(),

    // .positive() → el número debe ser mayor a cero
    // .optional() → el campo puede no estar presente; si está, debe cumplir las reglas de arriba
    age: yup.number().positive().optional()
})
