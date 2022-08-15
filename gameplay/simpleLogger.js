class SimpleLogger {
    #marker
    #logLevel

    get logLevel(){
        return this.#logLevel
    }
    set logLevel(value){
        if(SimpleLogger.VALID_LOG_LEVELS.includes(value)){
            this.#logLevel = value
        }
    }
    constructor(title = "", defaultLogLevel = SimpleLogger.LOG_LEVEL.DEFAULT){
        this.#marker = title
        this.#logLevel = defaultLogLevel
    }

    static LOG_LEVEL = {
        ALL: 0,
        FINE : 1,
        DEBUG : 2,
        INFO : 3,
        WARN : 4,
        DEFAULT : 5,
        ERROR : 6,
        FATAL : 7
    }

    static VALID_LOG_LEVELS = Object.keys(SimpleLogger.LOG_LEVEL).map((key) => SimpleLogger.LOG_LEVEL[key])

    /**
     * outputs a debug log
     * @param {string} title
     * @param {string} message
     */
    debug = (title= "", message= "") => {
        if(this.#shouldLog(SimpleLogger.LOG_LEVEL.DEBUG)){
            this.#log("DEBUG: " + title, message, "simpleLogDebug", "aqua", "aquamarine")
            console.debug(this.#marker, title, message)
        }
    }

    /**
     * Outputs an info log
     * @param {string} title
     * @param {string} message
     */
    info = (title= "", message= "") => {
        if(this.#shouldLog(SimpleLogger.LOG_LEVEL.INFO)){
            this.#log("INFO: " + title, message, "simpleLogInfo", "lawngreen", "lightgreen")
            console.info(this.#marker, title, message)
        }
    }

    /**
     * Outputs a warning log
     * @param {string} title
     * @param {string} message
     */
    warn = (title= "", message= "") => {
        if(this.#shouldLog(SimpleLogger.LOG_LEVEL.WARN)){
            this.#log("WARNING: " + title, message, "simpleLogWarn", "gold", "yellow")
            console.warn(this.#marker, title, message)
        }
    }

    /**
     * Outputs an error message
     * @param {string} title
     * @param {string} message
     */
    error = (title= "", message = "") => {
        if(this.#shouldLog(SimpleLogger.LOG_LEVEL.ERROR)){
            this.#log("ERROR: " + title, message, "simpleLogError", "darkred", "red")
            console.error(this.#marker, title, message)
        }
    }

    /**
     * Outputs an error message, and a stack trace into the console
     * @param {string} title
     * @param {string} message
     */
    fatal = (title, message = "") => {
        if(this.#shouldLog(SimpleLogger.LOG_LEVEL.FATAL)){
            this.#log("FATAL: " + title, message, "simpleLogFatal", "maroon", "crimson")
            console.group(this.#marker)
            console.error(title, message)
            console.trace()
            console.groupEnd()
        }
    }

    /**
     * @param {number} logLevel
     * @return {boolean} should log
     */
    #shouldLog = (logLevel) => {
        return this.#logLevel <= logLevel
    }

    /**
     * @param {string} title
     * @param {string} message
     * @param {string} className a legal HTML className
     * @param {string} titleColour a legal HTML colour for the title
     * @param {string} messageColour a legal HTML colour for the message
     */
    #log = (title, message, className, titleColour, messageColour) => {
        title = `${this.#marker}: ${title}`
        title = this.#escapeMessage(title)
        message = this.#escapeMessage(message)
        const titleFormatted = `<strong class="${className}" style="color:${titleColour}">${title}</strong>`
        let messageFormatted
        if(message === ""){
            messageFormatted = ""
        }else{
            messageFormatted = `<em class="${className}" style="color:${messageColour}">${message}</em>`
        }
        this.#printToChat(titleFormatted, messageFormatted)
    }

    /**
     * @param {string} message
     * @returns {string} the escaped message
     */
    #escapeMessage = (message) => {
        return message
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
    }

    /**
     * @param {string} title
     * @param {string} message
     */
    #printToChat = (title, message) => {
        window.gameChat.systemMessage(title, message)
    }
}
window.SimpleLogger = SimpleLogger