/**
 * Router.jsx — Configuración central de rutas de la aplicación.
 *
 * Define qué componente se renderiza para cada URL.
 * Usa createBrowserRouter (React Router v6+) con rutas anidadas:
 * Layout actúa como "contenedor padre" y sus hijos se insertan en su <Outlet />.
 */

import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Layout from "../components/Layout";
import Detalle from "../pages/Detalle";

// La ruta raíz "/" tiene a Layout como elemento, no a una página.
// Layout renderiza NavBar + <Outlet />, donde Outlet es el "slot" donde
// se muestran los hijos según la URL actual.
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/login",
        element: <Login />
      },
      {
        // `:idPersonaje` es un parámetro dinámico: acepta cualquier valor en esa posición.
        // El componente Detalle lo lee con useParams() → { idPersonaje: "valor" }.
        path: "/detalle/:idPersonaje",
        element: <Detalle />
      }
    ]
  }
]);

export default router
