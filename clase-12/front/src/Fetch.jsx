/**
 * Fetch.jsx — Componente que consume una API externa usando el hook useEffect.
 *
 * Responsabilidad: mostrar un selector de razas de perro y una foto aleatoria
 * de la raza elegida. Introduce useEffect para disparar llamadas a la API
 * en los momentos correctos del ciclo de vida del componente.
 *
 * API pública usada (sin autenticación): https://dog.ceo/api
 */

// React ya no se necesita importar explícitamente desde React 17 (Vite lo inyecta).
// Solo importamos los hooks que realmente usamos.
import { useEffect, useState } from 'react'

const Fetch = () => {

    // 1- ─── ESTADO ────────────────────────────────────────────────────────────────

    // imgUrl: la URL de la imagen que se pasa al <img src>.
    // Empieza vacío: el img existe pero no muestra nada hasta que la API responda.
    const [imgUrl, setImgUrl] = useState("")

    // razas: el array de strings que llena las <option> del <select>.
    // Empieza vacío: el select no tiene opciones hasta que lleguen los datos.
    const [razas, setRazas] = useState([])

    // razaSeleccionada: la raza que el usuario eligió en el <select>.
    // Es el "puente" entre la UI y traerFoto: cuando cambia, el useEffect #2 reacciona.
    const [razaSeleccionada, setRazaSeleccionada] = useState("")

    // 2- ─── FUNCIONES DE FETCH ────────────────────────────────────────────────────
    // IMPORTANTE: el callback de useEffect NO puede ser async directamente
    // (devolvería una Promise y useEffect no sabe qué hacer con ella).
    // Por eso las funciones async viven FUERA del useEffect y se las llama desde adentro.


    /**
     * Trae la lista de razas desde la API y la guarda en el ESTADO mediante setRazas.
     * 
     * Si la respuesta HTTP no es exitosa (res.ok = false), se lanza un error manualmente para que el catch lo capture. Esto es necesario porque fetch() solo rechaza la Promise por errores de red, no por códigos HTTP de error.
     * La API devuelve un objeto con una propiedad "message" que contiene otro objeto con las razas como claves. Object.keys() extrae solo las claves (nombres de razas) para guardarlas en el estado, que espera recibir un array de strings, según lo que seteamos arriba.
     */
    const traerRazas = async () => {
        try {
            // await "pausa" la ejecución aquí hasta que fetch() resuelva.
            // fetch() devuelve una Promise que resuelve con el objeto Response.
            const res = await fetch("https://dog.ceo/api/breeds/list/all")

            // TRAMPA de fetch: NO lanza error automáticamente si el servidor responde
            // con un código HTTP de error (404, 500, etc.).
            // Solo rechaza la Promise si hay un fallo de RED (sin conexión, timeout).
            // Por eso hay que chequear res.ok manualmente para atrapar errores HTTP.
            if (!res.ok) throw new Error(`Error HTTP: ${res.status}`)

            // .json() también es async: lee el stream del body y lo parsea como JSON.
            const data = await res.json()

            // La API devuelve este objeto:
            // { message: { affenpinscher: [], akita: [], beagle: [], ... }, status: "success" }
            // Object.keys() extrae solo las claves del objeto "message" → ["affenpinscher", "akita", ...]
            setRazas(Object.keys(data.message))

        } catch (err) {
            // try/catch captura tanto errores de red como el throw manual de arriba.
            console.error("Error al traer razas:", err)
        }
    }

    /**
     * Trae una foto aleatoria de la raza seleccionada y guarda la URL en el ESTADO mediante setImgUrl.
     */
    const traerFoto = async () => {
        try {
            // Template literal: la raza seleccionada se inserta en la URL como parámetro de ruta.
            // Ejemplo: si razaSeleccionada = "akita" → /api/breed/akita/images/random
            const res = await fetch(`https://dog.ceo/api/breed/${razaSeleccionada}/images/random`)

            // Lo mismo que en traerRazas: hay que chequear res.ok para atrapar errores HTTP.
            if (!res.ok) throw new Error(`Error HTTP: ${res.status}`)

            const data = await res.json()

            // La API devuelve:
            // { message: "https://images.dog.ceo/breeds/akita/An_Akita.jpg", status: "success" }
            // Acá data.message es directamente la URL de la imagen (string, no objeto).
            setImgUrl(data.message)

        } catch (err) {
            console.error("Error al traer foto:", err)
        }
    }


    // ─── useEffect #1 — AL MONTAR: cargar la lista de razas ────────────────────
    //
    // useEffect(callback, dependencias)
    // [] vacío como dependencias = "ejecutá esto solo cuando el componente aparece por primera vez".
    // En los viejos Class Components esto se llamaba componentDidMount.
    useEffect(() => {
        traerRazas()
    }, [])

    // ─── useEffect #2 — AL ACTUALIZAR: cargar foto cuando cambia la raza ───────
    //
    // [razaSeleccionada] como dependencias = "ejecutá esto cada vez que razaSeleccionada cambie".
    // React compara el valor anterior con el nuevo; si cambiaron, ejecuta el callback.
    // En los viejos Class Components esto se llamaba componentDidUpdate.
    //
    // El if protege contra la ejecución inicial: cuando razaSeleccionada es "" (estado inicial),
    // no tiene sentido pedir una foto para una raza vacía.
    useEffect(() => {
        if (razaSeleccionada != "") traerFoto()
    }, [razaSeleccionada])

    return (
        <div>
            {/*
                onChange se dispara cada vez que el usuario elige una opción.
                setRazaSeleccionada actualiza el estado con el valor elegido.
                Eso activa el useEffect #2, que llama a traerFoto automáticamente.
                No hace falta un botón para buscar la foto: el cambio en el select lo dispara solo.
            */}
            <select onChange={ (event) => setRazaSeleccionada(event.target.value) }>
                {/*
                    Se usa el índice del array (indice) como key porque la API no devuelve
                    un id por raza. Es aceptable cuando la lista no se reordena ni se filtra.
                */}
                { razas.map((raza, indice) => <option key={indice} value={raza}>{raza}</option>) }
            </select>

            {/* Botón manual para pedir otra foto de la misma raza (sin cambiar el select) */}
            <button onClick={traerFoto}>Foto!</button>

            {/* Botón manual para recargar la lista de razas (útil para testear) */}
            <button onClick={traerRazas}>Razas!</button>

            {/* Si imgUrl es "" el img se renderiza vacío.
                En una app real habría un estado "cargando" para mostrar un spinner. */}
            <img src={imgUrl} alt="" width={100} />
        </div>
    )
}

export default Fetch



