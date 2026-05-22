import swaggerAutogen from "swagger-autogen"

const doc = {
    info: {
        title: "Api de personajes y cafes",
        description: "Esta es una api de pruebas"
    },
    host: "localhost:2026",
    basePath: "/api",
    schemes: ["http"]
}

const endpointsFiles = [
    "./api/routes/products.routes.js",
    "./api/routes/personajes.routes.js"
]

const swagger = swaggerAutogen()
swagger( "swagger.json", endpointsFiles, doc )