from autoconvert import autoconvert
import os
import re
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
            8: AMQ-576 source is 576 or higher (unscaled, 480, mp3)
            9: AMQ-480 source is 480 or lower (unscaled, mp3)
            \t""")
        target = target.lower()
        crf = -1  # default value
        if target == "0" or target == "mp3":
            targetResolution = 0
        elif target == "1" or target == "480p":
            targetResolution = 480
        elif target == "2" or target == "720p":
            targetResolution = 720
        elif target == "6" or target == "unscaled":
            targetResolution = -4
        elif target == "7" or target == "amq":
            targetResolution = -5
        elif target == "8" or target == "amq-576":
            targetResolution = -6
        elif target == "9" or target == "amq-480":
            targetResolution = -7
        elif (target == "3" or target == "source" or target == ""
              or target == "4" or target == "all"
              or target == "5" or target == "all-amq"):
            if target == "3" or target == "source" or target == "":
                targetResolution = -1
            if target == "5" or target == "amq-720":
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
        elif targetResolution == -4:  # unscaled
            autoconvert(filename, -2, animeTitle,
                        songType, songTitle, songArtist, start, end, -1)
        elif targetResolution == -5:  # amq-720
            sourcefile = autoconvert(filename, 720, animeTitle,
                        songType, songTitle, songArtist, start, end, -1)
            if start != 0.0 or end != 0.0:
                autoconvert(sourcefile, 0, animeTitle,
                            songType, songTitle, songArtist, 0.0, 0.0, -1)
            else:
                autoconvert(filename, 0, animeTitle,
                            songType, songTitle, songArtist, start, end, -1)
            autoconvert(filename, 480, animeTitle,
                        songType, songTitle, songArtist, start, end, -1)
        elif targetResolution == -6:  # amq-576
            sourcefile = autoconvert(filename, -2, animeTitle,
                        songType, songTitle, songArtist, start, end, -1)
            if start != 0.0 or end != 0.0:
                autoconvert(sourcefile, 0, animeTitle,
                            songType, songTitle, songArtist, 0.0, 0.0, -1)
            else:
                autoconvert(filename, 0, animeTitle,
                            songType, songTitle, songArtist, start, end, -1)
            autoconvert(filename, 480, animeTitle,
                        songType, songTitle, songArtist, start, end, -1)
        elif targetResolution == -7:  # amq-480
            sourcefile = autoconvert(filename, -2, animeTitle,
                        songType, songTitle, songArtist, start, end, -1)
            if start != 0.0 or end != 0.0:
                autoconvert(sourcefile, 0, animeTitle,
                            songType, songTitle, songArtist, 0.0, 0.0, -1)
            else:
                autoconvert(filename, 0, animeTitle,
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
