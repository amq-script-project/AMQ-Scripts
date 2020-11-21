// ==UserScript==
// @name         AMQ no dropdown
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Disables dropdown for that extra taste of rage. Use ctrl + b to enable/disable dropdown
// @author       juvian
// @match        https://animemusicquiz.com/*
// @grant        none
// ==/UserScript==

if (!window.AutoCompleteController) return;

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