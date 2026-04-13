# API REST — Conceptos clave

> Este archivo expande los apuntes de clase con más detalle sobre cada punto.
> La definición oficial de AWS está linkeada al final; vale la pena leerla una vez
> que termines de leer esto, va a tener mucho más sentido.

---

## ¿Qué es una API REST?

Una **API** (Application Programming Interface) es un contrato entre dos programas:
uno le dice al otro "si me mandás tal pedido, yo te respondo de tal manera".

**REST** (Representational State Transfer) es un conjunto de **convenciones** — no
es una tecnología ni una librería, es un estilo de diseño — que define cómo deben
estructurarse esos pedidos y respuestas para que sean predecibles, consistentes
y fáciles de entender por cualquier cliente (un browser, una app mobile, Postman, etc.).

Cuando decimos que una API "es RESTful", significa que respeta esas convenciones.

---

## Regla 1 — La URL identifica un RECURSO, no una acción

```
URL -> Uniform Resource Locator   (dónde está el recurso)
URI -> Uniform Resource Identifier (quién es el recurso, sin importar dónde)
```

La URL describe **qué cosa** estás tocando, no **qué le vas a hacer**.
Lo que le hacés se define con el verbo HTTP (ver Regla 2).

```
/productos/nuevo         ❌  "nuevo" es una acción, no un recurso
/productos/edit/18       ❌  "edit" es una acción, no un recurso
/productos               ✅  identifica la colección de productos
/productos/18            ✅  identifica el producto con id 18
```

**¿Por qué importa esto?**
Porque si la acción está en la URL, terminás con URLs inconsistentes:
`/borrarProducto/18`, `/productos/delete/18`, `/removeItem?id=18` — todos
significan lo mismo pero son tres contratos distintos. REST resuelve eso
poniendo la acción en el verbo y dejando la URL solo para el recurso.

---

## Regla 2 — Las acciones se definen con los verbos HTTP

El protocolo HTTP tiene verbos (también llamados "métodos") que indican
la **intención** del pedido. REST los usa con un significado específico:

| Verbo    | Acción            | Ejemplo de uso en esta app              |
|----------|-------------------|-----------------------------------------|
| `GET`    | Obtener/leer      | Traer todos los productos               |
| `POST`   | Crear             | Guardar un producto nuevo               |
| `PUT`    | Reemplazar        | Sobreescribir un producto completo      |
| `PATCH`  | Actualizar        | Modificar solo un campo del producto    |
| `DELETE` | Borrar            | Eliminar un producto                    |

Combinando recurso + verbo obtenés las 5 operaciones básicas (**CRUD**):

```
GET    /productos        → listar todos
GET    /productos/18     → leer uno
POST   /productos        → crear uno nuevo
PUT    /productos/18     → reemplazar el producto 18 completo
PATCH  /productos/18     → actualizar un campo del producto 18
DELETE /productos/18     → borrar el producto 18
```

> **Importante — HTML Forms vs REST:**
> Los formularios HTML solo soportan `GET` y `POST`. Por eso en clase-06
> el profe usa `POST /productos/editar/:id` y `POST /productos/borrar/:id`
> para editar y borrar — es una limitación del HTML, no de REST.
> Cuando construyas una API pura (consumida por fetch/axios desde el frontend
> o desde Postman), ahí sí vas a usar `PUT`, `PATCH` y `DELETE` directamente.

---

## Regla 3 — Los datos se transportan en JSON

El cliente y el servidor se hablan en **JSON** (JavaScript Object Notation).
JSON es el "idioma común" de las APIs modernas: es liviano, legible, y
cualquier lenguaje sabe leerlo y escribirlo.

```json
{
  "id": 1,
  "nombre": "Espresso",
  "precio": 1500
}
```

En Express, para que el servidor pueda leer JSON que llega en el body,
necesitás activar el middleware `express.json()` en `main.js`:

```js
app.use(express.json())
```

Actualmente en el proyecto está comentado porque los datos llegan de un
formulario HTML (formato `urlencoded`), no de un cliente que manda JSON.
Cuando pases a consumir la API desde el frontend con `fetch`, vas a
descomentar esa línea y sacar el `urlencoded`.

---

