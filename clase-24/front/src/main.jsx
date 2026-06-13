/**
 * main.jsx — Punto de entrada de la aplicación React.
 *
 * Monta el árbol de componentes en el DOM. El orden de los wrappers importa:
 *
 *   StrictMode        → activa advertencias extra de React en desarrollo
 *     SessionProvider → provee el contexto global de sesión a TODA la app
 *       RouterProvider → activa React Router con la config de Router.jsx
 *
 * SessionProvider DEBE envolver a RouterProvider porque los componentes de las
 * rutas (Login, NavBar, etc.) necesitan acceder al contexto de sesión.
 * Si estuviera al revés, los componentes no podrían usar useLogin(), useEmail(), etc.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router-dom";
import router from './routes/Router';
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.bundle.min.js"
import { SessionProvider } from './contexts/Session.context';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* SessionProvider envuelve toda la app para que el contexto de sesión
        esté disponible en cualquier componente, sin importar qué tan anidado esté. */}
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>
  </StrictMode>,
)
