import yup from "yup"

export const loginSchema = yup.object({
    email: yup.string().email().typeError("Debe ser un mail valido").required(),
    password: yup.string().required()
})

export const registerSchema = yup.object({
    email: yup.string().email().typeError("Debe ser un mail valido").required(),
    password: yup.string().required()
                .min(8, "La contraseña debe tener al menos 8 caracteres")
                .matches(/[0-9]/, "La contraseña debe tener al menos un numero")
                .matches(/[A-Z]/, "La contraseña debe tener al menos una mayuscula")
                .matches(/[a-z]/, "La contraseña debe tener al menos una minuscula")
                .matches(/[@!$%&?=]/, "La contraseña debe tener al menos un caracter especial"),
    passwordConfirm: yup.string().oneOf([ yup.ref("password") ], "Las contraseñas deben ser iguales").required(),
    age: yup.number().positive().optional()
})