## Regla 4 — Los estados de la petición se indican con Status Codes

Cada respuesta HTTP incluye un **código de estado numérico** que le dice
al cliente si todo salió bien, si hubo un error, o qué pasó exactamente.
No alcanza con devolver datos; hay que devolver el código correcto.

```
1xx  → Informativos       Raramente los ves directo (el protocolo los usa internamente)
2xx  → Éxito              Todo salió bien
3xx  → Redirección        El recurso se movió; seguí esta otra URL
4xx  → Error del cliente  El pedido está mal (datos incorrectos, no autorizado, no existe)
5xx  → Error del servidor El pedido estaba bien pero el servidor explotó
```

Los más comunes que vas a usar o ver:

| Código | Nombre                | Cuándo usarlo                                              |
|--------|-----------------------|------------------------------------------------------------|
| `200`  | OK                    | GET o PATCH exitoso                                        |
| `201`  | Created               | POST exitoso — se creó un recurso nuevo                    |
| `204`  | No Content            | DELETE exitoso — no hay nada que devolver                  |
| `301`  | Moved Permanently     | La URL cambió para siempre                                 |
| `302`  | Found (redirect)      | Redirección temporal (lo que hace `res.redirect()` en Express) |
| `400`  | Bad Request           | El cliente mandó datos inválidos o incompletos             |
| `401`  | Unauthorized          | No estás autenticado (no iniciaste sesión)                 |
| `403`  | Forbidden             | Estás autenticado pero no tenés permiso                    |
| `404`  | Not Found             | El recurso no existe                                       |
| `500`  | Internal Server Error | El servidor tiró un error inesperado                       |

> **¿Para qué linkeó http.dog?**
> Es un sitio que muestra cada código de estado con una foto de un perro.
> El chiste es pedagógico: es más fácil recordar que 404 es "not found" si
> lo asociás con un perro buscando algo que no está. También existe
> [http.cat](https://http.cat) con gatos, si preferís.

En Express, el status code se envía así:

```js
res.status(201).json(productoGuardado)   // 201 Created
res.status(404).json({ error: "Producto no encontrado" })
res.status(500).json({ error: "Error interno del servidor" })
```

Actualmente en el proyecto los controladores no setean status codes
explícitamente — Express usa 200 por defecto en `res.send()`. En una
API REST prolija, cada respuesta debería devolver el código apropiado.

---

## REST en Node/Express vs Laravel/PHP

La idea de REST es **independiente del lenguaje** — es solo una convención.
Pero cada ecosistema tiene su forma de implementarla:

### Lo que hacés en Express:
```js
// Definís cada verbo + ruta manualmente
router.get("/productos",     controller.getAll)
router.get("/productos/:id", controller.getOne)
router.post("/productos",    controller.create)
router.put("/productos/:id", controller.update)
router.delete("/productos/:id", controller.destroy)
```

Express es minimalista: vos armás la estructura. Cada ruta, cada verbo,
cada respuesta es código que escribís explícitamente. Más control, más trabajo.

### Lo que hacés en Laravel:
```php
// Una sola línea genera las 7 rutas REST estándar automáticamente
Route::resource('productos', ProductoController::class);
```

Laravel tiene `Route::resource()` que genera de golpe todas las rutas
convencionales (index, show, create, store, edit, update, destroy) y las
mapea a métodos del controller con nombres estandarizados.
También tiene Eloquent (el ORM) que trabaja muy bien con esa estructura.

### La diferencia filosófica:
- **Laravel** es "opinionated": te dice cómo hacer las cosas, genera mucho
  por convención, y si seguís la estructura que espera, vas rápido.
- **Express** es "unopinionated": te da las herramientas pero no te obliga
  a ninguna estructura. Más flexible, más decisiones para tomar vos.

En ambos casos el resultado final puede ser una API REST correcta.
La diferencia está en cuánto te da el framework vs cuánto armás vos.

---

## Links de referencia

- [Definición REST — AWS](https://aws.amazon.com/what-is/restful-api/) — buena
  introducción oficial con diagramas, conviene leerla después de entender los
  conceptos de arriba.
- [http.dog](https://http.dog/) — referencia visual de status codes (con perros).
