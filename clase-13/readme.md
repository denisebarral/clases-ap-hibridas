# Clase 13 — Integración de IA: Chat con modelo de lenguaje via NVIDIA NIM

## Índice

- [¿Qué se hizo esta clase?](#qué-se-hizo-esta-clase)
- [Nuevos archivos y su rol](#nuevos-archivos-y-su-rol)
- [Nuevas dependencias](#nuevas-dependencias)
- [Conceptos clave](#conceptos-clave)
  - [¿Qué es NVIDIA NIM?](#qué-es-nvidia-nim)
  - [¿Qué modelo se usó y qué significa su nombre?](#qué-modelo-se-usó-y-qué-significa-su-nombre)
  - [¿Qué se copió de build.nvidia.com?](#qué-se-copió-de-buildnvidiacom)
  - [¿Por qué el backend hace el fetch y no el frontend?](#por-qué-el-backend-hace-el-fetch-y-no-el-frontend)
  - [¿Qué es CORS y por qué se necesita?](#qué-es-cors-y-por-qué-se-necesita)
  - [¿Qué es el "objeto de configuración" que se pasa al fetch?](#qué-es-el-objeto-de-configuración-que-se-pasa-al-fetch)
  - [stream: false vs stream: true](#stream-false-vs-stream-true)
  - [react-markdown y remark-gfm](#react-markdown-y-remark-gfm)
  - [¿Para qué sirve la extensión KILO?](#para-qué-sirve-la-extensión-kilo)
- [Desglose de código clave](#desglose-de-código-clave)
  - [Back: chat.routes.js](#back-chatroutesjs)
  - [Front: Chat.jsx](#front-chatjsx)
    - [1. Imports y dependencias](#1-imports-y-dependencias)
    - [2. El estado con useState](#2-el-estado-con-usestate)
    - [3. El manejador del formulario](#3-el-manejador-del-formulario-handlesubmit)
    - [4. El fetch al backend](#4-el-fetch-al-backend)
    - [5. El JSX de retorno: ReactMarkdown](#5-el-jsx-de-retorno-reactmarkdown)
    - [6. El truco del name en el input](#6-el-truco-del-name-en-el-input)
- [Flujo completo de una pregunta](#flujo-completo-de-una-pregunta)
- [Bug detectado: doble prefijo /api](#bug-detectado-doble-prefijo-api)
- [¿Necesito mi propia API key?](#necesito-mi-propia-api-key)
- [Cómo probarlo en Postman](#cómo-probarlo-en-postman)
- [Referencia rápida de endpoints nuevos](#referencia-rápida-de-endpoints-nuevos)

---

## ¿Qué se hizo esta clase?

Hasta la clase 12 el proyecto tenía un CRUD de personajes y productos conectado a MongoDB. Esta clase agrega una funcionalidad completamente nueva: **un chat de IA integrado en el frontend React que se comunica con un modelo de lenguaje de 480 mil millones de parámetros**, usando como intermediario el propio backend Express.

Lo que cambió respecto a la clase anterior:

- **Back** — Se agregó un único archivo nuevo: `api/routes/chat.routes.js`. Este archivo define un endpoint `POST /api/chat` que actúa como puente entre el frontend y la API de NVIDIA. También se agregó el paquete `cors` para permitir que el frontend (que corre en otro puerto) pueda hablar con el backend.
- **Front** — Se agregó el componente `Chat.jsx` y dos dependencias nuevas (`react-markdown`, `remark-gfm`) para renderizar correctamente las respuestas del modelo, que vienen en formato Markdown.

La capa del MVC que se tocó en el back es **exclusivamente la de rutas de la API** (`api/routes/`). No se tocó MongoDB, no hay modelo ni service nuevo: la fuente de datos acá no es la base de datos propia, sino la API externa de NVIDIA.

---

## Nuevos archivos y su rol

```
clase-13/
├── back/
│   └── api/
│       └── routes/
│           └── chat.routes.js   ← NUEVO: proxy hacia la API de IA de NVIDIA
└── front/
    └── src/
        ├── Chat.jsx             ← NUEVO: componente de chat en React
        └── main.jsx             ← MODIFICADO: monta Chat en lugar de App
```

### Back

| Archivo | Rol en el patrón |
|---|---|
| `back/api/routes/chat.routes.js` | Define `POST /api/chat`. Recibe la pregunta del usuario, la reenvía a NVIDIA con la API key, y devuelve la respuesta al frontend. No tiene service ni controller separado: la lógica es tan simple que cabe directo en la ruta. |

### Front

| Archivo | Qué cambió |
|---|---|
| `front/src/Chat.jsx` | Archivo nuevo. Componente React con un formulario de texto, un `fetch()` al backend y renderizado Markdown de la respuesta. |
| `front/src/main.jsx` | Se reemplazó `<App />` por `<Chat />` como componente raíz. La clase muestra `Chat` como el componente central de esta entrega. |

**Cambio en `main.jsx`:**

```jsx
// Antes (clase 12):
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />      // ← el componente raíz era App
  </StrictMode>
)

// Ahora (clase 13):
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Chat />     // ← el componente raíz es Chat; App sigue existiendo pero no se monta
  </StrictMode>
)
```

Esto no elimina `App.jsx`, simplemente no se lo monta. En un proyecto real ambos componentes coexistirían dentro de un árbol de rutas; acá se aísla `Chat` para mostrar el concepto en limpio.

---

## Nuevas dependencias

### Back (`back/package.json`)

```json
"dependencies": {
  "cors": "^2.8.6"   // ← NUEVO
}
```

| Paquete | Para qué sirve |
|---|---|
| `cors` | Agrega los headers HTTP necesarios para que el navegador permita requests entre orígenes distintos (frontend en `:5173`, backend en `:2026`). |

### Front (`front/package.json`)

```json
"dependencies": {
  "react-markdown": "^10.1.0",   // ← NUEVO
  "remark-gfm": "^4.1.0"        // ← NUEVO
}
```

| Paquete | Para qué sirve |
|---|---|
| `react-markdown` | Convierte texto en formato Markdown (`**negrita**`, listas, bloques de código) a JSX de React. Los modelos de IA siempre responden en Markdown. |
| `remark-gfm` | Plugin para `react-markdown` que agrega soporte para el dialecto "GitHub Flavored Markdown": tablas, tachado (`~~texto~~`), checkboxes, etc. |

---

## Conceptos clave

### ¿Qué es NVIDIA NIM?

NVIDIA es la empresa que fabrica las GPUs (las tarjetas gráficas que se usan para entrenar y correr modelos de IA). Pero además del hardware, tienen una plataforma cloud llamada **NVIDIA NIM** (Inference Microservices) que se accede desde [build.nvidia.com](https://build.nvidia.com).

Pensalo como el "OpenAI API" pero de NVIDIA: en lugar de acceder a los modelos de OpenAI (GPT-4, etc.), accedés a una colección de modelos open source de distintos proveedores (Meta, Alibaba, Google, Mistral, etc.), todos corriendo en la infraestructura de NVIDIA.

Lo más importante para esta clase: **ofrecen acceso gratuito para desarrollo**, con un límite de requests por mes. No hace falta una GPU propia ni pagar un servidor: NVIDIA pone la infraestructura y vos mandás requests via HTTP, igual que con cualquier API REST.

La URL del endpoint de inferencia (al que se le mandan las preguntas) es:
```
https://integrate.api.nvidia.com/v1/chat/completions
```

Esta URL sigue el mismo formato que la API de OpenAI, lo que significa que cualquier cliente que soporte OpenAI (librerías, herramientas) también funciona con NVIDIA NIM sin modificaciones.

---

### ¿Qué modelo se usó y qué significa su nombre?

El modelo es `qwen/qwen3-coder-480b-a35b-instruct`. Desglosado:

| Parte del nombre | Significado |
|---|---|
| `qwen` | El proveedor: **Qwen**, un laboratorio de IA de Alibaba (la empresa china de e-commerce). |
| `qwen3` | Versión 3 de la familia de modelos Qwen. |
| `coder` | Variante especializada en programación: fue entrenada con más código que la versión base. |
| `480b` | **480 billion (480 mil millones) de parámetros**. Los parámetros son los "pesos" que el modelo aprendió. Más parámetros = más capacidad. Para comparar: GPT-3 tenía 175B. |
| `a35b` | "Activates 35B". El modelo usa la arquitectura **MoE (Mixture of Experts)**: tiene 480B de parámetros totales pero solo activa 35B para responder cada token. Esto lo hace mucho más eficiente. |
| `instruct` | El modelo fue entrenado con **RLHF** (Reinforcement Learning from Human Feedback) para seguir instrucciones. Si fuera `base`, solo completaría texto; con `instruct`, puede tener conversaciones, responder preguntas y seguir órdenes. |

En términos prácticos: es un modelo enorme, especializado en código, gratuito para desarrollo, y que responde en lenguaje natural.

---

### ¿Qué se copió de build.nvidia.com?

El profe fue a [build.nvidia.com](https://build.nvidia.com), buscó el modelo `qwen3-coder-480b`, clickeó el botón **"Get API Key"** para obtener la clave, y después abrió el modal **"Copy Code to Make an API Request"**.

Ese modal tiene cuatro pestañas: **Python**, **LangChain**, **Node**, **Shell**. Las capturas muestran las pestañas Node y Shell. El código que se copió fue el de la pestaña **Node**, que usa `fetch()` nativo de JavaScript.

Lo que se copió es básicamente la **plantilla de llamada a la API**: la URL, los headers necesarios (Authorization, Content-Type, Accept), y la estructura del body JSON. El profe la adaptó para que el `content` del mensaje sea `req.body.pregunta` en lugar de un string fijo.

---

### ¿Por qué el backend hace el fetch y no el frontend?

Esta es la decisión de diseño más importante de la clase. El frontend PODRÍA llamar directamente a la API de NVIDIA, pero **no debe hacerlo** por una razón de seguridad fundamental:

```
❌ MAL (frontend llama directo a NVIDIA):
   Navegador → https://integrate.api.nvidia.com/v1/chat/completions
   Con header: Authorization: Bearer nvapi-xxxxx

   Problema: cualquier usuario que abra DevTools → Network ve la API key.
   Con esa key puede hacer requests a NVIDIA a tu costo.
```

```
✅ BIEN (backend como proxy):
   Navegador → http://localhost:2026/api/chat  (SIN API key)
   Backend   → https://integrate.api.nvidia.com (CON API key, en el servidor)

   La key nunca sale del servidor. El navegador solo ve la URL de tu propio backend.
```

El backend actúa como **proxy**: recibe la pregunta del frontend, la reenvía a NVIDIA añadiendo la API key que solo él conoce, y le pasa la respuesta al frontend. Es el mismo patrón que se usaría para esconder contraseñas de base de datos, claves de Stripe, tokens de Twilio, etc.

---

### ¿Qué es CORS y por qué se necesita?

CORS (Cross-Origin Resource Sharing) es una política de seguridad del navegador. Un "origen" es la combinación de protocolo + dominio + puerto.

Cuando el frontend (corriendo en `http://localhost:5173` con Vite) hace un `fetch()` al backend (`http://localhost:2026`), los puertos son distintos: **son orígenes diferentes**. El navegador bloquea esa request por defecto con un error como:

```
Access to fetch at 'http://localhost:2026/api/chat' from origin
'http://localhost:5173' has been blocked by CORS policy.
```

El paquete `cors` de Express resuelve esto agregando headers HTTP a las respuestas del servidor que le dicen al navegador "está bien, este origen puede acceder":

```javascript
// main.js
app.use(cors())  // Agrega el header: Access-Control-Allow-Origin: *
```

> **Importante**: CORS solo existe en el navegador. Postman y Node.js no tienen esta restricción porque no son navegadores. Por eso una request desde Postman a tu backend funciona sin `cors`, pero desde el navegador no.

---

### ¿Qué es el "objeto de configuración" que se pasa al fetch?

La API nativa `fetch()` acepta dos argumentos:

```javascript
fetch(url, objetoDeConfiguracion)
```

El primer argumento es la URL. El segundo es un objeto JavaScript con opciones de la request:

```javascript
fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
  method: "POST",           // verbo HTTP
  headers: {                // headers de la request
    Authorization: "...",
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify({    // cuerpo de la request (debe ser string, por eso JSON.stringify)
    model: "...",
    messages: [...],
    // ...
  }),
})
```

Esto no tiene nada de especial de NVIDIA: es la forma estándar de usar `fetch()` para hacer un POST con JSON, tanto en el navegador como en Node.js 18+. **No es Shell**: Shell sería usar `curl` en la terminal. Acá se usa JavaScript puro, que es lo mismo que el frontend usa cuando habla con el propio backend.

---

### stream: false vs stream: true

En el ejemplo de NVIDIA (visible en las capturas), el parámetro `stream` está en `true`. El profe lo cambió a `false`. La diferencia es:

| `stream: true` | `stream: false` |
|---|---|
| La respuesta llega en **múltiples chunks** sucesivos (Server-Sent Events) | La respuesta llega **entera en un solo JSON** |
| Produce el efecto "typing" de ChatGPT (el texto aparece letra a letra) | El texto aparece todo de golpe cuando termina |
| Requiere leer el stream de la response y procesar cada chunk | Se puede usar `.then(res => res.json())` directamente |
| Más complejo de implementar | Más simple de implementar |

Para una primera implementación, `stream: false` es mucho más práctico porque permite usar el flujo normal de `.then().then()` sin lógica extra. En una implementación más avanzada (con el SDK de AI de Vercel, por ejemplo), se usaría `stream: true`.

---

### react-markdown y remark-gfm

Los modelos de IA responden en **Markdown**: un formato de texto donde `**esto**` es negrita, `# Esto` es un título, etc.

Si mostrás esa respuesta en un `<p>` normal de React, el usuario vería los asteriscos y símbolos literalmente, no el formato real. Por ejemplo:

```
Sin react-markdown: **Node.js** es un *runtime* de JavaScript.
Con react-markdown: Node.js es un runtime de JavaScript.
                    ^^^^^^^^         ^^^^^^^
                    (en negrita)  (en cursiva)
```

`react-markdown` convierte ese texto en JSX de React: en lugar de `**texto**` renderiza `<strong>texto</strong>`.

`remark-gfm` es un plugin que agrega soporte para el dialecto **GitHub Flavored Markdown**, que incluye tablas, tachado, listas de tareas y URLs automáticas. Los modelos de código usan estas extensiones con frecuencia (especialmente las tablas y los bloques de código con syntax highlighting).

```jsx
// Uso en el componente:
<ReactMarkdown remarkPlugins={[remarkGfm]}>
  {message}
</ReactMarkdown>
```

---

### ¿Para qué sirve la extensión KILO?

**KILO** es una extensión de VS Code que es un asistente de IA para programación, similar a GitHub Copilot. Ofrece completado de código, chat con contexto del proyecto, generación de código, etc.

**No forma parte de la arquitectura del proyecto**: no hay código en el repositorio que la use. Se instaló como herramienta de desarrollo personal para que el profe pueda pedir ayuda a una IA mientras escribe código, del mismo modo en que podría usar GitHub Copilot. No afecta ni al build ni al comportamiento de la app.

---

## Desglose de código clave

### Back: chat.routes.js

```javascript
// 1. Importa Router de Express (igual que en las demás rutas de la API)
import { Router } from "express";
const router = Router();

// 2. Define el endpoint que el frontend va a llamar
router.post("/api/chat", (req, res) => {

  // 3. Lee la pregunta que mandó el frontend en el body JSON
  console.log("Esta llegando la resp", req.body.pregunta);

  // 4. Hace un fetch() a NVIDIA — esto es Node.js haciendo un HTTP request,
  //    igual que cuando el navegador llama a una API pero desde el servidor.
  fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      // La key secreta va aquí, en el servidor, nunca en el frontend
      Authorization: "Bearer nvapi-...",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      model: "qwen/qwen3-coder-480b-a35b-instruct",
      messages: [{ role: "user", content: req.body.pregunta }],
      temperature: 0.6,   // creatividad del modelo
      top_p: 0.9,
      max_tokens: 4096,
      stream: false,      // respuesta completa en un solo JSON
    }),
  })
    // 5. Parsea el JSON de NVIDIA
    .then((res) => res.json())
    // 6. Extrae el texto de la respuesta y lo manda al frontend
    //    NVIDIA devuelve un array "choices"; siempre hay uno con index 0
    .then((data) =>
      res.status(200).json({ message: data.choices[0].message.content })
    );
});
```

### Front: Chat.jsx

El componente tiene tres partes bien diferenciadas: el estado, el manejador del formulario, y el JSX de retorno. Acá el desglose de cada una.

#### 1. Imports y dependencias

```jsx
import { useState } from "react"           // hook de React para manejar estado
import ReactMarkdown from "react-markdown"  // convierte Markdown a JSX
import remarkGfm from "remark-gfm"         // plugin: tablas, tachado, etc.
```

#### 2. El estado con `useState`

```jsx
const [message, setMessage] = useState("")
//      ↑           ↑              ↑
//   variable    función para    valor inicial
//   de estado   actualizarla    (string vacío)
```

`useState` devuelve un array de dos elementos, y con destructuring los nombramos `message` y `setMessage`. Las reglas clave:

- **`message`** es de solo lectura. Nunca se hace `message = "algo"`.
- **`setMessage("algo")`** actualiza el valor Y le dice a React que vuelva a renderizar el componente.
- El valor inicial `""` hace que el área de respuesta arranque vacía hasta que llegue la primera respuesta.

#### 3. El manejador del formulario (`handleSubmit`)

```jsx
const handleSubmit = (event) => {
    event.preventDefault()
    //    ↑
    //    Sin esto, el <form> haría un GET a la URL actual y recargaría la página.
    //    Es el comportamiento default de los forms HTML desde los años 90.
    //    Con SPA (Single Page Apps) como React, siempre se cancela y se maneja en JS.

    const pregunta = event.target.pregunta.value
    //               ↑            ↑         ↑
    //               el <form>    busca el  lee el texto
    //                            input con  que escribió
    //                            name="pregunta"  el usuario
```

`event.target` es el elemento HTML que disparó el evento (el `<form>`). Desde el form se puede acceder a cualquier input por su atributo `name` directamente: `event.target.nombreDelInput.value`. No hace falta `useRef`, `document.getElementById`, ni tener el valor en estado con `onChange`.

#### 4. El fetch al backend

```jsx
fetch("http://localhost:2026/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pregunta: pregunta })
    //    ↑
    //    El body de un HTTP request es SIEMPRE texto.
    //    JSON.stringify convierte { pregunta: "..." } al string '{"pregunta":"..."}'.
    //    El header Content-Type le avisa al backend que ese texto es JSON,
    //    así Express sabe parsearlo con express.json() y dejarlo en req.body.
})
    .then(res => res.json())
    //           ↑
    //           Parsea el texto de la response como JSON y devuelve el objeto JS.
    //           La respuesta del backend es: { message: "texto en markdown" }

    .then(data => setMessage(data.message))
    //            ↑
    //            Actualiza el estado con el Markdown recibido → React re-renderiza.

    .catch(err => console.error(err))
    //     ↑
    //     Si algo falla (red, backend caído, etc.) lo muestra en consola.
    //     En producción se mostraría un mensaje al usuario.
```

#### 5. El JSX de retorno: ReactMarkdown

```jsx
<ReactMarkdown remarkPlugins={[remarkGfm]}>
    {message}
</ReactMarkdown>
```

Esto es lo que convierte la respuesta del modelo en algo legible. Sin `ReactMarkdown`, si el modelo responde:

```
**Node.js** es un _runtime_ de JavaScript. Ejemplo:
```js
console.log("hola")
```
```

El usuario vería esos asteriscos, guiones bajos y backticks literalmente en la pantalla.

Con `ReactMarkdown`, ve:

> **Node.js** es un _runtime_ de JavaScript. Ejemplo:
> ```js
> console.log("hola")
> ```

`remarkPlugins={[remarkGfm]}` activa el plugin GFM (GitHub Flavored Markdown) que agrega soporte para tablas, texto tachado (`~~esto~~`) y listas de tareas (`- [x]`). Los modelos de código los usan con frecuencia.

#### 6. El truco del `name` en el input

```jsx
<input name="pregunta" type="text" ... />
//     ↑
//     Este atributo name es el que permite hacer event.target.pregunta.value
//     en handleSubmit sin ningún useState ni useRef adicional.
//     Es una técnica válida cuando no necesitás reaccionar al texto mientras se escribe,
//     solo cuando el usuario envía el form.
```

Comparación de las tres formas de leer un input en React:

| Técnica | Cuándo usarla |
|---|---|
| `event.target.name.value` (este componente) | Cuando solo necesitás el valor al hacer submit, no mientras se escribe. |
| `useState` + `onChange` (input controlado) | Cuando necesitás reaccionar en tiempo real (validaciones, filtros, autocompletado). |
| `useRef` | Cuando necesitás el DOM directamente sin re-renders (animaciones, focus, librerías externas). |

---

## Flujo completo de una pregunta

```
Usuario escribe "¿Cómo funciona un array en JavaScript?" y clickea "Preguntar"

│
├─ [BROWSER] handleSubmit() captura el submit del form
│  └─ fetch("http://localhost:2026/api/chat", { method: "POST", body: { pregunta: "..." } })
│
├─ [BACK] Express recibe POST /api/chat
│  └─ Lee req.body.pregunta = "¿Cómo funciona un array en JavaScript?"
│  └─ fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
│       headers: { Authorization: "Bearer nvapi-..." },  ← la key secreta
│       body: { model: "qwen/...", messages: [{ role: "user", content: pregunta }] }
│     })
│
├─ [NVIDIA API] El modelo Qwen3-Coder-480B procesa la pregunta
│  └─ Responde con JSON: { choices: [{ message: { content: "Un array es..." } }] }
│
├─ [BACK] Extrae data.choices[0].message.content
│  └─ res.status(200).json({ message: "Un array es..." })
│
└─ [BROWSER] .then(data => setMessage(data.message))
   └─ React re-renderiza <ReactMarkdown>{message}</ReactMarkdown>
   └─ El usuario ve la respuesta formateada con negrita, código, listas, etc.
```

---

## Bug detectado: doble prefijo /api

En `chat.routes.js` la ruta está definida como:

```javascript
router.post("/api/chat", ...)  // ← tiene /api
```

Pero en `main.js` ese router se monta con prefijo:

```javascript
app.use("/api", ChatRoutesApi)  // ← agrega /api
```

Express suma ambas partes: `/api` + `/api/chat` = **`/api/api/chat`**.

Pero el frontend llama a `http://localhost:2026/api/chat`. Eso causaría un 404.

La corrección es cambiar la definición de la ruta en `chat.routes.js` para que no repita el prefijo:

```javascript
// Corrección:
router.post("/chat", ...)  // → con el prefijo de main.js queda: /api/chat ✓
```

Las rutas de `personajes.routes.js` y `products.routes.js` están definidas correctamente (`/personajes`, `/productos`) y por eso no tienen este problema.

---

## ¿Necesito mi propia API key?

**Sí, necesitás tu propia key.** La key del profe que aparece hardcodeada en el repositorio:

1. Es pública (está en el código del repo, visible para todos).
2. Probablemente ya fue revocada después de la clase.
3. Aunque no lo fuera, compartir una key entre muchos usuarios la quema rápidamente.

Para conseguir la tuya:

1. Ir a [build.nvidia.com](https://build.nvidia.com)
2. Hacer click en cualquier modelo → botón **"Get API Key"** (o "Try API")
3. Si el formulario de registro pide un mail corporativo y no tenés uno, buscar en Google "NVIDIA Developer Program" — el registro desde esa URL suele aceptar mails de Gmail
4. Una vez registrado, ir a [build.nvidia.com/settings/api-keys](https://build.nvidia.com/settings/api-keys) y generar una nueva key
5. Reemplazar el valor en `chat.routes.js` — o mejor, moverlo a una variable de entorno `.env`:

```
# .env (nunca comitearlo)
NVIDIA_API_KEY=nvapi-tu-clave-aqui
```

```javascript
// chat.routes.js con variable de entorno
Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
```

---

## Cómo probarlo en Postman

Asegurate de que el back está corriendo (`npm run dev` en `clase-13/back/`).

**POST `/api/chat`** (o `/api/api/chat` según el bug de montaje):

| Campo | Valor |
|---|---|
| Método | `POST` |
| URL | `http://localhost:2026/api/chat` |
| Body | `raw` → `JSON` |

```json
{
  "pregunta": "¿Qué es un array en JavaScript?"
}
```

**Respuesta esperada:**

```json
{
  "message": "## Arrays en JavaScript\n\nUn **array** es una estructura de datos..."
}
```

El `message` va a contener Markdown (verás `##`, `**`, etc.). El frontend lo renderiza correctamente con `ReactMarkdown`.

---

## Referencia rápida de endpoints nuevos

| Método | URL | Descripción | Body |
|---|---|---|---|
| `POST` | `/api/chat` | Manda una pregunta al modelo de IA y devuelve la respuesta | `{ "pregunta": "string" }` |
