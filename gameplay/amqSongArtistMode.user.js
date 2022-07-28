// ==UserScript==
// @name         AMQ Song Artist Mode
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Makes you able to play song/artist with other people who have this script installed
// @author       Zolhungaj
// @match        https://animemusicquiz.com/*
// @grant        none
// @downloadURL  https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqSongArtistMode.user.js
// @updateURL    https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqSongArtistMode.user.js
// @copyright    MIT license
// ==/UserScript==

class SongArtistMode {
    #signature = 'sa-'
    #artistHeader = 'a'
    #songHeader = 's'
    #playerAnswersArtist = new Map()
    #playerAnswersSong = new Map()
    #playerArtistScore = new Map()
    #playerSongScore = new Map()
    constructor() {
        if(window.socket === undefined){
            return
        }
        new window.Listener("game chat update", ({messages}) => this.#handleMessages(messages)).bindListener()
        new window.Listener("answer results", ({songInfo}) => this.#answerReveal(songInfo)).bindListener()
        new window.Listener("quiz ready", this.#reset).bindListener()
        new window.Listener("Game Starting", this.#reset).bindListener()
        new window.Listener("Join Game", this.#reset).bindListener()
        //new Listener("play next song", this.#clearAnswerFields)
    }

    #reset = () => {
        this.#playerAnswersArtist.clear()
        this.#playerAnswersSong.clear()
        this.#playerArtistScore.clear()
        this.#playerSongScore.clear()

        this.#setupAnswerArea()
    }

    #setupAnswerArea = () => {
        if(document.getElementById("artistsong")){
            return
        }
        const answerInput = document.getElementById("qpAnswerInputContainer")
        const container = document.createElement("div")
        container.id = "artistsong"

        const artistContainer = document.createElement("div")
        artistContainer.id = "artist"
        const artistInput = answerInput.cloneNode(true)
        artistContainer.appendChild(artistInput)
        container.appendChild(artistContainer)

        const songContainer = document.createElement("div")
        songContainer.id = "song"
        const songInput = answerInput.cloneNode(true)
        songContainer.appendChild(songInput)
        container.appendChild(songContainer)

        const parent = document.getElementById("qpAnimeCenterContainer")
        parent.appendChild(container)
    }



    /**
     * @param {[{sender: string, message: string}]} messages
     */
    #handleMessages = (messages) => {
        messages
            .filter(({message}) => message.startsWith(this.#signature))
            .map(this.#stripMessage)
            .forEach(this.#updatePlayer)
    }

    /**
     * @param {Object} messageObject
     * @param {string} messageObject.sender
     * @param {string} messageObject.message
     * @return {{sender: string, message: string}} message stripped of signature, same sender
     */
    #stripMessage = ({message, sender}) => {
        return {
            message: message.substring(this.#signature.length),
            sender
        }
    }

    /**
     * @param {Object} messageObject
     * @param {string} messageObject.sender
     * @param {string} messageObject.message
     */
    #updatePlayer = ({message, sender}) => {
        const content = message.substring(1)
        switch(message.charAt(0)){
            case this.#artistHeader:
                this.#playerAnswersArtist.set(sender, content)
                break
            case this.#songHeader:
                this.#playerAnswersSong.set(sender, content)
                break
        }
    }

    /**
     * @param {Object} songInfo
     * @param {string} songInfo.artist
     * @param {string} songInfo.songName
     */
    #answerReveal = ({artist, songName}) => {
        this.#answerRevealHelper(artist, this.#playerAnswersArtist, this.#playerArtistScore)
        this.#answerRevealHelper(songName, this.#playerAnswersSong, this.#playerSongScore)
    }

    /**
     * @param {String} value
     * @param {Map<String, String>} answerMap
     * @param {Map<String, String>} scoreMap
     */
    #answerRevealHelper = (value, answerMap, scoreMap) => {
        answerMap.forEach((sender, answer) => {
                if(this.#isCorrect(value, sender, answer)){
                    const previousScore = scoreMap.get(sender) ?? 0
                    scoreMap.set(sender, previousScore + 1)
                }
            }
        )
    }

    /**
     * @param {String} value
     * @param {String} sender
     * @param {String} answer
     * @return {boolean}
     */
    #isCorrect = (value, sender, answer) => {
        const hash = answer.substring(0,16)
        const timestamp = answer.substring(16)
        return hash === this.#hash(value, sender, timestamp)
    }

    submitArtist = (artist) => {
        this.#submit(this.#artistHeader, artist)
    }

    submitSong = (song) => {
        this.#submit(this.#songHeader, song)
    }

    /**
     * @param {String} header
     * @param {String} value
     */
    #submit = (header, value) => {
        const timestamp = Date.now().toString(16).toUpperCase()
        const hash = this.#hash(value, window.selfName, timestamp)
        const message = this.#signature + header + hash + timestamp
        this.#sendMessage(message)
    }

    /**
     * @param {String} inputString
     * @param {String} sender
     * @param timestamp string unix timestamp in hexadecimal
     * @return {String} 64-bit hash in hexadecimal
     */
    #hash = (inputString, sender, timestamp) => {
        const first = this.#calculateHash(inputString, sender, timestamp)
        const reverseInput = inputString
            .split("")
            .reverse()
            .join("")
        const second = this.#calculateHash(reverseInput, sender, timestamp)

        const radix = 16
        const hash = first.toString(radix).padEnd(8, '0') + second.toString(radix).padEnd(8, '0')
        return hash.toUpperCase()
    }

    /**
     * @param {string} inputString
     * @param {string} sender
     * @param {string} timestamp string unix timestamp in hexadecimal
     * @return Number
     */
    #calculateHash = (inputString, sender, timestamp) => {
        return this.#hashCode(sender + inputString + timestamp)
    }

    /**
     * Returns a hash code from a string
     * @param  {String} str The string to hash.
     * @return {Number}    A 32bit integer
     * @see https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
     */
    #hashCode = (str) => {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            let chr = str.charCodeAt(i)
            hash = (hash << 5) - hash + chr
            hash |= 0 // Convert to 32bit integer
        }
        return Math.abs(hash)
    }

    /**
     * @param {String} msg
     * @param {boolean} teamMessage
     */
    #sendMessage = (msg, teamMessage= false) => {
        window.socket.sendCommand({
            type: "lobby",
            command: "game chat message",
            data: {
                msg,
                teamMessage,
            }
        })
    }
}

window.songArtist = new SongArtistMode()