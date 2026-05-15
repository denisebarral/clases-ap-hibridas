/**
 * App.jsx — Componente raíz de la aplicación.
 *
 * Es el componente "padre" que React renderiza primero dentro del <div id="root">.
 * En proyectos reales suele contener el router y los providers globales (tema, auth, etc.).
 * Por ahora es un ejercicio de práctica: renderizado de listas con .map() y estado con useState.
 *
 * El archivo también conserva (comentadas) las distintas formas de escribir un componente
 * que el profe mostró en clase, de la más vieja a la más moderna.
 */

// ─── EVOLUCIÓN HISTÓRICA DE LA SINTAXIS DE COMPONENTES ────────────────────────
// El profe mostró estas variantes para entender de dónde viene la forma actual.
// No son errores: son la historia de React.

// FORMA 1 — Class Component (la vieja forma, pre-2019)
// Requiere extender Component, tener un método render() y manejar el estado
// con this.state. Hoy en día ya no se usa en proyectos nuevos.
// import React, { Component } from "react";
// export default class App extends Component {
//   render() {
//     return (
//       <div>App</div>
//     )
//   }
// }

// FORMA 2 — Function declaration clásica (sin arrow function)
// Más simple que la clase, pero sin la atajo del atajo "rafce".
// import React from 'react'
// function App() {
//   return (
//     <div>App</div>
//   )
// }
// export default App

// FORMA 3 — Class Component con React.Component (sintaxis alternativa a la FORMA 1)
// import React from "react";
// export default class App extends React.Component{
//   render(){
//     return( <div>hola</div> )
//   }
// }

// FORMA 4 — Function declaration con export default inline
// export default function App(){
//   return ( <div>hola!</div> )
// }

// FORMA 5 — Arrow function sin export inline (hay que exportar abajo)
// const App = () => {
//   return ( <div>hola!</div> )
// }
// export default App

// FORMA 6 — El snippet "rafce" genera exactamente la FORMA MODERNA que usamos abajo.
// rafce = React Arrow Function Component Export (atajo de la extensión ES7+ React snippets)

// ─── CÓDIGO ACTIVO ────────────────────────────────────────────────────────────

// useState es un Hook: una función especial de React que agrega estado a un componente funcional.
// Sin useState, las variables normales se reiniciarían con cada re-renderizado.
// A partir de React 17, el import de "React" ya no es necesario para usar JSX.
// Vite lo inyecta automáticamente. Solo se importa lo que realmente se usa.
import { useState } from "react";
import Fetch from "./Fetch.jsx";

const App = () => {
  //const variable = "Un valor";

  // Lista de personajes hardcodeada. En clases futuras vendrá de una API/MongoDB.
  // Cada objeto DEBE tener un campo identificador único (aquí: "id").
  // React lo necesita como prop "key" al renderizar listas para saber qué elemento
  // cambió, se agregó o se eliminó sin tener que comparar todo el árbol de nodos.
  const array = [
    { id: 1, nombre: "Homero",  apellido: "Simpson" },
    { id: 2, nombre: "Marge",   apellido: "Simpson" },
    { id: 3, nombre: "Bart",    apellido: "Simpson" },
    { id: 4, nombre: "Lisa",    apellido: "Simspon" },
    { id: 5, nombre: "Maggie",  apellido: "Simpson" },
  ]

  // useState(0) inicializa una variable de estado con valor 0.
  // Devuelve un array de dos elementos que desestructuramos:
  //   count    → el valor actual del estado (solo lectura)
  //   setCount → la función para actualizar ese valor y disparar un re-renderizado
  // Convención de nombres: la función setter siempre se llama "set" + nombre de la variable.
  const [ count, setCount ] = useState(0)

  function contador(){
    // NUNCA modificar "count" directamente (count = count + 1 no funcionaría).
    // Hay que usar siempre el setter para que React sepa que debe re-renderizar.
    setCount( count + 1 )
    // Este log muestra el valor ANTERIOR al cambio: setCount es asíncrono,
    // la variable "count" todavía tiene el valor viejo en esta línea.
    console.log(count)
  }

  // Este log se ejecuta cada vez que el componente se re-renderiza.
  // Con StrictMode activo en desarrollo, aparece dos veces por renderizado.
  console.log("me llamaron")

  return (
    <>
      {/* Componente de la clase 12: fetch a la API dog.ceo con useEffect */}
      <Fetch />
      <ul>
        {/* .map() recorre el array y devuelve un elemento JSX por cada item.
            key={personaje.id} es obligatoria: React la usa en el Virtual DOM para
            identificar cada nodo de la lista de forma eficiente.
            className en lugar de "class": en JavaScript, "class" es una palabra reservada
            (define clases ES6), por eso JSX usa "className" para el atributo CSS. */}
        { array.map( (personaje) => <li key={personaje.id} className="text-red-200">{ personaje.nombre }</li> )}

        {/* Interpolación simple: entre llaves {} puede ir cualquier expresión JS válida. */}
        { count }

        {/* onClick recibe la REFERENCIA a la función, no la invoca.
            Si fuera onClick={contador()} la ejecutaría al renderizar, no al hacer click. */}
        <button onClick={ contador } >+</button>
      </ul>
    </>
  );
};

export default App;



