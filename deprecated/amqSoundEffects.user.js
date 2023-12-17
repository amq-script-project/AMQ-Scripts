// ==UserScript==
// @name         AMQ Sound Effects
// @namespace    http://tampermonkey.net/
// @version      1.2.0
// @description  Makes the game a lot noisier
// @author       Zolhungaj
// @match        https://animemusicquiz.com/*
// @grant        none
// @downloadURL  https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqSoundEffects.user.js
// @updateURL    https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqSoundEffects.user.js
// @copyright MIT license
// ==/UserScript==

// based on https://stackoverflow.com/questions/879152/how-do-i-make-javascript-beep
// audio created with audacity, converted to mp3 with ffmpeg, and converted to base64 with https://base64.guru/converter/encode/audio

if (!window.GameChat) return;
function settings_changed() {
    var snd = new Audio("data:audio/mp3;base64,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");
    snd.play();
}
function mention() {
    var snd = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjM1LjEwNAAAAAAAAAAAAAAA//NwwAAAAAAAAAAAAEluZm8AAAAPAAAADgAAAiQAYWFhYWFhYW1tbW1tbW15eXl5eXl5hoaGhoaGhpKSkpKSkpKenp6enp6eqqqqqqqqqra2tra2tra2wsLCwsLCws/Pz8/Pz8/b29vb29vb5+fn5+fn5/Pz8/Pz8/P/////////AAAAAExhdmM1OC42NgAAAAAAAAAAAAAAACQEQAAAAAAAAAIkpJQFdgAAAAAAAAAAAAAAAAD/8xDEAAM4xmwBQCgB//U4mH3EADA4v/MMEP/zEsQAA3jCwAmAUAAgf//6EGhHQoAo6s5FUP/zEMQAAvDG2BnAUAACgf/+dMJgFxDp/6Ew//MQxAAC2M7IAAYTIP5vXGZgF5tABTKJSYD/8xDEAAL4xuXgCBZ0A3A/zEZfMlYHSIU0mP/zEMQAAzgu6eAJTAAX/DMN1UgAE1//6Hg0//MQxAACsKrmAAgEjAm+BZvkKcgL6MghMQT/8xDEAAH4rtAACCI4zX62PgUAPKKYgpqKAP/zEMQAAqCq1UAIJI0Szr99fUaAnwho5MQQ//MSxAACyKcJ+AgSkgBaBcB/7txt39H0piCA//MQxAACmKcF+AgKcmBQBwBX+L+oG/0JiCD/8xDEAAM4rrwBQlAADO43/////UiEsA0LLv/zEMQAA0CaoCmCKAACQAK3///+qfiIFOeP//MQxAAAAANIAcAAAExBTUUzLjEwMAAAAAA=");
    snd.play();
}

function dm() {
    var snd = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjM1LjEwNAAAAAAAAAAAAAAA//NwwAAAAAAAAAAAAEluZm8AAAAPAAAAEgAAAo0AUVFRUVFcXFxcXFxmZmZmZnBwcHBwcHp6enp6hISEhISEj4+Pj4+ZmZmZmZmjo6Ojo66urq6urri4uLi4uMLCwsLCzMzMzMzM1tbW1tbh4eHh4eHr6+vr6/X19fX19f//////AAAAAExhdmM1OC42NgAAAAAAAAAAAAAAACQDzAAAAAAAAAKNBvqRDQAAAAAAAAAAAAAAAAD/8xDEAAMoUngBQgAA//qc7hAMDAgIaw/ggP/zEsQAA0i25AGBOAD//7MaTaFX75uIG5vLgP/zEMQAAwiW3EHKOAAwP//4vDY47/0JAicA//MQxAAC0KbsYABEoRQNC2If/wonDnCC0wD/8xDEAAMIntGAAFqBADMI+ZBrdH//UEkKgP/zEMQAAsimzAADVKCVhZLPRv/nngNiYqYA//MQxAACsKbcIAIOpkM0hKBUrX/8JxJZMQT/8xDEAAKYosgAAJqghBAUEC3/WvgnJumIIP/zEMQAAoCe3GAAChMACRkh//roAQTBTEFN//MSxAADCKLuQABEgQABkAveCeP/8G+MyyYA//MQxAAC4J7uYACKiAABwOTDSmG/61fANMD/8xDEAALAosxgAIypAA8M4Qj//wvuIzNMQf/zEMQAAtiiyeABUIwAAW+g8YBP/+9AUqmA//MQxAACkJ7AYAFOoSALgwSDP/0zgmxTEED/8xDEAAKQnqQAAY6gl1gwFDv+qGsPi1MQQP/zEMQAAtimkCACkKgKmnuCCd//alAAn0mA//MQxAACmKJ0AACSqJgYkMP/6lLlgSNJiCD/8xLEAAGwAkSAAEYCAAmv//xWZTEFNRQAAAA=");
    snd.play();
}


new Listener("Room Settings Changed", (changes) => { settings_changed()}).bindListener()
new Listener("Game Chat Message", function (payload) {
    if (!socialTab.isBlocked(payload.sender)) {
        //this.chatMessage(payload.sender, payload.message, payload.emojis, payload.badges, payload.messageId, payload.atEveryone);
        if (gameChat.atSelfRegex.test(payload.message) || payload.atEveryone) {
            mention();
        }
    }
}).bindListener()
new Listener("chat message", function (payload) { dm() }).bindListener();
