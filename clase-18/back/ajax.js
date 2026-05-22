function miPromesa() {
    return new Promise((resolve, reject) => {
        let ok = true
        setTimeout(resolve, 1000)
        if (ok) {
            resolve("Todo salio bien!")
        } else {
            reject("Todo salio muy mal :(")
        }
    })
}
function miPromesa2(resultado) {
    return new Promise((resolve, reject) => {
        let ok = true
        if (ok) {
            resolve("Todo salio bien!")
        } else {
            reject("Todo salio muy mal :(")
        }
    })
}



function A() {
    console.log("A")
}
async function B() {
    // for( let i = 0; i < 10000000000 ; i++ ){}
    // try {
    //     const mensaje = await miPromesa()
    //     const mensaje2 = await miPromesa2(mensaje)
    //     console.log(mensaje2)
    // } catch (error) {
    //     console.log(error)
    // }
    // miPromesa()
    //     .then(mensaje => miPromesa2(mensaje))
    //     .then( resultado => console.log(resultado) )
    //     .catch(err => console.log(err))
    try {
        const mensaje2 = await miPromesa().then( (mensaje) => miPromesa2(mensaje) )
        console.log(mensaje2)
    } catch (error) {
        console.log(error)
    }
}
function C() {
    console.log("C")
}
A()
B()
C()