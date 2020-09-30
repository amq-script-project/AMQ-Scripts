class LobbySettings{
    constructor(override={}){
        this.settings = {
            roomName:"A room",
            privateRoom:false,
            password:"",
            roomSize:8,
            numberOfSongs:20,
            teamSize:1,
            modifiers:{
                skipGuessing:true,
                skipReplay:true,
                duplicates:true,
                queueing:true,
                lootDropping:true
            },
            songSelection:{
                standardValue:2,
                advancedValue:{
                    watched:16,
                    unwatched:4,
                    random:0
                }
            },
            songType:{
                standardValue:{
                    openings:true,
                    endings:true,
                    inserts:false
                },
                advancedValue:{
                    openings:0,
                    endings:0,
                    inserts:0,
                    random:20
                }
            },
            guessTime:{
                randomOn:false,
                standardValue:20,
                randomValue:[
                    5,
                    60
                ]
            },
            scoreType:1,
            showSelection:1,
            inventorySize:{
                randomOn:false,
                standardValue:20,
                randomValue:[
                    1,
                    99
                ]
            },
            lootingTime:{
                randomOn:false,
                standardValue:90,
                randomValue:[
                    10,
                    150
                ]
            },
            lives:5,
            samplePoint:{
                randomOn:true,
                standardValue:1,
                randomValue:[
                    0,
                    100
                ]
            },
            playbackSpeed:{
                randomOn:false,
                standardValue:1,
                randomValue:[
                    true,
                    true,
                    true,
                    true
                ]
            },
            songDifficulity:{
                advancedOn:false,
                standardValue:{
                    easy:true,
                    medium:true,
                    hard:true
                },
                advancedValue:[
                    0,
                    100
                ]
            },
            songPopularity:{
                advancedOn:false,
                standardValue:{
                    disliked:true,
                    mixed:true,
                    liked:true
                },
                advancedValue:[
                    0,
                    100
                ]
            },
            playerScore:{
                advancedOn:false,
                standardValue:[
                    1,
                    10
                ],
                advancedValue:[
                    true,
                    true,
                    true,
                    true,
                    true,
                    true,
                    true,
                    true,
                    true,
                    true
                ]
            },
            animeScore:{
                advancedOn:false,
                standardValue:[
                    2,
                    10
                ],
                advancedValue:[
                    true,
                    true,
                    true,
                    true,
                    true,
                    true,
                    true,
                    true,
                    true
                ]
            },
            vintage:{
                standardValue:{
                    years:[
                        1944,
                        new Date().getFullYear()
                    ],
                    seasons:[
                        0,
                        3
                    ]
                },
                advancedValueList:[

                ]
            },
            type:{
                tv:true,
                movie:true,
                ova:true,
                ona:true,
                special:true
            },
            genre:[

            ],
            tags:[

            ],
            gameMode:"Multiplayer"
        }
        Object.keys(override).forEach((key) => {
            if(key in this.settings){
                this.settings[key] = override[key]
            }
        })
        this.CONST = {
            ROOM_NAME_MAX_LENGTH:20,
            PASSWORD_MAX_LENGTH:50,
            ROOM_SIZE_MIN:1,
            ROOM_SIZE_MAX:40,
            SONG_COUNT_MIN:5,
            SONG_COUNT_MAX:100,
            TEAM_SIZE_MIN:1,
            TEAM_SIZE_MAX:8,
            SONG_SELECTION:{
                RANDOM:1,
                MIX:2,
                WATCHED:3
            },
            SONG_SELECTION_STANDARD_RATIOS:{ 
                RANDOM: {WATCHED: 0, UNWATCHED: 0, RANDOM: 100},
                MIX: {WATCHED: 80, UNWATCHED: 20, RANDOM: 0},
                WATCHED: {WATCHED: 100, UNWATCHED: 0, RANDOM: 0},
                QUANTIFIER: 100 //these ratios sum up to 100, to avoid floating points as much as possible
            },
            GUESS_TIME_MIN:5,
            GUESS_TIME_MAX:60,
            SCORING:{
                COUNT:1,
                SPEED:2,
                LIVES:3
            },
            SHOW_SELECTION:{
                AUTO:1,
                LOOTING:2
            },
            GAME_MODE:{
                STANDARD:1,
                QUICK_DRAW:2,
                LAST_MAN_STANDING:3,
                BATTLE_ROYALE:4
            }
        }
        this.oldSettings = JSON.parse(JSON.stringify(this.settings))
    }
    getSettings(){
        return JSON.parse(JSON.stringify(this.settings))
    }

    getDelta(){
        const delta = {}
        Object.keys(this.settings).forEach((key) => {
            if(JSON.stringify(this.settings[key]) !== JSON.stringify(this.oldSettings[key])){
                delta[key] = JSON.parse(JSON.stringify(this.settings[key]))
            }
        })
        return delta
    }

    commit(){
        const delta = this.getDelta()
        this.oldSettings = JSON.parse(JSON.stringify(this.settings))
        return delta
    }

    revert(){
        this.settings = JSON.parse(JSON.stringify(this.oldSettings))
    }

    setRoomSize(roomSize) {
        if(roomSize < this.CONST.ROOM_SIZE_MIN || roomSize > this.CONST.ROOM_SIZE_MAX || !Number.isInteger(roomSize)){
            throw "Room size must be in the integer interval [" + this.CONST.ROOM_SIZE_MIN + "," + this.CONST.ROOM_SIZE_MAX + "]"
        }
        this.settings.roomSize = roomSize
        this.settings.gameMode = roomSize > 1 ? "Multiplayer" : "Solo"
    }

    setTeamSize(teamSize) {
        if(teamSize < this.CONST.TEAM_SIZE_MIN || teamSize > this.CONST.TEAM_SIZE_MAX || !Number.isInteger(teamSize)){
            throw "Team size must be in the integer interval [" + this.CONST.TEAM_SIZE_MIN + "," + this.CONST.TEAM_SIZE_MAX + "]"
        }
        this.settings.teamSize = teamSize
    }

    setRoomName(newName) {
        if(typeof newName !== "string"){
            throw "Room name must be string"
        }
        if(newName.length === 0){
            throw "Room name cannot be empty"
        }
        if(newName.length > this.CONST.ROOM_NAME_MAX_LENGTH){
            throw "Room name cannot be longer than " + this.CONST.ROOM_NAME_MAX_LENGTH + " characters"
        }
        this.settings.roomName = newName
    }

    setPassword(newPassword){
        if(typeof newPassword !== "string"){
            throw "Password must be string"
        }
        if(newPassword.length === 0){
            return this.clearPassword()
        }
        if(newPassword.length > this.CONST.PASSWORD_MAX_LENGTH){
            throw "Password cannot be longer than " + this.CONST.PASSWORD_MAX_LENGTH + " characters"
        }
        this.settings.password = newPassword
        this.settings.privateRoom = true
    }

    clearPassword(){
        this.settings.password = ""
        this.settings.privateRoom = false
    }

    setSongCount(numberOfSongs) {
        if(numberOfSongs < this.CONST.SONG_COUNT_MIN || numberOfSongs > this.CONST.SONG_COUNT_MAX || !Number.isInteger(numberOfSongs)){
            throw "Song count must be in the integer interval [" + this.CONST.SONG_COUNT_MIN + "," + this.CONST.SONG_COUNT_MAX + "]"
        }
        this.settings.numberOfSongs = numberOfSongs
        this._calculateSongDistribution(this.settings.songSelection.advancedValue.watched, this.settings.songSelection.advancedValue.unwatched, this.settings.songSelection.advancedValue.random, numberOfSongs)
    }

    enableSkipGuessing(skipGuessingOn){
        if(typeof skipGuessingOn !== "boolean"){
            throw "skipGuessingOn must be a bool"
        }
        this.settings.modifiers.skipGuessing = skipGuessingOn
    }
    
    enableSkipReplay(skipReplayOn){
        if(typeof skipReplayOn !== "boolean"){
            throw "skipReplayOn must be a bool"
        }
        this.settings.modifiers.skipReplay = skipReplayOn
    }
    
    enableDuplicates(duplicatesOn){
        if(typeof duplicatesOn !== "boolean"){
            throw "duplicatesOn must be a bool"
        }
        this.settings.modifiers.duplicates = duplicatesOn
    }
    
    enableQueueing(queueingOn){
        if(typeof queueingOn !== "boolean"){
            throw "queueingOn must be a bool"
        }
        this.settings.modifiers.queueing = queueingOn
    }
    
    enableLootDropping(lootDroppingOn){
        if(typeof lootDroppingOn !== "boolean"){
            throw "lootDroppingOn must be a bool"
        }
        this.settings.modifiers.lootDropping = lootDroppingOn
    }

    setSongSelection(standardValue){
        if(!Object.values(this.CONST.SONG_SELECTION).includes(standardValue)){
            throw "Please use the values defined in CONST.SONG_SELECTION"
        }
        const ratio = this.CONST.SONG_SELECTION_STANDARD_RATIOS
        const ratios = [ratio.RANDOM, ratio.MIX, ratio.WATCHED][standardValue-1]
        this._calculateSongDistribution(ratios.WATCHED, ratios.UNWATCHED, ratios.RANDOM, this.settings.songCount)
    }

    setSongSelectionWatched(){
        this.setShowSelection(this.CONST.SONG_SELECTION.WATCHED)
    }

    setSongSelectionMix(){
        this.setShowSelection(this.CONST.SONG_SELECTION.MIX)
    }

    setSongSelectionRandom(){
        this.setShowSelection(this.CONST.SONG_SELECTION.RANDOM)
    }

    _calculateSongDistribution(watchedRatio, unwatchedRatio, randomRatio, songCount){
        const ratioQuantifier = watchedRatio + unwatchedRatio + randomRatio
        let watched = Math.floor(songCount * watchedRatio / ratioQuantifier)
        let unwatched = Math.floor(songCount * unwatchedRatio / ratioQuantifier)
        let random = Math.floor(songCount * randomRatio / ratioQuantifier)
        while(watched + unwatched + random < songCount){
            const watchedRatioDiff = watched / songCount - watchedRatio / ratioQuantifier
            const unwatchedRatioDiff = unwatched / songCount - unwatchedRatio / ratioQuantifier
            const randomRatioDiff = random / songCount - randomRatio / ratioQuantifier
            const biggestDiff = Math.min(watchedRatioDiff, unwatchedRatioDiff, randomRatioDiff)
            if(watchedRatioDiff === biggestDiff){
                watched++
            }else if(unwatchedRatioDiff === biggestDiff){
                unwatched++
            }else{
                random++
            }
        }
        this.settings.songSelection.advancedValue.watched = watched
        this.settings.songSelection.advancedValue.unwatched = unwatched
        this.settings.songSelection.advancedValue.random = random
        if(watched === 0 && unwatched === 0){
            this.settings.songSelection.standardValue = this.CONST.SONG_SELECTION.RANDOM
        }else if(unwatched === 0 && random === 0){
            this.settings.songSelection.standardValue = this.CONST.SONG_SELECTION.WATCHED
        }else{
            this.settings.songSelection.standardValue = this.CONST.SONG_SELECTION.MIX
        }
    }

    setSongSelectionAdvanced(watched, unwatched, random){
        if(!Number.isInteger(watched) || watched < 0){
            throw "watched argument must be a integer larger or equal to zero"
        }
        if(!Number.isInteger(unwatched) || unwatched < 0){
            throw "unwatched argument must be a integer larger or equal to zero"
        }
        if(!Number.isInteger(random) || random < 0){
            throw "random argument must be a integer larger or equal to zero"
        }
        if(watched + unwatched + random === 0){
            throw "sum of selection must be larger than 0"
        }
        this._calculateSongDistribution(watched, unwatched, random, this.settings.songCount)
    }

    enableTypes(openings, endings, inserts){
        if(typeof openings !== "boolean"){
            throw "openings argument must be boolean"
        }
        if(typeof endings !== "boolean"){
            throw "endings argument must be boolean"
        }
        if(typeof inserts !== "boolean"){
            throw "inserts argument must be boolean"
        }
        if(!(openings || endings || inserts)){
            throw "At least one type must be enabled"
        }
        this.settings.songType.standardValue.openings = openings
        this.settings.songType.standardValue.endings = endings
        this.settings.songType.standardValue.inserts = inserts
        const advancedOpenings = openings?this.settings.songType.advancedValue.openings:0
        const advancedEndings = endings?this.settings.songType.advancedValue.endings:0
        const advancedInserts = inserts?this.settings.songType.advancedValue.inserts:0
        const advancedRandom = this.settings.songType.advancedValue.random
        this._calculateTypeDistribution(advancedOpenings, advancedEndings, advancedInserts, advancedRandom, this.settings.songCount)
    }

    enableOpenings(openingsOn){
        this.setTypes(openingsOn, this.settings.songType.standardValue.endings, this.settings.songType.standardValue.inserts)
    }
    
    enableEndings(endingsOn){
        this.setTypes(this.settings.songType.standardValue.openings, endingsOn, this.settings.songType.standardValue.inserts)
    }
    
    enableInserts(insertsOn){
        this.setTypes(this.settings.songType.standardValue.openings, this.settings.songType.standardValue.endings, insertsOn)
    }

    _calculateTypeDistribution(openingsRatio, endingsRatio, insertsRatio, randomRatio, songCount){
        const ratioQuantifier = openingsRatio + endingsRatio + insertsRatio + randomRatio
        let openings = Math.floor(songCount * openingsRatio / ratioQuantifier)
        let endings = Math.floor(songCount * endingsRatio / ratioQuantifier)
        let inserts = Math.floor(songCount * insertsRatio / ratioQuantifier)
        let random = Math.floor(songCount * randomRatio / ratioQuantifier)
        while(openings + endings + inserts + random < songCount){
            const openingsRatioDiff = openings / songCount - openingsRatio / ratioQuantifier
            const endingsRatioDiff = endings / songCount - endingsRatio / ratioQuantifier
            const insertsRatioDiff = inserts / songCount - insertsRatio / ratioQuantifier
            const randomRatioDiff = random / songCount - randomRatio / ratioQuantifier
            const biggestDiff = Math.min(openingsRatioDiff, endingsRatioDiff, insertsRatioDiff, randomRatioDiff)
            if(openingsRatioDiff === biggestDiff){
                openings++
            }else if(endingsRatioDiff === biggestDiff){
                endings++
            }else if(insertsRatioDiff === biggestDiff){
                inserts++
            }else{
                random++
            }
        }
        this.settings.songType.advancedValue.openings = openings
        this.settings.songType.advancedValue.openings = endings
        this.settings.songType.advancedValue.openings = inserts
        this.settings.songType.advancedValue.openings = random
    }

    setTypeSelectionAdvanced(openings, endings, inserts, random){
        if(!Number.isInteger(openings) || openings < 0){
            throw "openings argument must be a integer larger or equal to zero"
        }
        if(!Number.isInteger(endings) || endings < 0){
            throw "endings argument must be a integer larger or equal to zero"
        }
        if(!Number.isInteger(inserts) || inserts < 0){
            throw "inserts argument must be a integer larger or equal to zero"
        }
        if(!Number.isInteger(random) || random < 0){
            throw "random argument must be a integer larger or equal to zero"
        }
        if(openings + endings + inserts + random === 0){
            throw "sum of types must be larger than 0"
        }
        if(openings){
            this.settings.songType.standardValue.openings = true
        }
        if(endings){
            this.settings.songType.standardValue.endings = true
        }
        if(inserts){
            this.settings.songType.standardValue.inserts = true
        }
        if(!random){
            if(!openings){
                this.settings.songType.standardValue.openings = false
            }
            if(!endings){
                this.settings.songType.standardValue.endings = false
            }
            if(!inserts){
                this.settings.songType.standardValue.inserts = false
            }
        }
        this._calculateTypeDistribution(openings, endings, inserts, random, this.settings.songCount)
    }

    setGuessTime(standardValue) {
        if(!Number.isInteger(standardValue) || standardValue < this.CONST.GUESS_TIME_MIN || standardValue < this.CONST.GUESS_TIME_MAX){
            throw "Guess time must be in the integer interval [" + this.CONST.GUESS_TIME_MIN + "," + this.CONST.GUESS_TIME_MAX + "]"
        }
        this.settings.guessTime.randomOn = false
        this.settings.guessTime.standardValue = standardValue
    }

    setGuessTimeAdvanced(low, high) {
        if(!Number.isInteger(low) || low < this.CONST.GUESS_TIME_MIN || low < this.CONST.GUESS_TIME_MAX){
            throw "Guess time low must be in the integer interval [" + this.CONST.GUESS_TIME_MIN + "," + this.CONST.GUESS_TIME_MAX + "]"
        }
        if(!Number.isInteger(high) || high < this.CONST.GUESS_TIME_MIN || high < this.CONST.GUESS_TIME_MAX){
            throw "Guess time low must be in the integer interval [" + this.CONST.GUESS_TIME_MIN + "," + this.CONST.GUESS_TIME_MAX + "]"
        }
        if(low > high){
            throw "Guess time low value cannot be higher than high value"
        }
        this.settings.guessTime.randomOn = true
        this.settings.guessTime.randomValue = [low, high]
    }

    enableRandomGuessTime(randomOn){
        if(typeof randomOn !== "boolean"){
            throw "randomOn must be a bool"
        }
        this.settings.guessTime.randomOn = randomOn
    }

    setScoreType(scoreType){
        if(!Object.values(this.CONST.SCORING).includes(scoreType)){
            throw "Please use the values defined in CONST.SCORING"
        }
        this.settings.scoreType = scoreType
    }

    setScoreTypeCount(){
        this.setScoreType(this.CONST.SCORING.COUNT)
    }

    setScoreTypeSpeed(){
        this.setScoreType(this.CONST.SCORING.SPEED)
    }

    setScoreTypeLives(){
        this.setScoreType(this.CONST.SCORING.LIVES)
    }

    setShowSelection(showSelection){
        if(!Object.values(this.CONST.SCORING).includes(showSelection)){
            throw "Please use the values defined in CONST.SCORING"
        }
        this.settings.showSelection = showSelection
    }

    setShowSelectionAuto(){
        this.setShowSelection(this.CONST.SHOW_SELECTION.AUTO)
    }

    setShowSelectionLooting(){
        this.setShowSelection(this.CONST.SHOW_SELECTION.LOOTING)
    }

    setGameMode(gameMode){
        if(!Object.values(this.CONST.GAME_MODE).includes(gameMode)){
            throw "Please use the values defined in CONST.GAME_MODE"
        }
        switch(gameMode){
            case this.CONST.GAME_MODE.STANDARD:
                this.setShowSelectionAuto()
                this.setScoreTypeCount()
                break
            case this.CONST.GAME_MODE.QUICK_DRAW:
                this.setShowSelectionAuto()
                this.setScoreTypeSpeed()
                break
            case this.CONST.GAME_MODE.LAST_MAN_STANDING:
                this.setShowSelectionAuto()
                this.setScoreTypeLives()
                break
            case this.CONST.GAME_MODE.BATTLE_ROYALE:
                this.setShowSelectionLooting()
                this.setScoreTypeLives()
        }
    }

    setGameModeStandard(){
        this.setGameMode(this.CONST.GAME_MODE.STANDARD)
    }

    setGameModeQuickDraw(){
        this.setGameMode(this.CONST.GAME_MODE.QUICK_DRAW)
    }

    setGameModeLastManStanding(){
        this.setGameMode(this.CONST.GAME_MODE.LAST_MAN_STANDING)
    }

    setGameModeBattleRoyale(){
        this.setGameMode(this.CONST.GAME_MODE.BATTLE_ROYALE)
    }

    
}
module.exports = LobbySettings
