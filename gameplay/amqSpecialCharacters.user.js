// ==UserScript==
// @name         AMQ special character inclusion
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Gives shortkeys for special characters
// @author       Zolhungaj
// @match        https://animemusicquiz.com/*
// @grant        none
// @copyright MIT license
// ==/UserScript==
const letterMap = {
    A:"Ā", a:"ā",
    I:"Ī", i:"ī",
    U:"Ū", u:"ū",
    E:"Ē", e:"ē",
    O:"Ō", o:"ō"
}

document.addEventListener("keydown", function(event) {
    const key = event.key
    const element = event.target
    if (!element || (element.tagName != "INPUT" && element.tagName != "TEXTAREA")) {
        return
    }
    if (event.ctrlKey && letterMap[key]) {
        event.preventDefault();
        const replacement = letterMap[key]
        let value = element.value
        const startPos = element.selectionStart // these are the start and end of a markup selection
        const endPos = element.selectionEnd // if these are equal they give the position of the cursor,
        // the position is given as how many characters are to the left of the cursor
        value = value.slice(0,startPos) + replacement + value.slice(endPos)
        element.value = value
        element.setSelectionRange(startPos+1, startPos+1)
        element.dispatchEvent(new InputEvent("input"))
    }
}, false);