/**
 * UserDetail.jsx — Panel lateral con el detalle completo del usuario seleccionado.
 *
 * Responsabilidad dentro de la aplicación:
 *  - Recibir el usuario seleccionado (o null) y mostrar toda su información.
 *  - Cuando no hay usuario seleccionado, mostrar un estado vacío amigable.
 *  - Notificar al padre (App) cuando el usuario quiere cerrar el detalle.
 *
 * También es un componente "presentacional":
 *  - No tiene estado propio.
 *  - No hace fetch.
 *  - No decide quién está seleccionado — solo muestra lo que le pasan.
 */

/**
 * InfoRow - Subcomponente auxiliar para renderizar una fila de dato.
 *
 * Extraemos esto como componente separado para no repetir el mismo HTML
 * cada vez que queremos mostrar un dato con ícono + etiqueta + valor.
 * Es un ejemplo de "DRY" (Don't Repeat Yourself).
 *
 * @param {Object} props
 * @param {string} props.label - Etiqueta descriptiva (ej: "Email", "Teléfono").
 * @param {string} props.value - El valor a mostrar (ej: "sincere@april.biz").
 * @param {string} [props.icon] - Emoji decorativo opcional (ej: "📧").
 * @returns {JSX.Element} Una fila con ícono, etiqueta y valor.
 */
function InfoRow({ label, value, icon }) {
  return (
    /*
      border-b border-gray-100: línea divisoria entre filas.
      last:border-0: Tailwind tiene el modificador "last:" que aplica
      el estilo solo al ÚLTIMO elemento con esa clase dentro de su padre.
      Así la última fila no tiene borde inferior (no queda flotando en el aire).
    */
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">

      {/* El ícono es opcional: solo se renderiza si se pasó la prop */}
      {icon && (
        <span className="text-lg mt-0.5 flex-shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}

      <div className="min-w-0 flex-1">
        {/*
          uppercase tracking-wide: típico estilo de "label" pequeño y estirado.
          Le da jerarquía visual diferenciando claramente etiqueta de valor.
        */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          {label}
        </p>
        {/* break-words evita que un email muy largo rompa el layout */}
        <p className="text-sm text-gray-700 mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

/**
 * UserDetail - Panel de detalle del usuario seleccionado.
 *
 * Maneja dos estados visuales:
 *  1. Sin usuario (user === null): muestra un placeholder invitando a seleccionar.
 *  2. Con usuario: muestra su información completa con nombre, email, teléfono, ciudad y empresa.
 *
 * @param {Object}      props         - Props del componente.
 * @param {Object|null} props.user    - El usuario seleccionado, o null si no hay ninguno.
 *                                      Estructura: { id, name, username, email, phone,
 *                                                    address: { city }, company: { name } }
 * @param {Function}    props.onClose - Callback sin argumentos: se llama cuando el
 *                                      usuario hace click en "Cerrar detalle".
 * @returns {JSX.Element} El panel de detalle o el placeholder.
 */
function UserDetail({ user, onClose }) {

  // --- ESTADO VACÍO: ningún usuario seleccionado ---
  // Early return: si no hay usuario, cortamos el renderizado acá
  // y mostramos el placeholder. No llega al resto del componente.
  if (!user) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400 flex flex-col items-center justify-center min-h-48 gap-2">
        <span className="text-5xl" aria-hidden="true">👤</span>
        <p className="text-sm font-semibold text-gray-500 mt-2">
          Seleccioná un usuario
        </p>
        <p className="text-xs leading-relaxed">
          Hacé click en cualquier tarjeta de la lista para ver su información completa acá.
        </p>
      </div>
    );
  }

  // --- CON USUARIO: desestructuramos para acceder a propiedades anidadas ---
  /*
    La API devuelve objetos anidados:
      user.address → { street, suite, city, zipcode, geo }
      user.company → { name, catchPhrase, bs }

    Al desestructurar así, podemos escribir `address.city` en vez de `user.address.city`
    y `company.name` en vez de `user.company.name`. Es solo comodidad.
  */
  const { name, username, email, phone, address, company } = user;

  return (
    /*
      animate-slide-down: animación CSS personalizada definida en index.css.
      Cuando cambia el usuario seleccionado, React desmonta y remonta este componente,
      haciendo que la animación se dispare de nuevo con cada selección.

      overflow-hidden en el contenedor: evita que el header con gradiente
      se salga de los bordes redondeados (rounded-xl).
    */
    <div className="bg-white border border-indigo-200 rounded-xl overflow-hidden shadow-lg animate-slide-down">

      {/* --- ENCABEZADO CON GRADIENTE Y AVATAR GRANDE --- */}
      <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-6 text-white text-center">

        {/* Avatar grande: bg-white/20 es blanco con 20% de opacidad (se mezcla con el gradiente) */}
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30">
          <span className="text-white text-2xl font-bold">
            {/*
              Calculamos las iniciales inline porque es un caso simple.
              Si se usara en más lugares, convendría extraerlo como función.
            */}
            {name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </span>
        </div>

        <h2 className="font-bold text-xl leading-tight">{name}</h2>
        <p className="text-indigo-200 text-sm mt-1">@{username}</p>
      </div>

      {/* --- SECCIÓN DE DATOS DETALLADOS --- */}
      <div className="p-4">
        {/*
          Cada InfoRow recibe:
            icon: emoji decorativo
            label: nombre del campo
            value: el dato a mostrar

          address.city accede al objeto anidado `address` y toma solo la ciudad.
          company.name accede al objeto anidado `company` y toma solo el nombre.
        */}
        <InfoRow icon="📧" label="Email"   value={email} />
        <InfoRow icon="📞" label="Teléfono" value={phone} />
        <InfoRow icon="📍" label="Ciudad"  value={address.city} />
        <InfoRow icon="🏢" label="Empresa" value={company.name} />
      </div>

      {/* --- BOTÓN CERRAR --- */}
      <div className="px-4 pb-4">
        {/*
          onClick llama al callback onClose que viene del padre.
          El padre (App) es quien decide qué hacer: poner selectedUser en null.
          Este componente no sabe nada de eso, solo "avisa" que se pidió cerrar.
        */}
        <button
          onClick={onClose}
          className="w-full py-2.5 text-sm font-semibold text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 active:bg-indigo-100 transition-colors"
        >
          Cerrar detalle
        </button>
      </div>
    </div>
  );
}

export default UserDetail;
