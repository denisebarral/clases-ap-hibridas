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

function miPromesa2(resultado) {  // recibe "resultado" de miPromesa()
    return new Promise((resolve, reject) => {
        let ok = true
        if (ok) {
            resolve(`Recibí "${resultado}" y también salió bien!`) // usa lo que recibe
        } else {
            reject("Todo salio muy mal :(")
        }
    })
}


function A() {
    console.log("A")
}

async function B() {
    // FORMA 1 — async/await puro (la más legible)
    try{
        const resultado = await miPromesa();
        const resultado2 = await miPromesa2(resultado);
        console.log(resultado2);
    } catch (error) {
        console.log(error)
    }

    //FORMA 2 - combinación de async/await con .then() (lo que el profé eligió y dejó sin comentar)
    /*try {
        const resultado = await miPromesa().then((resultado) => miPromesa2(resultado))
        //                                          ↑                        ↑
        //                                   lo que devuelve          se lo paso
        //                                     miPromesa()            a miPromesa2
        console.log(resultado)  // → 'Recibí "Todo salio bien!" y también salió bien!'
    } catch (error) {
        console.log(error)
    }*/

    // FORMA 3 - solo .then() encadenados (estilo promesas clásico, la más difícil de leer)    
    /*miPromesa()
    .then(resultado => miPromesa2(resultado))
    .then(resultado => console.log(resultado))
    .catch(err => console.log(err))*/

}

function C() {
    console.log("C")
}

A();
B();
C();