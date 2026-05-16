/**
 * UserCard.jsx — Tarjeta visual para un único usuario de la lista.
 *
 * Responsabilidad dentro de la aplicación:
 *  - Recibir UN objeto `user` via props y mostrar su información básica.
 *  - Notificar al padre (App) cuando el usuario hace click, sin manejar
 *    la selección por sí mismo (eso lo decide App).
 *
 * Es un componente "presentacional" o "tonto" (dumb component):
 *  - No tiene estado propio (no usa useState).
 *  - No hace fetch ni lógica de negocio.
 *  - Solo toma datos, los muestra y dispara callbacks.
 */

/**
 * getInitials - Extrae las dos primeras iniciales de un nombre completo.
 *
 * Ejemplo: "Leanne Graham" → "LG"
 *          "Chelsey Dietrich" → "CD"
 *          "Clementina DuBuque" → "CD" (toma solo las 2 primeras palabras)
 *
 * @param {string} name - Nombre completo del usuario (ej: "Leanne Graham").
 * @returns {string} Las dos primeras iniciales en mayúsculas.
 */
function getInitials(name) {
  return (
    name
      .split(' ')           // "Leanne Graham" → ["Leanne", "Graham"]
      .map(word => word[0]) // ["Leanne", "Graham"] → ["L", "G"]
      .join('')             // ["L", "G"] → "LG"
      .toUpperCase()        // Por si el nombre viene en minúsculas
      .slice(0, 2)          // Máximo 2 letras (por nombres compuestos como "Ana María López")
  );
}

/**
 * AVATAR_COLORS - Array de clases de Tailwind para los fondos de los avatares.
 *
 * Usamos el id del usuario (módulo el largo del array) para elegir un color
 * de forma determinista: el mismo usuario siempre tendrá el mismo color,
 * sin importar el orden en que se rendericen las tarjetas.
 *
 * El operador % (módulo) hace que el índice "dé la vuelta":
 *   usuario id 1  → índice 1 % 10 = 1 → bg-violet-500
 *   usuario id 11 → índice 11 % 10 = 1 → bg-violet-500 (mismo)
 */
const AVATAR_COLORS = [
  'bg-indigo-500',
  'bg-violet-500',
  'bg-pink-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-cyan-500',
  'bg-rose-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-blue-500',
];

/**
 * UserCard - Componente de tarjeta clickeable para un usuario.
 *
 * @param {Object}   props            - Objeto con todas las props del componente.
 * @param {Object}   props.user       - Objeto usuario completo de la API:
 *                                      { id, name, username, email, phone, address, company }
 * @param {Function} props.onSelect   - Callback del padre: se llama con el objeto `user`
 *                                      completo cuando el usuario hace click en la tarjeta.
 * @param {boolean}  props.isSelected - true si esta tarjeta está actualmente seleccionada
 *                                      (el padre la compara por id).
 * @returns {JSX.Element} La tarjeta del usuario.
 */
function UserCard({ user, onSelect, isSelected }) {
  // Elegimos el color del avatar usando el id como índice
  // % (módulo) asegura que nunca salgamos del rango del array
  const avatarColor = AVATAR_COLORS[user.id % AVATAR_COLORS.length];

  return (
    /**
     * <article> es semánticamente más correcto que <div> para representar
     * una "entidad" independiente de la página (cada tarjeta es un usuario completo).
     *
     * Clases Tailwind explicadas:
     *   - transition-all duration-200: anima TODOS los cambios de estilo en 200ms
     *   - hover:-translate-y-0.5: sube 2px al pasar el mouse (efecto de "elevación")
     *   - ring-2 ring-indigo-400: borde brillante cuando está seleccionado
     *   - scale-[1.02]: agranda un 2% cuando está seleccionado (efecto "pop")
     *
     * Usamos template literals con ternario para cambiar clases según isSelected.
     */
    <article
      onClick={() => onSelect(user)}
      className={`
        bg-white rounded-xl border p-4 cursor-pointer
        transition-all duration-200 ease-in-out
        hover:shadow-md hover:-translate-y-0.5
        ${isSelected
          ? 'ring-2 ring-indigo-400 border-indigo-300 shadow-md scale-[1.02]'
          : 'border-gray-200 hover:border-indigo-200'
        }
      `}
    >
      {/* Fila principal: avatar + información de texto */}
      <div className="flex items-start gap-3">

        {/* --- AVATAR CON INICIALES --- */}
        {/*
          flex-shrink-0 evita que el avatar se achique si el texto es largo.
          Sin esto, el avatar podría comprimirse en nombres muy extensos.
        */}
        <div className={`${avatarColor} w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0`}>
          <span className="text-white text-sm font-bold">
            {getInitials(user.name)}
          </span>
        </div>

        {/* --- INFORMACIÓN DEL USUARIO --- */}
        {/*
          min-w-0 es necesario en hijos de flexbox para que el truncate funcione.
          Sin min-w-0, el texto empujaría al contenedor y nunca se cortaría.
        */}
        <div className="min-w-0 flex-1">
          {/* truncate corta el texto con "..." si supera el ancho del contenedor */}
          <h3 className="font-semibold text-gray-800 leading-tight truncate">
            {user.name}
          </h3>
          <p className="text-sm text-indigo-500 truncate">@{user.username}</p>
          <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
        </div>
      </div>

      {/*
        Badge "Seleccionado": solo se renderiza si isSelected es true.
        El operador && en JSX funciona como "si X es true, renderizá esto".
        Si isSelected es false, React simplemente no renderiza nada.
      */}
      {isSelected && (
        <div className="mt-3 flex justify-end">
          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
            ✓ Seleccionado
          </span>
        </div>
      )}
    </article>
  );
}

export default UserCard;
