# Clase 12 — Consumo de APIs con fetch y el hook useEffect

## Índice

1. [¿Qué se hizo esta clase?](#qué-se-hizo-esta-clase)
2. [Nuevo archivo: Fetch.jsx](#nuevo-archivo-fetchjsx)
3. [Ciclos de vida de un componente React](#ciclos-de-vida-de-un-componente-react)
4. [El hook useEffect](#el-hook-useeffect)
5. [El array de dependencias — la clave de useEffect](#el-array-de-dependencias--la-clave-de-useeffect)
6. [useEffect vs useState — cuándo usar cada uno](#useeffect-vs-usestate--cuándo-usar-cada-uno)
7. [.then() vs async/await — dos formas de lo mismo](#then-vs-asyncawait--dos-formas-de-lo-mismo)
8. [fetch() y su trampa más común](#fetch-y-su-trampa-más-común)
9. [La API dog.ceo — estructura de los datos](#la-api-dogceo--estructura-de-los-datos)
10. [Flujo completo del componente](#flujo-completo-del-componente)
11. [Estructura interna de un componente](#estructura-interna-de-un-componente)
12. [Cómo correr el proyecto](#cómo-correr-el-proyecto)

---

## ¿Qué se hizo esta clase?

La clase 11 introdujo React, componentes funcionales, JSX y `useState`. Esta clase agrega la pieza que faltaba para hacer apps reales: **conectarse a una API externa**.

El único archivo nuevo respecto a la clase anterior es `Fetch.jsx`. Todo lo demás (estructura del proyecto, Vite, Tailwind, `main.jsx`, `App.jsx`) quedó igual.

**Qué se incorporó:**

- El hook `useEffect` para ejecutar código en momentos específicos del ciclo de vida.
- El uso de `fetch()` para llamar a una API REST desde el frontend.
- El patrón para actualizar estado con datos que vienen de una API.
- La conversión de `.then()` a `async/await` con `try/catch`.

---

## Nuevo archivo: Fetch.jsx

```
src/
├── main.jsx
├── App.jsx
├── Fetch.jsx   ← NUEVO: consume la API dog.ceo y muestra razas y fotos
├── App.css
└── index.css
```

`Fetch.jsx` es un componente independiente. Por ahora no está conectado a `App.jsx`: es un ejercicio autónomo para practicar `useEffect` y `fetch`.

---

## Ciclos de vida de un componente React

Antes de entender `useEffect`, hay que entender qué es el **ciclo de vida** de un componente.

Un componente React no existe para siempre. Pasa por tres etapas:

```
1. MONTAJE (mount)
   El componente aparece en pantalla por primera vez.
   React ejecuta la función, genera el JSX y lo inserta en el DOM.
   Momento típico para: cargar datos de una API, inicializar librerías.

         ▼

2. ACTUALIZACIÓN (update)
   El estado o las props del componente cambian.
   React vuelve a ejecutar la función y actualiza solo lo que cambió en el DOM.
   Momento típico para: reaccionar a cambios del usuario, sincronizar con una API.

         ▼

3. DESMONTAJE (unmount)
   El componente desaparece de la pantalla (ej: el usuario navega a otra página).
   Momento típico para: cancelar timers, cerrar conexiones WebSocket, limpiar listeners.
```

En los viejos **Class Components**, estos momentos tenían métodos con nombres explícitos:

| Momento       | Class Component          | Functional Component con Hooks                |
| ------------- | ------------------------ | --------------------------------------------- |
| Montaje       | `componentDidMount()`    | `useEffect(() => {...}, [])`                  |
| Actualización | `componentDidUpdate()`   | `useEffect(() => {...}, [variable])`          |
| Desmontaje    | `componentWillUnmount()` | `useEffect(() => { return () => {...} }, [])` |

Los Hooks reemplazaron los tres métodos con **un solo `useEffect`** que se comporta diferente según el array de dependencias que recibe.

---

## El hook useEffect

`useEffect` le dice a React: **"después de renderizar, ejecutá este código"**.

### Sintaxis

```jsx
useEffect(callback, [dependencias]);
```

- `callback` — la función que querés ejecutar.
- `[dependencias]` — array que controla _cuándo_ se ejecuta (ver la sección siguiente).

### En el código de la clase

```jsx
// useEffect #1 — Solo al montar
useEffect(() => {
  traerRazas();
}, []);

// useEffect #2 — Cada vez que razaSeleccionada cambia
useEffect(() => {
  if (razaSeleccionada != "") traerFoto();
}, [razaSeleccionada]);
```

### Por qué no se puede llamar a la API directo en el cuerpo del componente

Parece razonable hacer esto:

```jsx
const Fetch = () => {
  const [razas, setRazas] = useState([]);

  // ❌ LOOP INFINITO
  if (razas.length == 0) {
    traerRazas(); // traerRazas llama a setRazas...
  } // setRazas dispara un re-render...
  // el re-render ejecuta el if de nuevo...
  // que llama a traerRazas de nuevo... ♻️
};
```

El cuerpo de un componente se ejecuta en **cada render**. Cualquier llamada a un setter dentro del cuerpo genera un nuevo render, que vuelve a ejecutar el cuerpo, que vuelve a llamar al setter: loop infinito.

`useEffect` con `[]` rompe ese ciclo: React garantiza que el callback solo se ejecuta **una vez**, después del primer render.

### IMPORTANTE: useEffect no puede ser async

El callback que se le pasa a `useEffect` no puede ser `async`:

```jsx
// ❌ Incorrecto — useEffect ignora la Promise y genera una advertencia
useEffect(async () => {
    const data = await fetch(...)
}, [])

// ✅ Correcto — la función async vive fuera, useEffect solo la llama
const traerRazas = async () => { ... }

useEffect(() => {
    traerRazas()  // La llamamos, pero no la awaiteamos desde useEffect
}, [])
```

¿Por qué? `useEffect` espera que su callback devuelva o nada o una función de limpieza. Una función `async` siempre devuelve una `Promise`, y `useEffect` no sabe qué hacer con ella.

---

## El array de dependencias — la clave de useEffect

El segundo argumento de `useEffect` controla **cuándo** se ejecuta el callback:

| Array de dependencias | Cuándo se ejecuta                                 |
| --------------------- | ------------------------------------------------- |
| Sin segundo argumento | En **cada render** (casi nunca se quiere esto)    |
| `[]` vacío            | Solo al **montar** (una vez)                      |
| `[variable]`          | Al montar Y cada vez que `variable` cambie        |
| `[var1, var2]`        | Al montar Y cada vez que alguna de las dos cambie |

```jsx
// Se ejecuta en CADA render (peligroso, puede generar loops)
useEffect(() => {
  console.log("render!");
});

// Se ejecuta solo la primera vez que el componente aparece en pantalla
useEffect(() => {
  traerRazas();
}, []);

// Se ejecuta al montar Y cada vez que razaSeleccionada cambie
useEffect(() => {
  if (razaSeleccionada != "") traerFoto();
}, [razaSeleccionada]);
```

**Cómo funciona la detección de cambios:** React guarda el valor de cada dependencia del render anterior. Antes de cada render, compara los valores nuevos con los viejos. Si alguno cambió (comparación por `===`), ejecuta el callback.

---

## useEffect vs useState — cuándo usar cada uno

Son dos hooks que trabajan juntos pero tienen responsabilidades distintas:

|                       | `useState`                                | `useEffect`                                        |
| --------------------- | ----------------------------------------- | -------------------------------------------------- |
| **Para qué**          | Guardar datos que se muestran en pantalla | Ejecutar código en momentos del ciclo de vida      |
| **Qué dispara**       | Un re-render cuando el valor cambia       | Nada (no re-renderiza por sí solo)                 |
| **Cuándo se ejecuta** | El setter se llama cuando vos querés      | Después de cada render que cumpla las dependencias |
| **Devuelve**          | `[valor, setter]`                         | Nada (o una función de limpieza)                   |

**La relación entre los dos en este componente:**

```
useEffect detecta el momento correcto (montar / cambio de estado)
         │
         ▼
Llama a traerRazas / traerFoto (funciones async)
         │
         ▼
La API responde con datos
         │
         ▼
setRazas / setImgUrl (setters de useState) actualizan el estado
         │
         ▼
React re-renderiza el componente con los nuevos datos
         │
         ▼
El <select> y el <img> muestran la información actualizada
```

`useEffect` decide _cuándo_ llamar. `useState` guarda _qué_ mostrar.

---

## .then() vs async/await — dos formas de lo mismo

Las dos sintaxis hacen exactamente lo mismo: manejar código asíncrono (Promises). Son intercambiables. El código de la clase fue convertido de `.then()` a `async/await`.

### Versión original del profe — con .then()

```js
const traerRazas = () => {
  fetch("https://dog.ceo/api/breeds/list/all")
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
    })
    .then((data) => setRazas(Object.keys(data.message)))
    .catch((err) => console.error(err));
};
```

### Versión actual — con async/await

```js
const traerRazas = async () => {
  try {
    const res = await fetch("https://dog.ceo/api/breeds/list/all");
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
    const data = await res.json();
    setRazas(Object.keys(data.message));
  } catch (err) {
    console.error("Error al traer razas:", err);
  }
};
```

### Comparación

|                  | `.then()`                                                | `async/await`                          |
| ---------------- | -------------------------------------------------------- | -------------------------------------- |
| **Estilo**       | Encadenado (se lee de arriba a abajo pero con callbacks) | Lineal (se lee como código sincrónico) |
| **Errores**      | `.catch()` al final de la cadena                         | `try/catch` envolviendo todo           |
| **Familiaridad** | Propio de JS funcional                                   | Similar a try/catch de Node, PHP, Java |
| **Resultado**    | Idéntico                                                 | Idéntico                               |

`await` "pausa" la función hasta que la Promise resuelve, pero **no bloquea el hilo principal** del navegador. Mientras espera la respuesta de la API, el browser sigue respondiendo a eventos del usuario normalmente.

---

## fetch() y su trampa más común

`fetch()` tiene un comportamiento contraintuitivo que sorprende a todos la primera vez:

```
fetch() SOLO rechaza la Promise (va al catch) si hay un error de RED.
fetch() NO rechaza si el servidor responde con un error HTTP (404, 500, etc.).
```

Esto significa que si la API devuelve `404 Not Found`, `fetch()` lo considera un "éxito" y el código continúa después del `await`. Por eso **siempre** hay que chequear `res.ok`:

```js
const res = await fetch(
  "https://dog.ceo/api/breed/razainventada/images/random",
);

// Sin el if: el código continúa aunque la raza no exista y data.message sería undefined
// Con el if: lanzamos el error nosotros y lo captura el catch
if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
```

`res.ok` es `true` cuando el código HTTP está entre 200 y 299. Para cualquier otro código (400, 404, 500...) es `false`.

---

## La API dog.ceo — estructura de los datos

### GET /api/breeds/list/all

Devuelve todas las razas disponibles:

```json
{
  "message": {
    "affenpinscher": [],
    "akita": [],
    "beagle": [],
    "bulldog": ["boston", "english", "french"]
  },
  "status": "success"
}
```

`message` es un objeto donde cada clave es una raza. `Object.keys(data.message)` extrae los nombres: `["affenpinscher", "akita", "beagle", "bulldog", ...]`

### GET /api/breed/:raza/images/random

Devuelve una foto aleatoria de la raza:

```json
{
  "message": "https://images.dog.ceo/breeds/akita/An_Akita.jpg",
  "status": "success"
}
```

`message` acá es un **string** con la URL directa (no un objeto como en el endpoint anterior).

---

## Flujo completo del componente

```
Componente MONTA (aparece en pantalla por primera vez)
         │
         ▼
useEffect #1 se dispara ([] vacío = solo al montar)
         │
         ▼
traerRazas() → fetch("/api/breeds/list/all")
         │
         ▼  (la API responde)
setRazas(["akita", "beagle", ...]) → re-render
         │
         ▼
El <select> se llena con las opciones de razas

──────────────────────────────────────────────────

Usuario elige "akita" en el <select>
         │
         ▼
onChange → setRazaSeleccionada("akita") → re-render
         │
         ▼
useEffect #2 detecta que razaSeleccionada cambió ("" → "akita")
         │
         ▼
traerFoto() → fetch("/api/breed/akita/images/random")
         │
         ▼  (la API responde)
setImgUrl("https://images.dog.ceo/.../akita.jpg") → re-render
         │
         ▼
El <img src={imgUrl}> muestra la foto del akita

──────────────────────────────────────────────────

Usuario hace click en "Foto!" (sin cambiar el select)
         │
         ▼
onClick → traerFoto() directamente (sin pasar por useEffect)
         │cd
         ▼
setImgUrl(nueva URL) → re-render → nueva foto del mismo akita
```

---

## Estructura interna de un componente

Dentro de un componente funcional existe una convención de orden que toda la comunidad React sigue. No es una regla técnica — React no falla si la ignorás — pero refleja el flujo mental natural y hace el código predecible para cualquiera que lo lea.

```jsx
const MiComponente = () => {

    // ── 1. ESTADOS ──────────────────────────────────────────────
    // Primero se declaran todos los useState.
    // Son la "memoria" del componente: qué datos va a mostrar y actualizar.
    const [datos, setDatos] = useState([])
    const [seleccion, setSeleccion] = useState("")

    // ── 2. FUNCIONES / LÓGICA ────────────────────────────────────
    // Después van las funciones: fetch a APIs, handlers de eventos, transformaciones.
    // Viven antes de los effects porque los effects las llaman.
    const traerDatos = async () => {
        const res = await fetch("https://api.ejemplo.com/datos")
        const data = await res.json()
        setDatos(data)
    }

    // ── 3. EFFECTS ───────────────────────────────────────────────
    // Después los useEffect: definen CUÁNDO se ejecuta la lógica de arriba.
    // Van después de las funciones porque las referencian.
    useEffect(() => {
        traerDatos()
    }, [])

    // ── 4. RETURN / VISTA ────────────────────────────────────────
    // Al final el JSX: lo que se muestra en pantalla.
    // Siempre al último porque depende de todo lo anterior.
    return (
        <div>...</div>
    )
}
```

Aplicado al componente de esta clase:

```jsx
const Fetch = () => {

    // 1. Estados
    const [imgUrl, setImgUrl] = useState("")
    const [razas, setRazas] = useState([])
    const [razaSeleccionada, setRazaSeleccionada] = useState("")

    // 2. Funciones
    const traerRazas = async () => { ... }
    const traerFoto = async () => { ... }

    // 3. Effects
    useEffect(() => { traerRazas() }, [])
    useEffect(() => { if (razaSeleccionada != "") traerFoto() }, [razaSeleccionada])

    // 4. Vista
    return ( <div>...</div> )
}
```

### A futuro: separar el fetch en un archivo de servicio

A medida que los proyectos crezcan, la lógica de fetch se mueve a archivos de servicio separados — igual que hiciste en Node/Express con la carpeta `services/`. El componente se queda solo con estado, effects y vista:

```
src/
├── services/
│   └── dogService.js    ← solo fetch, sin useState ni JSX
└── components/
    └── Fetch.jsx        ← importa el servicio, maneja estado y vista
```

```js
// dogService.js — no sabe nada de React
export const getRazas = async () => {
    const res = await fetch("https://dog.ceo/api/breeds/list/all")
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`)
    const data = await res.json()
    return Object.keys(data.message)
}
```

```jsx
// Fetch.jsx — el componente llama al servicio pero no sabe cómo funciona el fetch
import { getRazas } from "../services/dogService.js"

const traerRazas = async () => {
    try {
        const razas = await getRazas()  // el fetch ya está encapsulado
        setRazas(razas)
    } catch (err) {
        console.error(err)
    }
}
```

Es exactamente el mismo principio MVC de Node/Express: el servicio accede a los datos, el componente orquesta y muestra. La separación de responsabilidades no cambia con React, solo el contexto.

---

## Cómo correr el proyecto

```bash
cd clase-12/front

npm install   # solo la primera vez

npm run dev   # arranca en http://localhost:5173
```
