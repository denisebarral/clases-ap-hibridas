# 1. La url no hace referencia a la accion, sino que identifica un recurso

    URL -> Uniform resource locator 
    URI -> Uniform resource Identifier 

    /productos/nuevo            ->      X
    /productos/edit/18          ->      X
    /productos                  ->      OK!

# 2. Las Acciones se definen con los verbos http

    GET         -> Obtener
    POST        -> Crear
    PUT         -> Reemplar
    PATCH       -> Actualizar
    DELETE      -> Borrar

# 3. Los datos de los recursos son transportados utilizando JSON

# 4. Los estado de una peticion son definidos por el status code

    1xx     -> Informativos
    2xx     -> TODO SALIO BIEN!
    3xx     -> El recurso cambio de lugar
    4xx     -> Error del usuario
    5xx     -> Errores del servidor

    https://http.dog/

[definicion aws](https://aws.amazon.com/what-is/restful-api/)