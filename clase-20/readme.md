# Clase 20 — Autenticación con JWT (JSON Web Token)

## Índice

- [¿Qué se hizo esta clase?](#qué-se-hizo-esta-clase)
- [Estructura de archivos](#estructura-de-archivos)
- [El problema que resuelve JWT](#el-problema-que-resuelve-jwt)
- [¿Qué es un JWT?](#qué-es-un-jwt)
- [¿El token se guarda en la base de datos?](#el-token-se-guarda-en-la-base-de-datos)
- [¿Qué es "Bearer"?](#qué-es-bearer)
- [JWT vs OAuth 2.0](#jwt-vs-oauth-20)
- [La clave secreta](#la-clave-secreta)
- [Desglose del código clave (back)](#desglose-del-código-clave)
- [Flujo completo de autenticación](#flujo-completo-de-autenticación)
- [Postman: Authorization vs Headers](#postman-authorization-vs-headers)
- [Front: conexión con la API propia](#front-conexión-con-la-api-propia)
- [Bugs encontrados y corregidos](#bugs-encontrados-y-corregidos)
- [Cómo probarlo en Postman](#cómo-probarlo-en-postman)

---

## ¿Qué se hizo esta clase?

Se trabajó en ambas carpetas: `back/` y `front/`.

**Back:**

| Archivo | Estado | Qué cambió |
|---|---|---|
| `back/services/usuarios.service.js` | Modificado | El método `login` ahora genera y devuelve un token JWT |
| `back/middlewares/token.validate.js` | Nuevo | Middleware que verifica el JWT en cada request a rutas protegidas |
| `back/api/routes/libros.routes.js` | Modificado | Se agregó `validateToken` al GET y POST; nuevo endpoint GET `/api/libros/:idLibro` |
| `back/api/controllers/libros.controllers.js` | Modificado | Se agregó el controller `getLibro` para obtener un libro por su `_id` |
| `back/services/libros.service.js` | Modificado | Se agregó `getLibroById(id)` que convierte el string a ObjectId y hace `findOne` |

**Front:**

| Archivo | Estado | Qué cambió |
|---|---|---|
| `front/src/pages/Login.jsx` | Modificado | Ahora hace fetch a la API propia y guarda el token JWT en localStorage |
| `front/src/pages/Home.jsx` | Modificado | Cambia de API Rick & Morty a API propia de libros; incluye token en el header |
| `front/src/pages/Detalle.jsx` | Modificado | Cambia de personajes a libros; consume el nuevo endpoint `GET /api/libros/:idLibro` |
| `front/src/routes/Router.jsx` | Corregido | `:idPersonaje` → `:idLibro` para que coincida con `useParams` en Detalle |

---

## Estructura de archivos

```
clase-20/
├── back/
│   ├── api/
│   │   ├── controllers/
│   │   │   └── libros.controllers.js  ← MODIFICADO (nuevo controller getLibro)
│   │   └── routes/
│   │       └── libros.routes.js       ← MODIFICADO (nuevo GET /:idLibro + validateToken)
│   ├── middlewares/
│   │   └── token.validate.js          ← NUEVO
│   └── services/
│       ├── libros.service.js          ← MODIFICADO (nueva función getLibroById)
│       └── usuarios.service.js        ← MODIFICADO (login genera JWT)
└── front/
    └── src/
        ├── pages/
        │   ├── Login.jsx              ← MODIFICADO (fetch a API propia + guarda token)
        │   ├── Home.jsx               ← MODIFICADO (API libros + header Authorization)
        │   └── Detalle.jsx            ← MODIFICADO (detalle de libro por _id)
        └── routes/
            └── Router.jsx             ← CORREGIDO (:idPersonaje → :idLibro)
```

---

## El problema que resuelve JWT

Para entender JWT, primero hay que entender el problema que resuelve: **el servidor no recuerda nada entre requests**.

HTTP es un protocolo **stateless** (sin estado): cada request llega sola, sin contexto de lo que pasó antes. Si el usuario hace login en una request, el servidor no sabe que ya se autenticó en la siguiente request.

### El enfoque viejo: sesiones

Antes de JWT, se usaban sesiones:
1. El usuario hace login.
2. El servidor guarda en memoria (o en BD) algo como `{ sessionId: "abc123", email: "user@mail.com" }`.
3. El servidor manda al cliente una cookie con el `sessionId`.
4. En cada request siguiente, el cliente manda la cookie y el servidor busca el `sessionId` para saber quién es.

**Problema:** el servidor tiene que guardar y consultar las sesiones. Si hay millones de usuarios activos, hay que mantener todo ese estado. Y si hay múltiples servidores, hay que sincronizarlos.

### El enfoque moderno: JWT

Con JWT no se guarda nada en el servidor:
1. El usuario hace login.
2. El servidor genera un token que **contiene** los datos del usuario, firmado matemáticamente.
3. El servidor devuelve el token al cliente. Lo "suelta": no lo guarda en ningún lado.
4. El cliente guarda el token (en localStorage, en memoria, etc.).
5. En cada request siguiente, el cliente manda el token en el header.
6. El servidor verifica la firma matemática del token — sin consultar ninguna base de datos — y extrae los datos del usuario directamente del token.

**Ventaja clave:** el servidor no recuerda nada. Puede verificar el token él solo con su clave secreta.

---

## ¿Qué es un JWT?

Un JWT es un string con tres partes separadas por puntos:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9  .  eyJlbWFpbCI6InVzZXJAbWFpbC5jb20ifQ  .  SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
           ↑ HEADER                                   ↑ PAYLOAD                               ↑ SIGNATURE
```

### Header

```json
{ "alg": "HS256", "typ": "JWT" }
```

Indica el algoritmo de firma usado. `HS256` = HMAC con SHA-256.

### Payload

```json
{ "email": "user@mail.com", "age": 25, "iat": 1700000000, "exp": 1700007200 }
```

Los datos que metiste cuando generaste el token. La librería agrega automáticamente:
- `iat` (issued at): timestamp de cuándo se generó
- `exp` (expires at): timestamp de cuándo vence

**El payload es visible para cualquiera.** No está encriptado, solo codificado en Base64. Por eso nunca se pone la contraseña ni datos sensibles ahí.

### Signature

Es el resultado de aplicar el algoritmo HMAC-SHA256 sobre `header + "." + payload` usando la clave secreta. Esto es lo que hace que el token sea confiable: nadie puede modificar el payload sin invalidar la firma (a menos que conozca la clave secreta).

### ¿Por qué se puede confiar en el token?

Si alguien intercepta el token y cambia el payload (por ejemplo, cambia el email por otro), la firma ya no va a coincidir. Cuando el servidor llama a `jwt.verify()`, detecta que la firma no corresponde al payload y rechaza el token.

---

## ¿El token se guarda en la base de datos?

**No. Este es uno de los conceptos más importantes de JWT.**

El servidor genera el token durante el login y lo devuelve al cliente. Después no lo recuerda. Cuando llega una request con un token, el servidor:

1. Extrae el header y el payload.
2. Re-calcula la firma con su clave secreta.
3. Si la firma calculada coincide → válido. Si no → inválido.
4. Revisa el campo `exp` para ver si no expiró.

Todo esto es matemática pura. No hay ninguna consulta a la base de datos.

```
¿Dónde vive el token?

  Al generarse  →  en la respuesta del login (el servidor lo devuelve y lo olvida)
  En el cliente →  guardado en localStorage o en memoria del navegador
  En cada request → en el header Authorization que manda el cliente
  En la BD      →  en ningún lado
  En el servidor entre requests → en ningún lado
```

---

## ¿Qué es "Bearer"?

"Bearer" es un tipo de autenticación definido en el estándar HTTP (RFC 6750). La palabra en inglés significa literalmente **"portador"**: quien lleve (porte) este token, tiene acceso.

El formato del header es siempre:

```
Authorization: Bearer <el-token-jwt>
```

El middleware lo lee con `req.headers.authorization`, que devuelve exactamente ese string:
```
"Bearer eyJhbGciOiJIUzI1NiIs..."
```

Luego hace `split(" ")` para separar la palabra "Bearer" del token en sí.

**Para contexto, otros tipos de autenticación HTTP:**

| Tipo | Formato del header | Usado para |
|---|---|---|
| `Basic` | `Authorization: Basic dXNlcjpwYXNz` | Usuario:contraseña en Base64 (inseguro) |
| `Bearer` | `Authorization: Bearer eyJhbGci...` | Tokens JWT y OAuth 2.0 |
| `API-Key` | `X-API-Key: mi-clave-secreta` | APIs con clave fija |

---

## JWT vs OAuth 2.0

La confusión es común porque se mencionan juntos, pero son cosas completamente distintas:

| | JWT | OAuth 2.0 |
|---|---|---|
| **¿Qué es?** | Un **formato** de token | Un **protocolo** de autorización |
| **¿Para qué sirve?** | Describir cómo se estructura y firma un token | Describir el flujo para que un tercero te dé acceso |
| **Analogía** | El formato del DNI (tamaño, campos, laminado) | El trámite en el Registro Civil para obtener el DNI |
| **¿Quién lo usa?** | Tu propio servidor | Google, GitHub, Facebook para "Login con..." |

### JWT en este proyecto

Tu servidor genera y verifica sus propios tokens. No hay terceros. Este es el uso más simple: **autenticación propia con JWT**.

```
Cliente → POST /api/login → Tu servidor → genera JWT → devuelve al cliente
Cliente → GET /api/libros con JWT → Tu servidor verifica → responde
```

### OAuth 2.0

Es el protocolo detrás del "Iniciar sesión con Google". En lugar de que vos guardes la contraseña del usuario, Google la guarda. Google te da un token (que puede tener formato JWT) que confirma la identidad del usuario.

```
Cliente → "Login con Google" → Google verifica credenciales → Google da un token al cliente
Cliente → Tu servidor con el token de Google → Tu servidor le pregunta a Google si es válido
```

**Resumen práctico:** en este proyecto usás JWT directamente, sin OAuth 2.0. OAuth 2.0 entra cuando necesitás que el usuario se autentique con un proveedor externo. En ambos casos, el token puede tener formato JWT.

---

## La clave secreta

En el código el profe usó `"1234"` como clave secreta:

```js
jwt.sign(payload, "1234", { expiresIn: "2h" })   // genera el token
jwt.verify(token, "1234")                          // lo verifica
```

La clave secreta es el ingrediente que hace que la firma sea única para tu servidor. Si alguien la conoce, puede generar tokens válidos haciéndose pasar por cualquier usuario.

**En producción:**
- Debe ser una cadena larga, aleatoria e impredecible.
- Debe guardarse en una variable de entorno (`.env`), nunca escrita en el código.
- En el código se usa como `process.env.JWT_SECRET`.

```
Clase   →  "1234"                           ← nunca en producción
Producción  →  "k9#mP2@xQr7!nL5vYw8$dJcT3sZbHuA6fR"  ← en .env
```

---

## Desglose del código clave

### Generar el token — `usuarios.service.js`

```js
const token = jwt.sign(
    { ...existe, password: undefined, _id: undefined },  // 1. payload
    "1234",                                               // 2. clave secreta
    { expiresIn: "2h" }                                  // 3. opciones
)
return { ...existe, password: undefined, _id: undefined, token: token }
```

`jwt.sign()` recibe tres argumentos:
1. **Payload**: los datos a guardar dentro del token. Se usa spread para copiar el usuario y se omiten `password` y `_id` para no exponerlos (cualquiera puede decodificar el payload).
2. **Clave secreta**: con esto se firma el token.
3. **Opciones**: `expiresIn: "2h"` hace que el token sea inválido después de 2 horas.

El token se devuelve junto con los datos del usuario. El cliente debe guardarlo.

---

### Verificar el token — `middlewares/token.validate.js`

```js
const auth = req.headers.authorization
// auth es el string: "Bearer eyJhbGciOiJIUzI1NiIs..."

const [ bearer, token ] = auth.split(" ")
// Desestructura el array ["Bearer", "eyJhbGci..."]
// bearer = "Bearer"
// token  = "eyJhbGci..."

if( bearer != "Bearer" || !token ) return res.status(401).json({ message: "token invalido" })

const usuario = jwt.verify(token, "1234")
// Si la firma es válida Y no expiró → devuelve el payload: { email, age, iat, exp }
// Si algo falla → lanza excepción → cae al catch → responde 401

req.usuario = usuario  // el controller puede acceder a req.usuario si lo necesita
next()
```

Todo el código del middleware está dentro de un `try/catch`. Cualquier error (token malformado, firma inválida, token expirado, header ausente) cae al `catch` y responde `401 Unauthorized`.

---

### Proteger una ruta — `libros.routes.js`

```js
router.get("/libros", [validateToken], getLibros)
router.post("/libros", [libroValidate, validateToken], crearLibro)
```

- El GET ahora también requiere token: no cualquiera puede ver el listado.
- El POST tiene dos middlewares en orden: primero valida el body (Yup), después verifica el token.
- Si cualquier middleware falla, el controller nunca se ejecuta.

---

## Flujo completo de autenticación

### Paso 1: Registro (sin cambios desde clase-19)

```
POST /api/
Body: { email, password, passwordConfirm }
→ Se guarda el usuario en MongoDB
← 201 con datos del usuario (sin password)
```

### Paso 2: Login — ahora devuelve token

```
POST /api/login
Body: { email, password }
         ↓
service busca el usuario en MongoDB por email
         ↓
verifica contraseña
         ↓
jwt.sign( { email, age, ... }, "1234", { expiresIn: "2h" } )
         ↓
← 200 con datos del usuario + token JWT

{
    "email": "user@mail.com",
    "age": 25,
    "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**El cliente debe guardar ese token.** Lo va a necesitar en cada request a rutas protegidas.

### Paso 3: Usar una ruta protegida

```
GET /api/libros
Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
         ↓
validateToken middleware:
  1. Lee req.headers.authorization → "Bearer eyJhbGci..."
  2. Separa "Bearer" del token con split(" ")
  3. jwt.verify(token, "1234") → si OK, extrae payload del usuario
  4. req.usuario = payload
  5. next()
         ↓
getLibros controller → service → MongoDB
         ↓
← 200 con array de libros
```

### Si el token no viene o es inválido

```
GET /api/libros
(sin header Authorization)
         ↓
validateToken: auth = undefined → split() lanza excepción → catch
         ↓
← 401 { message: "token invalido" }
(getLibros nunca se ejecuta)
```

---

## Postman: Authorization vs Headers

Hasta ahora solo usabas la pestaña **Body** para mandar datos. Con JWT aparecen dos pestañas nuevas.

### Pestaña Body

Manda datos en el **cuerpo** de la request. Se usa para POST/PUT cuando mandás un JSON.

### Pestaña Headers

Manda metadatos que viajan en la **cabecera** del mensaje HTTP, fuera del body. Son pares clave-valor.

Si quisieras mandar el token manualmente desde acá:

| Key | Value |
|---|---|
| `Authorization` | `Bearer eyJhbGciOiJIUzI1NiIs...` |

### Pestaña Authorization

Es un atajo de Postman. Si seleccionás `Type: Bearer Token` y pegás el token, Postman agrega automáticamente el header `Authorization: Bearer <token>` por vos. Es exactamente lo mismo que cargarlo a mano en Headers, solo más cómodo.

```
Pestaña Authorization → Bearer Token → [pegar token]
         ↕ equivalente exacto ↕
Pestaña Headers → Key: Authorization  /  Value: Bearer [pegar token]
```

En la práctica se usa la pestaña Authorization porque es más clara y menos propensa a errores de tipeo.

---

## Cómo probarlo en Postman

### 1. Registrar un usuario (si no lo hiciste en clase-19)

- Método: `POST`
- URL: `http://localhost:2026/api/`
- Body → raw → JSON:
```json
{
    "email": "usuario@mail.com",
    "password": "Clave123!",
    "passwordConfirm": "Clave123!"
}
```
Respuesta esperada: `201` con los datos del usuario.

### 2. Hacer login para obtener el token

- Método: `POST`
- URL: `http://localhost:2026/api/login`
- Body → raw → JSON:
```json
{
    "email": "usuario@mail.com",
    "password": "Clave123!"
}
```

Respuesta esperada (`200 OK`):
```json
{
    "email": "usuario@mail.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6..."
}
```

**Copiá el valor del campo `token`.**

### 3. Acceder a una ruta protegida con el token

- Método: `GET`
- URL: `http://localhost:2026/api/libros`
- Pestaña **Authorization** → Type: `Bearer Token` → Token: `[pegá el token copiado]`

Respuesta esperada (`200 OK`): array de libros.

### 4. Probar qué pasa sin el token

- Mismo `GET /api/libros` pero sin nada en Authorization.

Respuesta esperada (`401 Unauthorized`):
```json
{ "message": "token invalido" }
```

### 5. Probar qué pasa con un token inventado

- Mismo `GET /api/libros` con Authorization: `Bearer tokeninventado`

Respuesta esperada (`401 Unauthorized`):
```json
{ "message": "token invalido" }
```

> La firma no va a coincidir porque el servidor intenta verificarla con `"1234"` y falla.

---

## Front: conexión con la API propia

Esta clase el front deja de consumir la API pública de Rick & Morty y empieza a hablar con nuestra propia API de libros. El cambio más importante es que ahora las rutas del back requieren un token JWT, así que el front tiene que incluirlo en cada request.

### Cómo se guarda el token al hacer login

Cuando el login es exitoso, el back devuelve:
```json
{ "email": "user@mail.com", "token": "eyJhbGci..." }
```

El front guarda dos cosas en `localStorage`:
```js
localStorage.setItem("session", JSON.stringify({ email }))  // para mostrar en la UI
localStorage.setItem("token", data.token)                    // para autenticar requests
```

`localStorage` es persistente: sobrevive a cerrar el navegador y reiniciar el equipo. El token sigue ahí hasta que el usuario hace logout (que limpia el localStorage) o hasta que vence (2 horas por el `expiresIn: "2h"` del back).

### Cómo se incluye el token en un fetch

Cualquier request a una ruta protegida necesita el header `Authorization`:

```js
fetch("http://localhost:2026/api/libros", {
    headers: {
        authorization: `Bearer ${localStorage.getItem("token")}`
    }
})
```

Si el token no está en localStorage (porque el usuario no hizo login o lo limpió), `localStorage.getItem("token")` devuelve `null`, el header queda `Authorization: Bearer null`, el middleware lo rechaza con 401, y el front redirige al login.

### Qué pasa si el token venció mientras el usuario navega

En `Home.jsx`, si el servidor responde 401, el front redirige al login automáticamente:

```js
.then(res => {
    if (res.ok) return res.json()
    if (res.status == 401) navigate("/login")   // token vencido → al login
    throw new Error("Error al traer los libros")
})
```

Esto evita que el usuario quede "atrapado" en una página que no puede cargar datos.

### Flujo completo front + back

```
Usuario llena el form de login
         ↓
Login.jsx — fetch POST /api/login con { email, password }
         ↓
Back — validateLogin middleware → login service → jwt.sign()
         ↓
← 200 { email, token: "eyJ..." }
         ↓
Login.jsx — localStorage.setItem("token", data.token)
         ↓
navigate("/") → Home.jsx se monta
         ↓
Home.jsx — useEffect → fetch GET /api/libros con header Authorization: Bearer eyJ...
         ↓
Back — validateToken middleware → jwt.verify() → next() → getLibros service → MongoDB
         ↓
← 200 [ { titulo, autor, genero, ... }, ... ]
         ↓
Home.jsx — setLibros(data) → React re-renderiza la tabla con los datos
```

---

## Bugs encontrados y corregidos

Durante el pasaje de Rick & Morty a la API propia se introdujeron varios bugs. Se corrigieron todos:

| Archivo | Bug | Corrección |
|---|---|---|
| `Login.jsx` | URL `/api/usuarios/login` no existe | Corregido a `/api/login` |
| `Login.jsx` | `type="text"` en contraseña (visible en pantalla) | Corregido a `type="password"` |
| `Home.jsx` | `navigate` usado pero `useNavigate` nunca importado (ReferenceError en runtime) | Agregado al import |
| `Home.jsx` | `import { Activity }` de React sin usar | Eliminado |
| `Home.jsx` | `libro.id` — MongoDB usa `_id` | Corregido a `libro._id` en key y en Link |
| `Home.jsx` | Tabla con 5 headers y 4 celdas; "Autor" duplicado | Corregido headers: `#`, `Título`, `Autor`, `Género`, `Ver` |
| `Detalle.jsx` | `<a to="/">` — `to` es prop de `<Link>`, no de `<a>` | Corregido a `href="#"` |
| `Router.jsx` | `:idPersonaje` no coincidía con `useParams` en Detalle que usa `idLibro` | Corregido a `:idLibro` |

### Endpoint de detalle

El endpoint `GET /api/libros/:idLibro` fue implementado en esta misma clase para que `Detalle.jsx` pueda funcionar. Requiere token JWT igual que el resto de los endpoints de libros.
