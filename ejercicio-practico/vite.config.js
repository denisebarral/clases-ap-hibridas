import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Tailwind debe ir ANTES de React para que procese el CSS antes que el bundler
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
