/**
 * App.jsx — Componente raíz (principal) de la aplicación.
 *
 * Este es el "cerebro" de la app. Acá vive TODO el estado:
 *   - la lista de usuarios traídos de la API
 *   - cuál está seleccionado
 *   - si estamos cargando
 *   - si hubo un error
 *   - el texto del buscador
 *
 * Responsabilidades:
 *   1. Hacer fetch a la API al montar (useEffect).
 *   2. Guardar los datos en estado (useState).
 *   3. Manejar qué usuario está seleccionado.
 *   4. Filtrar la lista según el texto del buscador.
 *   5. Pasar datos y callbacks a los componentes hijos via props.
 *
 * Lo que NO hace:
 *   - No renderiza directamente las tarjetas ni el detalle → lo hacen los hijos.
 *   - No maneja rutas ni navegación.
 *   - No accede a la base de datos ni a ningún servidor propio.
 */

// useState: hook para manejar estado local dentro de un componente funcional.
// useEffect: hook para ejecutar efectos secundarios (fetch, timers, eventos del DOM).
// Ambos vienen de React, que es quien los define y controla.
import { useState, useEffect } from 'react';

// Importamos los componentes hijos que vamos a renderizar
import UserCard from './components/UserCard';
import UserDetail from './components/UserDetail';

/**
 * API_URL - URL base de la API pública de usuarios.
 *
 * JSONPlaceholder es un servicio gratuito para prototipar sin backend propio.
 * Devuelve siempre los mismos 10 usuarios (datos ficticios pero con estructura real).
 * La sacamos fuera del componente porque es una constante: no cambia entre renders.
 */
const API_URL = 'https://jsonplaceholder.typicode.com/users';

/**
 * App - Componente principal de la aplicación de directorio de usuarios.
 *
 * Flujo completo al abrir la app:
 *   1. React monta el componente con loading=true, users=[], etc.
 *   2. El primer render muestra el spinner de carga.
 *   3. useEffect se dispara DESPUÉS del render inicial.
 *   4. fetchUsers() hace el pedido a la API.
 *   5a. Si la API responde ok → setUsers(data), setLoading(false).
 *   5b. Si falla → setError(mensaje), setLoading(false).
 *   6. React re-renderiza con los datos (o con el error).
 *
 * @returns {JSX.Element} La aplicación completa.
 */
