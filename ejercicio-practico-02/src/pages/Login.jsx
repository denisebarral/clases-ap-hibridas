import React from 'react'

const Login = () => {

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Login")
  }

  return (
    <div className='container d-flex justify-content-center align-items-center vh-100' >
      <div className='card p-4 shadow' style={{ width: '350px' }} >
        <h2 className='text-center mb-4' > Iniciar Session </h2>
        <form onSubmit={ handleSubmit } >
          <div className='mb-3'>
            <label className='form-label' >Email: </label>
            <input type="email" placeholder='Ingrese su mail' className='form-control' />
          </div>
          <div className='mb-3'>
            <label className='form-label' >Contraseña: </label>
            <input type="text" placeholder='Ingrese su password' className='form-control' />
          </div>
          <button type='submit' className='btn btn-primary w-100' >Ingresar</button>
        </form>
      </div>
    </div>
  )
}

export default Login