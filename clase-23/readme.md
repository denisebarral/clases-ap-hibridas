# Clase 23 — Validación de formularios con React Hook Form

## Índice

- [¿Qué se hizo esta clase?](#qué-se-hizo-esta-clase)
- [Estructura de archivos](#estructura-de-archivos)
- [¿Qué es React Hook Form?](#qué-es-react-hook-form)
- [Los conceptos nuevos](#los-conceptos-nuevos)
  - [useForm()](#useform)
  - [register()](#register)
  - [handleSubmit()](#handlesubmit)
  - [formState: errors e isValid](#formstate-errors-e-isvalid)
  - [useWatch vs watch()](#usewatch-vs-watch)
  - [Activity (React 19)](#activity-react-19)
- [Feedback visual con Bootstrap](#feedback-visual-con-bootstrap)
- [El checklist de contraseña (Register)](#el-checklist-de-contraseña-register)
- [Reglas de validación en RHF](#reglas-de-validación-en-rhf)
- [Análisis crítico: profe vs versión simplificada](#análisis-crítico-profe-vs-versión-simplificada)
- [Cómo probarlo](#cómo-probarlo)

---

## ¿Qué se hizo esta clase?

Solo se trabajó en `front/`. No hay cambios en `back/`.

**Archivos modificados:**

| Archivo | Qué cambió |
|---|---|
| `src/pages/Login.jsx` | Se reemplazó el manejo manual de estado (`useState`) por `react-hook-form`. Se agrega feedback visual en tiempo real con clases de Bootstrap. |
| `src/pages/Register.jsx` | Ídem. Además se incorpora un checklist visual que va tildando requisitos de la contraseña mientras el usuario escribe. |

Ningún otro archivo del proyecto fue tocado.

---

## Estructura de archivos

```
clase-23/front/src/
├── pages/
│   ├── Login.jsx      ← MODIFICADO (react-hook-form + feedback visual)
│   └── Register.jsx   ← MODIFICADO (react-hook-form + checklist de contraseña)
└── (todo lo demás igual que clase-22)
```

---

## ¿Qué es React Hook Form?

Antes de esta clase, el manejo de un formulario en React se hacía con `useState`:

```jsx
// Forma manual (sin librería)
const [email, setEmail] = useState("")
const [pass, setPass]   = useState("")
const [error, setError] = useState("")

const handleSubmit = (e) => {
  e.preventDefault()
  if (!email.includes("@")) {
    setError("Email inválido")
    return
  }
  // ... más validaciones manuales
  loginService({ email, password: pass })
}
```

Esto escala mal: más campos = más `useState`, más funciones de validación, más posibilidades de que el estado se desincronice.

**React Hook Form (RHF)** es una librería que centraliza:
- El **registro** de cada campo (conectar el `<input>` con el formulario)
- Las **reglas de validación** de cada campo (requerido, formato, longitud mínima...)
- El **estado de errores** (qué campo falló y por qué)
- El **submit** (solo se ejecuta si todo es válido)

```
Sin RHF: form → manejás vos el estado de cada campo manualmente
Con RHF: form → RHF registra los campos, valida, y te avisa cuándo está listo
```

**Equivalente conocido:** en Laravel, la validación de formularios se hace en el controller con `$request->validate([...])`. RHF es la versión frontend de eso: definís las reglas y la librería hace el trabajo.

---

## Los conceptos nuevos

### useForm()

```jsx
const {
  register,
  handleSubmit,
  control,
  formState: { errors, isValid }
} = useForm({ mode: "onChange" })
```

`useForm()` es el punto de entrada de RHF. Devuelve un objeto con varias herramientas:

| Propiedad | Para qué sirve |
|---|---|
| `register` | Conectar un `<input>` con RHF y definir sus reglas de validación |
| `handleSubmit` | Envolver la función de submit: solo la ejecuta si el form es válido |
| `control` | Objeto interno necesario para usar `useWatch` |
| `formState.errors` | Objeto con los errores actuales de cada campo |
| `formState.isValid` | `true` si todos los campos pasan sus validaciones |

La opción `mode: "onChange"` le indica a RHF que valide **mientras el usuario escribe**, no solo al hacer submit. Sin esto, el feedback visual aparecería demasiado tarde.

---

### register()

```jsx
<input
  {...register("email", {
    required: "El campo email es obligatorio",
    pattern: {
      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: "No es un mail válido"
    }
  })}
/>
```

`register("nombreDelCampo", reglas)` hace dos cosas:
1. Le dice a RHF que este `<input>` es parte del formulario, con el nombre `"email"`.
2. Define las reglas que debe cumplir ese campo para ser considerado válido.

El `{...register(...)}` usa el **spread operator** para inyectar props en el `<input>`: `name`, `ref`, `onChange` y `onBlur`. RHF necesita esos props para interceptar lo que el usuario escribe y actualizar el estado interno.

---

### handleSubmit()

```jsx
<form onSubmit={handleSubmit(onSubmit)}>
```

En vez de poner `onSubmit` directamente, se envuelve con `handleSubmit()`. Esto hace que:
- Si el formulario **es válido** → llama a `onSubmit(formData)` con los valores finales.
- Si **no es válido** → bloquea el submit y marca los errores.

`formData` es el objeto con todos los valores del formulario en el momento del submit:
```js
// formData en Login:
{ email: "denise@mail.com", pass: "Clave123!" }
```

---

### formState: errors e isValid

```jsx
const { formState: { errors, isValid } } = useForm(...)
```

`errors` es un objeto que se va llenando a medida que RHF detecta problemas:

```js
// Si el email está vacío:
errors = {
  email: { message: "El campo email es obligatorio", type: "required" }
}

// Si el email tiene contenido pero formato incorrecto:
errors = {
  email: { message: "No es un mail válido", type: "pattern" }
}

// Si todo está bien:
errors = {}
```

Para leer el mensaje de error de un campo: `errors?.email?.message`
(El `?.` es optional chaining: si `errors.email` no existe, devuelve `undefined` en vez de tirar un error.)

`isValid` es `true` solo cuando **todos** los campos cumplen **todas** sus reglas. Se usa para habilitar/deshabilitar el botón de submit:

```jsx
<button type="submit" disabled={!isValid}>Registrarse</button>
```

---

### useWatch vs watch()

RHF tiene dos formas de "seguir" el valor de un campo en tiempo real:

| | `watch()` | `useWatch()` |
|---|---|---|
| Origen | Viene de `useForm()` | Hook separado de RHF |
| Funciona con React Compiler | No (genera warning) | Sí |
| Uso | `const email = watch("email", "")` | `const email = useWatch({ control, name: "email", defaultValue: "" })` |

¿Por qué importa el React Compiler? Vite 8 (que usa este proyecto) activa el React Compiler por defecto. El compilador intenta memoizar funciones automáticamente para optimizar re-renders. `watch()` devuelve una función que el compilador no puede memoizar de forma segura, lo que genera un warning. `useWatch()` es el hook alternativo de RHF que resuelve exactamente eso.

**Ambos hacen lo mismo:** devuelven el valor actual del campo y se actualizan en cada keystroke. La diferencia es solo de compatibilidad técnica.

---

### Activity (React 19)

```jsx
<Activity mode={errors?.email ? "visible" : "hidden"}>
  <div className='invalid-feedback'>{errors?.email?.message}</div>
</Activity>
```

`Activity` es un componente de React 19. Tiene dos modos:
- `mode="visible"` → muestra el contenido
- `mode="hidden"` → oculta el contenido **sin desmontarlo del DOM**

La diferencia con el renderizado condicional clásico (`{condicion && <div>...</div>}`) es sutil pero importante:

| | `{condicion && <div>}` | `<Activity mode={...}>` |
|---|---|---|
| Cuando oculta | Desmonta el componente del DOM | Mantiene el componente montado, solo lo oculta |
| Re-render al mostrar | Monta desde cero | Simplemente lo hace visible |
| Útil para | Contenido simple | Animaciones, contenido costoso de montar |

En este caso concreto ambos funcionarían igual, pero `Activity` es el patrón recomendado en React 19 cuando se quiere mostrar/ocultar contenido reactivo.

---

## Feedback visual con Bootstrap

Bootstrap tiene dos clases para mostrar el estado de un campo:
- `is-valid` → borde verde
- `is-invalid` → borde rojo + activa el `invalid-feedback` abajo

La lógica que usamos aplica estas clases de forma dinámica:

```jsx
// "Si el campo tiene contenido: si hay error → is-invalid, si no → is-valid. Si está vacío → sin clase."
className={`form-control ${emailValue.length > 0 ? (errors.email ? "is-invalid" : "is-valid") : ""}`}
```

Por qué se chequea `emailValue.length > 0` primero: si el campo está vacío, no se marca ni como válido ni como inválido. Un campo vacío sin tocar no debería mostrar color. Solo cuando el usuario empieza a escribir se activa el feedback.

El mensaje de error aparece en un `<div className='invalid-feedback'>`. Bootstrap solo lo muestra si el input hermano tiene la clase `is-invalid`:

```html
<input class="form-control is-invalid" ... />
<div class="invalid-feedback">El campo email es obligatorio</div>
<!-- ↑ Bootstrap lo muestra porque el input hermano tiene is-invalid -->
```

---

## El checklist de contraseña (Register)

Register tiene una funcionalidad extra: mientras el usuario escribe la contraseña, aparece un checklist que se va tildando en tiempo real.

```jsx
// Se calcula en cada render (gracias a useWatch, "pass" se actualiza en cada keystroke)
const validaciones = {
  longitudMin: pass.length >= 8,
  mayuscula:   /[A-Z]/.test(pass),
  minuscula:   /[a-z]/.test(pass),
  numero:      /[0-9]/.test(pass),
  simbolo:     /[@$!%*?&._-]/.test(pass)
}
```

`validaciones` es un objeto de booleanos. Cada propiedad se recalcula en cada keystroke. No es estado (`useState`), es simplemente una variable derivada del valor de `pass`.

El checklist lo renderiza así:
```jsx
<li className={validaciones.longitudMin ? "text-success" : "text-danger"}>
  {validaciones.longitudMin ? "✔" : "✗"} Mínimo 8 caracteres
</li>
```

`text-success` (verde) o `text-danger` (rojo) de Bootstrap, y el ícono cambia según el booleano.

**¿Por qué el checklist y el `validate` de RHF hacen lo mismo?**
Son capas distintas con propósitos distintos:
- El **checklist** es UX: ayuda visual para que el usuario sepa qué le falta sin tener que enviar el form.
- El **`validate`** de RHF es la validación formal: determina si el campo es válido para efectos del estado del form (y habilitar el botón).

Si solo tuvieras el checklist (sin `validate`), RHF no sabría que la contraseña es inválida y el form se podría enviar igual. Si solo tuvieras `validate` (sin checklist), el usuario tendría que adivinar qué le falta.

---

## Reglas de validación en RHF

RHF acepta tres formas de validar un campo:

### 1. `required`
```jsx
required: "Mensaje de error"
```
El campo no puede estar vacío.

### 2. `pattern`
```jsx
pattern: {
  value: /expresion-regular/,
  message: "Mensaje de error"
}
```
El valor debe coincidir con la regex. Se usa para el email.

### 3. `validate`
```jsx
validate: value => {
  if (value.length < 8) return "Debe tener al menos 8 caracteres"
  if (!/[A-Z]/.test(value)) return "Debe tener una mayúscula"
  return true  // ← siempre terminar con true si todo está ok
}
```
Función personalizada. Recibe el valor actual, y debe devolver:
- `true` → campo válido
- `string` → mensaje de error (campo inválido)

Se usa cuando hay múltiples condiciones que no caben en un `pattern`.

**Regla clave:** siempre terminar con `return true`. Si no se devuelve nada (`return` sin valor), RHF recibe `undefined`, que no es lo mismo que `true`, y puede tener comportamiento inesperado.

---

## Análisis crítico: profe vs versión simplificada

Esta sección compara el código del profe con las decisiones que tomamos en nuestra versión.

### 1. Validación de contraseña en Login (profe la valida, nosotros no)

**El profe:**
```jsx
// En Login, el campo de contraseña tenía:
pattern: {
  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-]).{8,}$/,
  message: "No es un pass valido"
}
```

**Por qué no funciona bien:**
El Login no es el lugar correcto para validar la fortaleza de la contraseña. Si un usuario se creó su cuenta antes de que existieran esos requisitos (o con una contraseña que no los cumple), el formulario de login le diría "contraseña inválida" y **nunca podría loguearse**, aunque sus credenciales sean correctas.

**Nuestra versión:**
```jsx
// En Login, solo validamos que no esté vacío:
required: "El campo contraseña es obligatorio"
```

El login solo verifica que haya algo en el campo. Si las credenciales son incorrectas, el backend responde con 400 y el `.catch()` lo maneja. La fortaleza de la contraseña ya fue validada cuando el usuario se registró.

---

### 2. Campo de confirmación de contraseña: validacionConfirm duplicada (profe la duplicó, nosotros no)

**El profe:**
```jsx
const validacionConfirm = {
  igual:      (pass == passConfirm) && pass.length > 0 && passConfirm.length > 0,
  longitudMin: passConfirm.length >= 8,
  mayuscula:   /[A-Z]/.test(passConfirm),
  minuscula:   /[a-z]/.test(passConfirm),
  numero:      /[0-9]/.test(passConfirm),
  simbolo:     /[@$!%*?&._-]/.test(passConfirm)
}
// Y en el JSX mostraba 6 ítems en el checklist del confirm
```

**Por qué sobra:**
Si `passConfirm === pass`, y `pass` ya cumplió todas las reglas de fortaleza, entonces `passConfirm` también las cumple (son idénticos). No tiene sentido re-validar algo que ya está implícito. Mostrar 6 ítems en el confirm puede confundir al usuario: "¿tengo que cumplir estas reglas otra vez?".

**Nuestra versión:**
```jsx
// Solo un requisito para el campo de confirmación:
const confirmacionOk = pass === passConfirm && passConfirm.length > 0

// Y en el validate de RHF:
validate: value => value === pass || "Las contraseñas no coinciden"
```

El campo confirm tiene exactamente un trabajo: ser igual al campo pass.

---

### 3. Bug en el validate de passConfirm: return sin valor

**El profe:**
```jsx
validate: value => {
  if (value == pass) return          // ← Bug: return sin valor = undefined
  if (value.length < 8) return "Debe tener al menos 8 Caracteres"
  // ...
}
```

`return` sin valor devuelve `undefined`. Para RHF, `undefined` no es lo mismo que `true`: puede causar comportamiento inesperado donde el campo parece estar sin error pero tampoco está marcado como válido.

**Nuestra versión:**
```jsx
validate: value => value === pass || "Las contraseñas no coinciden"
// Si value === pass → devuelve true (válido)
// Si no          → devuelve el string del mensaje (inválido)
```

Un liner idiomático y sin ambigüedad.

---

### 4. Botón disabled: clase CSS vs atributo HTML

**El profe:**
```jsx
<button className={`btn btn-primary w-100 ${ isValid ? "" : "disabled" }`}>
```

`disabled` como clase CSS solo cambia el estilo visual del botón (queda gris). Pero el botón sigue siendo funcionalmente clickeable: el usuario puede hacer click y el form se intenta enviar.

**Nuestra versión:**
```jsx
<button type="submit" disabled={!isValid}>
```

El atributo HTML `disabled` sí deshabilita el comportamiento nativo del botón: no se puede hacer click, no dispara el submit, y el navegador lo muestra gris automáticamente.

---

### 5. mode: "onChange" faltaba en Register

**El profe:** usó `mode: "onChange"` en Login pero no en Register.

Sin `mode: "onChange"`, RHF valida solo al hacer submit. Pero `useWatch` actualiza el checklist visual en cada keystroke. Resultado: el checklist se ve actualizado pero el estado interno de RHF (errors, isValid) no se actualiza hasta el submit. Inconsistente.

**Nuestra versión:** agregamos `mode: "onChange"` en ambos formularios.

---

### 6. watch() vs useWatch()

**El profe:**
```jsx
const email = watch("email", "")
```

**Por qué lo cambiamos:**
`watch()` devuelve una función que el React Compiler (activo en este proyecto con Vite 8) no puede memoizar de forma segura, lo que genera un warning en la consola. `useWatch()` es el hook alternativo de RHF que resuelve exactamente ese problema.

**Nuestra versión:**
```jsx
const emailValue = useWatch({ control, name: "email", defaultValue: "" })
```

---

### 7. type="text" en contraseña (profe, visible en pantalla)

**El profe:**
```jsx
<input type="text" placeholder='Ingrese su password' ...>
```

Con `type="text"` la contraseña se ve en pantalla mientras se escribe. Esto no es un bug de RHF, es simplemente un error en el HTML.

**Nuestra versión:** `type="password"` para que los caracteres se vean como puntos.

---

## Cómo probarlo

1. Pararse en `clase-23/front/` y levantar el servidor:
```bash
pnpm dev
```

2. Pararse en `clase-23/back/` y levantar el backend (necesario para login y registro):
```bash
node main.js
```

3. Abrir `http://localhost:5173` en el navegador.

### Casos a probar en Login (`/login`)

| Acción | Resultado esperado |
|---|---|
| Escribir en email sin formato correcto | Borde rojo + mensaje "No es un mail válido" |
| Escribir email con formato correcto | Borde verde |
| Dejar email vacío e intentar submit | Borde rojo + mensaje de obligatorio |
| Dejar contraseña vacía | Borde rojo |
| Completar todo bien y hacer submit | Redirige a `/` |

### Casos a probar en Register (`/register`)

| Acción | Resultado esperado |
|---|---|
| Empezar a escribir en contraseña | Aparece el checklist |
| Escribir menos de 8 caracteres | Ítem "Mínimo 8 caracteres" en rojo |
| Agregar una mayúscula | Ese ítem se pone verde |
| Completar todos los requisitos | Todos los ítems en verde, borde verde |
| Escribir en confirm distinto a pass | "Las contraseñas no coinciden" en rojo |
| Hacer coincidir confirm con pass | Borde verde |
| Botón "Registrarse" sin completar todo | Botón deshabilitado (no clickeable) |
| Completar todo y hacer submit | Redirige a `/login` |
