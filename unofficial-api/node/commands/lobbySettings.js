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

    setRoomSize(num) {
        if(num < this.CONST.ROOM_SIZE_MIN || num > this.CONST.ROOM_SIZE_MAX || !Number.isInteger(num)){
            throw "Room size must be in the integer interval [" + this.CONST.ROOM_SIZE_MIN + "," + this.CONST.ROOM_SIZE_MAX + "]"
        }
        this.settings.roomSize = num
        gameMode = num > 1 ? "Multiplayer" : "Solo"
    }

    setTeamSize(num) {
        if(num < this.CONST.TEAM_SIZE_MIN || num > this.CONST.TEAM_SIZE_MAX || !Number.isInteger(num)){
            throw "Team size must be in the integer interval [" + this.CONST.TEAM_SIZE_MIN + "," + this.CONST.TEAM_SIZE_MAX + "]"
        }
        this.settings.teamSize = num
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
        if(!newPassword){
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

    setSongCount(num) {
        if(num < this.CONST.SONG_COUNT_MIN || num > this.CONST.SONG_COUNT_MAX || !Number.isInteger(num)){
            throw "Song count must be in the integer interval [" + this.CONST.SONG_COUNT_MIN + "," + this.CONST.SONG_COUNT_MAX + "]"
        }
        const oldSongCount = this.settings.numberOfSongs
        this.settings.numberOfSongs = num
        _calculateSongDistribution(this.settings.songSelection.advancedValue.watched, this.settings.songSelection.advancedValue.unwatched, this.settings.songSelection.advancedValue.random, oldSongCount, this.settings.numberOfSongs)
    }

    setSkipGuessing(bool){
        if(typeof bool !== "boolean"){
            throw "skipGuessing must be a bool"
        }
        this.settings.modifiers.skipGuessing = bool
    }
    
    setSkipReplay(bool){
        if(typeof bool !== "boolean"){
            throw "skipReplay must be a bool"
        }
        this.settings.modifiers.skipReplay = bool
    }
    
    setDuplicates(bool){
        if(typeof bool !== "boolean"){
            throw "duplicates must be a bool"
        }
        this.settings.modifiers.duplicates = bool
    }
    
    setQueueing(bool){
        if(typeof bool !== "boolean"){
            throw "queueing must be a bool"
        }
        this.settings.modifiers.queueing = bool
    }
    
    setLootDropping(bool){
        if(typeof bool !== "boolean"){
            throw "lootDropping must be a bool"
        }
        this.settings.modifiers.lootDropping = bool
    }

    setSongSelectionStandard(num){
        if(!Object.values(this.CONST.SONG_SELECTION).includes(num)){
            throw "Please use the values defined in CONST.SONG_SELECTION"
        }
        const ratio = this.CONST.SONG_SELECTION_STANDARD_RATIOS
        const ratios = [ratio.RANDOM, ratio.MIX, ratio.WATCHED][num-1]
        this.settings.songSelection.standardValue = num
        this._calculateSongDistribution(ratios.WATCHED, ratios.UNWATCHED, ratios.RANDOM, ratio.QUANTIFIER, this.settings.songCount)
    }

    _calculateSongDistribution(watchedRatio, unwatchedRatio, randomRatio, ratioQuantifier, songCount){
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
    }

    
}
module.exports = LobbySettings
