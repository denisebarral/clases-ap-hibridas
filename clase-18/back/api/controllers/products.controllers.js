import * as service from "../../services/products.services.js"

export function getProductos(req, res) {
    const filter = req.query
    return service.getProductos(filter)
        .then(productos => res.status(200).json(productos))
        .catch(err => res.status(500).json({ message: "No se pueden obtener los productos" }))
}

export function getProductoById(req, res) {
    const id = req.params.id;
    return service.getProductosById(id)
        .then(producto => {
            if (!producto) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }
            res.status(200).json({ data: producto });
        })
        .catch(err => res.status(500).json({ message: "Error interno del servidor" }))
}

export function guardarProducto(req, res) {
    const producto = {
        nombre: req.body.nombre,
        precio: req.body.precio
    }
    service.productSave(producto)
        .then(producto => res.status(201).json(producto))
        .catch(err => res.status(500).json({ message: "Error a interntar guardar el producto" }))
}

export function borrarProducto(req, res) {
    const id = req.params.id
    service.deleteProduct(id)
        .then((producto) => {
            if (Object.keys(producto).length != 0) {
                res.status(202).json(producto)
                return
            }
            res.status(404).json({ message: "No se pudo encontrar el producto" })
        })
        .catch(err => res.status(500).json({ message: "No se pudo borrar el producto" }))
}

export function reemplazarProducto(req, res) {
    const id = req.params.id
    const producto = {
        _id: id,
        nombre: req.body?.nombre,
        precio: req.body?.precio
    }
    service.editProductosById(producto)
        .then(producto => {
            if (Object.keys(producto) != 0) {
                res.status(202).json(producto)
                return
            }
            res.status(404).json({ message: "No pude encontrar el producto" })
        })
        .catch(err => res.status(500).json({ message: "No se puede reemplazar el producto" }))
}

export async function actualizarProducto(req, res) {
    const id = req.params.id

    const productoAntiguo = await service.getProductosById(id)

    const producto = {
        _id: id,
        nombre: req.body?.nombre ? req.body?.nombre : productoAntiguo.nombre,
        precio: req.body?.precio ? req.body?.precio : productoAntiguo.precio,
    }
    service.editProductosById(producto)
        .then(producto => {
            if (Object.keys(producto) != 0) {
                res.status(202).json(producto)
                return
            }
            res.status(404).json({ message: "No pude encontrar el producto" })
        })
        .catch(err => res.status(500).json({ message: "No se puede reemplazar el producto" }))
}