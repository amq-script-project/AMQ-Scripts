""""
The part of the program the user should be using.
Presents them with a CLI that asks for file info.

Tries to check what kind of file the user is offering
so the user doesn't have to do anything.

Authors: Zolhungaj
        FokjeM / RivenSkaye (minor tweaks)
"""

from autoconvert import autoconvert
from autorescheck import autorescheck
import os
import re
import sys

upload = False
try:
    with open(sys.path[0] + os.sep + "interface.config") as file:
        match = re.search("upload" + r"\s?=[ \t\r\f\v]*(true|false)$", file.read(), re.I | re.M)
        if match is None:
            print("interface.py: upload defaults to FALSE")
        else:
            if match.group(1).lower() == "true":
                upload = True
except Exception:
    print("interface.py: no config file present")
if upload:
    import catbox

print("Welcome to the autoconverter interface")
while True:
    while True:
        filename = input("Please type the path/url to the file, or drag and drop the file into the window:\n\t")
        if filename.startswith('"') and filename.endswith('"'):
            filename = filename[1:-1]
        if not os.path.isfile(filename):
            if re.match("https?://.*", filename):
                # assume webpage is live and is a file
                break
            print("ERROR: That file does not exist.")
        else:
            break
    while True:
        target = input(
            """Please choose target resolution:
            0: mp3
            1: 480p
            2: 720p
            3: Source [default] (slow)
            4: All (Source, 720p, 480p, mp3)
            5: All-AMQ submit order (720p, Source, 480p, mp3)
            6: unscaled (like 720p but for esoteric sizes)
            7: AMQ-720 source is 720 or higher (720p, mp3, 480p)
            8: AMQ-576 source is 576 or at least higher than 480 (unscaled, 480p, mp3)
            9: AMQ-480 source is 480 or lower (unscaled, mp3)
            Leave blank for auto-determination mode, we'll figure out the details for you.
            \t""")
        choice = {"0" : 0, "mp3" : 0, "1" : 480, "480p" : 480, "2" : 720, "720p" : 720, "3" : -1, "source" : -1, "4" : -2, "all" : -2, "all-amq" : -2, "5" : -3, "amq-720" : -3, "6" : -4, "unscaled" : -4, "7" : -5, "amq" : -5, "8" : -6, "amq-576" : -6, "9" : -7, "amq-480" : -7}
        target = target.lower()
        crf = -1  # default value
        try:
            targetResolution = choice[target]
        # Any illegal value causes auto-determination to run.
        except KeyError:
            targetResolution = choice[autorescheck(filename)]
        # range(a, b) is inclusive a and exclusive b!
        if (targetResolution in range(-3, 0)):
            while True:
                try:
                    string = input(
                        "Optional: enter your desired crf [0-63]" +
                        ", default=16\n\t")
                    if string == "":
                        crf = 16
                        break
                    else:
                        crf = int(string)
                except ValueError as e:
                    print("That appears to not be a valid integer")
                    continue
                if crf < 0 or crf > 63:
                    print("%d is not in the range [0-63]")
                    continue
                break
        break
    animeTitle = input(
        "Please enter anime name, this will be used to name the file\n\t")
    songType = input("Optional: enter song type\n\t")
    songTitle = input("Optional: enter song title\n\t")
    songArtist = input("Optional: enter song artist\n\t")
    while True:
        start = input("Optional: enter start time override\n\t")
        if start == "":
            start = 0.0
        else:
            try:
                start = float(start)
            except ValueError:
                print("Invalid value")
                continue
            if start < 0.0:
                print("Invalid value")
                continue
        break
    while True:
        end = input("Optional: enter end time override\n\t")
        if end == "":
            end = 0.0
        else:
            try:
                end = float(end)
            except ValueError:
                print("Invalid value")
                continue
            if end < 0.0:
                print("Invalid value")
                continue
        break
    try:
        res = []
        if targetResolution == -2:
            sourcefile = autoconvert(filename, -1, animeTitle,
                                     songType, songTitle, songArtist,
                                     start, end, crf)
            res.append(sourcefile)
            if start != 0.0 or end != 0.0:
                res.append(autoconvert(sourcefile, 0, animeTitle,
                            songType, songTitle, songArtist, 0.0, 0.0, -1))
            else:
                res.append(autoconvert(filename, 0, animeTitle,
                            songType, songTitle, songArtist, start, end, -1))
            res.append(autoconvert(filename, 480, animeTitle,
                        songType, songTitle, songArtist, start, end, -1))
            res.append(autoconvert(filename, 720, animeTitle,
                        songType, songTitle, songArtist, start, end, -1))
        elif targetResolution == -3:
            res.append(autoconvert(filename, 720, animeTitle,
                        songType, songTitle, songArtist, start, end, -1))
            sourcefile = autoconvert(filename, -1, animeTitle,
                                     songType, songTitle, songArtist,
                                     start, end, crf)
            res.append(sourcefile)
            if start != 0.0 or end != 0.0:
                res.append(autoconvert(sourcefile, 0, animeTitle,
                            songType, songTitle, songArtist, 0.0, 0.0, -1))
            else:
                res.append(autoconvert(filename, 0, animeTitle,
                            songType, songTitle, songArtist, start, end, -1))
            res.append(autoconvert(filename, 480, animeTitle,
                        songType, songTitle, songArtist, start, end, -1))
        elif targetResolution == -4:  # unscaled
            res.append(autoconvert(filename, -2, animeTitle,
                        songType, songTitle, songArtist, start, end, -1))
        elif targetResolution == -5:  # amq-720
            sourcefile = autoconvert(filename, 720, animeTitle,
                        songType, songTitle, songArtist, start, end, -1)
            res.append(sourcefile)
            if start != 0.0 or end != 0.0:
                res.append(autoconvert(sourcefile, 0, animeTitle,
                            songType, songTitle, songArtist, 0.0, 0.0, -1))
            else:
                res.append(autoconvert(filename, 0, animeTitle,
                            songType, songTitle, songArtist, start, end, -1))
            res.append(autoconvert(filename, 480, animeTitle,
                        songType, songTitle, songArtist, start, end, -1))
        elif targetResolution == -6:  # amq-576
            sourcefile = autoconvert(filename, -2, animeTitle,
                        songType, songTitle, songArtist, start, end, -1)
            res.append(sourcefile)
            if start != 0.0 or end != 0.0:
                res.append(autoconvert(sourcefile, 0, animeTitle,
                            songType, songTitle, songArtist, 0.0, 0.0, -1))
            else:
                res.append(autoconvert(filename, 0, animeTitle,
                            songType, songTitle, songArtist, start, end, -1))
            res.append(autoconvert(filename, 480, animeTitle,
                        songType, songTitle, songArtist, start, end, -1))
        elif targetResolution == -7:  # amq-480
            sourcefile = autoconvert(filename, -2, animeTitle,
                        songType, songTitle, songArtist, start, end, -1)
            res.append(sourcefile)
            if start != 0.0 or end != 0.0:
                res.append(autoconvert(sourcefile, 0, animeTitle,
                            songType, songTitle, songArtist, 0.0, 0.0, -1))
            else:
                res.append(autoconvert(filename, 0, animeTitle,
                            songType, songTitle, songArtist, start, end, -1))
        else:
            res.append(autoconvert(filename, targetResolution, animeTitle,
                        songType, songTitle, songArtist, start, end, crf))
        print("Job completed")
    except Exception as e:
        print("During execution, an exception occured:%s" % str(e))
    print("")
    if upload:
        links = []
        for file in res:
            try:
                links.append(catbox.upload(file))
            except Exception as e:
                print("Could not upload %s: %s" % (file, str(e)))
        print(links)
    cont = input("Would you like to continue?(y/[n])").lower()
    if cont == "":
        break
    elif cont[0] == "y":
        continue
    else:
        break
