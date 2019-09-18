"""
this module searches through the database of uploaded songs and tries to print a match
"""

import sqlite3
conn = sqlite3.connect("automator.db")
url = "!"
url = input("input url\n")
while(url != ""):
    print()
    res = conn.execute("""SELECT
    source,
    anime,
    title,
    type,
    artist
    from upload
    WHERE url = ?
    ;""", (url,))
    box = res.fetchone()
    if box is None:
        print("no result")
    else:
        while box is not None:
            print("source url: <" + box[0] + ">")
            print("anime: " + box[1])
            print("song title: " + box[2])
            print("type: " + box[3])
            print("artist: " + box[4])
            print()
            box = res.fetchone()
    url = input("input url\n")
