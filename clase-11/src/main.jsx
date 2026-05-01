/**
 * main.jsx — Punto de entrada de la aplicación React.
 *
 * Este archivo es el "enchufe" que conecta React con el HTML real.
 * Su trabajo: buscar el <div id="root"> en index.html y montarle
 * el árbol de componentes. A partir de aquí, React toma control
 * completo del DOM dentro de ese div.
 *
 * No tiene lógica de negocio ni UI propia: solo inicializa la app.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Los archivos css siempre deben importarse desde este archivo (main.jsx)
import './index.css'
import './App.css'
import App from './App.jsx'

// createRoot reemplaza al viejo ReactDOM.render() (deprecado en React 18+).
// Recibe el nodo del DOM real donde React va a "vivir" y devuelve un objeto
// root con el método .render() para montar el árbol de componentes.
createRoot(document.getElementById('root')).render(
  // StrictMode no genera ningún HTML visible en el navegador.
  // Es una herramienta de desarrollo que:
  //   1. Llama a cada componente DOS VECES (solo en dev) para detectar efectos
  //      secundarios no intencionados.
  //   2. Activa advertencias extra sobre APIs obsoletas o patrones incorrectos.
  // En producción (npm run build) se elimina y no tiene ningún costo.
  <StrictMode>
    <App />
  </StrictMode>,
)
