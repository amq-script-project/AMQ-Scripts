// ==UserScript==
// @name         AMQ Background script
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Adds multiple custom background to amq or even a video. Tried to include as many selectors as possible, so remove the ones where you prefer to have original background
// @author       Juvian
// @match        https://animemusicquiz.com/*
// @grant        none
// @require      https://gist.githubusercontent.com/arantius/3123124/raw/grant-none-shim.js
// ==/UserScript==

let timer = (secs) => setInterval(changeBackground, secs * 1000);

let onMusicChange = () => {
	new Listener("play next song", function (data) {
		changeBackground();
    }).bindListener();
};

let onManualChange = (key) => {
    document.addEventListener ("keydown", function (zEvent) {
		if (zEvent.ctrlKey && zEvent.key.toLowerCase() === key.toLowerCase()) {
			changeBackground();
			zEvent.preventDefault();
		}
	});
}

let options = {
	images: [
	    "https://w.wallhaven.cc/full/wy/wallhaven-wye6g6.jpg",
		"https://w.wallhaven.cc/full/lm/wallhaven-lmwegp.png"
	],
	imageChangePolicy: onManualChange("b"), //options: timer(3) = every 3 seconds, onMusicChange() or onManualChange("n") = when pressing ctrl + your key,
	video: {
		url: "https://desktophut-com.cdn.vidyome.com/videos/12-2018/kStWC5u7eyifonqthwFl.mp4", //another good one: "https://desktophut-com.cdn.vidyome.com/videos/04-2019/mySuBqs1CcijooCKJsOq.mp4"
		enabled: true, // no images with this
		filter: "opacity(0.5)" // could also be blur(3px) or "none" to deactivate
	},
    transparent: [
		{
		    selector: ".qpAvatarImgContainer",
			description: "backgound of avatar image in quiz",
			enabled: true
		},
		{
		    selector: "#gameChatPage > .col-xs-9",
			description: "quiz main screen",
			enabled: true
		},
		{
            selector: "#gameChatContainer, .gcInputContainer, .gcList > li:nth-child(2n)",
			description: "quiz chat",
			enabled: true
		},
		{
            selector: ".rbRoom, .rbrRoomImageContainer",
			description: "rooms to choose",
			enabled: true
		},
		{
            selector: "#mainMenuSocailButton",
		    description: "friends/social button (bottom left)",
		    enabled: true
		},
		{
            selector: "#avatarUserImgContainer",
		    description: "avatar background (bottom right)",
		    enabled: true
		},
		{
            selector: ".topMenuBar",
		    description: "top menu",
		    enabled: true
		},
		{
		    selector: ".awSkinPreviewButtom, .awSkinPreview",
			description: "unlock/change avatar preview",
			enabled: true
		},
		{
		    selector: "#footerMenuBarBackground, #rightMenuBarPartContainer::before",
			description: "bottom menu",
			enabled: true
		},
		{
		    selector: "#mpPlayButton",
			description: "play button main screen",
			enabled: true
		},
		{
		    selector: "#mpExpandButton",
			description: "expand button main screen",
			enabled: true
		},
		{
		    selector: "#mpAvatarDriveContainer, #mpAvatarDriveHeaderShadowHider .floatingContainer",
			description: "avatar drive container main screen",
			enabled: true
		},
		{
		    selector: "#mpDriveDonationContainer .button",
			description: "avatar drive donate/faq buttons",
			enabled: true
		},
		{
		    selector: "#mpDriveStatsContainer *",
			description: "avatar drive entries",
			enabled: false
		},
		{
		    selector: "#mpNewsContainer, #mpNewsTitleShadowHider div",
			description: "news main menu",
			enabled: true
		},
		{
		    selector: "#mpNewSocailTab div, #mpPatreonContainer",
			description: "main menu black backgrounds near news",
			enabled: true
		},
		{
		    selector: "#rbMajorFilters",
			description: "game room top middle filters",
			enabled: false
		},
		{
		    selector: "#roomBrowserHostButton",
			description: "host room button",
			enabled: false
		},
		{
		    selector: "#topMenuBack",
			description: "top back button",
			enabled: false
		},
		{
		    selector: "#qpAnimeContainer div:first-child .qpSideContainer",
			description: "standings menu in quiz",
			enabled: true
		},
		{
		    selector: ".qpAvatarInfoContainer div, .qpAvatarAnswerContainer",
			description: "name/guess near avatar image in quiz",
			enabled: true
		}
	],
	background: [
		{
             selector: "#gameContainer",
			 description: "main screen background",
			 enabled: true
		},
		{
		    selector: ".rbrRoomImageContainer",
			description: "background of avatars in rooms to choose",
			enabled: false // not necessary with rooms to choose enabled
		},
		{
		    selector: "#avatarWindow",
			description: "background of choosing avatar page",
			enabled: true,
			extra: "#awMainView"
		},
		{
		    selector: "#qpAnimeNameHider",
			description: "anime name answer top menu in quiz",
			enabled: true,
			extra: ".qpAnimeNameContainer, #qpCounter"
		},
		{
		    selector: "#qpInfoHider",
			description: "song info in quiz",
			enabled: true,
			extra: ".col-xs-6 + .col-xs-3 .container.qpSideContainer.floatingContainer, .col-xs-3 .qpSingleRateContainer"
		},
		{
		    selector: "#qpVideoHider",
			description: "video counter/sound only background",
			enabled: true,
			extra: "#qpVideoOverflowContainer"
		}
	]
}

let backgrounds = options.background.filter(opt => opt.enabled);
let transparents = options.transparent.filter(opt => opt.enabled);

function changeBackground() {
    this.index = ((this.index || 0) + 1) % options.images.length;
	document.documentElement.style.setProperty('--url', `url("${options.images[this.index]}")`);
}

if (options.video.enabled) {
	$("#gameContainer").append(`<video id="background-video" autoplay loop muted><source src="${options.video.url}"></video>`)
	transparents = transparents.concat(backgrounds.filter(b => !b.extra));
	backgrounds = ['.nonexistant'];
}


GM_addStyle(`
:root {
  --url: url("${options.images[0]}");
}

${backgrounds.map(opt => opt.selector).join(',')} {
    background-image: var(--url) !important;
    background-size: 100% auto !important;
    background-attachment: fixed !important;
    background-position: 0px !important;
}

${transparents.map(opt => opt.selector).concat(backgrounds.filter(opt => opt.extra).map(opt => opt.extra)).join(',')} {
    background-color: transparent !important;
    background-image: none !important;
}

.leftShadowBorder, #currencyContainer, #menuBarOptionContainer, #awContentRow .rightShadowBorder {
    box-shadow:none;
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

#background-video {
    position: absolute;
    left: 50%;
    top: 50%;
    /* The following will size the video to fit the full container. Not necessary, just nice.*/
    min-width: 100%;
    min-height: 100%;
    -webkit-transform: translate(-50%,-50%);
    -moz-transform: translate(-50%,-50%);
    -ms-transform: translate(-50%,-50%);
    transform: translate(-50%,-50%);
    z-index: -1 !important;
    filter: blur(${options.video.blur}px);
    will-change: contents;
}

#mainContainer, #gameContainer {
   z-index: 55555;
}

.clickAble, .button {
    z-index:0;
}
`);

