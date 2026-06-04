# Clase 21 — Bcrypt, variables de entorno y separación de responsabilidades

## Índice

- [¿Qué se hizo esta clase?](#qué-se-hizo-esta-clase)
- [Estructura de archivos](#estructura-de-archivos)
- [¿Qué es bcrypt y por qué hashear contraseñas?](#qué-es-bcrypt-y-por-qué-hashear-contraseñas)
- [Salt rounds: ¿qué es el número 11?](#salt-rounds-qué-es-el-número-11)
- [¿Qué son las variables de entorno?](#qué-son-las-variables-de-entorno)
- [El archivo .env y dotenv](#el-archivo-env-y-dotenv)
- [token.service.js: separación de responsabilidades](#tokenservicejs-separación-de-responsabilidades)
- [Bug corregido: login con bcrypt.compare](#bug-corregido-login-con-bcryptcompare)
- [Flujo completo de registro y login](#flujo-completo-de-registro-y-login)
- [Cómo probarlo en Postman](#cómo-probarlo-en-postman)

---

## ¿Qué se hizo esta clase?

Solo se trabajó en la carpeta `back/`. No hubo cambios en `front/`.

| Archivo | Estado | Qué cambió |
|---|---|---|
| `back/services/usuarios.service.js` | Modificado | `createUser` ahora verifica duplicados y hashea la contraseña con bcrypt |
| `back/services/token.service.js` | Nuevo | Centraliza la generación y verificación de JWT; usa `process.env` para la clave |
| `back/middlewares/token.validate.js` | Modificado | Delega la verificación del token a `token.service.js` en lugar de usar `jwt.verify` directo |
| `back/.env` | Nuevo | Almacena `SECRET_PASSWORD` fuera del código fuente |

**Nuevas dependencias instaladas:**

| Paquete | Para qué sirve |
|---|---|
| `bcryptjs` | Hashear y comparar contraseñas de forma segura |
| `dotenv` | Leer el archivo `.env` y cargarlo en `process.env` |

---

## Estructura de archivos

```
clase-21/
└── back/
    ├── middlewares/
    │   └── token.validate.js    ← MODIFICADO (delega a token.service.js)
    ├── services/
    │   ├── token.service.js     ← NUEVO (createToken + validateToken)
    │   └── usuarios.service.js  ← MODIFICADO (createUser con bcrypt)
    └── .env                     ← NUEVO (SECRET_PASSWORD — no se sube a git)
```

---

## ¿Qué es bcrypt y por qué hashear contraseñas?

Hasta clase-20, las contraseñas se guardaban en texto plano en MongoDB:
```
{ email: "user@mail.com", password: "Clave123!" }
```

Eso es un problema grave: si alguien accede a la base de datos (por un ataque, un error, o un empleado malintencionado), obtiene todas las contraseñas directamente.

**La solución: hashear las contraseñas.**

Un **hash** es una transformación matemática de una sola dirección:
- Dado el texto `"Clave123!"` → siempre produce el mismo hash: `"$2b$11$xKp8..."`
- Dado el hash `"$2b$11$xKp8..."` → **imposible** recuperar `"Clave123!"`

Lo que se guarda en la BD no es la contraseña, sino su hash. Cuando el usuario hace login, se hashea lo que escribió y se compara con el hash guardado.

**Equivalente en PHP/Laravel:**

| Operación | PHP | Node.js (bcryptjs) |
|---|---|---|
| Hashear | `password_hash($pass, PASSWORD_BCRYPT)` | `await bcrypt.hash(pass, 11)` |
| Verificar | `password_verify($pass, $hash)` | `await bcrypt.compare(pass, hash)` |

En Laravel, cuando usás `Auth::attempt()`, Laravel hace este proceso por vos internamente. Acá lo hacemos a mano para entender qué pasa por abajo.

---

## Salt rounds: ¿qué es el número 11?

```js
bcrypt.hash(usuario.password, 11)
//                             ↑ salt rounds (factor de costo)
```

Define cuántas veces se aplica el algoritmo internamente antes de producir el hash final. Cada nivel **duplica** el tiempo de cómputo:

| Nivel | Tiempo aproximado |
|---|---|
| 10 | ~100ms |
| 11 | ~200ms |
| 12 | ~400ms |
| 13 | ~800ms |

**¿Por qué importa?** Si alguien roba la base de datos e intenta adivinar contraseñas por fuerza bruta (probando millones de combinaciones), un costo alto hace que cada intento tarde más, volviendo el ataque impracticable.

El nivel 11 o 12 es el estándar para producción. En tests se usa 1 o 2 para no ralentizarlos.

El **salt** también hace que dos usuarios con la misma contraseña tengan hashes diferentes:
```
bcrypt.hash("Clave123!", 11) → "$2b$11$abc..."  ← distinto cada vez
bcrypt.hash("Clave123!", 11) → "$2b$11$xyz..."  ← diferente al anterior
```
Esto evita los ataques de "rainbow tables" (tablas precomputadas de hashes).

---

## ¿Qué son las variables de entorno?

Una **variable de entorno** es un valor almacenado fuera del código fuente, en el sistema operativo o en un archivo de configuración (`.env`). Permite separar la configuración sensible del código.

**¿Por qué no hardcodear la clave secreta en el código?**

```js
// ❌ Clase-20 — el secreto visible en el código fuente
jwt.sign(payload, "1234", { expiresIn: "2h" })

// ✅ Clase-21 — el secreto vive en .env, no en el código
jwt.sign(payload, process.env.SECRET_PASSWORD, { expiresIn: "2h" })
```

Si el código sube a GitHub, cualquiera que lo vea tiene la clave secreta y puede generar tokens válidos haciéndose pasar por cualquier usuario. Con variables de entorno:
- El código puede ser público sin problema
- El `.env` **nunca** se sube al repositorio (está en `.gitignore`)
- Cada entorno (tu máquina, producción) tiene su propio `.env` con sus propios valores

**Equivalente en Laravel:** exactamente el mismo sistema. El `.env` de Laravel con `env('APP_KEY')`, `env('DB_PASSWORD')`, etc. Node.js replica ese mismo patrón.

---

## El archivo .env y dotenv

### El archivo `.env`

Se crea en la raíz del `back/` y contiene pares `CLAVE=valor`:

```
SECRET_PASSWORD=mi-clave-secreta-larga-y-aleatoria
```

Este archivo **nunca se sube a git**. Si otra persona clona el repo, tiene que crear su propio `.env` con sus propios valores.

### La librería `dotenv`

`dotenv` lee el archivo `.env` al arrancar la aplicación y carga cada variable en `process.env`. Se inicializa una sola vez en `main.js`:

```js
import 'dotenv/config'
```

Después de esa línea, en cualquier archivo del proyecto:

```js
process.env.SECRET_PASSWORD   // → el valor que pusiste en .env
```

**Orden importante:** `dotenv` debe cargarse antes de cualquier código que use `process.env`. Si `token.service.js` intenta leer `process.env.SECRET_PASSWORD` antes de que `dotenv` lo haya cargado, el valor es `undefined` y jwt falla.

---

## token.service.js: separación de responsabilidades

En clase-20, la lógica de JWT estaba duplicada y la clave hardcodeada en dos lugares:

```
usuarios.service.js  →  jwt.sign(payload, "1234", ...)    ← generación del token
token.validate.js    →  jwt.verify(token, "1234")          ← verificación del token
```

**Problema:** si querés cambiar la clave o el algoritmo, tenés que acordarte de cambiarla en dos archivos. Fácil de olvidar uno y romper todo.

**Solución de esta clase:** crear `token.service.js` que centraliza ambas operaciones:

```
token.service.js  →  createToken(usuario)    genera JWT con process.env.SECRET_PASSWORD
token.service.js  →  validateToken(token)    verifica JWT con process.env.SECRET_PASSWORD
```

Ahora si cambia la clave o la lógica, se toca un solo archivo.

### ¿Por qué el import usa un alias?

```js
// En token.validate.js:
import { validateToken as validarToken } from "../services/token.service.js"
```

El middleware exporta una función llamada `validateToken` y también importa una función llamada `validateToken` del service. Si se importara con el mismo nombre, habría un conflicto de nombres. El alias `as validarToken` resuelve la colisión.

---

## Bug corregido: login con bcrypt.compare

El `login` en clase-20 comparaba contraseñas con `!=`:

```js
// ❌ Clase-20 — comparación de texto plano
if (usuario.password != existe.password) throw new Error("No se pudo ingresar")
```

Eso funcionaba cuando las contraseñas estaban en texto plano. Ahora que `createUser` las hashea, esta comparación **siempre falla**:

```
"Clave123!"  !=  "$2b$11$xKp8abc..."   → siempre true → siempre rechaza
```

La comparación correcta usa `bcrypt.compare()`:

```js
// ✅ Clase-21 — comparación correcta con hash
const passwordOk = await bcrypt.compare(usuario.password, existe.password)
if (!passwordOk) throw new Error("No se pudo ingresar")
```

`bcrypt.compare()` toma el texto plano recibido, aplica el mismo proceso de hash usando el salt que está embebido dentro del string `"$2b$11$..."`, y compara los resultados internamente. El texto plano nunca viaja ni se guarda.

---

## Flujo completo de registro y login

### Registro — POST /api/

```
Cliente manda: { email, password, passwordConfirm }
         ↓
validateRegister middleware (Yup — valida formato)
         ↓
createUser controller → usuarios.service.js:
  1. findOne({ email }) → si ya existe, lanza Error (no duplicados)
  2. bcrypt.hash(password, 11) → "Clave123!" → "$2b$11$abc..."
  3. insertOne({ email, password: "$2b$11$abc...", age })
     (passwordConfirm se descarta con spread + undefined)
         ↓
← 201 { email, age }  (sin password)
```

### Login — POST /api/login

```
Cliente manda: { email, password: "Clave123!" }
         ↓
validateLogin middleware (Yup)
         ↓
login controller → usuarios.service.js:
  1. findOne({ email }) → obtiene { email, password: "$2b$11$abc...", ... }
  2. bcrypt.compare("Clave123!", "$2b$11$abc...") → true o false
  3. createToken(existe) → token.service.js → jwt.sign con process.env.SECRET_PASSWORD
         ↓
← 200 { email, age, token: "eyJ..." }
```

### Request a ruta protegida

```
Header: Authorization: Bearer eyJ...
         ↓
token.validate.js — validateToken middleware:
  1. Extrae el token del header Authorization
  2. validarToken(token) → token.service.js → jwt.verify con process.env.SECRET_PASSWORD
  3. Si válido → req.usuario = payload → next()
  4. Si inválido o expirado → 401 { message: "token invalido" }
```

---

## Cómo probarlo en Postman

### 1. Registrar un usuario nuevo

- Método: `POST`
- URL: `http://localhost:2026/api/`
- Body → raw → JSON:
```json
{
    "email": "nuevo@mail.com",
    "password": "Clave123!",
    "passwordConfirm": "Clave123!"
}
```

Respuesta esperada (`201`): datos del usuario sin password.

Verificá en MongoDB Compass: el campo `password` debe ser un string que empieza con `$2b$11$` — ese es el hash de bcrypt, no la contraseña original.

### 2. Intentar registrar el mismo email dos veces

Mandá el mismo body de nuevo. Respuesta esperada (`500`): el service lanza Error porque el email ya existe.

### 3. Login con el usuario nuevo

- Método: `POST`
- URL: `http://localhost:2026/api/login`
- Body → raw → JSON:
```json
{
    "email": "nuevo@mail.com",
    "password": "Clave123!"
}
```

Respuesta esperada (`200`): datos del usuario + token JWT.

### 4. Usar el token en una ruta protegida

- Método: `GET`
- URL: `http://localhost:2026/api/libros`
- Authorization → Bearer Token → pegar el token del paso anterior

Respuesta esperada (`200`): array de libros.

### Usuarios de clase-20 ya no sirven

Los usuarios registrados en clase-20 tienen la contraseña en texto plano. El `login` de clase-21 usa `bcrypt.compare()`, que va a fallar porque el segundo argumento no es un hash válido de bcrypt. Hay que registrar usuarios nuevos desde clase-21 para que todo funcione.
