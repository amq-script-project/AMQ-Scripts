class LobbySettings{
    constructor(override={}){
        this.settings = JSON.parse(JSON.stringify(defaultSettings))
        Object.keys(override).forEach((key) => {
            if(key in this.settings){
                this.settings[key] = JSON.parse(JSON.stringify(override[key]))
            }
        })
        this.settings.vintage.standardValue.years[1] = new Date().getFullYear()
        this.oldSettings = JSON.parse(JSON.stringify(this.settings))
    }

    static validate = (settings) => {
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
            console.log(settings.songSelection)
            if(ssa.watched+ssa.unwatched+ssa.random !== settings.numberOfSongs){
                throw `song selection count mismatch ${ssa.watched+ssa.unwatched+ssa.random}, ${settings.numberOfSongs}`
            }
            if((ssa.unwatched || (ssa.watched && ssa.random)) && sss !== CONST_VALUES.SONG_SELECTION.MIX){
                throw "song selection mix distribution, but not mix standardvalue"
            }
            if(ssa.watched && !ssa.unwatched && !ssa.random && sss !== CONST_VALUES.SONG_SELECTION.WATCHED){
                throw "song selection watched distribution, but not watched standardvalue"
            }
            if(ssa.random && !ssa.watched && !ssa.unwatched && sss !== CONST_VALUES.SONG_SELECTION.RANDOM){
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
        dummy.setScoreType(settings.scoreType)
        dummy.setShowSelection(settings.showSelection)
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
        settings.playerScore.advancedValue.forEach((val, idx) => dummy.setPlayerScoreAdvanced(idx + CONST_VALUES.PLAYER_SCORE_MIN, val))
        dummy.enablePlayerScoreAdvanced(settings.playerScore.advancedOn)
        if(settings.playerScore.advancedValue.some(entry => entry === undefined)){
            throw "player score advanced must not contained undefined variables"
        }
        dummy.setAnimeScore(...settings.animeScore.standardValue, ...invalidList)
        settings.animeScore.advancedValue.forEach((val, idx) => dummy.setAnimeScoreAdvanced(idx + CONST_VALUES.ANIME_SCORE_MIN, val))
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
        if(settings.gameMode !== "Solo" && settings.gameMode !== "Multiplayer"){
            throw "game mode argument invalid"
        }
    }

    getSettings = (validate=true) => {
        const settings = JSON.parse(JSON.stringify(this.settings))
        if (validate) LobbySettings.validate(settings)
        return settings
    }

    getDelta = () => {
        const delta = {}
        Object.keys(this.settings).forEach((key) => {
            if(JSON.stringify(this.settings[key]) !== JSON.stringify(this.oldSettings[key])){
                delta[key] = JSON.parse(JSON.stringify(this.settings[key]))
            }
        })
        return delta
    }

    commit = () => {
        const delta = this.getDelta()
        this.oldSettings = JSON.parse(JSON.stringify(this.settings))
        return delta
    }

    revert = () => {
        this.settings = JSON.parse(JSON.stringify(this.oldSettings))
    }

    setRoomSize = (roomSize) => {
        if(roomSize == 1) {
            this.settings.roomSize = 2
            this.settings.gameMode = "Solo"
            return
        }
        assertInInterval(roomSize, "Room size", CONST_VALUES.ROOM_SIZE_MIN, CONST_VALUES.ROOM_SIZE_MAX)
        this.settings.roomSize = roomSize
        this.settings.gameMode = "Multiplayer"
    }

    setTeamSize = (teamSize) => {
        assertInInterval(teamSize, "Team size", CONST_VALUES.TEAM_SIZE_MIN, CONST_VALUES.TEAM_SIZE_MAX)
        this.settings.teamSize = teamSize
    }

    setRoomName = (newName) => {
        if(typeof newName !== "string"){
            throw "Room name must be string"
        }
        if(newName.length === 0){
            throw "Room name cannot be empty"
        }
        if(newName.length > CONST_VALUES.ROOM_NAME_MAX_LENGTH){
            throw "Room name cannot be longer than " + CONST_VALUES.ROOM_NAME_MAX_LENGTH + " characters"
        }
        this.settings.roomName = newName
    }

    setPassword = (newPassword) => {
        if(typeof newPassword !== "string"){
            throw "Password must be string"
        }
        if(newPassword.length === 0){
            return this.clearPassword()
        }
        if(newPassword.length > CONST_VALUES.PASSWORD_MAX_LENGTH){
            throw "Password cannot be longer than " + CONST_VALUES.PASSWORD_MAX_LENGTH + " characters"
        }
        this.settings.password = newPassword
        this.settings.privateRoom = true
    }

    clearPassword = () => {
        this.settings.password = ""
        this.settings.privateRoom = false
    }

    setSongCount = (numberOfSongs) => {
        assertInInterval(numberOfSongs, "Song count", CONST_VALUES.SONG_COUNT_MIN, CONST_VALUES.SONG_COUNT_MAX)
        this.settings.numberOfSongs = numberOfSongs
        this._calculateSongDistribution(this.settings.songSelection.advancedValue.watched, this.settings.songSelection.advancedValue.unwatched, this.settings.songSelection.advancedValue.random, numberOfSongs)
    }

    enableSkipGuessing = (skipGuessingOn) => {
        assertBooleans({skipGuessingOn})

        this.settings.modifiers.skipGuessing = skipGuessingOn
    }

    enableSkipReplay = (skipReplayOn) => {
        assertBooleans({skipReplayOn})

        this.settings.modifiers.skipReplay = skipReplayOn
    }

    enableDuplicates = (duplicatesOn) => {
        assertBooleans({duplicatesOn})

        this.settings.modifiers.duplicates = duplicatesOn
    }

    enableQueueing = (queueingOn) => {
        assertBooleans({queueingOn})

        this.settings.modifiers.queueing = queueingOn
    }

    enableLootDropping = (lootDroppingOn) => {
        assertBooleans({lootDroppingOn})

        this.settings.modifiers.lootDropping = lootDroppingOn
    }

    setSongSelection = (standardValue) => {
        assertInDictionary(standardValue, CONST_VALUES.SONG_SELECTION, "CONST_VALUES.SONG_SELECTION")
        const ratio = CONST_VALUES.SONG_SELECTION_STANDARD_RATIOS
        const ratios = [ratio.RANDOM, ratio.MIX, ratio.WATCHED][standardValue-1]
        console.log(ratio, standardValue, ratios.WATCHED, ratios.UNWATCHED, ratios.RANDOM, this.settings.numberOfSongs)
        this._calculateSongDistribution(ratios.WATCHED, ratios.UNWATCHED, ratios.RANDOM, this.settings.numberOfSongs)
    }

    setSongSelectionWatched = () => {
        this.setShowSelection(CONST_VALUES.SONG_SELECTION.WATCHED)
    }

    setSongSelectionMix = () => {
        this.setShowSelection(CONST_VALUES.SONG_SELECTION.MIX)
    }

    setSongSelectionRandom = () => {
        this.setShowSelection(CONST_VALUES.SONG_SELECTION.RANDOM)
    }

    _calculateSongDistribution = (watchedRatio, unwatchedRatio, randomRatio, numberOfSongs) => {
        const ratioQuantifier = watchedRatio + unwatchedRatio + randomRatio
        let watched = Math.floor(numberOfSongs * watchedRatio / ratioQuantifier)
        let unwatched = Math.floor(numberOfSongs * unwatchedRatio / ratioQuantifier)
        let random = Math.floor(numberOfSongs * randomRatio / ratioQuantifier)
        while(watched + unwatched + random < numberOfSongs){
            const watchedRatioDiff = watched / numberOfSongs - watchedRatio / ratioQuantifier
            const unwatchedRatioDiff = unwatched / numberOfSongs - unwatchedRatio / ratioQuantifier
            const randomRatioDiff = random / numberOfSongs - randomRatio / ratioQuantifier
            const biggestDiff = Math.min(watchedRatioDiff, unwatchedRatioDiff, randomRatioDiff)
            if(watchedRatioDiff === biggestDiff){
                watched++
            }else if(unwatchedRatioDiff === biggestDiff){
                unwatched++
            }else{
                random++
            }
        }
        //console.log(numberOfSongs, randomRatio, ratioQuantifier)
        //console.trace()
        this.settings.songSelection.advancedValue.watched = watched
        this.settings.songSelection.advancedValue.unwatched = unwatched
        this.settings.songSelection.advancedValue.random = random
        if(watched === 0 && unwatched === 0){
            this.settings.songSelection.standardValue = CONST_VALUES.SONG_SELECTION.RANDOM
        }else if(unwatched === 0 && random === 0){
            this.settings.songSelection.standardValue = CONST_VALUES.SONG_SELECTION.WATCHED
        }else{
            this.settings.songSelection.standardValue = CONST_VALUES.SONG_SELECTION.MIX
        }
    }

    setSongSelectionAdvanced = (watched, unwatched, random) => {
        assertNotNegative({watched, unwatched, random})
        if(watched + unwatched + random === 0){
            throw "sum of selection must be larger than 0"
        }
        this._calculateSongDistribution(watched, unwatched, random, this.settings.numberOfSongs)
    }

    enableSongTypes = (openings=this.settings.songType.standardValue.openings, endings=this.settings.songType.standardValue.endings, inserts=this.settings.songType.standardValue.inserts) => {
        assertBooleans({openings, endings, inserts})

        if(!(openings || endings || inserts)){
            throw "At least one song type must be enabled"
        }
        this.settings.songType.standardValue.openings = openings
        this.settings.songType.standardValue.endings = endings
        this.settings.songType.standardValue.inserts = inserts
        const advancedOpenings = openings?this.settings.songType.advancedValue.openings:0
        const advancedEndings = endings?this.settings.songType.advancedValue.endings:0
        const advancedInserts = inserts?this.settings.songType.advancedValue.inserts:0
        const advancedRandom = this.settings.songType.advancedValue.random
        this._calculateSongTypeDistribution(advancedOpenings, advancedEndings, advancedInserts, advancedRandom, this.settings.numberOfSongs)
    }

    enableOpenings = (openingsOn) => {
        this.setTypes(openingsOn)
    }

    enableEndings = (endingsOn) => {
        this.setTypes(undefined, endingsOn)
    }

    enableInserts = (insertsOn) => {
        this.setTypes(undefined, undefined, insertsOn)
    }

    _calculateSongTypeDistribution = (openingsRatio, endingsRatio, insertsRatio, randomRatio, numberOfSongs) => {
        const ratioQuantifier = openingsRatio + endingsRatio + insertsRatio + randomRatio
        let openings = Math.floor(numberOfSongs * openingsRatio / ratioQuantifier)
        let endings = Math.floor(numberOfSongs * endingsRatio / ratioQuantifier)
        let inserts = Math.floor(numberOfSongs * insertsRatio / ratioQuantifier)
        let random = Math.floor(numberOfSongs * randomRatio / ratioQuantifier)
        while(openings + endings + inserts + random < numberOfSongs){
            const openingsRatioDiff = openings / numberOfSongs - openingsRatio / ratioQuantifier
            const endingsRatioDiff = endings / numberOfSongs - endingsRatio / ratioQuantifier
            const insertsRatioDiff = inserts / numberOfSongs - insertsRatio / ratioQuantifier
            const randomRatioDiff = random / numberOfSongs - randomRatio / ratioQuantifier
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
        this.settings.songType.advancedValue.endings = endings
        this.settings.songType.advancedValue.inserts = inserts
        this.settings.songType.advancedValue.random = random
    }

    setSongTypeSelectionAdvanced = (openings, endings, inserts, random) => {
        assertNotNegative({openings, endings, inserts, random})
        if(openings + endings + inserts + random === 0){
            throw "sum of types must be larger than 0"
        }

        this.settings.songType.standardValue.openings = Boolean(openings) || Boolean(random)
        this.settings.songType.standardValue.endings = Boolean(endings) || Boolean(random)
        this.settings.songType.standardValue.inserts = Boolean(inserts) || Boolean(random)

        this._calculateSongTypeDistribution(openings, endings, inserts, random, this.settings.numberOfSongs)
    }

    setGuessTime = (standardValue) => {
        assertInInterval(standardValue, "Guess time", CONST_VALUES.GUESS_TIME_MIN, CONST_VALUES.GUESS_TIME_MAX)
        this.settings.guessTime.randomOn = false
        this.settings.guessTime.standardValue = standardValue
    }

    setGuessTimeAdvanced = (low, high) => {
        assertIsInterval(low, "Guess time low", high, "Guess time high", CONST_VALUES.GUESS_TIME_MIN, CONST_VALUES.GUESS_TIME_MAX)
        this.settings.guessTime.randomOn = true
        this.settings.guessTime.randomValue = [low, high]
    }

    enableRandomGuessTime = (randomOn) => {
        assertBooleans({"guessTime.randomOn": randomOn})

        this.settings.guessTime.randomOn = randomOn
    }

    setScoreType = (scoreType) => {
        assertInDictionary(scoreType, CONST_VALUES.SCORING, "CONST_VALUES.SCORING")
        this.settings.scoreType = scoreType
    }

    setScoreTypeCount = () => {
        this.setScoreType(CONST_VALUES.SCORING.COUNT)
    }

    setScoreTypeSpeed = () => {
        this.setScoreType(CONST_VALUES.SCORING.SPEED)
    }

    setScoreTypeLives = () => {
        this.setScoreType(CONST_VALUES.SCORING.LIVES)
    }

    setShowSelection = (showSelection) => {
        assertInDictionary(showSelection, CONST_VALUES.SHOW_SELECTION, "CONST_VALUES.SHOW_SELECTION")
        this.settings.showSelection = showSelection
    }

    setShowSelectionAuto = () => {
        this.setShowSelection(CONST_VALUES.SHOW_SELECTION.AUTO)
    }

    setShowSelectionLooting = () => {
        this.setShowSelection(CONST_VALUES.SHOW_SELECTION.LOOTING)
    }

    setGameMode = (gameMode) => {
        assertInDictionary(gameMode, CONST_VALUES.GAME_MODE, "CONST_VALUES.GAME_MODE")
        switch(gameMode){
            case CONST_VALUES.GAME_MODE.STANDARD:
                this.setShowSelectionAuto()
                this.setScoreTypeCount()
                break
            case CONST_VALUES.GAME_MODE.QUICK_DRAW:
                this.setShowSelectionAuto()
                this.setScoreTypeSpeed()
                break
            case CONST_VALUES.GAME_MODE.LAST_MAN_STANDING:
                this.setShowSelectionAuto()
                this.setScoreTypeLives()
                break
            case CONST_VALUES.GAME_MODE.BATTLE_ROYALE:
                this.setShowSelectionLooting()
                this.setScoreTypeLives()
                break
            default:
                throw "Error in setGameMode, value " + gameMode + " not implemented"
        }
    }

    setGameModeStandard = () => {
        this.setGameMode(CONST_VALUES.GAME_MODE.STANDARD)
    }

    setGameModeQuickDraw = () => {
        this.setGameMode(CONST_VALUES.GAME_MODE.QUICK_DRAW)
    }

    setGameModeLastManStanding = () => {
        this.setGameMode(CONST_VALUES.GAME_MODE.LAST_MAN_STANDING)
    }

    setGameModeBattleRoyale = () => {
        this.setGameMode(CONST_VALUES.GAME_MODE.BATTLE_ROYALE)
    }

    setInventorySize = (standardValue) => {
        assertInInterval(standardValue, "Inventory size", CONST_VALUES.INVENTORY_SIZE_MIN, CONST_VALUES.INVENTORY_SIZE_MAX)

        this.settings.inventorySize.standardValue = standardValue
        this.settings.inventorySize.randomOn = false
    }

    setInventorySizeAdvanced = (low, high) => {
        assertIsInterval(low, "Inventory size low", high, "Inventory size high", CONST_VALUES.INVENTORY_SIZE_MIN, CONST_VALUES.INVENTORY_SIZE_MAX)

        this.settings.inventorySize.randomOn = true
        this.settings.inventorySize.randomValue = [low, high]
    }

    enableRandomInventorySize = (randomOn) => {
        assertBooleans({"inventorySize.randomOn": randomOn})

        this.settings.inventorySize.randomOn = randomOn
    }

    setLootingTime = (standardValue) => {
        assertInInterval(standardValue, "Looting time", CONST_VALUES.LOOTING_TIME_MIN, CONST_VALUES.LOOTING_TIME_MAX)

        this.settings.lootingTime.standardValue = standardValue
        this.settings.lootingTime.randomOn = false
    }

    setLootingTimeAdvanced = (low, high) => {
        assertIsInterval(low, "Looting time low", high, "Looting time high", CONST_VALUES.LOOTING_TIME_MIN, CONST_VALUES.LOOTING_TIME_MAX)

        this.settings.lootingTime.randomOn = true
        this.settings.lootingTime.randomValue = [low, high]
    }

    enableRandomLootingTime = (randomOn) => {
        assertBooleans({"lootingTime.randomOn": randomOn})

        this.settings.lootingTime.randomOn = randomOn
    }

    setLives = (count) => {
        assertInInterval(count, "Lives count", CONST_VALUES.LIVES_MIN, CONST_VALUES.LIVES_MAX)
        this.settings.lives = count
    }

    setSamplePoint = (position) => {
        assertInDictionary(position, CONST_VALUES.SAMPLE_POINT, "CONST_VALUES.SAMPLE_POINT")
        this.settings.samplePoint.standardValue = position
        this.settings.samplePoint.randomOn = false
    }

    setSamplePointStart = () => {
        this.setSamplePoint(CONST_VALUES.SAMPLE_POINT.START)
    }

    setSamplePointMiddle = () => {
        this.setSamplePoint(CONST_VALUES.SAMPLE_POINT.MIDDLE)
    }

    setSamplePointEnd = () => {
        this.setSamplePoint(CONST_VALUES.SAMPLE_POINT.END)
    }

    setSamplePointAdvanced = (low, high) => {
        assertIsInterval(low, "Looting time low", high, "Looting time high", CONST_VALUES.SAMPLE_POINT_MIN, CONST_VALUES.SAMPLE_POINT_MAX)

        this.settings.samplePoint.randomOn = true
        this.settings.samplePoint.randomValue = [low, high]
    }

    enableRandomSamplePoint = (randomOn) => {
        assertBooleans({"samplePoint.randomOn": randomOn})

        this.settings.samplePoint.randomOn = randomOn
    }

    setPlaybackSpeed = (multiplier) => {
        if(typeof multiplier !== "number" || Number.isNaN(multiplier) || multiplier < CONST_VALUES.PLAYBACK_SPEED_MIN || multiplier > CONST_VALUES.PLAYBACK_SPEED_MAX){
            throw "Playback speed multiplier must be a real number in the interval [" + CONST_VALUES.PLAYBACK_SPEED_MIN + ", " + CONST_VALUES.PLAYBACK_SPEED_MAX + "]"
        }
        this.settings.playbackSpeed.standardValue = multiplier
        this.settings.playbackSpeed.randomOn = false
    }

    setPlaybackSpeedAdvanced = (enable1=this.playbackSpeed.randomValue[0], enable1_5=this.playbackSpeed.randomValue[1], enable2=this.playbackSpeed.randomValue[2], enable4=this.playbackSpeed.randomValue[3]) => {
        assertBooleans({enable1, enable1_5, enable2, enable4})
        if(!(enable1 || enable1_5 || enable2 || enable4)){
            throw "At least one advanced playback speed must be enabled"
        }
        this.settings.playbackSpeed.randomValue = [enable1, enable1_5, enable2, enable4]
        this.settings.playbackSpeed.randomOn = true
    }

    enableRandomPlaybackSpeed = (randomOn) => {
        assertBooleans({"playbackSpeed.randomOn": randomOn})

        this.settings.playbackSpeed.randomOn = randomOn
    }

    enablePlaybackSpeed1 = (on) => {
        this.setPlaybackSpeedAdvanced(on)
    }

    enablePlaybackSpeed1_5 = (on) => {
        this.setPlaybackSpeedAdvanced(undefined, on)
    }

    enablePlaybackSpeed2 = (on) => {
        this.setPlaybackSpeedAdvanced(undefined, undefined, on)
    }

    enablePlaybackSpeed4 = (on) => {
        this.setPlaybackSpeedAdvanced(undefined, undefined, undefined, on)
    }

    enableSongDifficulty = (easy=this.settings.songDifficulity.standardValue.easy, medium=this.settings.songDifficulity.standardValue.medium, hard=this.settings.songDifficulity.standardValue.hard) => {
        assertBooleans({easy, medium, hard})

        if(!(easy || medium || hard)){
            throw "At least one difficulty must be enabled"
        }
        this.settings.songDifficulity.standardValue.easy = easy
        this.settings.songDifficulity.standardValue.medium = medium
        this.settings.songDifficulity.standardValue.hard = hard
        this.settings.songDifficulity.advancedOn = false
    }

    enableSongDifficultyEasy = (on) => {
        this.enableSongDifficulty(on)
    }

    enableSongDifficultyMedium = (on) => {
        this.enableSongDifficulty(undefined, on)
    }

    enableSongDifficultyHard = (on) => {
        this.enableSongDifficulty(undefined, undefined, on)
    }

    setSongDifficultyAdvanced = (low, high) => {
        assertIsInterval(low, "Difficulty low", high, "Difficulty high", CONST_VALUES.DIFFICULTY_MIN, CONST_VALUES.DIFFICULTY_MAX)

        this.settings.songDifficulity.advancedOn = true
        this.settings.songDifficulity.advancedValue = [low, high]
    }

    enableSongDifficultyAdvanced = (advancedOn) => {
        assertBooleans({"SongDifficulty.advancedOn": advancedOn})

        this.settings.songDifficulity.advancedOn = advancedOn
    }

    enableSongPopularity = (disliked=this.settings.songPopularity.standardValue.disliked, mixed=this.settings.songPopularity.standardValue.mixed, liked=this.settings.songPopularity.standardValue.liked) => {
        assertBooleans({disliked, mixed, liked})

        if(!(disliked || mixed || liked)){
            throw "At least one popularity must be enabled"
        }
        this.settings.songPopularity.standardValue.disliked = disliked
        this.settings.songPopularity.standardValue.mixed = mixed
        this.settings.songPopularity.standardValue.liked = liked
        this.settings.songPopularity.advancedOn = false
    }

    enableSongPopularityDisliked = (on) => {
        this.enableSongPopularity(on)
    }

    enableSongPopularityMixed = (on) => {
        this.enableSongPopularity(undefined, on)
    }

    enableSongPopularityLiked = (on) => {
        this.enableSongPopularity(undefined, undefined, on)
    }

    setSongPopularityAdvanced = (low, high) => {
        assertIsInterval(low, "Popularity low", high, "Popularity high", CONST_VALUES.POPULARITY_MIN, CONST_VALUES.POPULARITY_MAX)

        this.settings.songPopularity.advancedOn = true
        this.settings.songPopularity.advancedValue = [low, high]
    }

    enableSongPopularityAdvanced = (advancedOn) => {
        assertBooleans({"SongPopularity.advancedOn": advancedOn})

        this.settings.songPopularity.advancedOn = advancedOn
    }
    //scores start
    //player score start

    setPlayerScore = (low, high) => {
        assertIsInterval(low, "Player score low", high, "Player score high", CONST_VALUES.PLAYER_SCORE_MIN, CONST_VALUES.PLAYER_SCORE_MAX)

        this.settings.playerScore.advancedOn = false
        this.settings.playerScore.standardValue = [low, high]
    }

    resetPlayerScore = () => { //this is added as a special QoL case, because unscored anime gets excluded by player score
        this.setPlayerScore(CONST_VALUES.PLAYER_SCORE_MIN, CONST_VALUES.PLAYER_SCORE_MAX)
    }

    enablePlayerScoreAdvanced = (advancedOn) => {
        assertBooleans({"playerScore.advancedOn": advancedOn})

        this.settings.playerScore.advancedOn = advancedOn
    }

    setPlayerScoreAdvanced = (score, enable) => {
        assertBooleans({enable})
        assertInInterval(score, "player score", CONST_VALUES.PLAYER_SCORE_MIN, CONST_VALUES.PLAYER_SCORE_MAX)
        this.settings.playerScore.advancedValue[score - CONST_VALUES.PLAYER_SCORE_MIN] = enable
        this.settings.playerScore.advancedOn = !this.settings.playerScore.advancedValue.some(s => s)
    }
    //player score end

    //anime score start

    setAnimeScore = (low, high) => {
        assertIsInterval(low, "Anime score low", high, "Anime score high", CONST_VALUES.ANIME_SCORE_MIN, CONST_VALUES.ANIME_SCORE_MAX)

        this.settings.animeScore.advancedOn = false
        this.settings.animeScore.standardValue = [low, high]
    }

    resetAnimeScore = () => { //this is added as a special QoL case, because unscored anime gets excluded by anime score
        this.setAnimeScore(CONST_VALUES.ANIME_SCORE_MIN, CONST_VALUES.ANIME_SCORE_MAX)
    }

    enableAnimeScoreAdvanced = (advancedOn) => {
        assertBooleans({"animeScore.advancedOn": advancedOn})

        this.settings.animeScore.advancedOn = advancedOn
    }

    setAnimeScoreAdvanced = (score, enable) => {
        assertBooleans({enable})
        assertInInterval(score, "anime score", CONST_VALUES.ANIME_SCORE_MIN, CONST_VALUES.ANIME_SCORE_MAX)
        this.settings.animeScore.advancedValue[score - CONST_VALUES.ANIME_SCORE_MIN] = enable
        this.settings.animeScore.advancedOn = this.settings.animeScore.advancedValue.some(s => s)
    }
    //anime score end

    //scores end

    setVintage = (yearLow, yearHigh, seasonLow, seasonHigh, add=false) => {
        assertIsInterval(yearLow, "Year low", yearHigh, "Year high", CONST_VALUES.YEAR_MIN, CONST_VALUES.YEAR_MAX)
        assertIsInterval(seasonLow, "Season low", seasonHigh, "Season high", CONST_VALUES.SEASON_MIN, CONST_VALUES.SEASON_MAX)

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

    resetVintage = () => {
        this.setVintage(CONST_VALUES.YEAR_MIN, CONST_VALUES.YEAR_MAX, CONST_VALUES.SEASON_MIN, CONST_VALUES.SEASON_MAX)
    }

    addVintage = (yearLow, yearHigh, seasonLow, seasonHigh) => {
        this.setVintage(yearLow, yearHigh, seasonLow, seasonHigh, true)
    }

    enableShowTypes = (tv=this.settings.type.tv, movie=this.settings.type.movie, ova=this.settings.type.ova, ona=this.settings.type.ona, special=this.settings.type.special) => {
        let params = {tv, movie, ova, ona, special}
        assertBooleans(params)

        if(!Object.values(params).some(v => v)) {
            throw "At least one show type must be enabled"
        }

        Object.assign(this.settings.type, params)
    }

    enableAllShowTypes = () => {
        this.enableShowTypes(true,true,true,true,true)
    }

    addGenre = (id, state) => { //keeping a list of genres is beyond the scope of the settings
        if(typeof id !== "string"){
            throw "genre id must be a string"
        }
        assertInDictionary(state, CONST_VALUES.GENRE_STATE, "CONST_VALUES.GENRE_STATE")
        if(this.settings.genre.some(entry => entry.id === id)){
            throw "genre already in filter"
        }
        this.settings.genre.push({id, state})
    }

    includeGenre = (id) => {
        try{
            this.addGenre(id, CONST_VALUES.GENRE_STATE.INCLUDE)
        }catch{
            this.changeGenreState(id, CONST_VALUES.GENRE_STATE.INCLUDE)
        }
    }

    excludeGenre = (id) => {
        try{
            this.addGenre(id, CONST_VALUES.GENRE_STATE.EXCLUDE)
        }catch{
            this.changeGenreState(id, CONST_VALUES.GENRE_STATE.EXCLUDE)
        }
    }

    optionalGenre = (id) => {
        try{
            this.addGenre(id, CONST_VALUES.GENRE_STATE.OPTIONAL)
        }catch{
            this.changeGenreState(id, CONST_VALUES.GENRE_STATE.OPTIONAL)
        }
    }

    changeGenreState = (id, state) => {
        if(typeof id !== "string"){
            throw "genre id must be a string"
        }
        assertInDictionary(state, CONST_VALUES.GENRE_STATE, "CONST_VALUES.GENRE_STATE")
        if(!this.settings.genre.some(entry => entry.id === id)){
            throw "genre not in filter"
        }
        this.settings.genre.find(entry => entry.id === id).state = state
    }

    removeGenre = (id) => {
        if(typeof id !== "string"){
            throw "genre id must be a string"
        }
        if(!this.settings.genre.some(entry => entry.id === id)){
            throw "genre not in filter"
        }
        this.settings.genre = this.settings.genre.filter(entry => entry.id !== id)
    }

    clearGenres = () => {
        this.settings.genre = []
    }

    addTag = (id, state) => { //keeping a list of tags is beyond the scope of the settings
        if(typeof id !== "string"){
            throw "tag id must be a string"
        }
        assertInDictionary(state, CONST_VALUES.TAG_STATE, "CONST_VALUES.TAG_STATE")
        if(this.settings.tags.some(entry => entry.id === id)){
            throw "tag already in filter"
        }
        this.settings.tags.push({id, state})
    }

    includeTag = (id) => {
        try{
            this.addTag(id, CONST_VALUES.TAG_STATE.INCLUDE)
        }catch{
            this.changeTagState(id, CONST_VALUES.TAG_STATE.INCLUDE)
        }
    }

    excludeTag = (id) => {
        try{
            this.addTag(id, CONST_VALUES.TAG_STATE.EXCLUDE)
        }catch{
            this.changeTagState(id, CONST_VALUES.TAG_STATE.EXCLUDE)
        }
    }

    optionalTag = (id) => {
        try{
            this.addTag(id, CONST_VALUES.TAG_STATE.OPTIONAL)
        }catch{
            this.changeTagState(id, CONST_VALUES.TAG_STATE.OPTIONAL)
        }
    }

    changeTagState = (id, state) => {
        if(typeof id !== "string"){
            throw "tag id must be a string"
        }
        assertInDictionary(state, CONST_VALUES.TAG_STATE, "CONST_VALUES.TAG_STATE")
        if(!this.settings.tags.some(entry => entry.id === id)){
            throw "tag not in filter"
        }
        this.settings.tags.find(entry => entry.id === id).state = state
    }

    removeTag = (id) => {
        if(typeof id !== "string"){
            throw "tag id must be a string"
        }
        if(!this.settings.tags.some(entry => entry.id === id)){
            throw "tag not in filter"
        }
        this.settings.tags = this.settings.tags.filter(entry => entry.id !== id)
    }

    clearTags = () => {
        this.settings.tags = []
    }

    setSolo = () => {
        this.setRoomSize(1)
    }
}

const assertInInterval = (val, name, minVal, maxVal) => {
    if (!Number.isInteger(val)) {
        throw name + " should be an integer"
    }
    if(val < minVal || val > maxVal){
        throw name + " must be in the integer interval [" + minVal + "," + maxVal + "]"
    }
}

const assertNotNegative = (obj) => {
    for (let name in obj) {
        if(!Number.isInteger(obj[name]) || obj[name] < 0){
            throw name + " argument must be a integer larger or equal to zero"
        }
    }
}

const assertIsInterval = (low, lowName, high, highName, minVal, maxVal) => {
    assertInInterval(low, lowName, minVal, maxVal)
    assertInInterval(high, highName, minVal, maxVal)
    if(low > high){
        throw `${lowName} value cannot be higher than ${highName}`
    }
}

const assertBooleans = (obj) => {
    for (let name in obj) {
        if(typeof obj[name] !== "boolean"){
            throw name + " must be a bool"
        }
    }
}

const assertInDictionary = (val, dictionary, dictionaryName) => {
    if(!Object.values(dictionary).includes(val)){
        throw "Please use the values defined in " + dictionaryName
    }
}

const defaultSettings = {
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
        randomValue: new Array(4).fill(true)
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
        advancedValue: new Array(10).fill(true)
    },
    animeScore:{
        advancedOn:false,
        standardValue:[
            2,
            10
        ],
        advancedValue: new Array(9).fill(true)
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

const CONST_VALUES = {
    ROOM_NAME_MAX_LENGTH:20,
    PASSWORD_MAX_LENGTH:50,
    ROOM_SIZE_MIN:2,
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
        OPTIONAL:3
    },
    TAG_STATE:{
        INCLUDE:1,
        EXCLUDE:2,
        OPTIONAL:3
    }
}




LobbySettings.CONST_VALUES = CONST_VALUES
module.exports = LobbySettings
