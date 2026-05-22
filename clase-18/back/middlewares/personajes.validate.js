import { personajeSchema } from "../schemas/personajes.js";

export function personajeValidate(req, res, next){
    console.log("Validando...")
    personajeSchema.validate( req.body, { abortEarly: false, stripUnknown: true } )
        .then( () => next() )
        .catch( err => res.status(400).json({message: err.errors}) )
}