function App() {

  // ============================================================
  // ESTADO DEL COMPONENTE
  // Cada useState crea: [valor actual, función para actualizarlo]
  // ============================================================

  /**
   * users: array con todos los usuarios traídos de la API.
   * Empieza vacío [] porque todavía no hicimos el fetch.
   * Se llena en el useEffect.
   */
  const [users, setUsers] = useState([]);

  /**
   * selectedUser: el objeto del usuario en que se hizo click, o null.
   * null = ningún usuario seleccionado (estado inicial).
   * Se usa para mostrar/ocultar el panel UserDetail.
   */
  const [selectedUser, setSelectedUser] = useState(null);

  /**
   * loading: true mientras esperamos la respuesta de la API.
   * Arranca en true porque el fetch se lanza apenas monta el componente.
   * Se pone en false cuando el fetch termina (con éxito o con error).
   */
  const [loading, setLoading] = useState(true);

  /**
   * error: string con el mensaje de error, o null si todo está bien.
   * null = sin error.
   */
  const [error, setError] = useState(null);

  /**
   * searchTerm: texto que el usuario escribe en el campo de búsqueda.
   * Empieza vacío ('') = sin filtro, se muestran todos los usuarios.
   */
  const [searchTerm, setSearchTerm] = useState('');


  // ============================================================
  // EFECTO: FETCH A LA API
  // ============================================================

  /**
   * useEffect con array de dependencias vacío ([]):
   *   - Se ejecuta UNA SOLA VEZ, justo después del primer render.
   *   - Si el array tuviera [users], se ejecutaría cada vez que users cambia,
   *     creando un loop infinito: fetch → setUsers → fetch → setUsers → ...
   */
  useEffect(() => {
    /**
     * fetchUsers - Función async que hace el pedido a la API.
     *
     * La definimos ADENTRO del useEffect y la llamamos inmediatamente
     * porque el callback de useEffect NO puede ser directamente async.
     * (React usa el valor de retorno del callback para cleanup, y una
     * función async siempre devuelve una Promise, lo que rompería ese contrato.)
     */
    async function fetchUsers() {
      try {
        // fetch() envía un GET a la URL y devuelve una Promise<Response>.
        // Con await, pausamos acá hasta tener la respuesta completa.
        const response = await fetch(API_URL);

        // IMPORTANTE: fetch() NO lanza error en status 404 o 500.
        // Solo falla si hay un error de red (sin internet, DNS caído, etc.).
        // Por eso chequeamos response.ok (true si el status está entre 200-299).
        if (!response.ok) {
          // Lanzamos manualmente para que lo atrape el catch de abajo
          throw new Error(`Error ${response.status}: no se pudo obtener la lista de usuarios`);
        }

        // .json() parsea el body de la respuesta de texto a objeto/array JS.
        // También es async, por eso el await.
        const data = await response.json();

        // Guardamos el array de 10 usuarios en el estado
        setUsers(data);

      } catch (err) {
        // catch captura tanto errores de red como el throw manual de arriba.
        // err.message tiene el texto del error.
        setError(err.message);

      } finally {
        // finally se ejecuta SIEMPRE, haya error o no.
        // Acá apagamos el spinner sin importar qué pasó.
        setLoading(false);
      }
    }

    // Llamamos a la función que acabamos de definir
    fetchUsers();

  }, []); // <--- array vacío = "solo al montar"


  // ============================================================
  // HANDLERS (FUNCIONES QUE MANEJAN EVENTOS)
  // ============================================================

  /**
   * handleSelectUser - Se llama cuando el usuario hace click en una UserCard.
   *
   * Implementa un "toggle": si hacés click en el mismo usuario que ya está
   * seleccionado, lo deseleccionamos (cierra el detalle).
   * Si hacés click en otro usuario, lo seleccionamos.
   *
   * @param {Object} user - El objeto usuario completo de la tarjeta clickeada.
   */
  function handleSelectUser(user) {
    setSelectedUser(prev => {
      // prev es el valor ACTUAL de selectedUser (antes de esta actualización).
      // prev?.id → optional chaining: si prev es null, no explota, devuelve undefined.
      // Si el id del clickeado es igual al seleccionado → deseleccionar (null)
      // Si no → seleccionar el nuevo
      return prev?.id === user.id ? null : user;
    });
  }

  /**
   * handleCloseDetail - Se llama cuando se hace click en "Cerrar detalle" de UserDetail.
   * Simplemente limpia el usuario seleccionado.
   */
  function handleCloseDetail() {
    setSelectedUser(null);
  }


  // ============================================================
  // DATO DERIVADO: LISTA FILTRADA
  // ============================================================

  /**
   * filteredUsers - Lista de usuarios filtrada por el texto del buscador.
   *
   * .filter() crea un NUEVO array con los elementos que cumplen la condición.
   * .toLowerCase() en ambos lados hace la búsqueda case-insensitive.
   * .includes() devuelve true si el nombre contiene el término en cualquier posición.
   * Si searchTerm es vacío (''), todos los nombres incluyen el string vacío, así que no filtra nada y muestran todos los usuarios.
   */
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  // ============================================================
  // RENDERS CONDICIONALES (antes del return principal)
  // ============================================================

  // Mientras cargamos, mostramos un spinner y cortamos el render acá (early return)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          {/*
            Spinner animado con Tailwind:
              - w-12 h-12: 48x48px
              - border-4: borde de 4px
              - border-indigo-200: el borde completo es de color claro
              - border-t-indigo-600: SOLO el borde superior es oscuro
              - rounded-full: lo hace circular
              - animate-spin: gira indefinidamente (keyframes de Tailwind)
              - mx-auto mb-4: centrado horizontalmente, margen abajo
          */}
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg font-medium">Cargando usuarios...</p>
          <p className="text-gray-400 text-sm mt-1">Conectando con la API</p>
        </div>
      </div>
    );
  }

  // Si hubo un error, mostramos el mensaje y cortamos el render acá
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md text-center">
          <span className="text-5xl mb-4 block" aria-hidden="true">⚠️</span>
          <p className="text-red-700 font-semibold text-lg mb-2">Algo salió mal</p>
          <p className="text-red-500 text-sm leading-relaxed">{error}</p>
          <p className="text-gray-400 text-xs mt-4">
            Revisá tu conexión a internet y recargá la página.
          </p>
        </div>
      </div>
    );
  }


  // ============================================================
  // RENDER PRINCIPAL (solo llega acá si loading=false y error=null)
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ====================================================
          HEADER — Barra superior fija con título y buscador
          ==================================================== */}
      {/*
        sticky top-0 z-10: el header se queda fijo al scrollear.
        shadow-sm: sombra sutil para separarlo visualmente del contenido.
      */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center gap-3 sm:justify-between">

          {/* Título + contador */}
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-indigo-600 leading-tight">
              Directorio de Usuarios
            </h1>
            {/*
              Contador: muestra cuántos se ven vs cuántos hay en total.
              Si el filtro no está activo, ambos números son iguales.
              Si está activo, se diferencia cuántos coinciden.
            */}
            <p className="text-sm text-gray-400">
              Mostrando{' '}
              <span className="font-semibold text-gray-600">{filteredUsers.length}</span>
              {' '}de{' '}
              <span className="font-semibold text-gray-600">{users.length}</span>
              {' '}usuarios
            </p>
          </div>

          {/* Campo de búsqueda */}
          {/*
            value={searchTerm}: el input es "controlado" por React.
            onChange: cada vez que el usuario escribe, actualizamos searchTerm,
            lo que re-renderiza el componente y recalcula filteredUsers.
            Este patrón se llama "controlled component".
          */}
          <input
            type="text"
            placeholder="🔍 Buscar por nombre..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full sm:w-72 px-4 py-2 border border-gray-300 rounded-full text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
                       transition-shadow"
          />
        </div>
      </header>


      {/* ====================================================
          CONTENIDO PRINCIPAL
          ==================================================== */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/*
          Layout de dos columnas:
            - En mobile (< lg): columna única, el detalle queda debajo de las tarjetas.
            - En desktop (>= lg): flex horizontal, lista a la izquierda, detalle a la derecha.
        */}
        <div className="flex flex-col lg:flex-row gap-8">


          {/* ------------------------------------------------
              COLUMNA IZQUIERDA: GRID DE TARJETAS
              ------------------------------------------------ */}
          {/*
            flex-1: esta columna ocupa todo el espacio disponible
            (el panel de detalle tiene ancho fijo en desktop).
          */}
          <div className="flex-1">
            {filteredUsers.length === 0 ? (
              // Mensaje de "sin resultados" cuando el filtro no matchea nada
              <div className="text-center py-20 text-gray-400">
                <span className="text-5xl mb-4 block" aria-hidden="true">🔍</span>
                <p className="text-xl font-medium text-gray-500">Sin resultados</p>
                <p className="text-sm mt-2">
                  No hay usuarios cuyo nombre contenga &ldquo;{searchTerm}&rdquo;.
                </p>
              </div>
            ) : (
              /*
                Grid responsivo:
                  - 1 columna en mobile
                  - 2 columnas en pantallas sm (≥ 640px)
                gap-4: espacio entre tarjetas
              */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/*
                  .map() transforma cada objeto `user` del array en un componente <UserCard>.

                  key={user.id}: prop OBLIGATORIA cuando renderizamos listas.
                  React usa el key para identificar qué tarjeta es cuál
                  cuando necesita actualizar la lista (agregar, quitar, reordenar).
                  Sin key, React re-renderiza toda la lista aunque solo cambie una tarjeta.

                  isSelected: comparamos el id del usuario de esta tarjeta con el del
                  usuario seleccionado. Si coinciden → es la tarjeta seleccionada.
                  El operador ?. (optional chaining) evita que explote cuando
                  selectedUser es null (null?.id devuelve undefined, no error).
                */}
                {filteredUsers.map(user => (
                  <UserCard
                    key={user.id}
                    // user, onSelect y isSelected son props que le pasamos a UserCard necesita para funcionar.
                    user={user}
                    onSelect={handleSelectUser}
                    isSelected={selectedUser?.id === user.id}
                  />
                ))}
              </div>
            )}
          </div>


          {/* ------------------------------------------------
              COLUMNA DERECHA: DETALLE DEL USUARIO
              ------------------------------------------------ */}
          {/*
            lg:w-80: ancho fijo de 320px en desktop.
            lg:sticky lg:top-24: en desktop, el panel "sigue" al scroll
            sin moverse del borde superior (top-24 = 96px, deja espacio para el header).
            lg:self-start: evita que el panel se estire hasta el final del flex container.
          */}
          <div className="lg:w-80 lg:sticky lg:top-24 lg:self-start">
            {/*
              Pasamos:
                user={selectedUser}: el usuario seleccionado (o null).
                onClose={handleCloseDetail}: el callback para deseleccionar.

              UserDetail decide internamente qué mostrar según si user es null o no.
            */}
            <UserDetail
              user={selectedUser}
              onClose={handleCloseDetail}
            />
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;


