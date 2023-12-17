// ==UserScript==
// @name         AMQ Replay
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Lets you record game events and then replay them
// @author       Juvian
// @match        https://animemusicquiz.com/*
// @grant        none
// @require      https://github.com/joske2865/AMQ-Scripts/raw/master/common/amqScriptInfo.js
// ==/UserScript==

/*
Usage
1) Login to amq
2) run let recorder = new ReplayStorage(); recorder.start();
3) join a room, spectate a game, host one or whatever
4) stop recording
5) recorder.stop(); localStorage.recording = recorder.export();
6) emulate a stored game from main screen
7) run if (window.emulator === undefined) emulator = new ServerEmulator(); emulator.start(JSON.parse(localStorage.recording));

To only replay songs which you failed, replace 7) with: if (window.emulator === undefined) emulator = new ServerEmulator(); emulator.start(new GameParser(JSON.parse(localStorage.recording)).onlyFailedSongs());
*/

const version = "1.2";

//dont store these in replay
const globalIgnore = new Set(["online player count change", "Room Change", "New Rooms", "ping", "pong", "start game", "get all song names"]);

class ReplayStorage {
    constructor() {
        this.listener = socket._socket.on("command", this.onCommand.bind(this)); // intercept all commands
        this.messages = [];
        this.running = false;
    }

    onCommand({ command, data }) {
        if (this.running && this.shouldStore(command)) {
            let toSave = { command, time: new Date().getTime(), data };
            this.messages.push(JSON.parse(JSON.stringify(toSave)));
        }

        if (command == "get all song names") { // this makes replays too big, just store in localStorage (requesting while viewing replay is not possible, amq doesnt give you list if not in a real game)
            localStorage[command] = JSON.stringify(data);
        }
    }

    shouldStore(command) {
        return !globalIgnore.has(command);
    }

    start() {
        this.running = true;
        this.messages.push({ event: "record", time: new Date().getTime() })
    }

    stop() {
        this.running = false;
        this.messages.push({ event: "stop", time: new Date().getTime() })
    }

    export() {
        return JSON.stringify(this.messages);
    }
}

class ServerEmulator {
    constructor() {
        if (!ServerEmulator.oldEmit) {
            ServerEmulator.oldEmit = io.Socket.prototype.emit;
            ServerEmulator.oldGetVideoUrl = MoeVideoPlayer.prototype.getVideoUrl;
        }

        this.running = false;
        this.logging = true;
    }

    emit(command, data) {
        this.log("emit", command, data);

        if (this.running && command == 'command' && this.shouldMock(data.command, data.data)) { // dont bother server in our fake game
            this.handle(data.command, data.data);
            this.log("mocked");
        } else {
            ServerEmulator.oldEmit.call(socket._socket, command, data);
        }
    }

    handle(command, data) {
        if (command == "get all song names") {
            this.fire(command, JSON.parse(localStorage[command]))
        }
    }

    shouldMock(command, data) {
        return !globalIgnore.has(command) || command == "get all song names";
    }

    serverEmit(command, data) {
        this.log(command, data);

        if (command == "Spectate Game") {
            roomBrowser.fireSpectateGame();
        } else if (command == "Host Game") {
            lobby.setupLobby(data, false);
            viewChanger.changeView("lobby");
        } else if (command == "get all song names") {
            quiz.answerInput.updateAutocomplete();
            return;
        } else if (command == "Join Game") {
            roomBrowser.joinLobby(data, false);
        } else if (command == "quiz next video info") { // need to replace song url to real one because amq one will stop working after a while
            const song = this.parser.songs.find(s => s.info.data == data);
            if (song) data.videoInfo.videoMap = song.result.data.songInfo.urlMap;
        }

        this.fire(command, data);

    }

    start(messages) {
        io.Socket.prototype.emit = this.emit.bind(this);
        MoeVideoPlayer.prototype.getVideoUrl = this.getVideoUrl;
        this.messages = messages;
        this.running = true;
        this.current = 0;
        this.parser = new GameParser(messages);
        this.replayMessage();
    }

