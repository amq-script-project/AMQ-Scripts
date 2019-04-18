// ==UserScript==
// @name         AMQ Background script
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds custom background to amq. Tried to include as many selectors as possible, so remove the ones where you prefer to have original background
// @author       Juvian
// @match        https://animemusicquiz.com/*
// @grant        none
// @require      https://gist.githubusercontent.com/arantius/3123124/raw/grant-none-shim.js

// ==/UserScript==


GM_addStyle(`
#gameContainer, #gameChatPage > .col-xs-9, #gameChatPage, #gcMessageContainer,#rbRoomContainer .rbrRoomImageContainer, #mainMenuSocailButton, #xpBarCoverInner, #avatarUserImgContainer, .topMenuBar, #awContentRow, #awMainView, .gcInputContainer, #qpVideoOverflowContainer, #qpVideosUserHidden, #qpVideosUserHidden, .qpSideContainer, .qpAnimeNameContainer, #qpCounter, #qpVideoHider, #qpInfoHider, #qpWaitBuffering {
    background-image: url(https://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-723319.jpg) !important;
    background-size: 100% auto !important;
    background-attachment: fixed !important;
    background-position: 0px !important;
}

.leftShadowBorder, #currencyContainer, #menuBarOptionContainer, #awContentRow .rightShadowBorder {
    box-shadow:none;
}

#footerMenuBar .menuBar, #optionsContainer.popOut, #rightMenuBarPartContainer::before, .gcList > li:nth-child(2n) {
    background-color:transparent !important;
}

#socialTab:not(.open), #optionsContainer:not(.open) {
    display:none;
}

#mainMenuSocailButton, #avatarUserImgContainer {
    border:none !important;
}

#optionsContainer li {
    background-color:#424242 !important;
}

#rbMajorFilters {
    background-color: #1b1b1b;
    padding-left: 10px;
}

`)
