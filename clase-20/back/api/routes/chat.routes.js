/**
 * api/routes/chat.routes.js
 *
 * Ruta proxy hacia la API de NVIDIA NIM para el modelo de lenguaje Qwen3-Coder.
 *
 * "Proxy" significa que el backend actúa de intermediario: el frontend le pregunta
 * al backend, y el backend le pregunta a NVIDIA. Así la API key de NVIDIA nunca
 * queda expuesta en el navegador (donde cualquier usuario podría verla).
 *
 * Endpoint expuesto: POST /api/chat  (ver nota sobre montaje en main.js)
 * Recibe: { pregunta: string } en el body JSON
 * Devuelve: { message: string } con la respuesta del modelo en formato Markdown
 *
 */

import { Router } from "express";

const router = Router();

/**
 * POST /api/chat (ver nota en el docblock del archivo sobre el doble prefijo)
 *
 * Recibe la pregunta del usuario desde el frontend, la reenvía al modelo de IA
 * de NVIDIA y devuelve la respuesta como JSON.
 *
 * Flujo:
 *   1. Lee req.body.pregunta (la pregunta del usuario).
 *   2. Hace un fetch() a la API de NVIDIA con la pregunta como mensaje del usuario.
 *   3. Espera la respuesta completa (stream: false → JSON único, no chunks).
 *   4. Extrae el texto de data.choices[0].message.content y lo devuelve al frontend.
 *
 * @param {string} req.body.pregunta - La pregunta que escribió el usuario en el chat.
 * @returns {Promise<{ message: string }>} La respuesta del modelo en Markdown.
 */
router.post("/chat", (req, res) => {
  console.log("Esta llegando la resp", req.body.pregunta);

  // fetch() está disponible de forma nativa en Node.js 18+, sin instalar ningún paquete.
  // Es la misma API que en el navegador: fetch(url, objetoDeConfiguracion).
  fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      // La API key de NVIDIA va en el header Authorization como "Bearer <token>".
      // Al estar en el backend, el navegador nunca ve este valor.
      Authorization:
      "Bearer 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",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      // Identificador completo del modelo: proveedor/nombre-tamaño-variante
      model: "qwen/qwen3-coder-480b-a35b-instruct",
      // El historial de mensajes sigue el formato estándar de chat completions (OpenAI-compatible).
      // "role: user" indica que el mensaje viene del usuario (vs "assistant" o "system").
      messages: [
        {
          role: "user",
          content: req.body.pregunta,
        },
      ],
      // temperature: qué tan "creativo" es el modelo. 0 = determinista, 1 = muy variado.
      temperature: 0.6,
      // top_p: muestreo por núcleo (alternativa a temperature). 0.9 = considera el 90% de opciones más probables.
      top_p: 0.9,
      frequency_penalty: 0,
      presence_penalty: 0,
      // Límite de tokens en la respuesta. 1 token ≈ 0.75 palabras en inglés.
      max_tokens: 4096,
      // stream: false → la respuesta llega entera en un solo JSON (más simple).
      // stream: true → la respuesta llega en chunks sucesivos (como el efecto "typing" de ChatGPT).
      // El ejemplo de NVIDIA usa true; acá se cambió a false para simplificar el manejo.
      stream: false,
    }),
  })
    .then((res) => res.json())
    // La API devuelve un array "choices". Siempre tomamos el primer elemento [0].
    // La estructura es: data.choices[0].message.content → el texto de la respuesta.
    .then((data) =>
      res.status(200).json({ message: data.choices[0].message.content })
    );
});

export default router;

/**
 * Aquí, cómo sería esta lógica con async/await en vez de .then():
 *
 *
 *  router.post("/api/chat", async (req, res) => {
 *      console.log("Esta llegando la resp", req.body.pregunta)
 *
 *      try {
 *          // Primer await: espera que NVIDIA responda y lleguen los headers.
 *          // El resultado es el objeto Response (el "sobre cerrado"), no los datos todavía.
 *          const nvidiaRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
 *              method: "POST",
 *              headers: {
 *                  Authorization: "Bearer nvapi-...",
 *                  "Content-Type": "application/json",
 *                  Accept: "application/json",
 *              },
 *              body: JSON.stringify({
 *                  model: "qwen/qwen3-coder-480b-a35b-instruct",
 *                  messages: [{ role: "user", content: req.body.pregunta }],
 *                  temperature: 0.6,
 *                  top_p: 0.9,
 *                  frequency_penalty: 0,
 *                  presence_penalty: 0,
 *                  max_tokens: 4096,
 *                  stream: false,
 *              }),
 *          })
 *
 *          // Segundo await: lee el body completo y lo parsea como JSON.
 *          // Recién acá tenés el objeto con la respuesta del modelo.
 *          const data = await nvidiaRes.json()
 *
 *          // Extrae el texto y lo manda al frontend.
 *          res.status(200).json({ message: data.choices[0].message.content })
 *
 *      } catch (err) {
 *          // Si falla el fetch a NVIDIA o el parseo, devuelve un 500 al frontend
 *          // en lugar de dejar la request colgada sin respuesta.
 *          console.error(err)
 *          res.status(500).json({ error: "Error al contactar la API de NVIDIA" })
 *      }
 *  })
 *
 *
 *  Nota: la variable se llama "nvidiaRes" y no "res" para evitar pisar el "res"
 *  de Express (el objeto de respuesta hacia el frontend). Con .then() esto no
 *  era problema porque cada .then() tiene su propio scope; con async/await
 *  todo está en el mismo scope y los nombres deben ser distintos.
 */