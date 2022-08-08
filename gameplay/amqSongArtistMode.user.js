// ==UserScript==
// @name         AMQ Song Artist Mode
// @namespace    http://tampermonkey.net/
// @version      1.1
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
    #songHeader = 's'
    #artistHeader = 'a'
    #revealHeader = 'r'
    #teamHeader = 't'
    #hashHeader = 'h'
    #playerHashesSong = new Map()
    #playerHashesArtist = new Map()
    #playerHashesSongLocked = new Map()
    #playerHashesArtistLocked = new Map()
    #playerAnswersSong = new Map()
    #playerAnswersArtist = new Map()
    #playerSongScore = new Map()
    #playerArtistScore = new Map()
    #playerContainers = new Map()
    #currentSong = ""
    #currentArtist = ""

    #songField
    #artistField
    constructor() {
        if(window.socket === undefined){
            return
        }
        new window.Listener("game chat update", ({messages}) => this.#handleMessages(messages)).bindListener()
        new window.Listener("Game Chat Message", (message) => this.#handleMessages([message])).bindListener()
        //team messages are sent instantly and alone instead of grouped up
        new window.Listener("answer results", ({songInfo}) => this.#answerResults(songInfo)).bindListener()
        new window.Listener("player answers", this.#answerReveal).bindListener()
        new window.Listener("quiz ready", this.#reset).bindListener()
        new window.Listener("Game Starting", this.#reset).bindListener()
        new window.Listener("Join Game", this.#reset).bindListener()
        new window.Listener("play next song", this.#reset).bindListener()
        //new Listener("play next song", this.#clearAnswerFields)
        new window.Listener("Game Starting", this.#setupPlayers).bindListener()

        const oldChatUpdate = window.gameChat._chatUpdateListener
        window.gameChat._chatUpdateListener = new window.Listener("game chat update", (payload) =>{
            payload.messages = payload.messages.filter(({message}) => !message.startsWith(this.#signature))
            oldChatUpdate.callback.apply(window.gameChat, [payload])
        })
        const oldGameChatMessage = window.gameChat._newMessageListner
        window.gameChat._newMessageListner = new window.Listener("Game Chat Message", (payload) => {
            if(!payload.message.startsWith(this.#signature)){
                oldGameChatMessage.callback.apply(window.gameChat, [payload])
            }
        })
    }

    /**
     * @param {Object} object
     * @param {[{gamePlayerId: number, name: string}]} object.players
     */
    #setupPlayers = async ({players}) => {
        while(window.quiz.players === undefined || window.quiz.players === null){
            await this.#wait(250)//wait for quiz.players to finish setup
        }
        this.#playerContainers.clear()
        players
            .forEach(({gamePlayerId, name}) => {
                this.#playerContainers.set(
                    name,
                    window.quiz.players[gamePlayerId].avatarSlot
                )
            })
        this.#playerContainers.forEach((avatarSlot) => {
            const animeAnswerContainer = avatarSlot.$answerContainer

            const songAnswerElement = animeAnswerContainer[0].cloneNode(true)
            songAnswerElement.style="top:20px"
            avatarSlot.$innerContainer[0].appendChild(songAnswerElement)

            avatarSlot.$songAnswerContainer = $(songAnswerElement)
            avatarSlot.$songAnswerContainerText = avatarSlot.$songAnswerContainer.find(".qpAvatarAnswerText")


            const artistAnswerElement = animeAnswerContainer[0].cloneNode(true)
            artistAnswerElement.style="top:60px"
            avatarSlot.$innerContainer[0].appendChild(artistAnswerElement)
            avatarSlot.$artistAnswerContainer = $(artistAnswerElement)
            avatarSlot.$artistAnswerContainerText = avatarSlot.$artistAnswerContainer.find(".qpAvatarAnswerText")
        })
    }

    #showSong = (playerName, song, correct) => {
        const avatarSlot = this.#playerContainers.get(playerName)
        if(avatarSlot === undefined){
            return
        }
        this.#showAnswer(playerName,
            song,
            correct,
            avatarSlot.$songAnswerContainer,
            avatarSlot.$songAnswerContainerText)
    }

    #showArtist = (playerName, artist, correct) => {
        const avatarSlot = this.#playerContainers.get(playerName)
        if(avatarSlot === undefined){
            return
        }
        this.#showAnswer(playerName,
                         artist,
                         correct,
                         avatarSlot.$artistAnswerContainer,
                         avatarSlot.$artistAnswerContainerText)
    }

    #showAnswer(playerName, value, correct, $container, $text){
        if(value === undefined || value === ""){
            $container[0].classList.add("hide")
        }else{
            $container[0].classList.remove("hide")
        }
        $text.text(value)
        if(correct !== undefined){
            const classList = $text[0].classList
            if(correct){
                classList.add("rightAnswer")
            }else{
                classList.add("wrongAnswer")
            }
        }
        window.fitTextToContainer($text, $container, 23, 9)
    }

    #wait = (time) => {
        return new Promise((resolve, _) => {
            setTimeout(resolve, time)
        })
    }

    #reset = () => {
        this.#playerHashesSong.clear()
        this.#playerHashesArtist.clear()
        this.#playerHashesSongLocked.clear()
        this.#playerHashesArtistLocked.clear()
        this.#playerSongScore.clear()
        this.#playerArtistScore.clear()
        this.#playerAnswersSong.clear()
        this.#playerAnswersArtist.clear()

        this.#currentSong = ""
        this.#currentArtist = ""

        this.#setupAnswerArea()
        this.#songField.disabled = false
        this.#artistField.disabled = false
        this.#songField.value = ""
        this.#artistField.value = ""

        this.#playerContainers?.forEach((avatarSlot) => {
            avatarSlot.$songAnswerContainer[0].classList.add("hide")
            avatarSlot.$songAnswerContainerText.text("")
            avatarSlot.$songAnswerContainerText[0].classList.remove("wrongAnswer", "rightAnswer")
            avatarSlot.$artistAnswerContainer[0].classList.add("hide")
            avatarSlot.$artistAnswerContainerText.text("")
            avatarSlot.$artistAnswerContainerText[0].classList.remove("wrongAnswer", "rightAnswer")
        })
    }

    #setupAnswerArea = () => {
        if(document.getElementById("songartist")){
            return
        }
        const answerInput = document.getElementById("qpAnswerInputContainer")
        const container = document.createElement("div")
        container.id = "songartist"

        const songContainer = document.createElement("div")
        songContainer.id = "song"
        const songInput = answerInput.cloneNode(true)
        const songAnswerField = songInput.childNodes[3]
        songAnswerField.placeholder = "Song Title"
        songAnswerField.maxLength = "" + 150 - this.#signature.length - 2
        songInput.removeChild(songInput.childNodes[1])//remove skip button
        songContainer.appendChild(songInput)
        container.appendChild(songContainer)

        const artistContainer = document.createElement("div")
        artistContainer.id = "artist"
        const artistInput = answerInput.cloneNode(true)
        const artistAnswerField = artistInput.childNodes[3]
        artistAnswerField.placeholder = "Artist"
        artistAnswerField.maxLength = "" + 150 - this.#signature.length - 2
        artistInput.removeChild(artistInput.childNodes[1])//remove skip button
        artistContainer.appendChild(artistInput)
        container.appendChild(artistContainer)


        const parent = document.getElementById("qpAnimeCenterContainer")
        parent.appendChild(container)

        this.#songField = songAnswerField
        this.#artistField = artistAnswerField

        this.#songField.addEventListener("keydown", (event) => {
            if(event.key === "Enter"){
                this.#submitSong(this.#songField.value)
            }
        })

        this.#artistField.addEventListener("keydown", (event) => {
            if(event.key === "Enter"){
                this.#submitArtist(this.#artistField.value)
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
            case this.#hashHeader + this.#songHeader:
                this.#playerHashesSong.set(sender, content)
                break
            case this.#hashHeader + this.#artistHeader:
                this.#playerHashesArtist.set(sender, content)
                break
            case this.#revealHeader + this.#songHeader:
                this.#handleRevealSong(sender, content)
                break
            case this.#revealHeader + this.#artistHeader:
                this.#handleRevealArtist(sender, content)
                break
            case this.#teamHeader + this.#songHeader:
                this.#handleTeamRevealSong(sender, content)
                break
            case this.#teamHeader + this.#artistHeader:
                this.#handleTeamRevealArtist(sender, content)
                break
        }
    }

    /**
     * @param {string} sender
     * @param {string} content
     * @param {boolean | undefined} correct
     */
    #handleRevealSong = (sender, content, correct) => {
        this.#handleReveal(sender, content, this.#playerHashesSongLocked, this.#playerAnswersSong)
        this.#showSong(sender, this.#playerAnswersSong.get(sender), correct)
    }

    /**
     * @param {string} sender
     * @param {string} content
     * @param {boolean | undefined} correct
     */
    #handleRevealArtist = (sender, content, correct) => {
        this.#handleReveal(sender, content, this.#playerHashesArtistLocked, this.#playerAnswersArtist)
        this.#showArtist(sender, this.#playerAnswersArtist.get(sender), correct)
    }

    /**
     * @param {string} sender
     * @param {string} content
     */
    #handleTeamRevealSong = (sender, content) => {
        this.#handleReveal(sender, content, this.#playerHashesSong, this.#playerAnswersSong)
        this.#showSong(sender, this.#playerAnswersSong.get(sender))
    }

    /**
     * @param {string} sender
     * @param {string} content
     */
    #handleTeamRevealArtist = (sender, content) => {
        this.#handleReveal(sender, content, this.#playerHashesArtist, this.#playerAnswersArtist)
        this.#showArtist(sender, this.#playerAnswersArtist.get(sender))
    }

    /**
     * @param {string} sender
     * @param {string} content
     * @param {Map<String, String>} hashMap
     * @param {Map<String, String>} answerMap
     */
    #handleReveal = (sender, content, hashMap, answerMap) => {
        const hash = hashMap.get(sender) ?? ""
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
        this.#answerResultsHelper(songName,
            this.#playerHashesSongLocked,
            this.#playerSongScore,
            this.#playerAnswersSong,
            this.#handleRevealSong)
        this.#answerResultsHelper(artist,
            this.#playerHashesArtistLocked,
            this.#playerArtistScore,
            this.#playerAnswersArtist,
            this.#handleRevealArtist)
    }

    /**
     * @param {String} value
     * @param {Map<String, String>} hashesMap
     * @param {Map<String, String>} scoreMap
     * @param {Map<String, String>} answerMap
     * @param {Function<string, string, undefined|boolean>} revealFunction
     */
    #answerResultsHelper = (value, hashesMap, scoreMap, answerMap, revealFunction) => {
        hashesMap.forEach((answer, sender) => {
                if(this.#isCorrect(value, sender, answer)){
                    const previousScore = scoreMap.get(sender) ?? 0
                    scoreMap.set(sender, previousScore + 1)
                    const displayAnswer = answerMap.get(sender) ?? value
                    revealFunction(sender, displayAnswer, true)
                }else{
                    const displayAnswer = answerMap.get(sender) ?? "WRONG"
                    revealFunction(sender, displayAnswer, false)
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

    #submitSong = (song) => {
        song = song.trim()
        this.#submit(this.#hashHeader + this.#songHeader, song).then(() => {
            this.#teamSubmit(this.#teamHeader + this.#songHeader, song)
        })

        this.#currentSong = song
    }

    #submitArtist = (artist) => {
        artist = artist.trim()
        this.#submit(this.#hashHeader + this.#artistHeader, artist).then(() => {
            this.#teamSubmit(this.#teamHeader + this.#artistHeader, artist)
        })
        this.#currentArtist = artist
    }

    #teamSubmit = (header, value) => {
        if(window.quiz.teamMode){
            let teamMessage = false
            for(let index in window.quiz.players){
                //for some dumb reason players is an object
                const player = window.quiz.players[index]
                if(player.teamNumber !== 1){
                    teamMessage = true
                    break
                }
            }
            this.#sendMessage(this.#signature + header + value, teamMessage)
        }
    }

    /**
     * @param {String} header
     * @param {String} value
     */
    #submit = (header, value) => {
        const timestamp = Date.now().toString(16).toUpperCase()
        const hash = this.#hash(value, window.selfName, timestamp)
        const message = this.#signature + header + hash + timestamp
        return this.#sendMessage(message)
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
        str = str.toLowerCase()
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            let chr = str.charCodeAt(i)
            hash = (hash << 5) - hash + chr
            hash |= 0 // Convert to 32bit integer
        }
        return Math.abs(hash)
    }

    #lockAnswers = () => {
        this.#playerHashesSongLocked = new Map(this.#playerHashesSong)
        this.#playerHashesArtistLocked = new Map(this.#playerHashesArtist)
        this.#songField.disabled = true
        this.#artistField.disabled = true
        this.#songField.value = this.#currentSong
        this.#artistField.value = this.#currentArtist
    }

    #answerReveal = () => {
        this.#lockAnswers()
        const template = (header, value) => `${this.#answerRevealHeader(header)}${value}`
        if(this.#currentSong !== ""){
            const msg = template(this.#songHeader, this.#currentSong)
            this.#sendMessage(msg)
        }
        if(this.#currentArtist !== ""){
            const msg = template(this.#artistHeader, this.#currentArtist)
            this.#sendMessage(msg)
        }
    }

    #answerRevealHeader = (header) => {
        return `${this.#signature}${this.#revealHeader}${header}`
    }

    /**
     * @param {String} msg
     * @param {boolean} teamMessage
     * @return {Promise<boolean>} true on success, false on timeout
     */
    #sendMessage = (msg, teamMessage= false) => {
        const promise = new Promise((resolve, _) => {
            if(teamMessage){
                const listener = new window.Listener("Game Chat Message", ({message, sender}) => {
                    if(sender === window.selfName && message === msg){
                        resolve(true)
                        listener.unbindListener()
                    }
                })
                listener.bindListener()
            }else{
                const listener = new window.Listener("game chat update", ({messages}) => {
                    const found = messages.some(({sender, message}) => sender === window.selfName && message === msg)
                    if(found){
                        resolve(true)
                        listener.unbindListener()
                    }
                })
                listener.bindListener()
            }
            setTimeout(() => {resolve(false)}, 2000)
        })
        window.socket.sendCommand({
            type: "lobby",
            command: "game chat message",
            data: {
                msg,
                teamMessage,
            }
        })
        return promise
    }
}

window.songArtist = new SongArtistMode()