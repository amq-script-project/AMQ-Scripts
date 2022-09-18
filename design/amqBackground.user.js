// ==UserScript==
// @name         AMQ Background script
// @namespace    http://tampermonkey.net/
// @version      3.8
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

let defaultOpacity = 0.5;

let options = {
	images: [
	    "https://w.wallhaven.cc/full/wy/wallhaven-wye6g6.jpg",
		"https://w.wallhaven.cc/full/lm/wallhaven-lmwegp.png"
	],
	imageChangePolicy: onManualChange("b"), //options: timer(3) = every 3 seconds, onMusicChange() or onManualChange("n") = when pressing ctrl + your key,
	video: {
		url: "https://i.pximg.net/img-master/img/2022/09/17/23/15/10/101250893_p0_master1200.jpg", //other good ones: "https://desktophut-com.cdn.vidyome.com/videos/04-2019/mySuBqs1CcijooCKJsOq.mp4", "https://www.desktophut.com/wp-content/uploads/2021/12/Anime-Ganyu-Girl-And-Rainy-Night-4K-Live-Wallpaper.mp4"
		enabled: true, // no images with this
		filter: "none" // could be blur(3px) or "none" to deactivate
	},
    transparent: [
		{
		    selector: "div.lobbyAvatarImgContainer",
			description: "dots in game lobby",
			opacity: 0.7
		},
		{
		    selector: "#mpDriveStatsContainer>.col-xs-6 .floatingContainer",
			description: "avatar drive entries",
			opacity: defaultOpacity,
			css: `.mpDriveEntryName::after {
                      width: 0px;
                 }
                 .mpDriveEntry:nth-child(2n) {
                     background-color: rgba(27, 27, 27, 0.6) !important;
                 }
                 `
		},
		{
		    selector: "#mpAvatarDriveContainer",
			description: "dots in game lobby",
			opacity: defaultOpacity
		},
		{
		    selector: ".qpAvatarImgContainer",
			description: "backgound of avatar image in quiz",
			css: `.qpAvatarImgContainer {
                       box-shadow:none;
                   }`
		},
		{
		    selector: "#gameChatPage > .col-xs-9",
			description: "quiz main screen"
		},
		{
            selector: "#gameChatContainer, .gcInputContainer, .gcList > li:nth-child(2n)",
			description: "quiz chat",
			opacity: defaultOpacity
		},
		{
            selector: ".rbRoom, .rbrRoomImageContainer",
			description: "rooms to choose",
			opacity: defaultOpacity,
			css: `.rbrRoomImageContainer {
                      background-color: transparent !important;
                  }`
		},
		{
            selector: "#mainMenuSocailButton",
		    description: "friends/social button (bottom left)"
		},
		{
            selector: "#avatarUserImgContainer",
		    description: "avatar background (bottom right)"
		},
		{
            selector: ".topMenuBar",
		    description: "top menu"
		},
		{
		    selector: ".awSkinPreviewButtom, .awSkinPreview",
			description: "unlock/change avatar preview"
		},
		{
		    selector: "#footerMenuBarBackground, #rightMenuBarPartContainer::before, [id='3YearCelebrationContainer'], #xpBarOuter",
			description: "bottom menu",
			opacity: 0.3
		},
		{
		    selector: "#mpPlayButton",
			description: "play button main screen",
			opacity: defaultOpacity
		},
		{
		    selector: "#mpExpandButton",
			description: "expand button main screen",
			opacity: defaultOpacity
		},
		{
		    selector: "#mpRankedButton",
			description: "expand button main screen",
			opacity: defaultOpacity
		},
		{
		    selector: "#mpLeaderboardButton",
			description: "expand button main screen",
			opacity: defaultOpacity
		},
		{
		    selector: "#mpAvatarDriveContainer, #mpAvatarDriveHeaderShadowHider .floatingContainer",
			description: "avatar drive container main screen",
			opacity: defaultOpacity
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
			opacity: defaultOpacity
		},
		{
		    selector: "#mpNewSocailTab .leftRightButtonTop, #mpPatreonContainer, .startPageSocailIcon",
			description: "main menu black backgrounds near news",
			opacity: defaultOpacity
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
			opacity: defaultOpacity
		},
		{
		    selector: ".qpAvatarInfoContainer > div, .qpAvatarAnswerContainer",
			description: "name/guess near avatar image in quiz",
			opacity: defaultOpacity,
			css: `.qpAvatarInfoContainer > div {
                      box-shadow:none;
                  }`
		},
		{
		    selector: "#qpInfoHider, .col-xs-6 + .col-xs-3 .container.qpSideContainer.floatingContainer, .col-xs-3 .qpSingleRateContainer",
			description: "song info in quiz",
			opacity: defaultOpacity
		},
		{
		    selector: "#qpAnimeNameHider, .qpAnimeNameContainer, #qpCounter",
			description: "anime name answer top menu in quiz",
			opacity: defaultOpacity
		},
		{
		    selector: "#qpVideoHider, #qpVideoOverflowContainer",
			description: "video counter/sound only background",
			opacity: defaultOpacity
		},
		{
		    selector: "#socailTabFooter > .selected, #socialTab",
			description: "friends online menu",
			opacity: defaultOpacity
		},
		{
		    selector: ".lobbyAvatarTextContainer",
			description: "username/level text lobby",
			opacity: defaultOpacity
		},
		{
		    selector: "#startPageCenter",
			description: "login screen",
			opacity: defaultOpacity
		},
		{
		    selector: "#startPageLogoContainer",
			description: "login screen logo",
			opacity: defaultOpacity
		}
	]
}

