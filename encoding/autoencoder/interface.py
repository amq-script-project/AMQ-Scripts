from autoconvert import autoconvert
import os
import re
print("Welcome to the autoconverter interface")
while True:
    while True:
        filename = input("Please type the name of the file:\n\t")
        if not os.path.isfile(filename):
            if re.match("https?://.*", filename):
                # assume webpage is live and is a file
                break
            print("ERROR: That file does not exist.")
        else:
            break
    while True:
        target = input(
            "Please choose target resolution:\n0: mp3\n" +
            "1: 480p\n2: 720p\n3: Source [default]\n4: All\n" +
            "5:AMQ\n\t")
        target = target.lower()
        crf = -1  # default value
        if target == "0" or target == "mp3":
            targetResolution = 0
        elif target == "1" or target == "480p":
            targetResolution = 480
        elif target == "2" or target == "720p":
            targetResolution = 720
        elif (target == "3" or target == "source" or target == ""
              or target == "4" or target == "all"
              or target == "5" or target.lower() == "amq"):
            if target == "3" or target == "source" or target == "":
                targetResolution = -1
            if target == "5" or target.lower() == "amq":
                targetResolution = -3
            else:
                targetResolution = -2
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
        else:
            print('"%s" is not a valid choice' % target)
            continue
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
        if targetResolution == -2:
            sourcefile = autoconvert(filename, -1, animeTitle,
                                     songType, songTitle, songArtist,
                                     start, end, crf)
            if start != 0.0 or end != 0.0:
                autoconvert(sourcefile, 0, animeTitle,
                            songType, songTitle, songArtist, 0.0, 0.0, -1)
            else:
                autoconvert(filename, 0, animeTitle,
                            songType, songTitle, songArtist, start, end, -1)
            autoconvert(filename, 480, animeTitle,
                        songType, songTitle, songArtist, start, end, -1)
            autoconvert(filename, 720, animeTitle,
                        songType, songTitle, songArtist, start, end, -1)
        elif targetResolution == -3:
            autoconvert(filename, 720, animeTitle,
                        songType, songTitle, songArtist, start, end, -1)
            sourcefile = autoconvert(filename, -1, animeTitle,
                                     songType, songTitle, songArtist,
                                     start, end, crf)
            if start != 0.0 or end != 0.0:
                autoconvert(sourcefile, 0, animeTitle,
                            songType, songTitle, songArtist, 0.0, 0.0, -1)
            else:
                autoconvert(filename, 0, animeTitle,
                            songType, songTitle, songArtist, start, end, -1)
            autoconvert(filename, 480, animeTitle,
                        songType, songTitle, songArtist, start, end, -1)
        else:
            autoconvert(filename, targetResolution, animeTitle,
                        songType, songTitle, songArtist, start, end, crf)
        print("Job completed")
    except Exception as e:
        print("During execution, an exception occured:%s" % str(e))
    print("")
    cont = input("Would you like to continue?(y/[n])")
    if cont == "":
        break
    elif cont[0] == "y":
        continue
    else:
        break
