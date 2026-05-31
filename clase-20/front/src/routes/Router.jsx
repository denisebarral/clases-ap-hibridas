/**
 * Router.jsx — Configuración central de rutas de la aplicación.
 *
 * Define qué componente se renderiza para cada URL.
 * Las rutas protegidas (Home y Detalle) están envueltas en <ProtectedRoute />,
 * que actúa como guardia: si no hay sesión, redirige a /login antes de renderizar.
 */

import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Layout from "../components/Layout";
import Detalle from "../pages/Detalle";
import ProtectedRoute from "../components/ProtectedRoute";
import Logout from "../pages/Logout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,  // Layout envuelve todo: renderiza NavBar + Outlet
    children: [
      {
        path: "/",
        // ProtectedRoute recibe Home como prop y decide si mostrarlo o redirigir a login
        element: <ProtectedRoute element={<Home />} />,
      },
      {
        // :idLibro es el segmento dinámico de la URL.
        // useParams() en Detalle.jsx lo lee como { idLibro: "valor" }.
        path: "/detalle/:idLibro",
        element: <ProtectedRoute element={<Detalle />} />
      },
      {
        path: "/login",
        element: <Login />  // pública: cualquiera puede acceder
      },
      {
        // Al navegar a /logout, se monta el componente Logout,
        // que limpia localStorage y redirige inmediatamente a /login.
        path: "/logout",
        element: <Logout />
      }
    ]
  }
]);

export default router
