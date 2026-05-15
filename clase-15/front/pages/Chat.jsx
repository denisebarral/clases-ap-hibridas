/**
 * front/src/Chat.jsx
 *
 * Componente de chat para interactuar con un modelo de lenguaje de IA.
 *
 * Responsabilidades:
 *   - Renderizar un formulario de texto donde el usuario escribe su pregunta.
 *   - Enviar esa pregunta al backend (POST /api/chat), que actúa como proxy hacia NVIDIA.
 *   - Mostrar la respuesta del modelo renderizada como Markdown con formato real.
 *
 * Lo que NO hace:
 *   - No llama a la API de NVIDIA directamente (la API key vive en el backend).
 *   - No guarda historial de mensajes: cada pregunta reemplaza la respuesta anterior.
 */

import { useState } from "react"
import ReactMarkdown from "react-markdown"
// remark-gfm habilita tablas, tachado y otras extensiones de GitHub Flavored Markdown
import remarkGfm from "remark-gfm"

/**
 * Chat - Componente de interfaz para hacer preguntas al modelo de IA.
 *
 * Estado interno:
 *   - message (string): la respuesta más reciente del modelo, en formato Markdown.
 *     Arranca vacío; se actualiza cada vez que llega una respuesta del backend.
 *
 * Flujo por cada pregunta:
 *   1. El usuario escribe en el input y clickea "Preguntar".
 *   2. handleSubmit() captura el evento, lee el texto del input y hace fetch al backend.
 *   3. El backend llama a NVIDIA y devuelve { message: "...texto en markdown..." }.
 *   4. setMessage() actualiza el estado → React re-renderiza → ReactMarkdown muestra el resultado.
 *
 * @returns {JSX.Element} Área de respuesta (Markdown) + formulario de pregunta.
 */
const Chat = () => {
    // useState("") crea la variable de estado "message" con valor inicial vacío.
    // El segundo elemento, setMessage, es la función para actualizarla.
    // Cada vez que se llama a setMessage(), React vuelve a renderizar el componente.
    const [message, setMessage] = useState("")

    /**
     * handleSubmit - Maneja el envío del formulario.
     *
     * Recibe el evento nativo del DOM porque se pasa directamente al atributo onSubmit del form.
     * Sin preventDefault(), el form haría un GET a la misma URL y recargaría la página.
     *
     * @param {Event} event - El evento submit del elemento <form>.
     */
    const handleSubmit = (event) => {
        // Cancela el comportamiento default del form (recarga de página).
        event.preventDefault()
        // event.target es el elemento <form> en sí. .pregunta accede al <input name="pregunta">
        // directamente por su atributo name, sin necesidad de useRef ni getElementById.
        const pregunta = event.target.pregunta.value

        // Llama al BACKEND, no a NVIDIA directamente.
        fetch("http://localhost:2026/api/chat", {
            method: "POST",
            headers: {
                // Le avisa al backend que el body es JSON. El backend espera esto para parsear correctamente req.body.
                "Content-Type": "application/json"
            },
            // JSON.stringify convierte el objeto JS a string; el body HTTP siempre es texto.
            body: JSON.stringify({ pregunta: pregunta })
        })
            // Luego de enviar la pregunta, espera la respuesta del backend. El primer .then() recibe el objeto Response (el "sobre cerrado")
            .then(res => res.json())
            // data.message es el texto Markdown que extrajo el backend de la respuesta de NVIDIA.
            // setMessage dispara el re-render: React actualiza el DOM con la nueva respuesta.
            .then(data => setMessage(data.message))
            .catch(err => console.error(err))
    }
    // Referencia al SDK de AI de Vercel, una alternativa más avanzada con soporte de streaming:
    // https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat
    return (
        <div>
            {/* Área donde se muestra la respuesta del modelo.
                ReactMarkdown convierte el string con formato Markdown en JSX real:
                **negrita** → <strong>, # título → <h1>, `código` → <code>, etc.
                Sin esto, el usuario vería los asteriscos y símbolos literalmente. */}
            <div className="flex-1 rounded-lg p-4 mb-4 overflow-y-auto">
                {/* remarkPlugins={[remarkGfm]} activa tablas, tachado (~~texto~~) y listas de tareas */}
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message}
                </ReactMarkdown>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
                {/* name="pregunta" es indispensable: es lo que permite leer el valor
                    con event.target.pregunta.value en handleSubmit sin usar state ni ref. */}
                <input name="pregunta" type="text" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2" />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition" >
                    Preguntar
                </button>
            </form>
        </div>
    )
}

export default Chat



/***
 *  Aquí cómo sería  const handleSubmit = (event) => {...} si usáramos async/await en vez de .then():
 *
 *
 *  const handleSubmit = async (event) => {
 *      event.preventDefault()
 *      const pregunta = event.target.pregunta.value
 *
 *      try {
 *          // "await" pausa la ejecución hasta que fetch() resuelva la Promise.
 *          // El resultado es el objeto Response (el "sobre cerrado"), igual que el primer .then(res).
 *          const res = await fetch("http://localhost:2026/api/chat", {
 *              method: "POST",
 *              headers: { "Content-Type": "application/json" },
 *              body: JSON.stringify({ pregunta: pregunta })
 *          })
 *
 *          // Segundo await: lee y parsea el body como JSON.
 *          // Equivale al segundo .then(data). Recién acá tenés el objeto JS real.
 *          const data = await res.json()
 *
 *          // Igual que antes: actualiza el estado con la respuesta del modelo.
 *          setMessage(data.message)
 *
 *      } catch (err) {
 *          // El bloque catch captura cualquier error de red o de parseo.
 *          // Equivale al .catch(err => console.error(err)) de la versión con .then().
 *          console.error(err)
 *      }
 *  }
 *
 *
 *  Las dos versiones hacen exactamente lo mismo. La diferencia es solo de legibilidad:
 *  async/await se lee de arriba a abajo como código sincrónico, lo cual resulta
 *  más fácil de seguir cuando hay varias operaciones encadenadas.
 *  La versión con .then() es más compacta pero puede volverse difícil de leer
 *  si hay muchos pasos encadenados (lo que se conoce como "callback hell").
 */