let transparents = options.transparent.filter(opt => opt.enabled !== false);

function changeBackground() {
    this.index = ((this.index || 0) + 1) % options.images.length;
	document.documentElement.style.setProperty('--url', `url("${options.images[this.index]}")`);
}

let template = $(`<div id="custom-background"></div>`);


if (options.video.enabled) {
	template.append(`<video autoplay loop muted><source src="${options.video.url}"></video>`);
	options.images = [""];
}

$("#mainContainer").append(template);

function extend (func, method, ext) {
    let old = (func.fn ? func.fn : func.prototype)[method];
	func.prototype[method] = function () {
	    let result = old.apply(this, Array.from(arguments));
		ext.apply(this, Array.from(arguments));
		return result;
	}
}

let loggedIn = window.QuizInfoContainer != null;

if (loggedIn) {//we are logged in
	extend(QuizInfoContainer, "showContent", function () {
		$("#qpInfoHider").prevAll().css("visibility", "visible");
		$("#qpAnimeNameContainer").css("visibility", "visible");
	});

	extend(QuizInfoContainer, "hideContent", function () {
		$("#qpInfoHider").prevAll().css("visibility", "hidden");
		$("#qpAnimeNameContainer").css("visibility", "hidden");
	});

	extend(VideoOverlay, "show", function () {
		this.$hider.siblings().css("visibility", "hidden");
	});

	extend(VideoOverlay, "hide", function () {
		this.$hider.siblings().css("visibility", "visible");
	});


	extend(VideoOverlay, "showWaitingBuffering", function () {
		this.$bufferingScreen.siblings().css("visibility", "hidden");
	});

	extend(VideoOverlay, "hideWaitingBuffering", function () {
		this.$bufferingScreen.siblings().css("visibility", "visible");
	});

	extend(StoreWindow, "toggle", function () {
		if (this.open) {
			$("#custom-background").css("z-index", 10);
			$("#storeWindow").css("z-index", 11);
		} else {
			$("#custom-background").css("z-index", -1);
			$("#storeWindow").css("z-index", -1);
		}
	});



	let loadingScreenStateChange = function () {
	    if ($(this).attr("id") == "loadingScreen") {
		    if ($(this).hasClass("hidden")) {
			    $("#custom-background").css("z-index", -1);
			} else {
			    $("#custom-background").css("z-index", 10);
			}
		}
	}

	extend($, "addClass", loadingScreenStateChange);
	extend($, "removeClass", loadingScreenStateChange);
}

GM_addStyle(`

:root {
  --url: url("${options.images[0]}");
}

${transparents.map(obj => `
    ${obj.selector} {
        background-color: rgba(${obj.color || "27, 27, 27"}, ${obj.opacity || 0}) !important;
        background-image: none !important;
    }
    ${obj.css || ''}
`).join('\n')}


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

#custom-background {
    position: absolute;
    left: 0%;
    top: 0%;
    /* The following will size the video to fit the full container. Not necessary, just nice.*/
    min-width: 100%;
    min-height: 100%;
    /*
    left: 50%;
    top: 50%;
    -webkit-transform: translate(-50%,-50%);
    -moz-transform: translate(-50%,-50%);
    -ms-transform: translate(-50%,-50%);
    transform: translate(-50%,-50%);*/
    z-index: ${loggedIn ? 5 : -1};
    filter: ${options.video.filter};
    will-change: contents;
    background-image: var(--url) !important;
    background-size: 100% auto !important;
    background-attachment: fixed !important;
    background-position: 0px !important;
}

#custom-background video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
}

#mainContainer > *, #awMainView, #storeWindow, #startPage, #loadingScreen {
    background: none;
}

`);

