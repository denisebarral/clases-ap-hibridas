/**
 * vite.config.js — Configuración del servidor de desarrollo y del build de Vite.
 *
 * Vite es la herramienta que procesa y sirve el código React en el navegador.
 * Este archivo le dice qué plugins activar. No contiene lógica de la aplicación:
 * es pura infraestructura de build.
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Plugin oficial de React: convierte JSX a JavaScript puro y activa
    // el Hot Module Replacement (HMR): el componente se actualiza en pantalla
    // sin recargar toda la página cuando guardás un archivo.
    react(),

    // Integra Tailwind CSS directamente en el pipeline de Vite.
    // Analiza el código y genera solo las clases CSS que realmente se usan
    // (tree-shaking de CSS), descartando el resto del framework para el build final.
    tailwindcss(),
  ],
});
