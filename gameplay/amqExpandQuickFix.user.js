// ==UserScript==
// @name         AMQ Expand No Name Bug Patch
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  makes the error where an entry has no name less intrusive
// @author       Zolhungaj
// @match        https://animemusicquiz.com/*
// @grant        none
// @copyright MIT license
// ==/UserScript==

ExpandQuestionList.prototype.updateQuestionListOld = ExpandQuestionList.prototype.updateQuestionList
const newfun = function(questions){
    questions.forEach(question => {
        if(question.name === null){
            question.name = "___" + "ANNID" + question.annId + "_null"
        }
    })
    this.updateQuestionListOld(questions)
}
ExpandQuestionList.prototype.updateQuestionList = newfun

