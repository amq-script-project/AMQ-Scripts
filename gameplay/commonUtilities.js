

//Listener manipulation
//NOTE: make sure replacement functions are arrow functions or use .bind(something) if they use the "this" keyword

const overrideListener = (listener, newFunction) => {
    //this function overrides the callback function
    listener.callback = newFunction
}

const appendListener = (listener, newFunction) => {
    //this appends a function to be executed after the original callback
    const oldFire = listener.fire.bind(listener)
    listener.fire = (payload) => {
        oldFire(payload)
        newFunction(payload)
    }
}

const prependListener = (listener, newFunction) => {
    //this prepends a function to be executed before the original callback
    const oldFire = listener.fire.bind(listener)
    listener.fire = (payload) => {
        newFunction(payload)
        oldFire(payload)
    }
}