# Clase 22 — React Context, capa de servicios y refactor del front

## Índice

- [¿Qué se hizo esta clase?](#qué-se-hizo-esta-clase)
- [Estructura de archivos](#estructura-de-archivos)
- [El problema que resuelve React Context](#el-problema-que-resuelve-react-context)
- [¿Cómo funciona Context?](#cómo-funciona-context)
- [SessionProvider y los hooks del contexto](#sessionprovider-y-los-hooks-del-contexto)
- [La capa de servicios (src/services/)](#la-capa-de-servicios-srcservices)
- [Cómo cambió cada página](#cómo-cambió-cada-página)
- [Flujo completo: login con Context y services](#flujo-completo-login-con-context-y-services)
- [Bugs corregidos](#bugs-corregidos)

---

## ¿Qué se hizo esta clase?

Se trabajó exclusivamente en `front/`. No hubo cambios en `back/`.

**Archivos nuevos:**

| Archivo | Qué es |
|---|---|
| `src/contexts/Session.context.jsx` | Contexto global de sesión: comparte token y email en toda la app |
| `src/services/api.service.jsx` | Servicio base: centraliza fetch, URL base, token y manejo de 401 |
| `src/services/usuarios.service.jsx` | Servicio de usuarios: login y registro |
| `src/services/libros.service.jsx` | Servicio de libros: getLibros y getLibrosById |
| `src/pages/Register.jsx` | Nueva página de registro de cuenta |

**Archivos modificados:**

| Archivo | Qué cambió |
|---|---|
| `src/pages/Login.jsx` | Usa el contexto para guardar la sesión y el service para el fetch |
| `src/pages/Home.jsx` | Usa el service para pedir los libros (sin fetch manual) |
| `src/pages/Detalle.jsx` | Usa el service para pedir el libro por id |
| `src/pages/Logout.jsx` | Usa el contexto para limpiar la sesión |
| `src/components/NavBar.jsx` | Lee el email del contexto para mostrar links dinámicos |
| `src/routes/Router.jsx` | Agrega la ruta `/register` |
| `src/main.jsx` | Envuelve la app con `SessionProvider` |

---

## Estructura de archivos

```
clase-22/front/src/
├── contexts/
│   └── Session.context.jsx    ← NUEVO (estado global de sesión)
├── services/
│   ├── api.service.jsx         ← NUEVO (fetch base con token)
│   ├── usuarios.service.jsx    ← NUEVO (login, registro)
│   └── libros.service.jsx      ← NUEVO (getLibros, getLibrosById)
├── pages/
│   ├── Login.jsx               ← MODIFICADO
│   ├── Register.jsx            ← NUEVO
│   ├── Home.jsx                ← MODIFICADO
│   ├── Detalle.jsx             ← MODIFICADO
│   └── Logout.jsx              ← MODIFICADO
├── components/
│   └── NavBar.jsx              ← MODIFICADO
├── routes/
│   └── Router.jsx              ← MODIFICADO (agrega /register)
└── main.jsx                    ← MODIFICADO (agrega SessionProvider)
```

---

## El problema que resuelve React Context

Antes de Context, el token y el estado de sesión vivían en `localStorage` y cada componente los leía directamente:

```jsx
// Así era antes — cada componente leía su propio localStorage
const token = localStorage.getItem("token")
const session = JSON.parse(localStorage.getItem("session"))
```

Esto tiene dos problemas:

**Problema 1 — Prop drilling:**
Si un componente muy anidado necesita saber si el usuario está logueado, había que pasar la info como props de padre a hijo a nieto a bisnieto... Es tedioso, frágil y difícil de mantener.

```
App
└── Layout
    └── NavBar        ← necesita saber si hay sesión
        └── UserMenu  ← también la necesita
```

Sin Context: `App` pasa `session` a `Layout`, que la pasa a `NavBar`, que la pasa a `UserMenu`. Cuatro archivos afectados por un dato que solo usa uno.

**Problema 2 — Falta de reactividad:**
Si el usuario hace login, `NavBar` no se entera automáticamente porque está leyendo `localStorage` directamente, que no es parte del estado de React. Habría que recargar la página o forzar un re-render manualmente.

**La solución — Context:**
Un estado central (en `SessionProvider`) que cualquier componente puede leer **directamente**, sin pasar por props. Y como es estado de React (`useState`), cuando cambia, **todos los componentes suscriptos se re-renderizan automáticamente**.

---

## ¿Cómo funciona Context?

Son tres partes que trabajan juntas:

### 1. `createContext()` — Crear el canal

```jsx
export const Session = createContext()
```

Crea el "canal" de comunicación. Por sí solo no hace nada — es solo la definición del canal.

### 2. `<Provider>` — Poner datos en el canal

```jsx
<Session.Provider value={{ email, token, onLogin, onLogout }}>
    {children}
</Session.Provider>
```

El Provider envuelve los componentes que pueden acceder al contexto. El `value` es lo que van a recibir. Todos los `children` (y sus descendientes) tienen acceso a ese valor.

En esta app, el Provider está en `main.jsx` rodeando toda la app:
```jsx
<SessionProvider>
    <RouterProvider router={router} />
</SessionProvider>
```

Esto hace que **todos los componentes** de la app puedan leer el contexto.

### 3. `useContext()` — Leer el canal

```jsx
const { email } = useContext(Session)
```

Desde cualquier componente que esté dentro del Provider, se puede leer el valor actual del contexto. Si el valor cambia (porque `setEmail` fue llamado), el componente se re-renderiza automáticamente.

### Diagrama del flujo

```
main.jsx
└── SessionProvider  ← tiene el estado: { email, token, onLogin, onLogout }
    └── RouterProvider
        └── Layout
            ├── NavBar        ← useEmail() → lee email del contexto
            └── Outlet
                ├── Login     ← useLogin() → usa onLogin del contexto
                ├── Home      ← (no usa el contexto directamente, lo usa el service)
                └── Logout    ← useLogout() → usa onLogout del contexto
```

---

## SessionProvider y los hooks del contexto

### El estado del Provider

```jsx
const [email, setEmail] = useState( JSON.parse( localStorage.getItem("session") ) )
const [token, setToken] = useState(localStorage.getItem("token"))
```

Se inicializa con lo que haya en `localStorage`. Si la página se recarga, la sesión persiste.

### onLogin y onLogout

```jsx
const onLogin = (jwt, usuario) => {
    localStorage.setItem("session", JSON.stringify({ usuario }))
    localStorage.setItem("token", jwt)
    setEmail(usuario)   // → dispara re-render en NavBar, etc.
    setToken(jwt)       // → actualiza el token que usa api.service
}

const onLogout = () => {
    localStorage.clear()
    setEmail(null)
    setToken(null)
}
```

Cada función actualiza **dos lugares en paralelo**: `localStorage` (para persistencia) y el `useState` (para reactividad).

### Los hooks específicos

En vez de hacer `const { email } = useContext(Session)` en cada componente, el archivo exporta hooks simplificados:

```jsx
export function useEmail()  { return useContext(Session).email    }
export function useLogin()  { return useContext(Session).onLogin  }
export function useLogout() { return useContext(Session).onLogout }
export function useToken()  { return useContext(Session).token    }
```

Esto hace que el código en los componentes quede limpio:
```jsx
const email  = useEmail()   // en NavBar
const login  = useLogin()   // en Login
const logout = useLogout()  // en Logout
const token  = useToken()   // en api.service
```

**Equivalente en Vue.js:** el Context de React es similar a Vuex o Pinia — un store global de estado. En Vue lo declarás con `defineStore()`, acá con `createContext()`.

---

## La capa de servicios (src/services/)

### El problema que resolvía

Antes (clase-20), cada componente tenía su propio `fetch`:

```jsx
// En Home.jsx
fetch("http://localhost:2026/api/libros", {
    headers: { authorization: `Bearer ${localStorage.getItem("token")}` }
})
.then(res => { if (res.ok) return res.json(); if (res.status == 401) navigate("/login") })
```

Si había que cambiar la URL base, el nombre del header, o el manejo del 401, había que cambiarlo en cada componente. Y el componente mezcla lógica de negocio (mostrar libros) con lógica de red (cómo llamar a la API).

### La solución: tres capas

```
api.service.jsx        → CÓMO llamar (fetch, URL base, token, 401 handling)
    ↑ usa
usuarios.service.jsx   → QUÉ llamar para usuarios (login, registro)
libros.service.jsx     → QUÉ llamar para libros (getLibros, getLibrosById)
    ↑ usan
Login.jsx, Home.jsx... → PARA QUÉ se usa (lógica de la página)
```

### api.service.jsx — la base

```jsx
const call = (uri, method = "GET", body) => {
    return fetch("http://localhost:2026/api" + uri, {
        method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`   // token viene del Context, no de localStorage
        },
        body: JSON.stringify(body)
    })
    .then(res => {
        if (res.ok) return res.json()
        if (res.status == 401) navigate("/login")
        throw new Error("Error en la llamada a la API")
    })
}
```

`call("/libros")` → `GET http://localhost:2026/api/libros` con el token incluido automáticamente.

### usuarios.service.jsx

```jsx
const login   = (credenciales) => call("/login", "POST", credenciales)
const registro = (email, pass, passConfirm) => call("/", "POST", { email, password: pass, passwordConfirm: passConfirm })
```

### libros.service.jsx

```jsx
const getLibros      = () => call("/libros")
const getLibrosById  = (id) => call("/libros/" + id)
```

### Cómo quedan los componentes

Home.jsx antes:
```jsx
fetch("http://localhost:2026/api/libros", {
    headers: { authorization: `Bearer ${localStorage.getItem("token")}` }
})
.then(res => { if (res.ok) return res.json(); if (res.status == 401) navigate("/login") })
.then(data => setLibros(data))
```

Home.jsx ahora:
```jsx
const { getLibros } = useLibrosService()
getLibros().then(data => setLibros(data))
```

Mucho más limpio: el componente solo sabe qué quiere hacer, no cómo hacerlo.

---

## Cómo cambió cada página

### Login.jsx

Antes: hacía el fetch directo y guardaba en localStorage manualmente.
Ahora:
```jsx
const login = useLogin()                        // función del contexto
const { login: loginService } = useUsuariosService()  // función del service

loginService({ email, password })
  .then(data => {
    login(data.token, email)  // guarda en context + localStorage
    navigate("/")
  })
```

### Home.jsx

Antes: fetch manual con token de localStorage, manejo del 401 inline.
Ahora: una línea.
```jsx
const { getLibros } = useLibrosService()
getLibros().then(data => setLibros(data))
```

### Detalle.jsx

Similar a Home: una línea para pedir el libro.
```jsx
const { getLibrosById } = useLibrosService()
getLibrosById(idLibro).then(data => setLibro(data))
```

### Logout.jsx

Antes: `localStorage.clear()` directo.
Ahora:
```jsx
const logout = useLogout()
useEffect(() => { logout() }, [])
```
`logout()` limpia tanto el localStorage como el estado del Context, disparando un re-render en NavBar.

### NavBar.jsx

Antes: leía `localStorage` en el render (sin reactividad).
Ahora:
```jsx
const email = useEmail()  // reactivo: NavBar se actualiza solo al hacer login/logout
```

---

## Flujo completo: login con Context y services

```
Usuario llena el form y hace submit
         ↓
Login.jsx — handleSubmit()
         ↓
useUsuariosService().login({ email, password })
         ↓
api.service — call("/login", "POST", credenciales)
   fetch POST http://localhost:2026/api/login
         ↓
Back — validateLogin → login service → bcrypt.compare → createToken
         ↓
← 200 { email, token: "eyJ..." }
         ↓
Login.jsx — login(data.token, email)  (función del contexto)
         ↓
SessionProvider.onLogin():
   localStorage.setItem("token", jwt)    → persiste
   localStorage.setItem("session", ...) → persiste
   setToken(jwt)     → actualiza estado → api.service usa el nuevo token
   setEmail(usuario) → actualiza estado → NavBar se re-renderiza mostrando "Salir"
         ↓
navigate("/") → Home se monta
         ↓
Home.jsx — useLibrosService().getLibros()
         ↓
api.service — call("/libros") con el token ya actualizado en el contexto
         ↓
Back — validateToken → getLibros → MongoDB
         ↓
← 200 [array de libros]
         ↓
Home.jsx — setLibros(data) → tabla renderizada
```

---

## Bugs corregidos

| Archivo | Bug | Corrección |
|---|---|---|
| `Login.jsx` | `loginService` y `login` usados sin declarar → ReferenceError | Agregadas las dos líneas de destructuring |
| `Detalle.jsx` | `useLibrosService` usado sin importar → ReferenceError | Agregado el import |
| `Detalle.jsx` | `data.data` → la API no envuelve en `{ data: ... }` | Corregido a `data` |
| `Home.jsx` | Imports sin usar: `Activity`, `React`, `useToken`, `useApi` | Eliminados |
| `Router.jsx` | NavBar linkea a `/register` pero la ruta no existía | Agregada la ruta |
| `main.jsx` | `createContext` importado sin usar | Eliminado |
| `NavBar.jsx` | `useContext` importado sin usar | Eliminado |
| `Register.jsx` | `type="text"` en contraseñas (visibles en pantalla) | Corregido a `type="password"` |
| `usuarios.service.jsx` | URLs incorrectas: `/usuarios/login` y `/usuarios` no existen en el back | Corregidas a `/login` y `/` |
