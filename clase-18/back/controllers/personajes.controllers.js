import { createPage } from "../page/utils.js"
import * as service from "../services/personajes.service.js"
import * as view from "../views/personajes.views.js"

export function getPersonajes(req, res) {
    const filter = req.query
    service.getPersonajes(filter)
        .then(cafes => res.send(view.createProductList(cafes)))
        .catch(err => res.send("No se pudo leer el archivo"))
}

// export function getProductosById(req, res) {
//     const id = req.params.id
//     productsService.getProductosById(id)
//         .then(cafe => res.send(productsView.createProductPage(cafe)))
//         .catch(err => res.send(productsView.create404Page()))
// }

// export function productForm(req, res) {
//     res.send(productsView.createProductForm())
// }

// export function productSave(req, res) {
//     const producto = req.body
//     console.log(producto)
//     productsService.productSave(producto)
//         .then((productoGuardado) => res.send(productsView.createProductPage(productoGuardado)))
//         .catch((err) => res.send("No se pudo guardar el archivo"))
// }

// export function editProductForm(req, res) {
//     const id = req.params.id
//     productsService.getProductosById(id)
//         .then(producto => res.send(productsView.editProductForm(producto)))
//         .catch((err) => res.send("No se pudo editar el archivo"))
// }

// export function productEdit(req, res) {
//     const id = req.params.id
//     const producto = {
//         nombre: req.body.nombre,
//         precio: req.body.precio
//     }
//     productsService.editProductosById(id, producto)
//         .then( productoEditado => res.send(productsView.createProductPage(productoEditado)) )
//         .catch( err => res.send("No se pudo editar") )
// }

// export function deleteProductform(req, res){
//     const id = req.params.id
//     productsService.getProductosById(id)
//         .then(producto => res.send(productsView.deleleProduct(producto)))
//         .catch((err) => res.send("No se pudo editar el archivo"))
// }

// export function deleteProduct(req, res){
//     const id = req.params.id
//     productsService.deleteProduct( id )
//         .then(producto => res.send(productsView.createProductPage(producto)))
//         .catch( err => res.send("No se pudo borrar") )
// }