    getVideoUrl() {
        return this.getNextVideoId();
    }

    stop() {
        this.running = false;
        if (this.messageTimeout) clearInterval(this.messageTimeout);
        io.Socket.prototype.emit = ServerEmulator.oldEmit;
        MoeVideoPlayer.prototype.getVideoUrl = ServerEmulator.oldGetVideoUrl;
    }

    fire(command, data) {
        (socket.listners[command] || []).slice(0).forEach(l => l.fire(data));
    }

    replayMessage() {
        if (this.current < this.messages.length) {
            const message = this.messages[this.current];
            let diff = this.current + 1 < this.messages.length ? this.messages[this.current + 1].time - this.messages[this.current].time : null;

            this.current++;
            if (message.event == "record") {
                diff = 0;
            } else if (message.event == "stop") {
                diff = 0;
            } else {
                this.serverEmit(message.command, message.data);
            }

            if (diff != null) this.messageTimeout = setTimeout(this.replayMessage.bind(this), diff);
        } else {
            this.stop();
            this.done();
        }
    }

    done() {
        this.log("replay done");
    }

    log() {
        if (this.logging) console.log.apply(null, Array.from(arguments));
    }
}

class GameParser {
    constructor(messages) {
        this.messages = messages;
        this.parse();
    }

    parse() {
        this.players = {};
        this.songs = [];

        let currentSong;

        for (const message of this.messages) {
            const idx = message.command == 'quiz next video info' ? (currentSong == null ? 0 : currentSong + 1) : currentSong;

            if (message.command == 'quiz end result') {
                break;
            } else if (message.command == 'Game Starting') {
                this.gameStart = message.data;
                for (const player of message.data.players) {
                    this.players[player.name] = player;
                }
            } else if (message.command == 'quiz next video info') {
                this.songs[idx] = {info: message};
            } else if (message.command == 'quiz ready') {
                this.numberOfSongs = message.data.numberOfSongs;
            } else if (message.command == 'play next song') {
                currentSong = message.data.songNumber - 1;
                this.songs[currentSong].play = message;
            } else if (message.command == 'answer results') {
                this.songs[currentSong].result = message;
            }

            if (idx == null) continue;

            this.songs[idx].messages = this.songs[idx].messages || [];
            this.songs[idx].messages.push(message);
        }
    }

    onlyFailedSongs(playerName) {
        playerName = playerName || selfName;

        const failedSongs = this.songs.filter(s => s.result.data.players.some(p => p.gamePlayerId == this.players[playerName].gamePlayerId && !p.correct));

        return this.filterBySongs(failedSongs);
    }

    filterBySongs(songs) {
        const messages = [];
        const references = this.songReferences(songs);
        const allReferences = this.songReferences(this.songs);

        for (const message of this.messages) {
            if (allReferences.has(message) && !references.has(message)) {
                message.time = messages[messages.length - 1].time + 1;
            }
            messages.push(message);
        }

        return messages;
    }


    songReferences(songs) {
        const references = new Set();

        for (const song of songs) {
            for (const message of song.messages) references.add(message);
        }

        return references;
    }
}

AMQ_addScriptData({
	name: "Replay",
	author: "Juvian",
	version: version,
	link: "https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqReplay.user.js",
	description: `
		<ul><b>Usage</b>
			<li>1) Login to amq</li>
			<li>2) run let recorder = new ReplayStorage(); recorder.start();</li>
			<li>3) join a room, spectate a game, host one or whatever</li>
			<li>4) stop recording</li>
			<li>5) recorder.stop(); localStorage.recording = recorder.export();</li>
			<li>6) emulate a stored game from main screen</li>
			<li>7) run if (window.emulator === undefined) emulator = new ServerEmulator(); emulator.start(JSON.parse(localStorage.recording));</li>
		</ul>
	`
})

window.ReplayStorage = ReplayStorage;
window.ServerEmulator = ServerEmulator;
window.GameParser = GameParser;