// ==UserScript==
// @name         AMQ Player Answer Time Display
// @namespace    http://tampermonkey.net/
// @version      1.12
// @description  Makes you able to see how quickly people answered
// @author       Zolhungaj
// @match        https://animemusicquiz.com/*
// @grant        none
// @downloadURL  https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqPlayerAnswerTimeDisplay.user.js
// @updateURL    https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqPlayerAnswerTimeDisplay.user.js
// @require      https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqAnswerTimesUtility.user.js
// @require      https://github.com/joske2865/AMQ-Scripts/raw/master/common/amqScriptInfo.js
// @copyright    MIT license
// ==/UserScript==

if (typeof Listener === "undefined") return

const version = "1.12"
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
    ignoredPlayerIds = [1, 2, 3, 4, 5, 6, 7, 8]
}

new Listener("Game Starting", (data) => {
    ignorePlayersRegular(data.players)
}).bindListener()

new Listener("Join Game", (data) => {
    if (data.quizState) {
        ignorePlayersRegular(data.quizState.players)
    }
}).bindListener()

new Listener("Spectate Game", () => {
    ignoredPlayerIds = []
}).bindListener()

new Listener("player late join", () => {
    setTimeout(() => {
        ignorePlayersRegular(Object.values(quiz.players))
    }, 0)
}).bindListener()

new Listener("nexus enemy encounter", () => {
    ignorePlayersNexus()
}).bindListener()

new Listener("nexus map rejoin", () => {
    ignorePlayersNexus()
}).bindListener()

new Listener("player answered", (data) => {
    data.filter(id => !ignoredPlayerIds.includes(id)).forEach(id => {
        let player = quiz.players?.[id]
        if (player) { //prevent errors from hidden players
            player.answer = amqAnswerTimesUtility.playerTimes[id] + "ms"
        }
    })
}).bindListener()

new Listener("answer results", (data) => {
    if (data.lateJoinPlayers) {
        setTimeout(() => {
            ignorePlayersRegular(Object.values(quiz.players))
        }, 0)
    }
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
        if (quiz.hintGameMode) {
            quiz.hintController.hide()
        }
    }

    quiz.videoTimerBar.updateState(data.progressBarState)
    quizVideoController.checkForBufferingIssue()
})

AMQ_addScriptData({
    name: "Player Answer Time Display",
    author: "Zolhungaj",
    version: version,
    link: "https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqPlayerAnswerTimeDisplay.user.js",
    description: `
        <p>Makes you able to see how quickly people answered</p>
        <p>(# ms) will be appended to all players' answers in their answer boxes</p>
    `
})
