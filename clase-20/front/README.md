# Clase 18 — Autenticación con localStorage, rutas protegidas y redirecciones

## Índice

- [¿Qué se hizo esta clase?](#qué-se-hizo-esta-clase)
- [Estructura de archivos](#estructura-de-archivos)
- [Conceptos nuevos](#conceptos-nuevos)
  - [Sesión con localStorage](#sesión-con-localstorage)
  - [Redirección programada: useNavigate()](#redirección-programada-usenavigate)
  - [Redirección por componente: Navigate](#redirección-por-componente-navigate)
  - [¿Cuándo usar cada una?](#cuándo-usar-cada-una)
  - [Rutas protegidas: ProtectedRoute](#rutas-protegidas-protectedroute)
- [Flujo completo de autenticación](#flujo-completo-de-autenticación)
- [Cómo probarlo](#cómo-probarlo)

---

## ¿Qué se hizo esta clase?

Se tomó la app de la clase anterior (lista paginada de personajes con React Router) y se le agregó un sistema de autenticación básico. Los cambios respecto a la clase anterior:

| Qué cambió | Archivo | Por qué |
|---|---|---|
| Login ahora guarda sesión y redirige | `Login.jsx` | Simula autenticación con localStorage + `useNavigate` |
| Nuevo componente de logout | `Logout.jsx` | Limpia sesión y redirige con `<Navigate>` |
| Nuevo componente guardia | `ProtectedRoute.jsx` | Bloquea rutas si no hay sesión |
| NavBar muestra Login o Salir según sesión | `NavBar.jsx` | Refleja el estado de autenticación |
| Home y Detalle ahora están protegidas | `Router.jsx` | Envueltas en `<ProtectedRoute>` |

---

## Estructura de archivos

```
front/src/
├── main.jsx                       # Punto de entrada
├── routes/
│   └── Router.jsx                 # Rutas: protegidas y públicas
├── components/
│   ├── Layout.jsx                 # NavBar + Outlet
│   ├── NavBar.jsx                 # Muestra Login o Salir según sesión
│   └── ProtectedRoute.jsx        # Guardia: redirige a /login si no hay sesión
└── pages/
    ├── Home.jsx                   # Lista de personajes (protegida)
    ├── Detalle.jsx                # Detalle de personaje (protegida)
    ├── Login.jsx                  # Formulario de login
    └── Logout.jsx                 # Limpia sesión y redirige
```

---

## Conceptos nuevos

### Sesión con localStorage

`localStorage` es un almacenamiento del navegador que persiste aunque se cierre la pestaña o se recargue la página. A diferencia de las variables de React (que se pierden al recargar), lo que guardás en localStorage sigue ahí hasta que explícitamente lo borrás.

```js
// Guardar (solo acepta strings, por eso JSON.stringify)
localStorage.setItem("session", JSON.stringify({ email, pass }))

// Leer (devuelve string o null; JSON.parse lo convierte de vuelta a objeto)
const session = JSON.parse(localStorage.getItem("session"))

// Borrar todo
localStorage.clear()
```

**¿Por qué `JSON.stringify` / `JSON.parse`?**  
`localStorage` solo puede guardar strings. Si intentás guardar un objeto directamente, lo convierte a `"[object Object]"`, que es inútil. `JSON.stringify` lo convierte a un string JSON válido, y `JSON.parse` lo devuelve a objeto al leer.

**Importante:** en esta clase se guarda el email y la contraseña como simulación. En una app real se guardaría el **token JWT** que devuelve el servidor, nunca la contraseña.

---

### Redirección programada: `useNavigate()`

`useNavigate()` es un hook de React Router que devuelve una función `navigate`. Esa función se llama **desde código** (dentro de un evento, después de un fetch, etc.) para navegar a otra ruta.

```jsx
// Login.jsx
const navigate = useNavigate()

const handleSubmit = (e) => {
  e.preventDefault()
  localStorage.setItem("session", JSON.stringify({ email, pass }))

  navigate("/")   // ← redirección programada: se llama DESPUÉS de guardar la sesión
}
```

Se llama "programada" porque vos decidís **cuándo** redirigir: en este caso, solo después de haber guardado la sesión. Podría estar adentro de un `if`, después de un `await fetch(...)`, etc.

**¿Qué pasa si se llama `navigate` durante el render (fuera de un evento)?**  
No hay que hacerlo. Si la redirección depende de una condición de render (no de una acción), la herramienta correcta es `<Navigate>`.

---

### Redirección por componente: `<Navigate>`

`<Navigate>` es un componente de React Router. Cuando React lo renderiza, **inmediatamente** redirige al usuario a la ruta indicada. No muestra nada en pantalla, solo provoca la navegación.

```jsx
// Logout.jsx
const Logout = () => {
  localStorage.clear()
  return <Navigate to="/login" />   // ← redirección por componente
}
```

```jsx
// ProtectedRoute.jsx
const ProtectedRoute = ({ element }) => {
  const session = JSON.parse(localStorage.getItem("session"))
  if (session) return element
  return <Navigate to="/login" />   // ← redirección por componente
}
```

Se llama "por componente" porque la redirección ocurre como parte del **render**: React evalúa lo que retorna el componente y, si encuentra `<Navigate>`, ejecuta la navegación.

---

### ¿Cuándo usar cada una?

Esta es la pregunta clave. No son intercambiables: cada una tiene su escenario.

| | `useNavigate()` | `<Navigate>` |
|---|---|---|
| **¿Cuándo corre?** | Dentro de una función (evento, callback) | Durante el render del componente |
| **¿Qué la dispara?** | Una acción del usuario o resultado de un fetch | Una condición en el render |
| **¿Dónde se escribe?** | Dentro de handlers o efectos | En el `return` del componente |
| **Ejemplo** | Redirigir después del submit de un form | Redirigir si no hay sesión |

**Regla práctica:**
- Si el redirect ocurre **después de algo** (submit, click, fetch) → `useNavigate()`
- Si el redirect depende de **una condición** que se evalúa al renderizar → `<Navigate>`

**¿Se usan las dos al mismo tiempo?**  
No en el mismo componente para la misma redirección. En esta app se usan en archivos distintos porque los casos son distintos:

```
Login.jsx       → useNavigate()   porque redirige DESPUÉS del submit del form
Logout.jsx      → <Navigate>      porque redirigir ES el render del componente
ProtectedRoute  → <Navigate>      porque redirige según una condición de render
```

Dicho de otra forma: sí, en este código se usan las dos, pero cada una donde corresponde.
`useNavigate()` maneja el form del login (hay una acción que esperar antes de redirigir),
y `<Navigate>` maneja las rutas protegidas y el logout (la redirección se decide durante el render, no como respuesta a un evento).

---

### Rutas protegidas: `ProtectedRoute`

`ProtectedRoute` es un componente "guardia" que envuelve las rutas que requieren autenticación. Recibe como prop el componente de página que quiere proteger:

```jsx
// Router.jsx
{ path: "/",                     element: <ProtectedRoute element={<Home />} /> }
{ path: "/detalle/:idPersonaje", element: <ProtectedRoute element={<Detalle />} /> }
```

Lógica interna:

```jsx
const ProtectedRoute = ({ element }) => {
  const session = JSON.parse(localStorage.getItem("session"))

  if (session) return element          // hay sesión → mostrar la página
  return <Navigate to="/login" />      // no hay sesión → redirigir
}
```

**¿Por qué esta abstracción?**  
Sin `ProtectedRoute`, cada página tendría que chequear la sesión por sí misma y hacer la redirección. Con el componente guardia, la lógica de autenticación está en un solo lugar: si cambia la forma de verificar la sesión, solo se toca `ProtectedRoute`.

**Flujo cuando un usuario no logueado intenta entrar a `/`:**

```
1. React Router activa la ruta "/"
2. Se monta ProtectedRoute con element={<Home />}
3. ProtectedRoute lee localStorage → session === null
4. ProtectedRoute retorna <Navigate to="/login" />
5. React Router redirige a /login
6. Home nunca llega a montarse
```

---

## Flujo completo de autenticación

### Login

```
Usuario llena el form y hace submit
  → handleSubmit se ejecuta
  → e.preventDefault() evita recarga de página
  → Se leen email y pass del form con e.target.email.value
  → localStorage.setItem("session", JSON.stringify({email, pass}))
  → navigate("/")
    → React Router va a "/"
    → ProtectedRoute chequea localStorage → hay sesión ✓
    → Renderiza <Home />
    → NavBar re-renderiza: session existe → muestra "Salir"
```

### Logout

```
Usuario hace click en "Salir" (Link to="/logout")
  → React Router monta el componente Logout
  → localStorage.clear() elimina la sesión
  → return <Navigate to="/login" />
    → React Router va a "/login"
    → NavBar re-renderiza: session es null → muestra "Login"
```

### Intento de acceso sin sesión

```
Usuario intenta entrar directo a "/"
  → ProtectedRoute chequea localStorage → session === null
  → return <Navigate to="/login" />
  → React Router va a "/login"
  → Home nunca se renderiza
```

---

## Cómo probarlo

```bash
cd front
pnpm install
pnpm run dev
```

La app queda disponible en `http://localhost:5173`.

**Rutas disponibles:**

| URL | Acceso | Qué hace |
|---|---|---|
| `/` | Solo con sesión | Lista paginada de personajes |
| `/detalle/:id` | Solo con sesión | Detalle del personaje |
| `/login` | Público | Formulario de login |
| `/logout` | Público | Limpia sesión y redirige a /login |

**Para probar el flujo:**
1. Entrar a `/` sin haber logueado → debe redirigir a `/login`
2. Completar el form con cualquier email y contraseña → debe ir a `/`
3. Abrir DevTools → Application → Local Storage → verificar que se guardó la sesión
4. Hacer click en "Salir" → debe redirigir a `/login` y el Local Storage debe quedar vacío
