/**
 * Router.jsx — Configuración central de rutas de la aplicación.
 *
 * Define qué componente se renderiza para cada URL.
 * Las rutas protegidas (Home y Detalle) están envueltas en ProtectedRoute,
 * que redirige a /login si no hay sesión activa.
 *
 * Novedad clase-22: se agrega la ruta pública /register para el registro de nuevos usuarios.
 */

import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/crud/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Layout from "../components/Layout";
import Detalle from "../pages/crud/Detalle";
import ProtectedRoute from "../components/ProtectedRoute";
import Logout from "../pages/auth/Logout";
import NuevoLibro from "../pages/crud/NuevoLibro";
import ModificarLibro from "../pages/crud/ModificarLibro";
import EliminarLibro from "../pages/crud/EliminarLibro";  

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,  // Layout envuelve todo: renderiza NavBar + Outlet
    children: [
      {
        path: "/",
        element: <ProtectedRoute element={<Home />} />,
      },
      {
        path: "/detalle/:idLibro",
        element: <ProtectedRoute element={<Detalle />} />
      },
      {
        path: "/nuevo-libro",
        element: <ProtectedRoute element={<NuevoLibro />} />
      },
      {
        path: "/modificar-libro/:idLibro",
        element: <ProtectedRoute element={<ModificarLibro />} />
      },
      {
        path: "/eliminar-libro/:idLibro",
        element: <ProtectedRoute element={<EliminarLibro />} />
      },
      {
        path: "/login",
        element: <Login />      // pública: accesible sin sesión
      },
      {
        // Nueva ruta: registro de cuenta nueva.
        // Pública: el usuario todavía no tiene cuenta, así que no puede estar logueado.
        path: "/register",
        element: <Register />
      },
      {
        path: "/logout",
        element: <Logout />
      },
      {
        path: "*",
        element: <div>404</div>
      }
    ]
  }
]);

export default router
