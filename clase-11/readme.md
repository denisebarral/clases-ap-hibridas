# Clase 11 — Introducción a React con Vite

## Índice

1. [¿Qué se hizo esta clase?](#qué-se-hizo-esta-clase)
2. [Estructura del proyecto React](#estructura-del-proyecto-react)
3. [¿Qué es Vite y por qué lo usamos?](#qué-es-vite-y-por-qué-lo-usamos)
4. [DOM vs Virtual DOM](#dom-vs-virtual-dom)
5. [Componentes: Class vs Functional](#componentes-class-vs-functional)
6. [JSX: el lenguaje de React](#jsx-el-lenguaje-de-react)
7. [React Fragment y la etiqueta `<>`](#react-fragment-y-la-etiqueta-)
8. [StrictMode](#strictmode)
9. [Hooks — el concepto central de React moderno](#hooks--el-concepto-central-de-react-moderno)
10. [`useState` en detalle](#usestate-en-detalle)
11. [Por qué `className` y no `class`](#por-qué-classname-y-no-class)
12. [Renderizado de listas: `.map()` y la prop `key`](#renderizado-de-listas-map-y-la-prop-key)
13. [Desglose del código clave](#desglose-del-código-clave)
14. [Flujo de arranque de la app](#flujo-de-arranque-de-la-app)
15. [Cómo manejar el CSS en React](#cómo-manejar-el-css-en-react)
16. [Cómo correr el proyecto](#cómo-correr-el-proyecto)

---

## ¿Qué se hizo esta clase?

Hasta la clase 10 construimos una API REST con Node + Express + MongoDB y un frontend con HTML generado en el servidor (vistas EJS renderizadas por los controladores). Ese enfoque se llama **Server-Side Rendering (SSR)**: el servidor arma el HTML y lo manda completo al navegador.

Esta clase damos un giro conceptual: arrancamos con **React**, que vive completamente en el cliente (browser). El servidor ya no arma el HTML; en cambio, manda un HTML casi vacío con un solo `<div id="root">`, y React se encarga de construir toda la interfaz en el navegador usando JavaScript.

**Qué se incorporó:**
- React 19 como librería de UI.
- Vite como herramienta de build y servidor de desarrollo.
- Tailwind CSS 4 integrado en Vite.
- El concepto de componentes, JSX, estado y hooks.

**Qué capa del proyecto se tocó:**
Esta clase es un proyecto separado. No se tocó nada de las clases anteriores (la API sigue igual). React es el reemplazo del frontend (las vistas EJS), pero todavía no conecta con la API; eso vendrá en clases futuras.

---

## Estructura del proyecto React

Cuando creás un proyecto con `npm create vite@latest` y elegís React, la estructura que genera es esta:

```
clase-11/
│
├── index.html              ← El único HTML del proyecto. Tiene un <div id="root"> vacío.
├── vite.config.js          ← Configuración de Vite: plugins de React, Tailwind, etc.
├── package.json            ← Dependencias y scripts (dev, build, preview).
├── eslint.config.js        ← Reglas de linting para código React.
├── .gitignore              ← Excluye node_modules, dist, etc.
│
└── src/                    ← Todo el código fuente de la app vive aquí.
    ├── main.jsx            ← Punto de entrada: monta React en el <div id="root">.
    ├── App.jsx             ← Componente raíz, el "papá" de todos los demás componentes.
    ├── App.css             ← Estilos específicos de App. Aquí se importa Tailwind.
    └── index.css           ← Estilos globales: variables CSS, estilos del body, etc.
```

**Por dónde empezar a leer el código:**

```
index.html  →  src/main.jsx  →  src/App.jsx  →  componentes hijos (en clases futuras)
```

El orden de lectura sigue el flujo de ejecución: el HTML carga `main.jsx`, que monta `App.jsx`, que a su vez puede incluir otros componentes.

**Archivos que no hay que tocar:**
- `node_modules/` — las dependencias instaladas. Nunca se edita a mano.
- `dist/` — la carpeta que genera `npm run build` con el código optimizado para producción. Se genera automáticamente.

---

## ¿Qué es Vite y por qué lo usamos?

### El problema que resuelve

El código React está escrito en JSX y usa módulos ES6 (`import`/`export`). Los navegadores no entienden JSX directamente: necesitan que alguien lo traduzca a JavaScript puro antes de ejecutarlo.

Vite es esa herramienta. Actúa como:

1. **Servidor de desarrollo** — Sirve los archivos del proyecto al browser mientras trabajás. Cuando guardás un archivo, actualiza el componente en pantalla en milisegundos sin recargar la página (esto se llama **Hot Module Replacement** o HMR).
2. **Compilador** — Transforma JSX a JS, procesa el CSS de Tailwind, y optimiza todo para producción con `npm run build`.

### Comparación con alternativas

| Herramienta | Velocidad | Complejidad de config | Estado |
|---|---|---|---|
| **Webpack** | Lenta en dev | Alta | Viejo estándar |
| **Create React App** | Media | Casi nula | Deprecado en 2023 |
| **Vite** | Muy rápida | Baja | El estándar actual |

### Los scripts del `package.json`

```json
"scripts": {
  "dev":     "vite",          // Arranca el servidor de desarrollo en localhost:5173
  "build":   "vite build",    // Genera la carpeta dist/ para producción
  "preview": "vite preview"   // Sirve la carpeta dist/ para revisarla antes de deployar
}
```

### El `vite.config.js` de esta clase

```js
import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),          // Habilita JSX y HMR
    babel({ presets: [reactCompilerPreset()] }),  // Optimizaciones automáticas (experimental)
    tailwindcss(),    // Integra Tailwind, genera solo el CSS usado
  ],
});
```

Cada plugin es una extensión de lo que Vite puede hacer. Sin `react()`, no entendería JSX. Sin `tailwindcss()`, las clases como `text-red-200` no generarían CSS.

**Cómo se integra Tailwind:** solo hace falta importarlo en el CSS:

```css
/* src/App.css */
@import "tailwindcss";
```

Eso es todo. Vite + el plugin de Tailwind se encargan del resto: escanean todos los archivos `.jsx`, detectan qué clases se usan, y generan solo el CSS necesario.

---

## DOM vs Virtual DOM

### El DOM real (lo que conocías)

El **Document Object Model (DOM)** es la representación que el navegador construye del HTML de una página. Es un árbol de nodos: cada etiqueta HTML es un nodo.

Cuando hacías esto con JavaScript puro:

```js
document.getElementById("miBoton").textContent = "Nuevo texto";
```

...le ordenabas al navegador que modificara directamente ese nodo del árbol del DOM. El problema es que las operaciones sobre el DOM real son **lentas** (el navegador tiene que recalcular estilos, hacer un "reflow" del layout, y repintar la pantalla). Si tenés una lista de 1000 items y cambia uno, recalcular todo es costoso.

### El Virtual DOM (la solución de React)

El **Virtual DOM (VDOM)** es una copia del DOM que vive en la memoria de JavaScript. Es un objeto JavaScript que representa el árbol de la UI, no el árbol real del navegador.

Cuando algo cambia en tu app React, el flujo es:

```
1. El estado cambia (ej: count pasa de 0 a 1)
           │
           ▼
2. React genera un NUEVO Virtual DOM con el estado actualizado
           │
           ▼
3. React compara el VDOM nuevo con el VDOM anterior
   (este proceso se llama "reconciliación" o "diffing")
           │
           ▼
4. React detecta QUÉ cambió exactamente
           │
           ▼
5. React actualiza SOLO ese nodo en el DOM real
```

El paso 3-4 (el "diffing") es barato porque comparar objetos JavaScript es rápido. El paso 5 es mínimo porque solo toca lo que cambió.

### La diferencia práctica

Con JavaScript puro (lo que hacías antes):
```js
// Vos decís CÓMO hacerlo (imperativo)
const li = document.getElementById("item-3");
li.textContent = "Nuevo nombre";
li.classList.add("resaltado");
```

Con React:
```jsx
// Vos decís QUÉ querés que se vea (declarativo)
// React se encarga del CÓMO
<li className="resaltado">{personaje.nombre}</li>
```

Esta distinción **imperativo vs declarativo** es el cambio de mentalidad más importante de React.

---

## Componentes: Class vs Functional

Un **componente** en React es una función (o clase) que recibe datos y devuelve JSX (lo que se va a mostrar en pantalla). Son los bloques de construcción de toda app React: en lugar de un HTML monolítico, la UI se divide en piezas reutilizables.

El profe mostró la evolución histórica de cómo se escriben. Las dejamos comentadas en [App.jsx](src/App.jsx) para estudiarlas.

### Class Component (la forma vieja, pre-2019)

```jsx
import React, { Component } from "react";

export default class App extends Component {
  render() {
    return (
      <div>App</div>
    )
  }
}
```

- Requiere extender `Component` de React.
- La UI se escribe dentro de un método `render()`.
- El estado se maneja con `this.state` y `this.setState()`.
- Los métodos del ciclo de vida (`componentDidMount`, `componentDidUpdate`) se definen como métodos de la clase.
- Verboso, difícil de reutilizar lógica entre componentes.

### Functional Component (la forma moderna)

```jsx
const App = () => {
  return ( <div>hola!</div> )
}

export default App
```

- Es simplemente una función que devuelve JSX.
- No hay `this`. No hay `render()`. No hay clase.
- El estado y los efectos secundarios se manejan con **Hooks** (ver más abajo).
- Desde React 16.8 (2019), los Hooks hicieron que los Class Components quedaran obsoletos para código nuevo.

### El snippet `rafce`

La extensión **ES7+ React/Redux/React-Native snippets** define el atajo `rafce`:

```
rafce = React Arrow Function Component Export
```

Al escribir `rafce` y presionar Tab, genera automáticamente:

```jsx
import React from 'react'

const NombreDelArchivo = () => {
  return (
    <div>NombreDelArchivo</div>
  )
}

export default NombreDelArchivo
```

Es solo un shortcut de teclado; no cambia nada del comportamiento.

---

## JSX: el lenguaje de React

**JSX** no es HTML. Es una extensión de sintaxis de JavaScript que *parece* HTML pero se compila a llamadas de función puras.

Esto:
```jsx
const elemento = <h1 className="titulo">Hola mundo</h1>;
```

Vite/Babel lo transforma a esto:
```js
const elemento = React.createElement("h1", { className: "titulo" }, "Hola mundo");
```

Es decir, `<h1>` no es una etiqueta HTML: es azúcar sintáctica para una función.

**Reglas importantes de JSX:**

| Regla | Por qué |
|---|---|
| Solo puede haber UN elemento raíz en el return | Porque compila a una llamada de función, y una función devuelve un solo valor |
| Las expresiones JS van entre `{}` | `{personaje.nombre}`, `{count}`, `{array.map(...)}` |
| Los atributos usan `camelCase` | `onClick` en vez de `onclick`, `className` en vez de `class` |
| Los componentes empiezan con mayúscula | `<App />` (componente) vs `<div>` (etiqueta HTML nativa) |
| Las etiquetas siempre se cierran | `<input />`, no `<input>` |

---

## React Fragment y la etiqueta `<>`

Como JSX solo puede devolver UN elemento raíz, si necesitás devolver varios hermanos tenés dos opciones:

**Opción 1 — Envolver en un div (mala práctica si el div no aporta semántica):**
```jsx
return (
  <div>
    <h1>Título</h1>
    <p>Párrafo</p>
  </div>
);
```
Esto agrega un `<div>` innecesario al DOM real.

**Opción 2 — Fragment explícito:**
```jsx
import { Fragment } from 'react';
return (
  <Fragment>
    <h1>Título</h1>
    <p>Párrafo</p>
  </Fragment>
);
```

**Opción 3 — Fragment con shorthand `<>` (la más usada):**
```jsx
return (
  <>
    <h1>Título</h1>
    <p>Párrafo</p>
  </>
);
```

`<>` y `</>` son exactamente lo mismo que `<Fragment>` pero con menos código. No generan ningún nodo en el DOM real: son invisibles para el navegador. Solo existen para satisfacer la regla de "un solo elemento raíz" de JSX.

---

## StrictMode

`StrictMode` es un componente de React que activa controles extra **solo en modo desarrollo** (`npm run dev`). En producción (`npm run build`) desaparece sin dejar rastro.

```jsx
// En main.jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Qué hace StrictMode:**

1. **Llama a cada componente dos veces**: React renderiza el componente, tira el resultado, y lo renderiza de nuevo. Esto simula lo que pasaría si React decidiera descartar y reconstruir un componente (algo que puede pasar con Concurrent Mode). Si tu componente tiene efectos secundarios en el render (como llamadas a una API dentro del cuerpo de la función), StrictMode los expone.

   > Esto explica por qué `console.log("me llamaron")` aparece dos veces en la consola del navegador, aunque el componente se renderice una sola vez visualmente.

2. **Detecta APIs obsoletas**: advierte si usás métodos o patrones de React que ya no se recomiendan.

**La regla de oro:** si algo funciona en StrictMode, va a funcionar en producción. Si algo se rompe con StrictMode, tenés un bug que en producción puede manifestarse de formas imprevisibles.

---

## Hooks — el concepto central de React moderno

### El problema que resuelven

Los componentes funcionales son funciones simples. Cada vez que el estado cambia, React llama a la función de nuevo (re-renderiza). Pero una función normal no puede "recordar" nada entre llamadas: sus variables se recrean desde cero cada vez.

```js
// Esta función no "recuerda" nada entre ejecuciones
function App() {
  let count = 0;       // Siempre empieza en 0
  count = count + 1;   // Llega a 1 y se olvida
  return count;        // Siempre muestra 1
}
```

Los **Hooks** son funciones especiales que le dan a los componentes funcionales capacidades que antes solo tenían las clases: **memoria entre renderizados, efectos secundarios, contexto global**, etc.

### Reglas de los Hooks

Hay dos reglas que no se pueden violar:

1. **Solo se llaman en el nivel superior del componente** — nunca dentro de un `if`, un `for` o una función anidada. React necesita que siempre se llamen en el mismo orden para llevar la cuenta de cuál es cuál.

2. **Solo se llaman dentro de componentes funcionales de React** (o dentro de custom hooks) — no en funciones JavaScript normales.

```jsx
// ✅ Correcto
const App = () => {
  const [count, setCount] = useState(0); // Nivel superior
  return <div>{count}</div>;
};

// ❌ Incorrecto
const App = () => {
  if (condicion) {
    const [count, setCount] = useState(0); // Dentro de un if: PROHIBIDO
  }
};
```

### Los Hooks más importantes

| Hook | Para qué sirve |
|---|---|
| `useState` | Agregar estado local a un componente |
| `useEffect` | Ejecutar código cuando el componente monta, actualiza o desmonta (ej: llamar a una API) |
| `useContext` | Leer un valor de contexto global sin prop drilling |
| `useRef` | Guardar una referencia a un nodo del DOM o un valor que no dispara re-renderizado |
| `useMemo` | Memorizar el resultado de un cálculo costoso |
| `useCallback` | Memorizar una función para que no se recree en cada render |

Esta clase vemos solo `useState`. El resto vendrá en clases futuras.

---

## `useState` en detalle

### Sintaxis

```jsx
const [valorActual, funcionSetter] = useState(valorInicial);
```

`useState` devuelve siempre un array de dos elementos. Lo desestructuramos de inmediato con `const [a, b]`.

- El primer elemento es el **valor actual del estado** (solo lectura).
- El segundo es la **función para actualizarlo** (por convención se llama `set` + nombre).

### En el código de la clase

```jsx
const [ count, setCount ] = useState(0)
// count    → empieza en 0, es lo que se muestra en pantalla
// setCount → la función que actualiza count y dispara el re-renderizado
```

### Qué pasa cuando llamás a `setCount`

```
Usuario hace click en el botón
         │
         ▼
contador() se ejecuta
         │
         ▼
setCount(count + 1) se llama
         │
         ├── React guarda el nuevo valor (1) internamente
         │
         └── React agenda un re-renderizado del componente
                   │
                   ▼
         App() se vuelve a ejecutar
                   │
                   ▼
         Ahora count vale 1 (React le pasa el nuevo valor)
                   │
                   ▼
         React compara el VDOM nuevo con el viejo
                   │
                   ▼
         Solo actualiza el nodo que mostró "0" (ahora muestra "1")
```

### Por qué el `console.log` muestra el valor viejo

```jsx
function contador(){
  setCount( count + 1 )
  console.log(count)  // ← Muestra el valor ANTERIOR
}
```

`setCount` no modifica `count` inmediatamente. Programa un re-renderizado. La variable `count` que existe en esa ejecución de la función sigue siendo la del render anterior. El nuevo valor solo estará disponible en el próximo render del componente.

### La diferencia con una variable normal

```jsx
// Variable normal: se resetea en cada render, React no sabe que cambió
const App = () => {
  let count = 0;          // Siempre 0
  const sumar = () => {
    count = count + 1;    // Cambia, pero React no re-renderiza
  };
  return <div onClick={sumar}>{count}</div>; // Siempre muestra 0
};

// useState: persiste entre renders, React re-renderiza al cambiar
const App = () => {
  const [count, setCount] = useState(0);
  const sumar = () => {
    setCount(count + 1);  // React se entera y re-renderiza
  };
  return <div onClick={sumar}>{count}</div>; // Se actualiza
};
```

---

## Por qué `className` y no `class`

En HTML puro escribís:
```html
<li class="text-red-200">Bart</li>
```

En JSX escribís:
```jsx
<li className="text-red-200">Bart</li>
```

**¿Por qué?** Porque JSX se compila a JavaScript, y en JavaScript `class` es una **palabra reservada** del lenguaje (define clases ES6):

```js
class Persona { ... }        // class es una keyword de JS
```

Para evitar la ambigüedad, React usó `className` desde el principio. Es el único atributo que más confunde al principio, pero con el tiempo sale solo.

Otros atributos HTML que también cambian de nombre en JSX:

| HTML | JSX | Por qué |
|---|---|---|
| `class` | `className` | `class` es keyword de JS |
| `for` (en `<label>`) | `htmlFor` | `for` es keyword de JS (bucles) |
| `onclick` | `onClick` | Convención camelCase de JS |
| `onchange` | `onChange` | Convención camelCase de JS |

---

## Renderizado de listas: `.map()` y la prop `key`

Para mostrar una lista en React, usás el método `.map()` de JavaScript dentro del JSX:

```jsx
{ array.map( (personaje) => (
  <li key={personaje.id} className="text-red-200">
    { personaje.nombre }
  </li>
))}
```

### La prop `key`

`key` es una prop especial que React usa **internamente** para identificar cada elemento de la lista en el Virtual DOM. No aparece como atributo en el HTML real.

**¿Por qué es obligatoria?**

Imaginá que tenés una lista de 5 Simpsons y agregás uno en el medio. Sin `key`, React no sabe cuál es cuál y compara por posición (el elemento 1 con el elemento 1, el 2 con el 2, etc.), lo que puede generar actualizaciones innecesarias o bugs visuales.

Con `key`, React puede identificar exactamente qué elemento es nuevo, cuál se movió y cuál se eliminó, actualizando solo lo necesario.

**Reglas de `key`:**
- Debe ser **única entre hermanos** (no en todo el árbol, solo en esa lista).
- Debe ser **estable**: no usar el índice del array como key, porque si el array se reordena, los índices cambian y React se confunde. Usá siempre un `id` real del dato.
- No tiene que ser un número: puede ser un string.

```jsx
// ❌ Usar el índice como key (problemático si el array se reordena o filtra)
array.map( (item, index) => <li key={index}>{item.nombre}</li> )

// ✅ Usar un id real del dato
array.map( (item) => <li key={item.id}>{item.nombre}</li> )
```

---

## Desglose del código clave

### `src/main.jsx` — El punto de entrada

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

| Línea | Qué hace |
|---|---|
| `createRoot(document.getElementById('root'))` | Busca el `<div id="root">` del `index.html` y le dice a React que va a "vivir" ahí |
| `.render(...)` | Monta el árbol de componentes dentro de ese div |
| `<StrictMode>` | Activa los controles extra de desarrollo |
| `<App />` | El componente raíz: React empieza a renderizar desde aquí hacia abajo |

### `src/App.jsx` — El componente con estado

```jsx
const [ count, setCount ] = useState(0)
```
Declara el estado `count` inicializado en 0.

```jsx
function contador(){
  setCount( count + 1 )
}
```
Usa el setter para incrementar el estado. Esto dispara un re-renderizado.

```jsx
<button onClick={ contador } >+</button>
```
`onClick` recibe la **referencia** a la función (sin paréntesis). Si fuera `onClick={contador()}` la ejecutaría al renderizar, no al clickear.

```jsx
{ array.map( (personaje) => (
  <li key={personaje.id} className="text-red-200">
    { personaje.nombre }
  </li>
))}
```
Convierte el array de objetos en un array de elementos JSX. React sabe renderizar arrays de JSX.

---

## Flujo de arranque de la app

```
Browser carga index.html
         │
         │  Encuentra <div id="root"></div> (vacío)
         │  Encuentra <script src="/src/main.jsx">
         │
         ▼
Vite sirve main.jsx (compilado a JS puro)
         │
         │  createRoot(document.getElementById('root'))
         │  Encuentra el div vacío en el DOM real
         │
         ▼
React monta <StrictMode> y dentro <App />
         │
         │  App() se ejecuta
         │  useState(0) → count = 0
         │  .map() genera 5 elementos <li>
         │  Devuelve el árbol JSX
         │
         ▼
React genera el Virtual DOM con ese árbol
         │
         │  Lo compara con el DOM real (que estaba vacío)
         │  Detecta todo como "nuevo"
         │
         ▼
React actualiza el DOM real
         │
         └── El browser pinta la lista de Simpsons y el botón "+"

Usuario hace click en "+"
         │
         ▼
contador() → setCount(1)
         │
         ▼
React re-renderiza App() con count = 1
         │
         ▼
VDOM nuevo vs VDOM anterior: solo cambió el nodo que muestra "0"
         │
         ▼
React actualiza solo ese nodo en el DOM real → browser muestra "1"
```

---

## Cómo manejar el CSS en React

### La regla de oro: CSS se importa desde JS, no desde el HTML

En un proyecto Vite+React, la forma correcta de cargar estilos es mediante `import` en los archivos JS/JSX. **No** con `<link>` en el `index.html`.

```jsx
// ✅ Correcto: Vite lo procesa, lo bundlea y lo optimiza para producción
import './App.css'

// ⚠️ Funciona pero no es el patrón React: queda fuera del control del bundler
// <link rel="stylesheet" href="src/App.css"> en index.html
```

Cuando el CSS entra por `import`, Vite sabe exactamente qué archivos CSS usa la app, puede optimizarlos y los incluye correctamente en el build de producción. Con un `<link>` en el HTML eso hay que manejarlo a mano.

### Dónde importar cada CSS

Hay dos niveles:

**CSS global** — estilos que aplican a toda la app (variables de color, reset, tipografía base). Se importan en `main.jsx` porque es el punto de entrada de toda la app.

```jsx
// main.jsx
import './index.css'  // variables CSS, estilos del body, h1, h2...
import './App.css'    // @import "tailwindcss" — Tailwind para toda la app
```

**CSS de componente** — estilos específicos de un componente. Se importan en el propio archivo del componente.

```jsx
// Home.jsx
import './Home.css'   // estilos que solo usa este componente

const Home = () => {
  return <div className="home-container">...</div>
}
```

### Los estilos se acumulan (no hay scope automático)

Este es el punto más importante: cuando Vite arma el bundle, **junta todos los CSS importados en cualquier parte del árbol JS y los aplica al mismo documento HTML**. No existe aislamiento automático entre componentes.

```
main.jsx  →  import './index.css'   ┐
main.jsx  →  import './App.css'     ├── Los tres van al mismo <head> del browser
Home.jsx  →  import './Home.css'    ┘
```

El componente `Home` va a tener los tres aplicados. De hecho, **todos los componentes** van a tener los tres, porque todos viven en el mismo documento.

La consecuencia práctica:

```css
/* App.css */
.titulo { color: blue; }

/* Home.css */
.titulo { color: red; }   /* ← Gana este porque se cargó después */
```

Si dos archivos CSS definen la misma clase, se pisan. El último en cargarse gana (cascada normal de CSS).

### Ejemplo completo con múltiples componentes

```
src/
├── main.jsx          →  import './index.css'  (variables globales)
│                        import './App.css'    (Tailwind)
│
├── App.jsx           →  sin CSS propio (usa Tailwind con className)
│
├── components/
│   ├── Home.jsx      →  import './Home.css'
│   ├── Home.css      →  estilos específicos de Home
│   ├── Navbar.jsx    →  import './Navbar.css'
│   └── Navbar.css    →  estilos específicos de Navbar
```

### ¿Y si quiero estilos realmente aislados?

La solución se llama **CSS Modules**. Los archivos se nombran `Home.module.css` y las clases se aplican como propiedades de un objeto JS. Vite genera nombres de clase únicos automáticamente, así que nunca hay colisiones.

```jsx
// Home.jsx con CSS Modules
import styles from './Home.module.css'

const Home = () => {
  // "titulo" se convierte en algo como "titulo_3xK9a" — único globalmente
  return <div className={styles.titulo}>Hola</div>
}
```

Eso es tema de una clase futura. Por ahora alcanza con saber que existe y que es la solución cuando los proyectos crecen y las colisiones de nombres se vuelven un problema real.

---

## Cómo correr el proyecto

```bash
# 1. Entrar a la carpeta de la clase
cd clase-11

# 2. Instalar dependencias (solo la primera vez)
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

Vite arranca en `http://localhost:5173` (no en el `localhost:2026` de la API de Express).

**Scripts disponibles:**

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Genera la carpeta `dist/` optimizada para producción |
| `npm run preview` | Sirve la carpeta `dist/` localmente para revisarla |
| `npm run lint` | Ejecuta ESLint para detectar errores de código React |
