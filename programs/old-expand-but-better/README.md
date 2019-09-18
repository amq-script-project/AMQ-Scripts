# AMQ-automator
A tool that finds entries matching a particular upload pattern and prompts the user for a video source

modules
automator - core module, the one usually ran
autoconvert - conversion backbone
catbox - catbox upload handler
find_entry - database search

automator.config defintion{
  amq-username
  amq-password
  anilist-username
  kitsu-username
  seek op in ed 720 480 mp3 random
  geckodriver_location
}[
  1st line is the amq username used to log in
  2nd line is the amq password used to log in
  3rd line is anilist username (leave blank for none)
  4th line is kitsu username (leave blank for none)
  5th line is the mode parameter, valid content{
    "seek": the mode seek, the automator will search for entries matching the other parameters and prompt the user for a good source

    "op": limit the search to openings
    "ed": limit the search to endings
    "in": limit the search to inserts
    "op ed in": can be combined in any way, omitting them is the same as including all of them

    "720": limit the search to songs which have 720p uploaded
    "480": limit the search to songs which have 480p uploaded
    "mp3": limit the search to songs which have mp3 uploaded
    "720 480 mp3": can be combined in any way, vomiting any of them will limit to songs which do not have them uploaded

    "random": scrambles the order, songs will still be grouped by anime.
  }
  6th line is the path to geckodriver
]
