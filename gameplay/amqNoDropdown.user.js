// ==UserScript==
// @name         AMQ No Dropdown
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Disables dropdown for that extra taste of rage. Use ctrl + b to enable/disable dropdown
// @author       Juvian
// @match        https://animemusicquiz.com/*
// @grant        none
// @require      https://github.com/joske2865/AMQ-Scripts/raw/master/common/amqScriptInfo.js
// @downloadURL  https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqNoDropdown.user.js
// @updateURL    https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqNoDropdown.user.js
// ==/UserScript==

if (!window.AutoCompleteController) return;

const version = 0.2;
let enabled = false;
let realList;

function changeEnabled() {
    enabled = !enabled;
    let controller = window?.quiz?.answerInput?.autoCompleteController;

    if (controller) {
        controller.newList();
    }
}

let oldNewList = AutoCompleteController.prototype.newList;

AutoCompleteController.prototype.newList = function () {
    if (this.list.length) realList = this.list;
    if (!realList) return;
    this.list = enabled ? realList : [];
    oldNewList.apply(this, Array.from(arguments));
}

document.addEventListener ("keydown", function (zEvent) {
    if (zEvent.ctrlKey && zEvent.key.toLowerCase() === 'b') {
        changeEnabled();
    }
});

AMQ_addScriptData({
    name: "AMQ No Dropdown",
    author: "Juvian",
    version: version,
    link: "https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqNoDropdown.user.js",
    description: `
        <p>Disables dropdown for that extra taste of rage. Use ctrl + b to enable/disable dropdown</p>
    `
});