# Ejercicio Práctico — Directorio de Usuarios con React

## Índice

- [¿Qué hace esta app?](#qué-hace-esta-app)
- [Estructura de componentes](#estructura-de-componentes)
- [El flujo del usuario seleccionado (explicación paso a paso)](#el-flujo-del-usuario-seleccionado-explicación-paso-a-paso)
  - [Paso 1 — El estado vive en App.jsx, no en la tarjeta](#paso-1--el-estado-vive-en-appjsx-no-en-la-tarjeta)
  - [Paso 2 — App le pasa una función a UserCard (onSelect)](#paso-2--app-le-pasa-una-función-a-usercard-onselect)
  - [Paso 3 — El usuario hace click en una tarjeta](#paso-3--el-usuario-hace-click-en-una-tarjeta)
  - [Paso 4 — handleSelectUser actualiza el estado](#paso-4--handleSelectUser-actualiza-el-estado)
  - [Paso 5 — React re-renderiza todo](#paso-5--react-re-renderiza-todo)
  - [Paso 6 — isSelected le dice a cada tarjeta si "es la elegida"](#paso-6--isselected-le-dice-a-cada-tarjeta-si-es-la-elegida)
- [Diagrama completo del flujo](#diagrama-completo-del-flujo)
- [Por qué el estado vive en App y no en UserCard](#por-qué-el-estado-vive-en-app-y-no-en-usercard)
- [Qué es "prev" y de dónde sale](#qué-es-prev-y-de-dónde-sale)
- [Glosario rápido](#glosario-rápido)

---

## ¿Qué hace esta app?

Consume la API pública `https://jsonplaceholder.typicode.com/users`, muestra los 10 usuarios en tarjetas, y al hacer click en una tarjeta muestra el detalle completo de ese usuario en un panel lateral.

---

## Estructura de componentes

```
App.jsx  (componente padre / cerebro)
├── UserCard.jsx  ← se repite por cada usuario (10 en total)
└── UserDetail.jsx  ← panel lateral del usuario seleccionado
```

La jerarquía importa: **App es el padre de UserCard y de UserDetail**. Los datos siempre fluyen de arriba hacia abajo (de padre a hijos), y los eventos fluyen de abajo hacia arriba (de hijos al padre) mediante callbacks.

---

## El flujo del usuario seleccionado (explicación paso a paso)

### Paso 1 — El estado vive en App.jsx, no en la tarjeta

Antes de arrancar con el click, hay que entender dónde vive la información de "quién está seleccionado".

En `App.jsx`:

```jsx
const [selectedUser, setSelectedUser] = useState(null);
```

Este `useState` crea dos cosas:
- `selectedUser` → el objeto del usuario seleccionado (o `null` si no hay ninguno)
- `setSelectedUser` → la función para cambiar ese valor

**¿Por qué el estado vive en App y no dentro de UserCard?**

Porque tanto `UserCard` (que necesita saber si "es la elegida" para mostrarse resaltada) como `UserDetail` (que necesita los datos del usuario para mostrarlos) necesitan acceder a ese dato. El único lugar desde donde podés pasarle información a ambos a la vez es su padre común: `App`.

---

### Paso 2 — App le pasa una función a UserCard (onSelect)

Cuando App renderiza la lista de tarjetas, le pasa dos cosas a cada `UserCard`:

```jsx
// Dentro del .map() en App.jsx
<UserCard
  key={user.id}
  user={user}
  onSelect={handleSelectUser}   // ← una función
  isSelected={selectedUser?.id === user.id}  // ← un booleano
/>
```

Enfocate en `onSelect={handleSelectUser}`.

`handleSelectUser` es una función definida en `App.jsx`:

```jsx
function handleSelectUser(user) {
  setSelectedUser(prev => prev?.id === user.id ? null : user);
}
```

Al escribir `onSelect={handleSelectUser}`, App le está diciendo a UserCard:
> "Tomá esta función. Cuando quieras avisarme que te hicieron click, llamala y pasame el usuario."

`onSelect` no es un atributo nativo de HTML ni de React. Es un nombre que **nosotros inventamos**. Podría llamarse `alHacerClick`, `cuandoMeEligen`, o cualquier cosa. Lo importante es que:
1. App la define y la pasa como prop.
2. UserCard la recibe y la llama cuando corresponde.

---

### Paso 3 — El usuario hace click en una tarjeta

Dentro de `UserCard.jsx`, el `<article>` tiene un `onClick`:

```jsx
// Dentro de UserCard.jsx
<article onClick={() => onSelect(user)}>
```

Cuando el usuario hace click, se ejecuta `() => onSelect(user)`.

Esto llama a la función `onSelect` que le llegó por props desde App, pasándole el objeto `user` de esa tarjeta específica.

Traducido al español: **"Che App, me hicieron click a mí, acá te mando los datos del usuario que soy."**

---

### Paso 4 — handleSelectUser actualiza el estado

`onSelect` es `handleSelectUser` (son la misma función, solo cambia el nombre según dónde se mira). Cuando se ejecuta:

```jsx
function handleSelectUser(user) {
  setSelectedUser(prev => {
    // prev = valor ACTUAL de selectedUser antes de esta actualización
    // Si ya estaba seleccionado este mismo usuario → deseleccionar (null)
    // Si era otro usuario o null → seleccionar el nuevo
    return prev?.id === user.id ? null : user;
  });
}
```

Ejemplo concreto:

| Estado anterior (`prev`) | Usuario clickeado | Resultado |
|---|---|---|
| `null` | Usuario id=3 | `selectedUser` pasa a ser el objeto del usuario 3 |
| Usuario id=3 | Usuario id=3 (el mismo) | `selectedUser` pasa a `null` (toggle: se cierra) |
| Usuario id=3 | Usuario id=7 (otro) | `selectedUser` pasa a ser el objeto del usuario 7 |

---

### Paso 5 — React re-renderiza todo

Cuando `setSelectedUser` actualiza el estado, **React vuelve a ejecutar el return de App.jsx** con el nuevo valor de `selectedUser`.

Esto dispara dos consecuencias automáticas:

1. Se vuelven a calcular los `isSelected` de cada tarjeta (ver paso 6).
2. `UserDetail` recibe el nuevo `user={selectedUser}` y muestra la información actualizada.

```jsx
// App.jsx re-renderiza y pasa el usuario seleccionado a UserDetail
<UserDetail
  user={selectedUser}   // ← ahora tiene el objeto del usuario clickeado
  onClose={handleCloseDetail}
/>
```

---

### Paso 6 — isSelected le dice a cada tarjeta si "es la elegida"

Al re-renderizar, cada `UserCard` recibe su prop `isSelected` actualizada:

```jsx
<UserCard
  isSelected={selectedUser?.id === user.id}
  // ...
/>
```

Esta expresión se evalúa por separado para cada tarjeta del `.map()`:

- Si el `user.id` de esta tarjeta coincide con el `id` del usuario seleccionado → `isSelected = true`
- Si no coincide → `isSelected = false`

Adentro de `UserCard.jsx`, `isSelected` se usa para cambiar los estilos:

```jsx
// Dentro de UserCard.jsx
<article className={`
  ${isSelected
    ? 'ring-2 ring-indigo-400 border-indigo-300 scale-[1.02]'  // resaltado
    : 'border-gray-200'  // normal
  }
`}>

{/* Badge "Seleccionado" que aparece solo si isSelected es true */}
{isSelected && <span>✓ Seleccionado</span>}
```

`UserCard` **no decide** si está seleccionada. Solo recibe un booleano y cambia su apariencia en consecuencia.

---

## Diagrama completo del flujo

```
 ┌─────────────────────────────────────────────────────────┐
 │  APP.JSX                                                │
 │                                                         │
 │  const [selectedUser, setSelectedUser] = useState(null) │
 │                                                         │
 │  function handleSelectUser(user) {                      │
 │    setSelectedUser(...)  ← ACTUALIZA EL ESTADO          │
 │  }                                                      │
 │                                                         │
 │  return (                                               │
 │    <UserCard                                            │
 │      onSelect={handleSelectUser}  ──────────────────┐  │
 │      isSelected={selectedUser?.id === user.id}  ─┐  │  │
 │    />                                             │  │  │
 │    <UserDetail user={selectedUser} />             │  │  │
 │  )                                                │  │  │
 └───────────────────────────────────────────────────┼──┼──┘
                                                     │  │
          ┌──────────────────────────────────────────┘  │
          │  isSelected (booleano: ¿soy la elegida?)     │
          │                                              │
          ▼                  onSelect (función callback) │
 ┌────────────────────┐           ┌──────────────────────┘
 │  USERCARD.JSX      │           │
 │                    │           │
 │  Recibe:           │           │
 │   - user           │           │
 │   - onSelect  ◄────┘           │
 │   - isSelected ◄───────────────┘
 │                    │
 │  <article          │
 │    onClick={() =>  │
 │      onSelect(user)│  ← EL CLICK dispara onSelect con el usuario
 │    }               │    App recibe el evento y actualiza selectedUser
 │  >                 │    React re-renderiza → isSelected se actualiza
 └────────────────────┘
```

**El ciclo completo:**

```
Click en tarjeta
  → onSelect(user) se ejecuta en UserCard
    → handleSelectUser(user) se ejecuta en App
      → setSelectedUser(user) actualiza el estado
        → React re-renderiza App
          → isSelected se recalcula para cada tarjeta
          → UserDetail recibe el nuevo usuario seleccionado
```

---

## Por qué el estado vive en App y no en UserCard

Podría parecerte natural que cada `UserCard` maneje su propio "estoy seleccionada/no estoy seleccionada". Pero habría un problema: **si el estado vive en cada tarjeta, las tarjetas no se enteran entre sí de lo que pasa**.

Si UserCard 3 se marca como seleccionada, UserCard 7 (que también estaba seleccionada) no se entera y quedarían las dos seleccionadas al mismo tiempo. Tampoco podría `UserDetail` saber quién está seleccionada, porque esa información vive "encerrada" dentro de una tarjeta.

La solución es **"levantar el estado"** (*lifting state up*): moverlo al ancestro común más cercano de todos los que lo necesitan. En este caso, `App` es el padre de `UserCard` y de `UserDetail`, entonces el estado vive ahí y se distribuye hacia abajo por props.

---

## Qué es "prev" y de dónde sale

Este es uno de los conceptos que más confunde al principio porque **parece que `prev` aparece de la nada**.

### El problema que resuelve

Cuando querés actualizar un estado, la forma más directa es pasarle el nuevo valor al setter:

```jsx
setSelectedUser(user); // "ponele este valor"
```

Pero a veces necesitás saber **qué valor tenía antes** para decidir qué valor nuevo ponerle. En nuestro caso: si el usuario clickeado ya estaba seleccionado, queremos deseleccionarlo (poner `null`). Si no estaba seleccionado, queremos seleccionarlo.

Para tomar esa decisión necesitamos comparar el nuevo con el anterior. Ahí es donde entra `prev`.

---

### Las dos formas de usar un setter

`setSelectedUser` (y cualquier setter de `useState`) acepta dos formas distintas:

**Forma 1 — Valor directo:** le pasás el nuevo valor y listo.

```jsx
setSelectedUser(user);
// React guarda `user` como nuevo estado. No sabés nada del valor anterior.
```

**Forma 2 — Función updater:** le pasás una función. React la llama automáticamente
y le inyecta el valor actual del estado como argumento.

```jsx
setSelectedUser(prev => {
  // React llama a esta función y le pasa el valor actual de selectedUser
  // Vos le pusiste el nombre "prev" pero podría llamarse como quieras
  return /* el nuevo valor que querés guardar */;
});
```

La diferencia clave: en la Forma 2, **React es quien llama a tu función** y quien pone el valor de `prev`. Vos solo definís la función y usás el argumento que React te entrega.

---

### Desglose línea por línea

```jsx
function handleSelectUser(user) {
//                        ^^^^
//  "user" lo ponés VOS al llamar la función desde UserCard:
//  onSelect(user) → handleSelectUser recibe ese objeto

  setSelectedUser(prev => {
//                ^^^^
//  "prev" lo pone REACT automáticamente.
//  React dice: "voy a llamar tu función y le voy a pasar
//  el valor que selectedUser tiene EN ESTE MOMENTO"

    return prev?.id === user.id ? null : user;
//         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//  Con prev y user disponibles, podemos comparar:
//    ¿el id del que estaba seleccionado (prev) es igual al que acaban de clickear (user)?
//    Si SÍ  → devolvemos null   (deseleccionar: toggle off)
//    Si NO  → devolvemos user   (seleccionar el nuevo: toggle on)
  });
}
```

---

### Alternativa sin usar "prev"

También podés escribir exactamente la misma lógica **sin la forma de función updater**, leyendo `selectedUser` directamente desde el estado. Para este caso funciona igual:

```jsx
function handleSelectUser(user) {
  // Leemos selectedUser directamente (es la variable del useState de arriba)
  // En lugar de pedirle a React el valor anterior, lo tomamos nosotros mismos

  if (selectedUser?.id === user.id) {
    // El usuario clickeado YA estaba seleccionado → deseleccionar
    setSelectedUser(null);
  } else {
    // Era otro usuario o no había ninguno → seleccionar el nuevo
    setSelectedUser(user);
  }
}
```

O con ternario, más compacto:

```jsx
function handleSelectUser(user) {
  const esElMismo = selectedUser?.id === user.id;
  setSelectedUser(esElMismo ? null : user);
}
```

Estas tres versiones producen el mismo resultado en esta app.

---

### ¿Cuándo usar `prev` y cuándo no?

La diferencia importa en situaciones donde React puede **agrupar varias actualizaciones de estado** y ejecutarlas juntas (lo que se llama *batching*). En ese caso, si leés el estado directamente en lugar de usar `prev`, podrías estar leyendo un valor desactualizado.

| | Leer estado directamente | Usar `prev` |
|---|---|---|
| **Cómo se escribe** | `setEstado(estado + 1)` | `setEstado(prev => prev + 1)` |
| **Valor que usás** | El que tenía cuando se renderizó el componente (puede estar desactualizado) | El más reciente garantizado por React |
| **Cuándo usarlo** | Cuando el nuevo valor NO depende del anterior | Cuando el nuevo valor SÍ depende del anterior |
| **Ejemplo** | `setError(null)` (siempre null, no depende de nada) | `setCount(prev => prev + 1)` (necesito saber el número anterior) |

En nuestra app, cualquiera de las dos formas funciona porque el click de una tarjeta es un evento simple. La forma con `prev` es la más robusta y es la que se recomienda como buena práctica cuando el nuevo estado depende del anterior.

---

| Término | Qué es |
|---|---|
| `selectedUser` | El estado en App: objeto del usuario clickeado, o `null` |
| `setSelectedUser` | La función que cambia `selectedUser` |
| `handleSelectUser` | La función que define **cómo** cambia (lógica del toggle) |
| `onSelect` | El nombre de la prop con la que App le pasa `handleSelectUser` a UserCard |
| `isSelected` | Prop booleana que le dice a cada UserCard si es la actualmente seleccionada |
| Props | Datos que un padre le pasa a un hijo. Solo fluyen hacia abajo |
| Callback | Una función que el padre le pasa al hijo para que el hijo la llame cuando pase algo |
| Re-render | Cuando React vuelve a ejecutar el componente porque cambió su estado o sus props |
