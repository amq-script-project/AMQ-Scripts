// ==UserScript==
// @name         AMQ Player Answer Time Display
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Makes you able to see how quickly people answered
// @author       Zolhungaj
// @match        https://animemusicquiz.com/*
// @grant        none
// @downloadURL  https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqPlayerAnswerTimeDisplay.user.js
// @updateURL    https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqPlayerAnswerTimeDisplay.user.js
// @require      https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqAnswerTimesUtility.user.js
// @copyright    MIT license
// ==/UserScript==

if (document.getElementById("startPage")) return

let ignoredPlayerIds = []

const ignorePlayersRegular = (players) => {
    ignoredPlayerIds = []
    const self = players.find(player => player.name === selfName)
    if (self?.teamNumber) {
        const teamMates = players.filter(player => player.teamNumber === self.teamNumber)
        if (teamMates.length > 1) {
            ignoredPlayerIds = teamMates.map(player => player.gamePlayerId)
        }
    }
}

const ignorePlayersNexus = () => {
    ignoredPlayerIds = [1,2,3,4,5,6,7,8]
}

new Listener("Game Starting", (data) => {
    ignorePlayersRegular(data.players)
}).bindListener()

new Listener("Join Game", (data) => {
    if (data.quizState) {
        ignorePlayersRegular(data.quizState.players)
    }
}).bindListener()

new Listener("nexus enemy encounter", () => {
    ignorePlayersNexus()
}).bindListener()

new Listener("nexus map rejoin", () => {
    ignorePlayersNexus()
}).bindListener()

new Listener("player answered", (data) => {
    data.filter(gamePlayerId => !ignoredPlayerIds.includes(gamePlayerId)).forEach(gamePlayerId => {
        quiz.players[gamePlayerId].answer = amqAnswerTimesUtility.playerTimes[gamePlayerId] + "ms"
    })
}).bindListener()

quiz._playerAnswerListner = new Listener("player answers", (data) => {
    data.answers.forEach((answer) => {
        const quizPlayer = quiz.players[answer.gamePlayerId]
        let answerText = answer.answer
        if (amqAnswerTimesUtility.playerTimes[answer.gamePlayerId] !== undefined) {
            answerText += " (" + amqAnswerTimesUtility.playerTimes[answer.gamePlayerId] + "ms)"
        }
        quizPlayer.answer = answerText
        quizPlayer.unknownAnswerNumber = answer.answerNumber
        quizPlayer.toggleTeamAnswerSharing(false)
    })

    if (!quiz.isSpectator) {
        quiz.answerInput.showSubmitedAnswer()
        quiz.answerInput.resetAnswerState()
    }

    quiz.videoTimerBar.updateState(data.progressBarState)
})
