//Listener manipulation
//NOTE: make sure replacement functions are arrow functions or use .bind(something) if they use the "this" keyword

const listeners = new function(){
    "use strict"
    this.notInitialized = () => {throw "commonUtilities.listeners was unable to initialize"}
    this.create = this.notInitialized
    this.on = this.notInitialized
    this.once = this.notInitialized

    this.override = (listener, newFunction) => {
        //this function overrides the callback function
        listener.callback = newFunction
    }
    this.append = (listener, newFunction) => {
        //this appends a function to be executed after the original callback
        const oldFire = listener.fire.bind(listener)
        listener.fire = (payload) => {
            oldFire(payload)
            newFunction(payload)
        }
    }
    
    this.prepend = (listener, newFunction) => {
        //this prepends a function to be executed before the original callback
        const oldFire = listener.fire.bind(listener)
        listener.fire = (payload) => {
            newFunction(payload)
            oldFire(payload)
        }
    }

    this.destroy = (listener) => {
        //completely disables a listener
        listener.unbindListener()
        listener.fire = () => {}
    }
    if(typeof Listener === "undefined"){
        return
    }

    this.create = (command, callback) => {
        //creates a new listener
        return new Listener(command, callback)
    }
    this.on = (command, callback) => {
        //creates a new listener and immediately binds it
        const listener = this.create(command, callback)
        listener.bindListener()
        return listener
    }
    this.once = (command, callback) => {
        //creates a new listener, binds it and then when it fires it immediately unbinds
        const listener = this.on(command, callback)
        this.prepend(listener, () => this.destroy(listener))
        return listener
    }
}()

const chat = new function(){
    "use strict"
    this.notInitialized = () => {throw "commonUtilities.chat was unable to initialize"}
    this.sendMessageRaw = this.notInitialized
    this.sendMessageSafe = this.notInitialized
    this.sendMessage = this.notInitialized
    this.onMessage = this.notInitialized
    this.onceMessage = this.notInitialized
    this.escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') //for use with onMessage and onceMessage for literal strings

    if(typeof socket === "undefined" || typeof gameChat === "undefined" || typeof Listener === "undefined"){
        return
    }
    this.MAX_MESSAGE_LENGTH = gameChat.MAX_MESSAGE_LENGTH
    this.sendMessageRaw = async (msg, teamMessage=false) => {
        socket.sendCommand({
            type: "lobby",
            command: "game chat message",
            data: {
                msg,
                teamMessage,
            },
        })
        return new Promise((resolve, reject) => {
            let rejectMessage = "timeout"
            if(msg.length > this.MAX_MESSAGE_LENGTH){
                rejectMessage ="message was too long" //we know the server won't accept a message that is too long, but maybe someday it will
            }
            let timeout
            const listener = this.onMessage(() => {
                clearTimeout(timeout)
                listeners.destroy(listener)
                resolve()
            }, `^${this.escapeRegex(msg)}$`, selfName)
            timeout = setTimeout(() => {
                listeners.destroy(listener)
                reject(rejectMessage)
            }, 2000)
        })
    }
    this.sendMessage = async (msg, teamMessage=false) => {
        //this is for sending a single message short message that always fit the rules
        if(msg.length > this.MAX_MESSAGE_LENGTH){
            throw `chat.sendMessage: message cannot be longer than ${this.MAX_MESSAGE_LENGTH}`
        }
        return this.sendMessageRaw(msg, teamMessage)
    }
    this.sendMessageSafe = async (msg, teamMessage=false) => {
        //this will send a series of messages, this particular segment is borrowed from my other project at https://raw.githubusercontent.com/Zolhungaj/Athena/5015ac8003de87c399b0cdc33b34e3554f8429c5/chatMonitor.js
        const words = msg.split(" ")
        let currentMessage = ""
        if (words[0].length > this.MAX_MESSAGE_LENGTH) {
            words.splice(0,1,words[0].slice(0,this.MAX_MESSAGE_LENGTH), words[0].slice(this.MAX_MESSAGE_LENGTH))
        }
        currentMessage = words[0] //this is to avoid all messages starting with a space
        for(let i = 1; i < words.length; i++){
            if(words[i].length > this.MAX_MESSAGE_LENGTH){
                const slicepoint = this.MAX_MESSAGE_LENGTH - currentMessage.length - 1
                words.splice(i,1,words[i].slice(0,slicepoint), words[i].slice(slicepoint))
            }
            if(currentMessage.length + 1 + words[i].length > this.MAX_MESSAGE_LENGTH){
                await this.sendMessage(currentMessage, teamMessage)
                currentMessage = words[i]
            }else{
                currentMessage += " " + words[i]
            }
        }
    }
    this.onMessage = (callback, messageRegex="", senderName="") => {
        //triggers a function when something matches a regex, set messageRegex to "" and senderName to "" to always trigger
        messageRegex = new RegExp(messageRegex)
        return listeners.on("game chat update", ({messages}) => {
            for(const {sender, message} of messages){
                if(messageContent.test(message) && (!senderName || senderName === sender)){
                    callback(message, sender)
                }
            }
        })
    }
    this.onceMessage = (callback, messageRegex="", senderName="") => {
        //triggers a function once when something matches a regex with the correct sender
        messageRegex = new RegExp(messageRegex)
        const listener = listeners.on("game chat update", ({messages}) => {
            for(const {sender, message} of messages){
                if(messageContent.test(message) && (!senderName || senderName === sender)){
                    callback(message, sender)
                    listeners.destroy(listener)
                    break
                }
            }
        })
        return listener
    }
}()
