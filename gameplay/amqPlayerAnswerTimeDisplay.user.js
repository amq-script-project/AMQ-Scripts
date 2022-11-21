// ==UserScript==
// @name         AMQ Player Answer Time Display
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Makes you able to see how quickly people answered
// @author       Zolhungaj
// @match        https://animemusicquiz.com/*
// @grant        none
// @downloadURL  https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqPlayerAnswerTimeDisplay.user.js
// @updateURL    https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqPlayerAnswerTimeDisplay.user.js
// @require      https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqAnswerTimesUtility.user.js
// @copyright    MIT license
// ==/UserScript==

let ignoredPlayerIds = []

const ignorePlayers = (players) => {
    ignoredPlayerIds = []
    const self = players.find(player => player.name === selfName)
    if(self){
        const teamNumber = self.teamNumber
        if(teamNumber){
            const teamMates = players.filter(player => player.teamNumber === teamNumber)
            if(teamMates.length > 1){
                ignoredPlayerIds = teamMates.map(player => player.gamePlayerId)
            }
        }
    }
}

new Listener("Game Starting", ({players}) => ignorePlayers(players)).bindListener()
new Listener("nexus enemy encounter", ({players}) => ignorePlayers(players)).bindListener()

new Listener("player answered", (data) => {
    data.filter(gamePlayerId => !ignoredPlayerIds.includes(gamePlayerId)).forEach(gamePlayerId => {
        quiz.players[gamePlayerId].answer = amqAnswerTimesUtility.playerTimes[gamePlayerId] + "ms"
    })
}).bindListener()

quiz._playerAnswerListner = new Listener(
    "player answers",
    function (data) {
        const that = quiz
        data.answers.forEach((answer) => {
            const quizPlayer = that.players[answer.gamePlayerId]
            let answerText = answer.answer
            if(amqAnswerTimesUtility.playerTimes[answer.gamePlayerId] !== undefined){
                answerText += " (" + amqAnswerTimesUtility.playerTimes[answer.gamePlayerId] + "ms)"
            }
            quizPlayer.answer = answerText
            quizPlayer.unknownAnswerNumber = answer.answerNumber
            quizPlayer.toggleTeamAnswerSharing(false)
        })

        if (!that.isSpectator) {
            that.answerInput.showSubmitedAnswer()
            that.answerInput.resetAnswerState()
        }

        that.videoTimerBar.updateState(data.progressBarState)
    }
)
