// ==UserScript==
// @name         AMQ Expand Library
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Makes it more ugly and efficient
// @author       Juvian
// @match        https://animemusicquiz.com/*
// @downloadURL  https://gist.github.com/juvian/4bf4496b236f8ee9b3c158d7520902d9/raw
// @updateURL    https://gist.github.com/juvian/4bf4496b236f8ee9b3c158d7520902d9/raw
// @grant        none
// ==/UserScript==

if (!window.ExpandQuestionList) return;

ExpandQuestionList.prototype.updateQuestionList = function (questions) {
	this.clear();
	this.animeEntries = questions.map((entry) => { return new ExpandQuestionListEntry(entry, this); });


	this._$questionList.append(
		this.animeEntries
		.sort((a, b) => { return a.name.localeCompare(b.name); })
		.map(entry => entry.$body)
	)
	.append(this._LIST_FILLER_HTML)
	.prepend(this._LIST_FILLER_HTML);

	this.topShownQuestionIndex = 0;
	this.updateScrollLayout();
	this._$questionList.perfectScrollbar('destroy');
	this._$questionList.attr("style", "overflow-y: scroll !important");
};

ExpandQuestionList.prototype.updateScrollLayout = function () {}