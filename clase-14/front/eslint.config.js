import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // react-hooks v7 incluye reglas del React Compiler experimental que generan
      // falsos positivos: marcan como error llamar a funciones async desde useEffect
      // aunque setState se llame solo DESPUÉS de un await (patrón válido y recomendado
      // por la propia documentación de React para fetch de datos).
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
