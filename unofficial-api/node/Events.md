# Events
> note: all events come with at most one payload object, thus to access the variables stored within you always have to unpack the object manually. 
Also yes some of them are misspelled, that's just how it is.
nested objects are displayed as nested lists
## LOGIN_COMPLETE - "login complete"
> contains everything required for the client once login has succeeded
### items
- self
  > (string) name of the user that logged in
- gameAdmin
  > (boolean) identifies if the user is admin, decides if certain visual elements are shown or not
- saleTax
  > (number/integer) taxation rate given in percent, only nonzero in EU countries
- malName
  > (string) currently synced MyAnimeList account
- malLastUpdate
  > (string/null) last time the MyAnimeList account was synced, on the format "YYYY-MM-DD", null if no MyAnimeList account is synced
- settings
  > a loose mix of website functionality and game functionality
  - autoSubmit
    > (boolean) **website only**, if the client should autosubmit the info in the answer box if no answer is submitted yet at the end of asnwer phase
  - voteSkipGuess
    > (boolean) **website only**, if the client should automatically vote to skip after answering
  - voteSkipReplay
    > (boolean) **website only**, if the client should automatically vote to skip replay, with a 2 second delay
  - disableEmojis
    > (boolean) **website only**, if the client should avoid rendering emojis
  - showTeamAnswersState
    > (integer) **website only**, if chat should print team member answers, has three valid states 0: never, 1: (out of focus) only if you are currently viewing another team's block, 2: always
  - autoSwitchFavoritedAvatars
    > (integer) **website only**, if the client should switch avatars automatically after a round, has three valid states 0: off, 1: cycle, 2: random
  - shareMal
    > (boolean) tells you if the game should share that a show was in any of your lists and your status for the show
  - shareScore
    > (boolean) continuation of shareMal, if your score should be shared too
  - useWatched
    > (boolean) if watched shows from your list should be used in song selection
  - useCompleted
    > (boolean) if completed shows from your list should be used in song selection
  - useOnHold
    > (boolean) if paused shows from your list should be used in song selection
  - useDropped
    > (boolean) if dropped shows from your list should be used in song selection
  - usePlanning
    > (boolean) if planned shows from your list should be used in song selection
- anilist
  > (string) currently synced AniList account
- anilistLastUpdate
  > (string/null) last time the AniList account was synced, on the format "YYYY-MM-DD", null if no AniList account is synced
- kitsu
  > (string) currently synced Kitsu account
- kitsuLastUpdate
  > (string/null) last time the Kitsu account was synced, on the format "YYYY-MM-DD", null if no Kitsu account is synced
- useRomajiNames
  > (boolean) if romaji show names should be preferred over English names
- serverStatuses
  > list of:
  - name
    > (string) name of the server
  - online
    > (boolean) if the server is online
- videoHostNames
  > ([string]) names of videohosts
- genreInfo
  > list of:
  - id
    > (number/integer) id of the genre
  - name
    > (string) name of the genre
- tagInfo
  > list of:
  - id
    > (number/integer) id of the tag
  - name
    > (string) name of the tag
- savedQuizSettings
  > list of:
  - id
    > (integer) id of the saved setting set
  - settingString
    > (string) string representation of the saved setting set, on the form of a series of base 36 numbers
  - name
    > (string) name of the saved setting set
- top5AvatarNominatios
  > list of: the current top 5 avatar nominations
  - name
    > (string) name of nomination
  - value
    > (number/double) current donated value
- top5AllTime
  > list of: top 5 donators of all time
  - name
    > (string) name of donator
  - amount
    > (number/double) amount donated total
- top5Montly
  > list of: top 5 donators of the last month
  - name
    > (string) name of donator
  - amount
    > (number/double) amount donated last month
- top5Weekly
  > list of: top 5 donators of the last week
  - name
    > (string) name of donator
  - amount
    > (number/double) amount donated last week
- recentDonations
  > list of: recent donations
  - username
    > (string) name of donator
  - avatarName
    > (string) name of avatar supported
  - amount
    > (number/double) amount donated
- driveTotal
  > (number/double) sum of money donated to current drive
- freeDonation
  > (boolean) **patreon feature** wether or not you have a free donation available
- tutorial
  > (number/integer) if the tutorial has been completed, has three valid values 0: has completed tutorial, and thus can't be rewarded for taking it; 1: is to be prompted to take tutorial; 2: has skipped the tutorial, but may take it at any time to get reward
- expandCount
  > (number/integer) amount of songs you have submitted to expand library
- rankedState
  > (number/integer) current state of current/next scheduled ranked game has 9 valid values: 0: offline, 1: lobby, 2: running, 3: finished, 4: championship offline, 5: championship lobby, 6: championship running, 7: championship finished, 8: break day
- rankedSerie
  > (number/integer) which ranked is next has 2 valid values: 1: Central (8:30pm Europe/Copenhagen), 2: West (8:30pm America/Chicago)
- rankedLeaderboards
- rankedChampions
- defaultAvatars
- unlockedDesigns
- avatar
- characterUnlockCount
- avatarUnlockCount
- emoteGroups
- rhythm
- unlockedEmoteIds
- favoriteAvatars
- patreonId
- backerLevel
- badgeLevel
- customEmojis
- patreonBadgeInfo
- patreonDesynced
- recentEmotes
- guestAccount
- restartState
  - msg
    > (string) The message conserning the server restart
  - time
    > (number/integer) time to restart, in minutes
- xpInfo
- level
- credits
- tickets
## ALERT - "alert"
### items
- title
- message
- easyClose
## FORCED_LOGOFF - "force logoff"
### items
- reason
  > (string) reason you were logged off, usually server restart
## SERVER_STATE_CHANGE - "server state change
- name
  > (string) name of affected server
- onlne
  > (boolean) online status


















