# Objetivo

Crear una aplicación web utilizando React y React Router que consuma datos desde cualquier API REST pública y permita la navegación entre diferentes páginas. La temática de la aplicación queda a su elección. Algunos ejemplos:

* Pokémon
* Rick & Morty
* Películas
* Videojuegos
* Países
* Clima
* Productos
* Usuarios
* Noticias
* Música
* Libros

## Requisitos

### Instalación

```
npm create vite@latest mi-app -- --template react
cd mi-app
npm install
npm install react-router-dom
npm run dev
```

## Estructura de Páginas Requeridas

### 1. Barra de Navegación

Debe estar presente en todas las páginas y contener enlaces a:

* Home / Listado principal
* Login

Puede incluir también:

* Buscador
* Logo
* Otras secciones opcionales

### 2. Página de Listado (`/`)

Debe mostrar una lista de elementos obtenidos desde una API REST pública. Cada elemento debe mostrar al menos:

* Nombre o título
* Imagen (si la API la proporciona)
* Botón o enlace para ver el detalle

Los elementos deben ser clicables y navegar hacia la página de detalle.

#### Ejemplos de APIs

* Pokémon: `https://pokeapi.co/api/v2/pokemon`
* Rick & Morty: `https://rickandmortyapi.com/api/character`
* Countries: `https://restcountries.com/v3.1/all`
* Fake Store API: `https://fakestoreapi.com/products`
* The Movie Database (TMDB): `https://developer.themoviedb.org/`
* JSONPlaceholder: `https://jsonplaceholder.typicode.com/users`

### 3. Página de Detalle (`/detalle/:id`)

Debe mostrar información detallada de un elemento específico obtenido desde la API. Debe incluir:

* Nombre o título
* Imagen más grande (si existe)
* Información adicional relevante según la API elegida
* Botón para volver al listado

Ejemplos de información:

* Descripción
* Categoría
* Precio
* País
* Género
* Habilidades
* Estado
* Fecha
* Estadísticas
* etc.

### 4. Página de Login (`/login`)

Crear un formulario con:

* Campo de email o usuario
* Campo de contraseña
* Botón de "Iniciar Sesión"

No necesita autenticación real. Al enviar el formulario puede hacerse un:

```
console.log("Login enviado")
```

## Estructura de Componentes Sugerida

```
src/
├── components/
│   └── Navbar.jsx
├── pages/
│   ├── Home.jsx
│   ├── Detail.jsx
│   └── Login.jsx
├── App.jsx
└── main.jsx
```

## Requisitos de React Router

La aplicación debe utilizar:

* `BrowserRouter`
* `Routes`
* `Route`
* `Link` o `NavLink`
* `useParams()`

Debe existir navegación entre páginas.

## Requisitos de React

La aplicación debe implementar:

* `useState`
* `useEffect`

Para:

* Consumir datos desde la API
* Guardar resultados
* Mostrar información dinámica

## Manejo de Estados

Se recomienda implementar:

* Estado de carga (`loading`)
* Manejo de errores (`error`)
* Mensajes cuando no haya datos

Ejemplo:

```
if (loading) return <p>Cargando...</p>
```

## Consumo de API REST

La aplicación debe consumir al menos:

* Un endpoint de listado
* Un endpoint de detalle

Puede utilizar:

```
fetch()
```

## Consignas

La aplicación debe:

✅ Tener múltiples páginas usando React Router
✅ Consumir una API REST pública
✅ Mostrar un listado dinámico
✅ Tener navegación hacia una vista de detalle
✅ Implementar un formulario de login
✅ Utilizar componentes reutilizables
✅ Usar hooks de React (`useState`, `useEffect`)

## Bonus (Opcional)

Funcionalidades extra posibles:

* Buscador
* Filtros
* Paginación
* Dark mode
* Favoritos
* Responsive design
* Manejo avanzado de errores
* Skeleton loaders
* Deploy online

## APIs Públicas Recomendadas

APIs sin autenticación:

* Pokémon API: `https://pokeapi.co/`
* Rick & Morty API: `https://rickandmortyapi.com/`
* Fake Store API: `https://fakestoreapi.com/`
* REST Countries: `https://restcountries.com/`
* JSONPlaceholder: `https://jsonplaceholder.typicode.com/`
* The Cat API: `https://thecatapi.com/`
* Dog API: `https://dog.ceo/dog-api/`
