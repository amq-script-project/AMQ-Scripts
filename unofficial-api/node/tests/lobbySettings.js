let LobbySettings = require('../structures/lobbySettings')

verboseTests = false
test = (verbose=verboseTests) => {
    const oldVerbose = verboseTests
    const CONST_VALUES = LobbySettings.CONST_VALUES
    verboseTests = verbose
    const dummy = new LobbySettings()
    dummy.getSettings() //test that valid settings work, validate is part of getSettings
    new LobbySettings(dummy.getSettings(false)).getSettings() //test that valid override works

    verifyFailList(dummy.setRoomName, "", 4, "a".repeat(CONST_VALUES.ROOM_NAME_MAX_LENGTH + 1))
    verifyFailList(dummy.setPassword, 4, "a".repeat(CONST_VALUES.PASSWORD_MAX_LENGTH + 1))
    verifyFailList(dummy.setRoomSize, "4", 0, CONST_VALUES.ROOM_SIZE_MAX+1,8.5)
    verifyFailList(dummy.setTeamSize,  "4", CONST_VALUES.TEAM_SIZE_MIN-1, CONST_VALUES.TEAM_SIZE_MAX+1,3.5)
    verifyFailList(dummy.setSongCount, "4", CONST_VALUES.SONG_COUNT_MIN-1, CONST_VALUES.SONG_COUNT_MAX+1,10.5)
    verifyFailList(dummy.enableSkipGuessing, 1, 0, "", undefined)
    verifyFailList(dummy.enableSkipReplay, 1, 0, "", undefined)
    verifyFailList(dummy.enableDuplicates, 1, 0, "", undefined)
    verifyFailList(dummy.enableQueueing, 1, 0, "", undefined)
    verifyFailList(dummy.enableLootDropping, 1, 0, "", undefined)
    verifyFailList(dummy.setSongSelection, 0, 4)
    verifyFailList(dummy.setSongSelectionAdvanced, [0,0,0], [-1,14,14], [0,-1,4], [4,4,-1], [-1,-1,-1])
    verifyFailList(dummy.enableSongTypes, [false, false, false], [1, true, true], [true, 1, true], [true, true, 1])
    verifyFailList(dummy.setSongTypeSelectionAdvanced, [0,0,0,0], [-1,14,14,15], [0,-1,4,4], [4,4,-1,0], [4,4,0,-1], [-1,-1,-1, -1], [undefined])
    verifyFailList(dummy.setGuessTime, "4", CONST_VALUES.GUESS_TIME_MIN-1, CONST_VALUES.GUESS_TIME_MAX+1,10.5)
    verifyFailList(dummy.setGuessTimeAdvanced, [CONST_VALUES.GUESS_TIME_MIN,"4"], ["4",CONST_VALUES.GUESS_TIME_MAX], [CONST_VALUES.GUESS_TIME_MIN-1, CONST_VALUES.GUESS_TIME_MAX],[CONST_VALUES.GUESS_TIME_MIN, CONST_VALUES.GUESS_TIME_MAX+1], [CONST_VALUES.GUESS_TIME_MAX, CONST_VALUES.GUESS_TIME_MIN])
    verifyFailList(dummy.enableRandomGuessTime, 1, 0, "", undefined)
    verifyFailList(dummy.setScoreType, 0, 4, "a", undefined)
    verifyFailList(dummy.setShowSelection, 0, 3, "a", undefined)
    verifyFailList(dummy.setGameMode, 0, 5, "a", undefined)
    verifyFailList(dummy.setInventorySize, "4", CONST_VALUES.INVENTORY_SIZE_MIN-1, CONST_VALUES.INVENTORY_SIZE_MAX+1,10.5)
    verifyFailList(dummy.setInventorySizeAdvanced, [CONST_VALUES.INVENTORY_SIZE_MIN,"4"], ["4",CONST_VALUES.INVENTORY_SIZE_MAX], [CONST_VALUES.INVENTORY_SIZE_MIN-1, CONST_VALUES.INVENTORY_SIZE_MAX],[CONST_VALUES.INVENTORY_SIZE_MIN, CONST_VALUES.INVENTORY_SIZE_MAX+1], [CONST_VALUES.INVENTORY_SIZE_MAX, CONST_VALUES.INVENTORY_SIZE_MIN])
    verifyFailList(dummy.enableRandomInventorySize, 1, 0, "", undefined)
    verifyFailList(dummy.setLootingTime, "4", CONST_VALUES.LOOTING_TIME_MIN-1, CONST_VALUES.LOOTING_TIME_MAX+1,10.5)
    verifyFailList(dummy.setLootingTimeAdvanced, [CONST_VALUES.LOOTING_TIME_MIN,"4"], ["4",CONST_VALUES.LOOTING_TIME_MAX], [CONST_VALUES.LOOTING_TIME_MIN-1, CONST_VALUES.LOOTING_TIME_MAX],[CONST_VALUES.LOOTING_TIME_MIN, CONST_VALUES.LOOTING_TIME_MAX+1], [CONST_VALUES.LOOTING_TIME_MAX, CONST_VALUES.LOOTING_TIME_MIN])
    verifyFailList(dummy.enableRandomLootingTime, 1, 0, "", undefined)
    verifyFailList(dummy.setLives, "4", CONST_VALUES.LIVES_MIN-1, CONST_VALUES.LIVES_MAX+1,4.5)
    verifyFailList(dummy.setSamplePoint, 0, 4, "a", undefined)
    verifyFailList(dummy.setSamplePointAdvanced, [CONST_VALUES.SAMPLE_POINT_MIN,"4"], ["4",CONST_VALUES.SAMPLE_POINT_MAX], [CONST_VALUES.SAMPLE_POINT_MIN-1, CONST_VALUES.SAMPLE_POINT_MAX],[CONST_VALUES.SAMPLE_POINT_MIN, CONST_VALUES.SAMPLE_POINT_MAX+1], [CONST_VALUES.SAMPLE_POINT_MAX, CONST_VALUES.SAMPLE_POINT_MIN])
    verifyFailList(dummy.enableRandomSamplePoint, 1, 0, "", undefined)
    verifyFailList(dummy.setPlaybackSpeed, CONST_VALUES.PLAYBACK_SPEED_MIN-0.5, CONST_VALUES.PLAYBACK_SPEED_MAX+0.5, "4", undefined)
    verifyFailList(dummy.setPlaybackSpeedAdvanced, [false, false, false, false], [1, true, true, true], [true, 1, true, true], [true, true, 1, true], [true, true, true, 1])
    verifyFailList(dummy.enableRandomPlaybackSpeed, 1, 0, "", undefined)
    verifyFailList(dummy.enableSongDifficulty, [false, false, false], [1, true, true], [true, 1, true], [true, true, 1])
    verifyFailList(dummy.setSongDifficultyAdvanced, [CONST_VALUES.DIFFICULTY_MIN,"4"], ["4",CONST_VALUES.DIFFICULTY_MAX], [CONST_VALUES.DIFFICULTY_MIN-1, CONST_VALUES.DIFFICULTY_MAX],[CONST_VALUES.DIFFICULTY_MIN, CONST_VALUES.DIFFICULTY_MAX+1], [CONST_VALUES.DIFFICULTY_MAX, CONST_VALUES.DIFFICULTY_MIN])
    verifyFailList(dummy.enableSongDifficultyAdvanced, 1, 0, "", undefined)
    verifyFailList(dummy.enableSongPopularity, [false, false, false], [1, true, true], [true, 1, true], [true, true, 1])
    verifyFailList(dummy.setSongPopularityAdvanced, [CONST_VALUES.POPULARITY_MIN,"4"], ["4",CONST_VALUES.POPULARITY_MAX], [CONST_VALUES.POPULARITY_MIN-1, CONST_VALUES.POPULARITY_MAX],[CONST_VALUES.POPULARITY_MIN, CONST_VALUES.POPULARITY_MAX+1], [CONST_VALUES.POPULARITY_MAX, CONST_VALUES.POPULARITY_MIN])
    verifyFailList(dummy.enableSongPopularityAdvanced, 1, 0, "", undefined)
    verifyFailList(dummy.setPlayerScore, [CONST_VALUES.PLAYER_SCORE_MIN,"4"], ["4",CONST_VALUES.PLAYER_SCORE_MAX], [CONST_VALUES.PLAYER_SCORE_MIN-1, CONST_VALUES.PLAYER_SCORE_MAX],[CONST_VALUES.PLAYER_SCORE_MIN, CONST_VALUES.PLAYER_SCORE_MAX+1], [CONST_VALUES.PLAYER_SCORE_MAX, CONST_VALUES.PLAYER_SCORE_MIN])
    verifyFailList(dummy.enablePlayerScoreAdvanced, 1, 0, "", undefined)
    verifyFailList(dummy.setPlayerScoreAdvanced, [0, true], [1.5, true], [11, true])
    verifyFailList(dummy.setAnimeScore, [CONST_VALUES.ANIME_SCORE_MIN,"4"], ["4",CONST_VALUES.ANIME_SCORE_MAX], [CONST_VALUES.ANIME_SCORE_MIN-1, CONST_VALUES.ANIME_SCORE_MAX],[CONST_VALUES.ANIME_SCORE_MIN, CONST_VALUES.ANIME_SCORE_MAX+1], [CONST_VALUES.ANIME_SCORE_MAX, CONST_VALUES.ANIME_SCORE_MIN])
    verifyFailList(dummy.enableAnimeScoreAdvanced, 1, 0, "", undefined)
    verifyFailList(dummy.setAnimeScoreAdvanced, [1, true], [2.5, true], [11, true])
    { //vintage
        dummy.resetVintage()
        dummy.addVintage(1999, 2001, 1, 3)
        dummy.addVintage(1944, 2020, 0, 3)
        dummy.addVintage(1955, 2002, 1, 2)
        verifyFailList(dummy.addVintage, [1999, 2001, 1, 3], [1944, 2020, 0, 3], [1955, 2002, 1, 2])
        dummy.resetVintage()
        verifyFailList(dummy.setVintage,
            [CONST_VALUES.YEAR_MIN-1, CONST_VALUES.YEAR_MAX, CONST_VALUES.SEASON_MIN, CONST_VALUES.SEASON_MAX],
            [CONST_VALUES.YEAR_MIN, CONST_VALUES.YEAR_MAX+1, CONST_VALUES.SEASON_MIN, CONST_VALUES.SEASON_MAX],
            [CONST_VALUES.YEAR_MIN, CONST_VALUES.YEAR_MAX, CONST_VALUES.SEASON_MIN-1, CONST_VALUES.SEASON_MAX],
            [CONST_VALUES.YEAR_MIN, CONST_VALUES.YEAR_MAX, CONST_VALUES.SEASON_MIN, CONST_VALUES.SEASON_MAX+1],
            [CONST_VALUES.YEAR_MAX, CONST_VALUES.YEAR_MIN, CONST_VALUES.SEASON_MIN, CONST_VALUES.SEASON_MAX],
            [CONST_VALUES.YEAR_MIN, CONST_VALUES.YEAR_MAX, CONST_VALUES.SEASON_MAX, CONST_VALUES.SEASON_MIN],
        )
    }
    verifyFailList(dummy.enableShowTypes,
        ["true",true,true,true,true],
        [true,"true",true,true,true],
        [true,true,"true",true,true],
        [true,true,true,"true",true],
        [true,true,true,true,"true"],
        [false,false,false,false,false],
    )
    {//genres
        dummy.clearGenres()
        dummy.addGenre("5", 2)
        verifyFailList(dummy.removeGenre, 5, "4")
        verifyFailList(dummy.changeGenreState, [4, 2], ["4", 4], ["0", 0], ["0", "1"], ["0", 1])
        verifyFailList(dummy.addGenre, ["5", 2], [0, 1], ["0", 0], ["0", 4])
    }
    {//tags
        dummy.clearTags()
        dummy.addTag("5", 2)
        verifyFailList(dummy.removeTag, 5, "4")
        verifyFailList(dummy.changeTagState, [4, 2], ["4", 4], ["0", 0], ["0", "1"], ["0", 1])
        verifyFailList(dummy.addTag, ["5", 2], [0, 1], ["0", 0], ["0", 4])
    }
    //verifyFailList(dummy.enable, 1, 0, "", undefined)
    // verifyFailList(dummy. , )
    //verifyFailList(dummy. , )
    //verifyFailList(dummy. , )
    console.log("All tests passed successfully")
    verboseTests = oldVerbose
    //exit()
}

verifyFailList = (func, ...listOfArgs) => {
    listOfArgs.forEach((arg) => {
        if(Array.isArray(arg)){
            verifyFail(func, ...arg)
        }else{
            verifyFail(func, arg)
        }
    })
    if(verboseTests){
        console.log(func.name, "SUCCESS", listOfArgs.length, "cases tested\n")
    }
}

verifyFail = (func, ...args) => {
    let success = false
    try{
        //console.log(args, ...args)
        func(...args)
        if(verboseTests){
            console.log(func.name, ...args, "SUCCEEDED, FAIL!")
        }
        success = true
    }catch(err){
        if(verboseTests){
            console.log(func.name, ...args, "FAILED, SUCCESS!", err)
        }
        success = false
    }
    if(success){
        throw func.name + " succeeded with arguments [" + args.join(", ") + "]"
    }
}

test(true)
