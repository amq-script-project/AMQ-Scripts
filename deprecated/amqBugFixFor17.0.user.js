// ==UserScript==
// @name         bugfix on 0.17.0
// @namespace    http://tampermonkey.net/
// @version      1.0
// @downloadURL  https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqBugFixFor17.0.user.js
// @updateURL    https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqBugFixFor17.0.user.js
// @description  Fixes opening profiles
// @author       Zolhungaj
// @match        https://animemusicquiz.com/*
// @grant        none
// @copyright    MIT License
// ==/UserScript==
quiz.setupQuizInner = quiz.setupQuiz
quiz.setupQuiz = (players, isSpectator, quizState, settings, isHost, groupSlotMap, soloMode) => {
    quiz.setupQuizInner(players, isSpectator, quizState, settings, isHost, groupSlotMap, soloMode)
    Object.values(quiz.players).forEach(player => {player.avatarSlot.$nameContainerOuter = player.avatarSlot.$bottomContainer})
}
