import * as service from "../../services/personajes.service.js"

export function getPersonajes(req, res) {
    const filter = req.query
    return service.getPersonajes(filter)
        .then(personajes => res.status(200).json(personajes))
        .catch(err => res.status(500).json({ message: "No se pueden obtener los productos" }))
}
export function asignarFavorito(req, res) {
    const idPersonaje = req.params.id
    const idCade = req.body.idCafe
    return service.asignarFavorito(idPersonaje, idCade)
        .then(respuesta => res.status(201).json(respuesta))
        .catch(err => res.status(500).json({ message: "No se puede asignar el cafe" }))
}
export function getPersonajeById(req, res) {
    // console.log(req.params)
    const id = req.params.id;
    return service.getPersonajeById(id)
        .then(personaje => {
            if (!personaje) {
                return res.status(404).json({ message: 'personaje no encontrado' });
            }
            res.status(200).json({ data: personaje });
        })
        .catch(err => res.status(500).json({ message: "Error interno del servidor" }))
}

export function guardarPersonaje(req, res) {
    const personaje = {
        "superhero": req.body.superhero,
        "publisher": req.body.publisher,
        "alter_ego": req.body.alter_ego,
        "first_appearance": req.body.first_appearance,
        "characters": req.body.characters,
        "cafes": []
    }
    service.savePersonaje(personaje)
        .then(personaje => res.status(201).json(personaje))
        .catch(err => res.status(500).json({ message: "Error a interntar guardar el producto" }))
}

export function borrarPersonaje(req, res) {
    const id = req.params.id
    service.deletePersonaje(id)
        .then((personaje) => {
            if (Object.keys(personaje).length != 0) {
                res.status(202).json(personaje)
                return
            }
            res.status(404).json({ message: "No se pudo encontrar el personaje" })
        })
        .catch(err => res.status(500).json({ message: "No se pudo borrar el personaje" }))
}

export function reemplazarPersonaje(req, res) {
    // console.log(req.params.id)
    // console.log(req.body)
    const id = req.params?.id
    const personaje = {
        "_id": id,
        "superhero": req.body?.superhero,
        "publisher": req.body?.publisher,
        "alter_ego": req.body?.alter_ego,
        "first_appearance": req.body?.first_appearance,
        "characters": req.body?.characters,
        "cafes": req.body?.cafes
    }
    service.editPersonajeById(personaje)
        .then(personaje => {
            if (Object.keys(personaje) != 0) {
                res.status(202).json(personaje)
                return
            }
            res.status(404).json({ message: "No pude encontrar el personaje" })
        })
        .catch(err => res.status(500).json({ message: "No se puede reemplazar el personaje" }))
}

export async function actualizarPersonaje(req, res) {
    const id = req.params.id

    const personajeAntiguo = await service.getPersonajeById(id)
    const personaje = {
        "_id": id,
        "superhero": req.body?.superhero ? req.body?.superhero : personajeAntiguo.superhero,
        "publisher": req.body?.publisher ? req.body?.publisher : personajeAntiguo.publisher,
        "alter_ego": req.body?.alter_ego ? req.body?.alter_ego : personajeAntiguo.alter_ego,
        "first_appearance": req.body?.first_appearance ? req.body?.first_appearance : personajeAntiguo.first_appearance,
        "characters": req.body?.characters ? req.body?.characters : personajeAntiguo.characters,
        "cafes": req.body?.cafes ? req.body?.cafes : personajeAntiguo.cafes
    }
    service.editPersonajeById(personaje)
        .then(producto => {
            if (Object.keys(producto) != 0) {
                res.status(202).json(producto)
                return
            }
            res.status(404).json({ message: "No pude encontrar el producto" })
        })
        .catch(err => res.status(500).json({ message: "No se puede reemplazar el producto" }))
}

export async function crearCafe(req, res) {
    const id = req.params.id
    const cafe = req.body
    service.crearCafe(id, cafe)
        .then(producto => {
            if (Object.keys(producto) != 0) {
                res.status(201).json(producto)
                return
            }
            res.status(404).json({ message: "No pude crear el producto" })
        })
        .catch(err => res.status(500).json({ message: "No se puede reemplazar el producto" }))
}

export async function getCafeCreado(req, res) {
    const id = req.params.id
    service.getCafeCreado(id)
        .then(productos => {
            res.status(200).json(productos)
        })
        .catch(err => res.status(500).json({ message: "No se puede reemplazar el producto" }))
}