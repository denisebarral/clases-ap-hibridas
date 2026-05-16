/**
 * main.jsx — Punto de entrada de la aplicación React.
 *
 * Este es el archivo que Vite ejecuta primero al iniciar la app.
 * Tiene una sola responsabilidad: montar el componente raíz <App>
 * en el elemento HTML con id="root" (definido en index.html).
 *
 * Después de esto, React toma el control y maneja todos los renders.
 */

// StrictMode: wrapper especial de React para DESARROLLO.
// Detecta problemas potenciales renderizando dos veces cada componente en dev.
// En producción (npm run build) no hace nada, no afecta la performance.
import { StrictMode } from 'react'

// createRoot: la API moderna de React 18+ para montar la app.
// Reemplaza al antiguo ReactDOM.render() y habilita las mejoras de React 18
// (como el Concurrent Mode y el automatic batching de estados).
import { createRoot } from 'react-dom/client'

// Estilos globales: incluye el @import "tailwindcss" que activa todo Tailwind
import './index.css'

// El componente raíz de nuestra aplicación
import App from './App.jsx'

// 1. document.getElementById('root') → busca el <div id="root"> en index.html
// 2. createRoot() → crea un árbol de React anclado a ese div
// 3. .render() → renderiza <App> dentro de ese árbol
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
