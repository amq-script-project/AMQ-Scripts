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
    #revealHeader = 'r'
    #hashHeader = 'h'
    #playerHashesArtist = new Map()
    #playerHashesSong = new Map()
    #playerHashesArtistLocked = new Map()
    #playerHashesSongLocked = new Map()
    #playerAnswersArtist = new Map()
    #playerAnswersSong = new Map()
    #playerArtistScore = new Map()
    #playerSongScore = new Map()
    #currentSong = ""
    #currentArtist = ""

    #songField
    #artistField
    constructor() {
        if(window.socket === undefined){
            return
        }
        new window.Listener("game chat update", ({messages}) => this.#handleMessages(messages)).bindListener()
        new window.Listener("answer results", ({songInfo}) => this.#answerResults(songInfo)).bindListener()
        new window.Listener("player answers", this.#lockAnswers).bindListener()
        new window.Listener("player answers", this.#answerReveal).bindListener()
        new window.Listener("quiz ready", this.#reset).bindListener()
        new window.Listener("Game Starting", this.#reset).bindListener()
        new window.Listener("Join Game", this.#reset).bindListener()
        new window.Listener("play next song", this.#reset).bindListener()
        //new Listener("play next song", this.#clearAnswerFields)
    }

    #reset = () => {
        this.#playerHashesArtist.clear()
        this.#playerHashesSong.clear()
        this.#playerHashesArtistLocked.clear()
        this.#playerHashesSongLocked.clear()
        this.#playerArtistScore.clear()
        this.#playerSongScore.clear()
        this.#playerAnswersArtist.clear()
        this.#playerAnswersSong.clear()

        this.#currentSong = ""
        this.#currentArtist = ""

        this.#setupAnswerArea()
        this.#artistField.disabled = false
        this.#songField.disabled = false
        this.#artistField.value = ""
        this.#songField.value = ""
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
        const artistAnswerField = artistInput.childNodes[3]
        artistAnswerField.placeholder = "Artist"
        artistInput.removeChild(artistInput.childNodes[1])//remove skip button
        artistContainer.appendChild(artistInput)
        container.appendChild(artistContainer)

        const songContainer = document.createElement("div")
        songContainer.id = "song"
        const songInput = answerInput.cloneNode(true)
        const songAnswerField = songInput.childNodes[3]
        songAnswerField.placeholder = "Song Title"
        songInput.removeChild(songInput.childNodes[1])//remove skip button
        songContainer.appendChild(songInput)
        container.appendChild(songContainer)

        const parent = document.getElementById("qpAnimeCenterContainer")
        parent.appendChild(container)

        this.#artistField = artistAnswerField
        this.#songField = songAnswerField

        this.#artistField.addEventListener("keydown", (event) => {
            if(event.key === "Enter"){
                this.#submitArtist(this.#artistField.value)
            }
        })

        this.#songField.addEventListener("keydown", (event) => {
            if(event.key === "Enter"){
                this.#submitSong(this.#songField.value)
            }
        })
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
        const content = message.substring(2)
        switch(message.substring(0,2)){
            case this.#hashHeader + this.#artistHeader:
                this.#playerHashesArtist.set(sender, content)
                break
            case this.#hashHeader + this.#songHeader:
                this.#playerHashesSong.set(sender, content)
                break
            case this.#revealHeader + this.#artistHeader:
                this.#handleRevealArtist(sender, content)
                break
            case this.#revealHeader + this.#songHeader:
                this.#handleRevealSong(sender, content)
                break
        }
    }

    /**
     * @param {string} sender
     * @param {string} content
     */
    #handleRevealArtist = (sender, content) => {
        this.#handleReveal(sender, content, this.#playerHashesArtistLocked, this.#playerAnswersArtist)
    }

    /**
     * @param {string} sender
     * @param {string} content
     */
    #handleRevealSong = (sender, content) => {
        this.#handleReveal(sender, content, this.#playerHashesSongLocked, this.#playerAnswersSong)
    }

    /**
     * @param {string} sender
     * @param {string} content
     * @param {Map<String, String>} lockedHashesMap
     * @param {Map<String, String>} answerMap
     */
    #handleReveal = (sender, content, lockedHashesMap, answerMap) => {
        const hash = lockedHashesMap.get(sender)
        if(this.#isCorrect(content, sender, hash)){
            answerMap.set(sender, content)
            console.log(sender, "did indeed send the answer", content)
        }
    }

    /**
     * @param {Object} songInfo
     * @param {string} songInfo.artist
     * @param {string} songInfo.songName
     */
    #answerResults = ({artist, songName}) => {
        this.#answerResultsHelper(artist, this.#playerHashesArtistLocked, this.#playerArtistScore)
        this.#answerResultsHelper(songName, this.#playerHashesSongLocked, this.#playerSongScore)
    }

    /**
     * @param {String} value
     * @param {Map<String, String>} hashesMap
     * @param {Map<String, String>} scoreMap
     */
    #answerResultsHelper = (value, hashesMap, scoreMap) => {
        hashesMap.forEach((sender, answer) => {
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

    #submitArtist = (artist) => {
        artist = artist.trim()
        this.#submit(this.#hashHeader + this.#artistHeader, artist)
        this.#currentArtist = artist
    }

    #submitSong = (song) => {
        song = song.trim()
        this.#submit(this.#hashHeader + this.#songHeader, song)
        this.#currentSong = song
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
        const spice = "alphanumeric"
        //during testing, I found the last letter to heavily impact the first byte pair of the hash
        //the spice should shift that away
        str += spice
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            let chr = str.charCodeAt(i)
            hash = (hash << 5) - hash + chr
            hash |= 0 // Convert to 32bit integer
        }
        return Math.abs(hash)
    }

    #lockAnswers = () => {
        this.#playerHashesArtistLocked = new Map(this.#playerHashesArtist)
        this.#playerHashesSongLocked = new Map(this.#playerHashesSong)
        this.#artistField.disabled = true
        this.#songField.disabled = true
        this.#artistField.value = this.#currentArtist
        this.#songField.value = this.#currentSong
    }

    #answerReveal = () => {
        const template = (header, value) => `${this.#answerRevealHeader(header)}${value}`
        if(this.#currentArtist !== ""){
            const msg = template(this.#artistHeader, this.#currentArtist)
            this.#sendMessage(msg)
        }
        if(this.#currentSong !== ""){
            const msg = template(this.#songHeader, this.#currentSong)
            this.#sendMessage(msg)
        }
    }

    #answerRevealHeader = (header) => {
        return `${this.#signature}${this.#revealHeader}${header}`
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