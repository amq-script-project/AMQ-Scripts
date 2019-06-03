"""
Simple piece of code that checks the current video quality
and then returns the best AMQ option.

Author: FokjeM / RivenSkaye
"""
import os
import subprocess
import datetime
import time
mediainfo = "mediainfo"
logfile = "AMQ-autorescheck.log"
if "\\mediainfo" not in str.lower(os.environ['PATH']):
    log("MediaInfo not found on path.")
    try:
        subprocess.check_call("C:\\Program\ Files\\MediaInfo\\MediaInfo.exe");
        mediainfo = "C:\\Program\ Files\\MediaInfo\\MediaInfo.exe"
    except CalledProcessError:
        log("MediaInfo not installed in Program Files.")
        try:
            subprocess.check_call("C:\\Program\ Files\ (x86)\\MediaInfo\\MediaInfo.exe");
            mediainfo = "C:\\Program\ Files\ (x86)\\MediaInfo\\MediaInfo.exe"
        except CalledProcessError:
            log("MediaInfo not found in Program Files (x86).")
            log("MediaInfo was not found on your system, it is a dependency for this script\r\nGet it at: https://mediaarea.net/en/MediaInfo\r\nIf you already have the CLI version, add it to your PATH.")
            exit()

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

def log(message):
    """
    Borrowed Zol's code here
    This functions logs to a file, given by the logfile global
    """
    # write timestamp message newline to file
    msg = "[%s]: %s\n" % (datetime.datetime.fromtimestamp(
        datetime.datetime.now().timestamp()).isoformat(), message)
    file = open(logfile, "a", encoding="utf-8")
    file.write(msg)
    file.close()
    print(msg)
