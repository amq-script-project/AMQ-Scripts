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
            songDifficulity:{ // sic
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
        this.oldSettings = JSON.parse(JSON.stringify(this.settings))
    }

    static validate(settings){
        const dummy = new this()
        dummy.setRoomName(settings.roomName)
        if(settings.privateRoom && !settings.password){
            throw "privateRoom without password"
        }
        dummy.setPassword(settings.password)
        dummy.setRoomSize(settings.roomSize)
        dummy.setSongCount(settings.numberOfSongs)
        dummy.setTeamSize(settings.teamSize) //game does not care if team size exceeds room size
        dummy.enableSkipGuessing(settings.modifiers.skipGuessing)
        dummy.enableSkipReplay(settings.modifiers.skipReplay)
        dummy.enableDuplicates(settings.modifiers.duplicates)
        dummy.enableQueueing(settings.modifiers.queueing)
        dummy.enableLootDropping(settings.modifiers.lootDropping)
        { //songSelection
            const sss = settings.songSelection.standardValue
            const ssa = settings.songSelection.advancedValue
            dummy.setSongSelection(sss)
            if(ssa.watched+ssa.unwatched+ssa.random !== settings.numberOfSongs){
                throw "song selection count mismatch"
            }
            if((ssa.unwatched || (ssa.watched && ssa.random)) && sss !== this.CONST.SONG_SELECTION.MIXED){
                throw "song selection mixed distribution, but not mixed standardvalue"
            }else if(ssa.watched && sss !== this.CONST.SONG_SELECTION.WATCHED){
                throw "song selection watched distribution, but not watched standardvalue"
            }else if(sss !== this.CONST.SONG_SELECTION.RANDOM){
                throw "song selection random distribution, but not random standardvalue"
            }
            dummy.setSongSelectionAdvanced(ssa.watched, ssa.unwatched, ssa.random)
        }
        { //songType
            const sts = settings.songType.standardValue
            const sta = settings.songType.advancedValue
            dummy.enableSongTypes(sts.openings, sts.endings, sts.inserts)
            dummy.setSongTypeSelectionAdvanced(sta.openings, sta.endings, sta.inserts, sta.random)
            if(!sts.openings && Boolean(sta.openings)){
                throw "openings disabled but openings count has non-zero value"
            }
            if(!sts.endings && Boolean(sta.endings)){
                throw "endings disabled but endings count has non-zero value"
            }
            if(!sts.inserts && Boolean(sta.inserts)){
                throw "inserts disabled but inserts count has non-zero value"
            }
            if(sta.openings+sta.endings+sta.inserts+sta.random !== settings.numberOfSongs){
                throw "song type selection count mismatch"
            }
            if(sts.openings === undefined){
                throw "openings can not be undefined"
            }
            if(sts.endings === undefined){
                throw "endings can not be undefined"
            }
            if(sts.inserts === undefined){
                throw "inserts can not be undefined"
            }
        }
        const invalidList = ["a","a","a","a","a","a","a","a","a","a","a","a"] //this is a list to reveal too short lists
        dummy.setGuessTime(settings.guessTime.standardValue)
        dummy.setGuessTimeAdvanced(...settings.guessTime.randomValue, ...invalidList)
        dummy.enableRandomGuessTime(settings.guessTime.randomOn)
        dummy.setScoreType(settings.guessTime.scoreType)
        dummy.setShowSelection(settings.guessTime.showSelection)
        dummy.setInventorySize(settings.inventorySize.standardValue)
        dummy.setInventorySizeAdvanced(...settings.inventorySize.randomValue, ...invalidList)
        dummy.enableRandomInventorySize(settings.inventorySize.randomOn)
        dummy.setLootingTime(settings.lootingTime.standardValue)
        dummy.setLootingTimeAdvanced(...settings.lootingTime.randomValue, ...invalidList)
        dummy.enableRandomLootingTime(settings.lootingTime.randomOn)
        dummy.setLives(settings.lives)
        dummy.setSamplePoint(settings.samplePoint.standardValue)
        dummy.setSamplePointAdvanced(...settings.samplePoint.randomValue, ...invalidList)
        dummy.enableRandomSamplePoint(settings.samplePoint.randomOn)
        dummy.setPlaybackSpeed(settings.playbackSpeed.standardValue)
        dummy.setPlaybackSpeedAdvanced(...settings.playbackSpeed.randomValue, ...invalidList)
        if(settings.playbackSpeed.randomValue.some(entry => entry === undefined)){
            throw "playback speed advanced must not contained undefined variables"
        }
        dummy.enableRandomPlaybackSpeed(settings.playbackSpeed.randomOn)
        dummy.enableSongDifficulty(settings.songDifficulity.standardValue.easy, settings.songDifficulity.standardValue.medium, settings.songDifficulity.standardValue.hard)
        dummy.setSongDifficultyAdvanced(...settings.songDifficulity.advancedValue, ...invalidList)
        dummy.enableSongDifficultyAdvanced(settings.songDifficulity.advancedOn)
        {
            const s = settings.songDifficulity.standardValue
            if(s.easy === undefined){
                throw "easy can not be undefined"
            }
            if(s.medium === undefined){
                throw "medium can not be undefined"
            }
            if(s.hard === undefined){
                throw "hard can not be undefined"
            }
        }
        dummy.enableSongPopularity(settings.songPopularity.standardValue.easy, settings.songPopularity.standardValue.medium, settings.songPopularity.standardValue.hard)
        dummy.setSongPopularityAdvanced(...settings.songPopularity.advancedValue, ...invalidList)
        dummy.enableSongPopularityAdvanced(settings.songPopularity.advancedOn)
        {
            const p = settings.songPopularity.standardValue
            if(p.disliked === undefined){
                throw "disliked can not be undefined"
            }
            if(p.mixed === undefined){
                throw "mixed can not be undefined"
            }
            if(p.liked === undefined){
                throw "liked can not be undefined"
            }
        }
        dummy.setPlayerScore(...settings.playerScore.standardValue, ...invalidList)
        dummy.setPlayerScoreAdvanced(...settings.playerScore.advancedValue, ...invalidList)
        dummy.enablePlayerScoreAdvanced(settings.playerScore.advancedOn)
        if(settings.playerScore.advancedValue.some(entry => entry === undefined)){
            throw "player score advanced must not contained undefined variables"
        }
        dummy.setAnimeScore(...settings.animeScore.standardValue, ...invalidList)
        dummy.setAnimeScoreAdvanced(...settings.animeScore.advancedValue, ...invalidList)
        if(settings.animeScore.advancedValue.some(entry => entry === undefined)){
            throw "anime score advanced must not contained undefined variables"
        }
        dummy.enableAnimeScoreAdvanced(settings.animeScore.advancedOn)
        { //vintage
            const vs = settings.vintage.standardValue
            const va = settings.vintage.advancedValueList
            dummy.setVintage(vs.years[0], vs.years[1], vs.seasons[0], vs.seasons[1])
            va.forEach(entry => {dummy.addVintage(entry.years[0], entry.years[1], entry.seasons[0], entry.seasons[1])})
        }
        { //showtypes
            const t = settings.type
            if(t.tv === undefined){
                throw "tv can not be undefined"
            }
            if(t.movie === undefined){
                throw "movie can not be undefined"
            }
            if(t.ova === undefined){
                throw "ova can not be undefined"
            }
            if(t.ona === undefined){
                throw "ona can not be undefined"
            }
            if(t.special === undefined){
                throw "special can not be undefined"
            }
            dummy.enableShowTypes(t.tv, t.movie, t.ova, t.ona, t.special)
        }
        settings.genre.forEach(entry => {dummy.addGenre(entry.id, entry.state)})
        settings.tags.forEach(entry => {dummy.addTag(entry.id, entry.state)})
    }

    static CONST = {
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
        },
        INVENTORY_SIZE_MIN:1,
        INVENTORY_SIZE_MAX:99,
        LIVES_MIN:1,
        LIVES_MAX:5,
        LOOTING_TIME_MIN:10,
        LOOTING_TIME_MAX:150,
        SAMPLE_POINT:{
            START:1,
            MIDDLE:2,
            END:3
        },
        SAMPLE_POINT_MIN:0,
        SAMPLE_POINT_MAX:100,
        PLAYBACK_SPEED_MIN:1.0,
        PLAYBACK_SPEED_MAX:4.0,
        DIFFICULTY_MIN:0,
        DIFFICULTY_MAX:100,
        POPULARITY_MIN:0,
        POPULARITY_MAX:100,
        PLAYER_SCORE_MIN:1,
        PLAYER_SCORE_MAX:10,
        ANIME_SCORE_MIN:2,
        ANIME_SCORE_MAX:10,
        YEAR_MIN:1944,
        YEAR_MAX:new Date().getFullYear(), //future-proofing
        SEASON:{ //no idea why this particular list is 0-indexed
            WINTER:0,
            SPRING:1,
            SUMMER:2,
            FALL:3
        },
        SEASON_MIN:0,
        SEASON_MAX:3,
        GENRE_STATE:{
            INCLUDE:1,
            EXCLUDE:2,
            OPTIONAL:3,
        },
        TAG_STATE:{
            INCLUDE:1,
            EXCLUDE:2,
            OPTIONAL:3,
        },
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

    enableSongTypes(openings, endings, inserts){
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
            throw "At least one show type must be enabled"
        }
        this.settings.songType.standardValue.openings = openings
        this.settings.songType.standardValue.endings = endings
        this.settings.songType.standardValue.inserts = inserts
        const advancedOpenings = openings?this.settings.songType.advancedValue.openings:0
        const advancedEndings = endings?this.settings.songType.advancedValue.endings:0
        const advancedInserts = inserts?this.settings.songType.advancedValue.inserts:0
        const advancedRandom = this.settings.songType.advancedValue.random
        this._calculateSongTypeDistribution(advancedOpenings, advancedEndings, advancedInserts, advancedRandom, this.settings.songCount)
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

    _calculateSongTypeDistribution(openingsRatio, endingsRatio, insertsRatio, randomRatio, songCount){
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

    setSongTypeSelectionAdvanced(openings, endings, inserts, random){
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
            this.settings.songType.standardValue.openings = Boolean(openings)
            this.settings.songType.standardValue.endings = Boolean(endings)
            this.settings.songType.standardValue.inserts = Boolean(inserts)
        }
        this._calculateSongTypeDistribution(openings, endings, inserts, random, this.settings.songCount)
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
            throw "Guess time high must be in the integer interval [" + this.CONST.GUESS_TIME_MIN + "," + this.CONST.GUESS_TIME_MAX + "]"
        }
        if(low > high){
            throw "Guess time low value cannot be higher than high value"
        }
        this.settings.guessTime.randomOn = true
        this.settings.guessTime.randomValue = [low, high]
    }

    enableRandomGuessTime(randomOn){
        if(typeof randomOn !== "boolean"){
            throw "guessTime.randomOn must be a bool"
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

    setInventorySize(standardValue){
        if(!Number.isInteger(standardValue) || standardValue < this.CONST.INVENTORY_SIZE_MIN || standardValue < this.CONST.INVENTORY_SIZE_MAX){
            throw "Inventory size must be in the integer interval [" + this.CONST.INVENTORY_SIZE_MIN + "," + this.CONST.INVENTORY_SIZE_MAX + "]"
        }
        this.settings.inventorySize.standardValue = standardValue
        this.settings.inventorySize.randomOn = false
    }

    setInventorySizeAdvanced(low, high){
        if(!Number.isInteger(low) || low < this.CONST.INVENTORY_SIZE_MIN || low < this.CONST.INVENTORY_SIZE_MAX){
            throw "Inventory size low must be in the integer interval [" + this.CONST.INVENTORY_SIZE_MIN + "," + this.CONST.INVENTORY_SIZE_MAX + "]"
        }
        if(!Number.isInteger(high) || high < this.CONST.INVENTORY_SIZE_MIN || high < this.CONST.INVENTORY_SIZE_MAX){
            throw "Inventory size high must be in the integer interval [" + this.CONST.INVENTORY_SIZE_MIN + "," + this.CONST.INVENTORY_SIZE_MAX + "]"
        }
        if(low > high){
            throw "Inventory size low value cannot be higher than high value"
        }
        this.settings.inventorySize.randomOn = true
        this.settings.inventorySize.randomValue = [low, high]
    }

    enableRandomInventorySize(randomOn){
        if(typeof randomOn !== "boolean"){
            throw "inventorySize.randomOn must be a bool"
        }
        this.settings.inventorySize.randomOn = randomOn
    }

    setLootingTime(standardValue){
        if(!Number.isInteger(standardValue) || standardValue < this.CONST.LOOTING_TIME_MIN || standardValue < this.CONST.LOOTING_TIME_MAX){
            throw "Looting time must be in the integer interval [" + this.CONST.LOOTING_TIME_MIN + "," + this.CONST.LOOTING_TIME_MAX + "]"
        }
        this.settings.lootingTime.standardValue = standardValue
        this.settings.lootingTime.randomOn = false
    }

    setLootingTimeAdvanced(low, high){
        if(!Number.isInteger(low) || low < this.CONST.LOOTING_TIME_MIN || low < this.CONST.LOOTING_TIME_MAX){
            throw "Looting time low must be in the integer interval [" + this.CONST.LOOTING_TIME_MIN + "," + this.CONST.LOOTING_TIME_MAX + "]"
        }
        if(!Number.isInteger(high) || high < this.CONST.LOOTING_TIME_MIN || high < this.CONST.LOOTING_TIME_MAX){
            throw "Looting time high must be in the integer interval [" + this.CONST.LOOTING_TIME_MIN + "," + this.CONST.LOOTING_TIME_MAX + "]"
        }
        if(low > high){
            throw "Looting time low value cannot be higher than high value"
        }
        this.settings.lootingTime.randomOn = true
        this.settings.lootingTime.randomValue = [low, high]
    }

    enableRandomLootingTime(randomOn){
        if(typeof randomOn !== "boolean"){
            throw "lootingTime.randomOn must be a bool"
        }
        this.settings.lootingTime.randomOn = randomOn
    }

    setLives(count){
        if(!Number.isInteger(count) || count < this.CONST.LIVES_MIN || count < this.CONST.LIVES_MAX){
            throw "Lives count must be in the integer interval [" + this.CONST.LIVES_MIN + "," + this.CONST.LIVES_MAX + "]"
        }
        this.settings.lives = count
    }

    setSamplePoint(position){
        if(!Object.values(this.CONST.GAME_MODE).includes(position)){
            throw "Please use the values defined in CONST.SAMPLE_POINT"
        }
        this.settings.samplePoint.standardValue = position
        this.settings.samplePoint.randomOn = false
    }

    setSamplePointStart(){
        this.setSamplePoint(this.CONST.SAMPLE_POINT.START)
    }
    
    setSamplePointMiddle(){
        this.setSamplePoint(this.CONST.SAMPLE_POINT.MIDDLE)
    }
    
    setSamplePointEnd(){
        this.setSamplePoint(this.CONST.SAMPLE_POINT.END)
    }

    setSamplePointAdvanced(low, high){
        if(!Number.isInteger(low) || low < this.CONST.SAMPLE_POINT_MIN || low < this.CONST.SAMPLE_POINT_MAX){
            throw "Looting time low must be in the integer interval [" + this.CONST.SAMPLE_POINT_MIN + "," + this.CONST.SAMPLE_POINT_MAX + "]"
        }
        if(!Number.isInteger(high) || high < this.CONST.SAMPLE_POINT_MIN || high < this.CONST.SAMPLE_POINT_MAX){
            throw "Looting time high must be in the integer interval [" + this.CONST.SAMPLE_POINT_MIN + "," + this.CONST.SAMPLE_POINT_MAX + "]"
        }
        if(low > high){
            throw "Looting time low value cannot be higher than high value"
        }
        this.settings.samplePoint.randomOn = true
        this.settings.samplePoint.randomValue = [low, high]
    }

    enableRandomSamplePoint(randomOn){
        if(typeof randomOn !== "boolean"){
            throw "samplePoint.randomOn must be a bool"
        }
        this.settings.samplePoint.randomOn = randomOn
    }

    setPlaybackSpeed(multiplier) {
        if(typeof multiplier !== "number" || Number.isNaN(multiplier) || multiplier < this.CONST.PLAYBACK_SPEED_MIN || multiplier > this.CONST.PLAYBACK_SPEED_MAX){
            throw "Playback speed multiplier must be a real number in the interval [" + this.CONST.PLAYBACK_SPEED_MIN + ", " + this.CONST.PLAYBACK_SPEED_MAX + "]"
        }
        this.settings.playbackSpeed.standardValue = multiplier
        this.playbackSpeed.randomOn = false
    }

    setPlaybackSpeedAdvanced(enable1=this.playbackSpeed.randomValue[0], enable1_5=this.playbackSpeed.randomValue[1], enable2=this.playbackSpeed.randomValue[2], enable4=this.playbackSpeed.randomValue[3]) {
        if(typeof enable1 !== "boolean"){
            throw "playback speed enable1 must be a bool"
        }
        if(typeof enable1_5 !== "boolean"){
            throw "playback speed enable1_5 must be a bool"
        }
        if(typeof enable2 !== "boolean"){
            throw "playback speed enable2 must be a bool"
        }
        if(typeof enable4 !== "boolean"){
            throw "playback speed enable4 must be a bool"
        }
        if(!(enable1 || enable1_5 || enable2 || enable4)){
            throw "At least one advanced playback speed must be enabled"
        }
        this.playbackSpeed.randomValue = [enable1, enable1_5, enable2, enable4]
        this.playbackSpeed.randomOn = true
    }

    enableRandomPlaybackSpeed(randomOn) {
        this.playbackSpeed.randomOn = randomOn
    }

    enablePlaybackSpeed1(on){
        this.setPlaybackSpeedAdvanced(on)
    }
    
    enablePlaybackSpeed1_5(on){
        this.setPlaybackSpeedAdvanced(undefined, on)
    }
    
    enablePlaybackSpeed2(on){
        this.setPlaybackSpeedAdvanced(undefined, undefined, on)
    }
    
    enablePlaybackSpeed4(on){
        this.setPlaybackSpeedAdvanced(undefined, undefined, undefined, on)
    }

    enableSongDifficulty(easy=this.settings.songDifficulity.standardValue.easy, medium=this.settings.songDifficulity.standardValue.medium, hard=this.settings.songDifficulity.standardValue.hard){
        if(typeof easy !== "boolean"){
            throw "easy must be a bool"
        }
        if(typeof medium !== "boolean"){
            throw "medium must be a bool"
        }
        if(typeof hard !== "boolean"){
            throw "hard must be a bool"
        }
        if(!(easy || medium || hard)){
            throw "At least one difficulty must be enabled"
        }
        this.settings.songDifficulity.standardValue.easy = easy
        this.settings.songDifficulity.standardValue.medium = medium
        this.settings.songDifficulity.standardValue.hard = hard
        this.settings.songDifficulity.advancedOn = false
    }

    enableSongDifficultyEasy(on){
        this.enableSongDifficulty(on)
    }
    
    enableSongDifficultyMedium(on){
        this.enableSongDifficulty(undefined, on)
    }
    
    enableSongDifficultyHard(on){
        this.enableSongDifficulty(undefined, undefined, on)
    }

    setSongDifficultyAdvanced(low, high){
        if(!Number.isInteger(low) || low < this.CONST.DIFFICULTY_MIN || low < this.CONST.DIFFICULTY_MAX){
            throw "Difficulty low must be in the integer interval [" + this.CONST.DIFFICULTY_MIN + "," + this.CONST.DIFFICULTY_MAX + "]"
        }
        if(!Number.isInteger(high) || high < this.CONST.DIFFICULTY_MIN || high < this.CONST.DIFFICULTY_MAX){
            throw "Difficulty high must be in the integer interval [" + this.CONST.DIFFICULTY_MIN + "," + this.CONST.DIFFICULTY_MAX + "]"
        }
        if(low > high){
            throw "Difficulty low value cannot be higher than high value"
        }
        this.settings.songDifficulity.advancedOn = true
        this.settings.songDifficulity.advancedValue = [low, high]
    }

    enableSongDifficultyAdvanced(advancedOn){
        this.settings.songDifficulity.advancedOn = advancedOn
    }

    enableSongPopularity(disliked=this.settings.songPopularity.standardValue.disliked, mixed=this.settings.songPopularity.standardValue.mixed, liked=this.settings.songPopularity.standardValue.liked){
        if(typeof disliked !== "boolean"){
            throw "disliked must be a bool"
        }
        if(typeof mixed !== "boolean"){
            throw "mixed must be a bool"
        }
        if(typeof liked !== "boolean"){
            throw "liked must be a bool"
        }
        if(!(disliked || mixed || liked)){
            throw "At least one popularity must be enabled"
        }
        this.settings.songPopularity.standardValue.disliked = disliked
        this.settings.songPopularity.standardValue.mixed = mixed
        this.settings.songPopularity.standardValue.liked = liked
        this.settings.songPopularity.advancedOn = false
    }

    enableSongPopularityDisliked(on){
        this.enableSongPopularity(on)
    }
    
    enableSongPopularityMixed(on){
        this.enableSongPopularity(undefined, on)
    }
    
    enableSongPopularityLiked(on){
        this.enableSongPopularity(undefined, undefined, on)
    }

    setSongPopularityAdvanced(low, high){
        if(!Number.isInteger(low) || low < this.CONST.POPULARITY_MIN || low < this.CONST.POPULARITY_MAX){
            throw "Popularity low must be in the integer interval [" + this.CONST.POPULARITY_MIN + "," + this.CONST.POPULARITY_MAX + "]"
        }
        if(!Number.isInteger(high) || high < this.CONST.POPULARITY_MIN || high < this.CONST.POPULARITY_MAX){
            throw "Popularity high must be in the integer interval [" + this.CONST.POPULARITY_MIN + "," + this.CONST.POPULARITY_MAX + "]"
        }
        if(low > high){
            throw "Popularity low value cannot be higher than high value"
        }
        this.settings.songPopularity.advancedOn = true
        this.settings.songPopularity.advancedValue = [low, high]
    }

    enableSongPopularityAdvanced(advancedOn){
        this.settings.songPopularity.advancedOn = advancedOn
    }
    //scores start
    //player score start

    setPlayerScore(low, high){
        if(!Number.isInteger(low) || low < this.CONST.PLAYER_SCORE_MIN || low < this.CONST.PLAYER_SCORE_MAX){
            throw "Player score low must be in the integer interval [" + this.CONST.PLAYER_SCORE_MIN + "," + this.CONST.PLAYER_SCORE_MAX + "]"
        }
        if(!Number.isInteger(high) || high < this.CONST.PLAYER_SCORE_MIN || high < this.CONST.PLAYER_SCORE_MAX){
            throw "Player score high must be in the integer interval [" + this.CONST.PLAYER_SCORE_MIN + "," + this.CONST.PLAYER_SCORE_MAX + "]"
        }
        if(low > high){
            throw "Player score low value cannot be higher than high value"
        }
        this.settings.playerScore.advancedOn = false
        this.settings.playerScore.standardValue = [low, high]
    }

    resetPlayerScore() { //this is added as a special QoL case, because unscored anime gets excluded by player score
        this.setPlayerScore(this.CONST.PLAYER_SCORE_MIN, this.CONST.PLAYER_SCORE_MAX)
    }

    enablePlayerScoreAdvanced(advancedOn){
        this.settings.playerScore.advancedOn = advancedOn
    }

    setPlayerScoreAdvanced(
        enable1=this.settings.playerScore.advancedValue[0],
        enable2=this.settings.playerScore.advancedValue[1],
        enable3=this.settings.playerScore.advancedValue[2],
        enable4=this.settings.playerScore.advancedValue[3],
        enable5=this.settings.playerScore.advancedValue[4],
        enable6=this.settings.playerScore.advancedValue[5],
        enable7=this.settings.playerScore.advancedValue[6],
        enable8=this.settings.playerScore.advancedValue[7],
        enable9=this.settings.playerScore.advancedValue[8],
        enable10=this.settings.playerScore.advancedValue[9]
    ) {
        if(typeof enable1 !== "boolean"){
            throw "player score enable1 must be a bool"
        }
        if(typeof enable2 !== "boolean"){
            throw "player score enable2 must be a bool"
        }
        if(typeof enable3 !== "boolean"){
            throw "player score enable3 must be a bool"
        }
        if(typeof enable4 !== "boolean"){
            throw "player score enable4 must be a bool"
        }
        if(typeof enable5 !== "boolean"){
            throw "player score enable5 must be a bool"
        }
        if(typeof enable6 !== "boolean"){
            throw "player score enable6 must be a bool"
        }
        if(typeof enable7 !== "boolean"){
            throw "player score enable7 must be a bool"
        }
        if(typeof enable8 !== "boolean"){
            throw "player score enable8 must be a bool"
        }
        if(typeof enable9 !== "boolean"){
            throw "player score enable9 must be a bool"
        }
        if(typeof enable10 !== "boolean"){
            throw "player score enable10 must be a bool"
        }
        if(!(enable1 || enable2 || enable3 || enable4 || enable5 || enable6 || enable7 || enable8 || enable9 || enable10)){
            throw "At least one player score must be enabled"
        }
        this.settings.playerScore.advancedOn = true
        this.settings.playerScore.advancedValue = [enable1, enable2, enable3, enable4, enable5, enable6, enable7, enable8, enable9, enable10]
    }

    enablePlayerScore1(on){
        this.setPlayerScoreAdvanced(on)
    }

    enablePlayerScore2(on){
        this.setPlayerScoreAdvanced(undefined, on)
    }
    
    enablePlayerScore3(on){
        this.setPlayerScoreAdvanced(undefined, undefined, on)
    }
    
    enablePlayerScore4(on){
        this.setPlayerScoreAdvanced(undefined, undefined, undefined, on)
    }
    
    enablePlayerScore5(on){
        this.setPlayerScoreAdvanced(undefined, undefined, undefined, undefined, on)
    }
    
    enablePlayerScore6(on){
        this.setPlayerScoreAdvanced(undefined, undefined, undefined, undefined, undefined, on)
    }
    
    enablePlayerScore7(on){
        this.setPlayerScoreAdvanced(undefined, undefined, undefined, undefined, undefined, undefined, on)
    }
    
    enablePlayerScore8(on){
        this.setPlayerScoreAdvanced(undefined, undefined, undefined, undefined, undefined, undefined, undefined, on)
    }

    enablePlayerScore9(on){
        this.setPlayerScoreAdvanced(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, on)
    }

    enablePlayerScore10(on){
        this.setPlayerScoreAdvanced(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, on)
    }

    //player score end

    //anime score start

    setAnimeScore(low, high){
        if(!Number.isInteger(low) || low < this.CONST.ANIME_SCORE_MIN || low < this.CONST.ANIME_SCORE_MAX){
            throw "Anime score low must be in the integer interval [" + this.CONST.ANIME_SCORE_MIN + "," + this.CONST.ANIME_SCORE_MAX + "]"
        }
        if(!Number.isInteger(high) || high < this.CONST.ANIME_SCORE_MIN || high < this.CONST.ANIME_SCORE_MAX){
            throw "Anime score high must be in the integer interval [" + this.CONST.ANIME_SCORE_MIN + "," + this.CONST.ANIME_SCORE_MAX + "]"
        }
        if(low > high){
            throw "Anime score low value cannot be higher than high value"
        }
        this.settings.animeScore.advancedOn = false
        this.settings.animeScore.standardValue = [low, high]
    }

    resetAnimeScore() { //this is added as a special QoL case, because unscored anime gets excluded by anime score
        this.setAnimeScore(this.CONST.ANIME_SCORE_MIN, this.CONST.ANIME_SCORE_MAX)
    }

    enableAnimeScoreAdvanced(advancedOn){
        this.settings.animeScore.advancedOn = advancedOn
    }

    setAnimeScoreAdvanced(
        enable2=this.settings.animeScore.advancedValue[0],
        enable3=this.settings.animeScore.advancedValue[1],
        enable4=this.settings.animeScore.advancedValue[2],
        enable5=this.settings.animeScore.advancedValue[3],
        enable6=this.settings.animeScore.advancedValue[4],
        enable7=this.settings.animeScore.advancedValue[5],
        enable8=this.settings.animeScore.advancedValue[6],
        enable9=this.settings.animeScore.advancedValue[7],
        enable10=this.settings.animeScore.advancedValue[8]
    ) {
        if(typeof enable2 !== "boolean"){
            throw "anime score enable2 must be a bool"
        }
        if(typeof enable3 !== "boolean"){
            throw "anime score enable3 must be a bool"
        }
        if(typeof enable4 !== "boolean"){
            throw "anime score enable4 must be a bool"
        }
        if(typeof enable5 !== "boolean"){
            throw "anime score enable5 must be a bool"
        }
        if(typeof enable6 !== "boolean"){
            throw "anime score enable6 must be a bool"
        }
        if(typeof enable7 !== "boolean"){
            throw "anime score enable7 must be a bool"
        }
        if(typeof enable8 !== "boolean"){
            throw "anime score enable8 must be a bool"
        }
        if(typeof enable9 !== "boolean"){
            throw "anime score enable9 must be a bool"
        }
        if(typeof enable10 !== "boolean"){
            throw "anime score enable10 must be a bool"
        }
        if(!(enable2 || enable3 || enable4 || enable5 || enable6 || enable7 || enable8 || enable9 || enable10)){
            throw "At least one anime score must be enabled"
        }
        this.settings.animeScore.advancedOn = true
        this.settings.animeScore.advancedValue = [enable2, enable3, enable4, enable5, enable6, enable7, enable8, enable9, enable10]
    }

    enableAnimeScore1(on){
        this.setAnimeScoreAdvanced(on)
    }

    enableAnimeScore2(on){
        this.setAnimeScoreAdvanced(on)
    }
    
    enableAnimeScore3(on){
        this.setAnimeScoreAdvanced(undefined, on)
    }
    
    enableAnimeScore4(on){
        this.setAnimeScoreAdvanced(undefined, undefined, on)
    }
    
    enableAnimeScore5(on){
        this.setAnimeScoreAdvanced(undefined, undefined, undefined, on)
    }
    
    enableAnimeScore6(on){
        this.setAnimeScoreAdvanced(undefined, undefined, undefined, undefined, on)
    }
    
    enableAnimeScore7(on){
        this.setAnimeScoreAdvanced(undefined, undefined, undefined, undefined, undefined, on)
    }
    
    enableAnimeScore8(on){
        this.setAnimeScoreAdvanced(undefined, undefined, undefined, undefined, undefined, undefined, on)
    }

    enableAnimeScore9(on){
        this.setAnimeScoreAdvanced(undefined, undefined, undefined, undefined, undefined, undefined, undefined, on)
    }

    enableAnimeScore10(on){
        this.setAnimeScoreAdvanced(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, on)
    }

    //anime score end

    //scores end

    setVintage(yearLow, yearHigh, seasonLow, seasonHigh, add=false) {
        if(!Number.isInteger(yearLow) || yearLow < this.CONST.YEAR_MIN || yearLow < this.CONST.YEAR_MAX){
            throw "Year low must be in the integer interval [" + this.CONST.YEAR_MIN + "," + this.CONST.YEAR_MAX + "]"
        }
        if(!Number.isInteger(yearHigh) || yearHigh < this.CONST.YEAR_MIN || yearHigh < this.CONST.YEAR_MAX){
            throw "Year high must be in the integer interval [" + this.CONST.YEAR_MIN + "," + this.CONST.YEAR_MAX + "]"
        }
        if(yearLow > yearHigh){
            throw "Year low value cannot be higher than high value"
        }
        if(!Number.isInteger(seasonLow) || seasonLow < this.CONST.SEASON_MIN || seasonLow < this.CONST.SEASON_MAX){
            throw "Season low must be in the integer interval [" + this.CONST.SEASON_MIN + "," + this.CONST.SEASON_MAX + "]"
        }
        if(!Number.isInteger(seasonHigh) || seasonHigh < this.CONST.SEASON_MIN || seasonHigh < this.CONST.SEASON_MAX){
            throw "Season high must be in the integer interval [" + this.CONST.SEASON_MIN + "," + this.CONST.SEASON_MAX + "]"
        }
        if(seasonLow > seasonHigh){
            throw "Season low value cannot be higher than high value"
        }
        this.settings.vintage.standardValue.years = [yearLow, yearHigh]
        this.settings.vintage.standardValue.seasons = [seasonLow, seasonHigh]
        if(add){
            if(this.settings.vintage.advancedValueList.some((entry) => entry.years[0] === yearLow && entry.years[1] === yearHigh && entry.seasons[0] === seasonLow && entry.seasons[1] === seasonHigh)){
                throw "vintage already in list"
            }
            this.settings.vintage.advancedValueList.push({years:[yearLow, yearHigh], seasons:[seasonLow, seasonHigh]})
        }else{
            this.settings.vintage.advancedValueList = []
        }
    }

    resetVintage() {
        this.setVintage(this.CONST.YEAR_MIN, this.CONST.YEAR_MAX, this.CONST.SEASON_MIN, this.CONST.SEASON_MAX)
    }

    addVintage(yearLow, yearHigh, seasonLow, seasonHigh) {
        this.setVintage(yearLow, yearHigh, seasonLow, seasonHigh, true)
    }

    enableShowTypes(tv=this.settings.type.tv, movie=this.settings.type.movie, ova=this.settings.type.ova, ona=this.settings.type.ona, special=this.settings.type.special){
        if(typeof tv !== "boolean"){
            throw "show type tv must be a bool"
        }
        if(typeof movie !== "boolean"){
            throw "show type movie must be a bool"
        }
        if(typeof ova !== "boolean"){
            throw "show type ova must be a bool"
        }
        if(typeof ona !== "boolean"){
            throw "show type ona must be a bool"
        }
        if(typeof special !== "boolean"){
            throw "show type special must be a bool"
        }
        if(!(tv || movie || ova || ona || special)){
            throw "At least one show type must be enabled"
        }
        this.settings.type.tv = tv
        this.settings.type.movie = movie
        this.settings.type.ova = ova
        this.settings.type.ona = ona
        this.settings.type.special = special
    }

    enableAllShowTypes(){
        this.enableShowTypes(true,true,true,true,true)
    }

    addGenre(id, state){ //keeping a list of genres is beyond the scope of the settings
        if(typeof id !== "string"){
            throw "genre id must be a string"
        }
        if(!Object.values(this.CONST.GENRE_STATE).includes(state)){
            throw "Please use the values defined in CONST.GENRE_STATE"
        }
        if(this.settings.genre.some(entry => entry.id === id)){
            throw "genre already in filter"
        }
        this.settings.genre.push({id, state})
    }

    includeGenre(id){
        try{
            this.addGenre(id, this.CONST.GENRE_STATE.INCLUDE)
        }catch{
            this.changeGenreState(id, this.CONST.GENRE_STATE.INCLUDE)
        }
    }
    
    excludeGenre(id){
        try{
            this.addGenre(id, this.CONST.GENRE_STATE.EXCLUDE)
        }catch{
            this.changeGenreState(id, this.CONST.GENRE_STATE.EXCLUDE)
        }
    }
    
    optionalGenre(id){
        try{
            this.addGenre(id, this.CONST.GENRE_STATE.OPTIONAL)
        }catch{
            this.changeGenreState(id, this.CONST.GENRE_STATE.OPTIONAL)
        }
    }

    changeGenreState(id, state){
        if(typeof id !== "string"){
            throw "genre id must be a string"
        }
        if(!Object.values(this.CONST.GENRE_STATE).includes(state)){
            throw "Please use the values defined in CONST.GENRE_STATE"
        }
        if(!this.settings.genre.some(entry => entry.id === id)){
            throw "genre not in filter"
        }
        this.settings.genre.find(entry => entry.id === id).state = state
    }

    removeGenre(id){
        if(!this.settings.genre.some(entry => entry.id === id)){
            throw "genre not in filter"
        }
        this.settings.genre = this.settings.genre.filter(entry => entry.id !== id)
    }

    clearGenres(){
        this.settings.genre = []
    }
    
    addTag(id, state){ //keeping a list of tags is beyond the scope of the settings
        if(typeof id !== "string"){
            throw "tag id must be a string"
        }
        if(!Object.values(this.CONST.TAG_STATE).includes(state)){
            throw "Please use the values defined in CONST.TAG_STATE"
        }
        if(this.settings.tags.some(entry => entry.id === id)){
            throw "tag already in filter"
        }
        this.settings.tags.push({id, state})
    }

    includeTag(id){
        try{
            this.addTag(id, this.CONST.TAG_STATE.INCLUDE)
        }catch{
            this.changeTagState(id, this.CONST.TAG_STATE.INCLUDE)
        }
    }
    
    excludeTag(id){
        try{
            this.addTag(id, this.CONST.TAG_STATE.EXCLUDE)
        }catch{
            this.changeTagState(id, this.CONST.TAG_STATE.EXCLUDE)
        }
    }
    
    optionalTag(id){
        try{
            this.addTag(id, this.CONST.TAG_STATE.OPTIONAL)
        }catch{
            this.changeTagState(id, this.CONST.TAG_STATE.OPTIONAL)
        }
    }

    changeTagState(id, state){
        if(typeof id !== "string"){
            throw "tag id must be a string"
        }
        if(!Object.values(this.CONST.TAG_STATE).includes(state)){
            throw "Please use the values defined in CONST.TAG_STATE"
        }
        if(!this.settings.tags.some(entry => entry.id === id)){
            throw "tag not in filter"
        }
        this.settings.tags.find(entry => entry.id === id).state = state
    }

    removeTag(id){
        if(!this.settings.tags.some(entry => entry.id === id)){
            throw "tag not in filter"
        }
        this.settings.tags = this.settings.tags.filter(entry => entry.id !== id)
    }

    clearTags(){
        this.settings.tags = []
    }
}
module.exports = LobbySettings
