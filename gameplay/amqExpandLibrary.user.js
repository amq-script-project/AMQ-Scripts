// ==UserScript==
// @name         AMQ Expand Library
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Makes it more ugly and efficient
// @author       Juvian
// @match        https://animemusicquiz.com/*
// @grant        none
// @downloadURL  https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqExpandLibrary.user.js
// @updateURL    https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqExpandLibrary.user.js
// @require      https://github.com/joske2865/AMQ-Scripts/raw/master/common/amqScriptInfo.js
// ==/UserScript==

if (!window.ExpandQuestionList) return;

const version = "1.2";

ExpandQuestionList.prototype.updateQuestionList = function (questions) {
    this.clear();
    this.animeEntries = questions.map((entry) => { return new ExpandQuestionListEntry(entry, this); });

    let entries = new WeakMap();

    this.animeEntries.forEach(function(entry) {
        entry.$songContainer.detach();
        entries.set(entry.$animeEntry[0], entry);
    })

    this._$questionList.off().on("click", ".elQuestionAnime", (ev) => {
        let entry = entries.get(ev.currentTarget);
        if (entry.open) {
            $(ev.currentTarget).parent().append(entry.$songContainer);
        } else {
            entry.$songContainer.detach();
        }
    });

    this._$questionList.append(
        this.animeEntries
            .sort((a, b) => { return a.name.localeCompare(b.name); })
            .map(entry => entry.$body)
     )
    .append(this._LIST_FILLER_HTML)
    .prepend(this._LIST_FILLER_HTML);

    this.topShownQuestionIndex = 0;
    this._$questionList.perfectScrollbar("destroy");
    this._$questionList.attr("style", "overflow-y: scroll !important");
    this._QUERY_UPDATE_CHUNK_SiZE = 200;
};

ExpandQuestionList.prototype.updateScrollLayout = function () {}

AMQ_addScriptData({
    name: "Expand Library",
    author: "Juvian",
    version: version,
    link: "https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqExpandLibrary.user.js",
    description: `
        <p>Makes the expand library more ugly and efficient</p>
    `
});

AMQ_addStyle(`
    .elQuestion.open .elQuestionSongContainer {
        display: block;
    }

    .elQuestionSongContainer {
        display: none;
        height: auto !important;
    }
`);
