import { MongoClient, ObjectId } from "mongodb"
import { getProductosById, productSave } from "./products.services.js"
const client = new MongoClient("mongodb+srv://admin:admin@dwn4av.gryz2kk.mongodb.net/") //se conectaron al cluster
const db = client.db("dwn4av")                                                          //se conectaron a la db

export async function getPersonajes(filter = {}) {
    const filterMongo = { eliminado: { $ne: true } }
    if (filter?.nombre) filterMongo.$text = { $search: filter.nombre }
    if (filter?.publicado) filterMongo.publisher = filter.publicado
    if (filter?.eliminado) filterMongo.eliminado = true
    return db.collection("personajes").find(filterMongo).toArray()
}

export async function asignarFavorito(idPersonaje, idCafe) {
    try {
        await client.connect()
        const cafe = await getProductosById(idCafe)
        return await db.collection("personajes").updateOne(
            { _id: new ObjectId(idPersonaje) },
            {
                $addToSet: { cafes: { ...cafe } }       //https://www.mongodb.com/es/docs/manual/reference/operator/update/push/
                //https://www.mongodb.com/es/docs/manual/reference/operator/update/addToSet/
            })
    } catch (error) {
        throw new Error(error)
    }
}

export async function getPersonajeById(idPersonaje) {
    console.log(idPersonaje)
    try {
        await client.connect()
        return db.collection("personajes").findOne({ _id: new ObjectId(idPersonaje) })
    } catch (error) {
        throw new Error(error)
    }
}

export async function deletePersonaje(idPersonaje) {
    await client.connect()
    return db.collection("personajes").updateOne(
        { _id: new ObjectId(idPersonaje) },
        {
            $set: { eliminado: true }
        }
    )
}

export async function savePersonaje(personaje) {
    try {
        await client.connect()
        return db.collection("personajes").insertOne(personaje)
    } catch (error) {
        throw new Error(error)
    }
}

export async function editPersonajeById(personaje) {
    console.log(personaje)
    try {
        await client.connect()
        const { _id, ...personajeSinId } = personaje
        console.log(_id, personajeSinId)
        await db.collection("personajes").updateOne({ _id: new ObjectId(_id) }, {
            $set: personajeSinId
        })
        return personaje._id
    } catch (error) {
        throw new Error(error)
    }
}

export async function crearCafe(id, cafe) {
    try {
        await client.connect()
        cafe.duenio = id
        const resultado = await productSave(cafe)
        await db.collection("personajes").updateOne(
            { _id: new ObjectId(id) },
            {
                $addToSet: { cafesCreados: { ...cafe } }       //https://www.mongodb.com/es/docs/manual/reference/operator/update/push/
                //https://www.mongodb.com/es/docs/manual/reference/operator/update/addToSet/
            })
        return cafe
    } catch (error) {
        throw new Error(error)
    }
}

export async function getCafeCreado(id) {
    try {
        await client.connect()
        const cafes = await db.collection("personajes").findOne({ _id: new ObjectId(id) })
        return cafes?.cafesCreados ? cafes?.cafesCreados : []
    } catch (error) {
        throw new Error(error)
    }
}