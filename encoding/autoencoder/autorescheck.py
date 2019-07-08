"""
Simple piece of code that checks the current video quality
and then returns the best AMQ option.

Author: FokjeM / RivenSkaye
        Zolhungaj, upgrade for the addition of a config file
"""
import os
import sys
import re

with open(os.path.dirname(sys.argv[0]) + os.sep + "autoconvert.config") as file:
    match = re.search("mediainfo_path" + r"\s?=[ \t\r\f\v]*(.+)$", file.read(), re.I | re.M)
    if match is None:
        print("ERROR %s missing in config file" % keyword)
        input()
        exit(0)
    else:
        mediainfo = match.group(1)


def autorescheck(inputfile):
    print("Using automatic determination for video resolution!")
    command = '%s "%s" --output=Video;%%Height%%' % (mediainfo, inputfile)
    process = os.popen(command)
    height = int(process.read())
    if height <= 480: # 480 or worse, should be encoded as AMQ 480p
        return "9"
    elif height < 720: # This falls under the 576p category, because we know it's more than 480p
        return "8"
    else: # It's 720p or better. Someone has quality content!
        return "7"
