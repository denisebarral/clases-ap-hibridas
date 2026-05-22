import * as services from "../../services/usuarios.service.js"

export function createUser(req, res){
    services.createUser(req.body)
        .then( usuario => res.status(201).json(usuario) )
        .catch( err => res.status(500).json(err) )
}

export function login(req, res){
    services.login(req.body)
        .then( usuario => res.status(200).json(usuario) )
        .catch( err => res.status(400).json({ message: "Usuario o contraseña incorrectos" }) )
}