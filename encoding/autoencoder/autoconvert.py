"""
As the name implies this module contains the functions related to
autoconverting, which is a fancy way of saying cut silence
adjust audio volume and use a standard formula for output

Dependent on:
mediainfo
ffmpeg

Author: Zolhungaj
        FokjeM / Riven Skaye (really minor tweaks)
"""
import re
import os
import datetime
import time
import subprocess
# dependencies:
# mediainfo, tested on v18.05
# ffmpeg, tested on N-91538-g269daf5985
#
logfile = "AMQ-autoconvert.log"
mediainfo = "mediainfo"  # command to invoke mediainfo, eg C:mediainfo.exe
ffmpeg = "ffmpeg"  # command to invoke ffmpeg, eg C:ffmpeg\bin\ffmpeg.exe
# global ffprobe = "ffprobe"
outputFolder = "outputfiles\\"  # path to output folder
maxmean = -16.0
maxpeak = -1.0


def log(message):
    """
    This functions logs to a file, given by the logfile global
    """
    # write timestamp message newline to file
    msg = "[%s]: %s\n" % (datetime.datetime.fromtimestamp(
        datetime.datetime.now().timestamp()).isoformat(), message)
    file = open(logfile, "a", encoding="utf-8")
    file.write(msg)
    file.close()
    print(msg)


def system_call_wait(command):
    os.system("start /wait /MIN cmd /c %s" % command)


def regular_convert(inputfile, outputfile, volume=0.0, start=0.0, end=0.0,
              keyframeinterval=120, scaling=0, libaom_av1_experimental=False):
    if scaling == 0:
        outputfile += "-unscaled.webm"
        log("unscaled conversion started")
        title = "AMQ unscaled convert"
        audioencode = "-c:a libopus -b:a 320k"  # default encoding
        videosettings = "-b:v 3250k -crf 24"
        scaling_settings = ""
    elif scaling == 480:
        outputfile += "-480p.webm"
        log("480p conversion started")
        title = "AMQ 480p convert"
        audioencode = "-c:a libopus -b:a 192k"  # default encoding
        videosettings = "-b:v 2000k -crf 33"
        scaling_settings = '"-vf scale=-1:480"'
    elif scaling == 720:
        outputfile += "-720p.webm"
        log("720p conversion started")
        title = "AMQ 720p convert"
        audioencode = "-c:a libopus -b:a 320k"  # default encoding
        videosettings = "-b:v 3250k -crf 24"
        scaling_settings = '"-vf scale=-1:720"'
    else:
        outputfile += "-%dp.webm" % scaling
        log("%dp conversion started") % scaling
        title = "AMQ %dp convert" % scaling
        audioencode = "-c:a libopus -b:a 320k"  # default encoding
        videosettings = "-b:v 3250k -crf 24"
        scaling_settings = '"-vf scale=-1:%d"' % scaling

    if libaom_av1_experimental:
        videoencoder = "libaom-av1 -strict -2"
    else:
        videoencoder = "libvpx-vp9"
    start = float(start)
    end = float(end)
    keyframeinterval = int(keyframeinterval)
    volume = float(volume)
    volumesettings = ""
    ss = ""
    to = ""
    if volume == 0.0 and start == 0 and end == 0:
        pass
        # TODO: in the rare occasion that no audio editing is necessary,
        # consider copying audio stream
    if volume != 0.0:
        volumesettings = '-af "volume=%.1fdB"' % (volume)
    if start != 0.0:
        ss = "-ss %f" % (start)
    if end != 0.0:
        to = "-to %f" % (end)
    command  = '%s -y %s %s -i "%s" ' % (ffmpeg, ss, to, inputfile)
    command += '-map_metadata -1 -map_chapters -1 '
    command += '-metadata title="%s" ' % title
    command += '-c:v %s %s ' % (videoencoder, videosettings)
    command += '-g %d ' % keyframeinterval
    command += '%s -pass 1 -threads 16 ' % scaling_settings
    command += '-tile-columns 2 -tile-rows 2 '
    command += '-frame-parallel 1 -cpu-used 4 -pix_fmt yuv420p '
    command += '-an -map 0:v:0 -max_muxing_queue_size 4096 -f webm NUL && '

    command += '%s -y %s %s -i "%s" ' % (ffmpeg, ss, to, inputfile)
    command += '-map_metadata -1 -map_chapters -1 '
    command += '-metadata title="%s" ' % title
    command += '-c:v %s %s ' % (videoencoder, videosettings)
    command += '-g %d ' % keyframeinterval
    command += '%s -pass 2 -threads 16 ' % scaling_settings
    command += '-tile-columns 2 -tile-rows 2 '
    command += '-frame-parallel 1 -cpu-used 4 -pix_fmt yuv420p '
    command += '%s %s -map 0:v:0 ' % (audioencode, volumesettings)
    command +='-max_muxing_queue_size 4096 -map 0:a:0 "%s"' % outputfile
    # os.popen(command)
    log(command)
    system_call_wait(command)
    log("conversion complete")
    # os.remove("480pdummy")
    return outputfile


def SDconvert(inputfile, outputfile, volume=0.0, start=0.0, end=0.0,
              keyframeinterval=120):  # 480p
    """
    SD/480p convert, low quality video, low quality audio, low bitrate
    """
    return regular_convert(inputfile, outputfile, volume, start, end, keyframeinterval, 480)
    outputfile += "-480p.webm"
    log("480p conversion started")
    title = "AMQ 480p convert"
    audioencode = "-c:a libopus -b:a 192k"  # default encoding
    videoencoder = "libvpx-vp9"
    start = float(start)
    end = float(end)
    keyframeinterval = int(keyframeinterval)
    volume = float(volume)
    volumesettings = ""
    ss = ""
    to = ""
    if volume == 0.0 and start == 0 and end == 0:
        pass
        # TODO: in the rare occasion that no audio editing is necessary,
        # consider copying audio stream
    if volume != 0.0:
        volumesettings = '-af "volume=%.1fdB"' % (volume)
    if start != 0.0:
        ss = "-ss %f" % (start)
    if end != 0.0:
        to = "-to %f" % (end)
    command  = '%s -y %s %s -i "%s" ' % (ffmpeg, ss, to, inputfile)
    command += '-map_metadata -1 -map_chapters -1 '
    command += '-metadata title="%s" ' % title
    command += '-c:v %s -b:v 2000k -crf 33 ' % videoencoder
    command += '-g %d -vf scale=-1:480 -pass 1 -threads 16 ' % keyframeinterval
    command += '-tile-columns 4 -frame-parallel 1 -cpu-used 4 -pix_fmt yuv420p '
    command += '-an -map 0:v:0 -max_muxing_queue_size 4096 -f webm NUL && '

    command += '%s -y %s %s -i "%s" ' % (ffmpeg, ss, to, inputfile)
    command += '-map_metadata -1 -map_chapters -1 '
    command += '-metadata title="%s" ' % title
    command += '-c:v %s -b:v 2000k -crf 33 ' % videoencoder
    command += '-g %d -vf scale=-1:480 -pass 2 -threads 16 ' % keyframeinterval
    command += '-tile-columns 4 -frame-parallel 1 -cpu-used 4 -pix_fmt yuv420p '
    command += '%s %s -map 0:v:0 ' % (audioencode, volumesettings)
    command +='-max_muxing_queue_size 4096 -map 0:a:0 "%s"' % outputfile
    # os.popen(command)
    log(command)
    system_call_wait(command)
    log("conversion complete")
    # os.remove("480pdummy")
    return outputfile


def HDconvert(inputfile, outputfile, volume=0.0, start=0.0, end=0.0,
              keyframeinterval=120):  # 720p
    """
    decent quality video, high quality audio, medium bitrate
    """
    return regular_convert(inputfile, outputfile, volume, start, end, keyframeinterval, 720)
    outputfile += "-720p.webm"
    log("720p conversion started")
    title = "AMQ 720p convert"
    audioencode = "-c:a libopus -b:a 320k"  # default encoding
    videoencoder = "libvpx-vp9"
    start = float(start)
    end = float(end)
    keyframeinterval = int(keyframeinterval)
    volume = float(volume)
    volumesettings = ""
    ss = ""
    to = ""
    if volume == 0.0 and start == 0 and end == 0:
        pass
        # TODO: in the rare occasion that no audio editing is necessary,
        # consider copying audio stream
    if volume != 0.0:
        volumesettings = '-af "volume=%.1fdB"' % (volume)
    if start != 0.0:
        ss = "-ss %f" % (start)
    if end != 0.0:
        to = "-to %f" % (end)
    command  = '%s -y %s %s -i "%s" ' % (ffmpeg, ss, to, inputfile)
    command += '-map_metadata -1 -map_chapters -1 '
    command += '-metadata title="%s" ' % title
    command += '-c:v %s -b:v 3250k -crf 24 ' % videoencoder
    command += '-g %d -vf scale=-1:720 -pass 1 -threads 16 ' % keyframeinterval
    command += '-tile-columns 4 -frame-parallel 1 -cpu-used 4 -pix_fmt yuv420p '
    command += '-an -map 0:v:0 -max_muxing_queue_size 4096 -f webm NUL && '

    command += '%s -y %s %s -i "%s" ' % (ffmpeg, ss, to, inputfile)
    command += '-map_metadata -1 -map_chapters -1 '
    command += '-metadata title="%s" ' % title
    command += '-c:v %s -b:v 3250k -crf 24 ' % videoencoder
    command += '-g %d -vf scale=-1:720 -pass 2 -threads 16 ' % keyframeinterval
    command += '-tile-columns 4 -frame-parallel 1 -cpu-used 4 -pix_fmt yuv420p '
    command += '%s %s -map 0:v:0 ' % (audioencode, volumesettings)
    command +='-max_muxing_queue_size 4096 -map 0:a:0 "%s"' % outputfile
    log(command)
    system_call_wait(command)
    log("conversion complete")
    return outputfile


def unscaled_convert(inputfile, outputfile, volume=0.0, start=0.0, end=0.0, keyframeinterval=120):  # 720p
    """
    decent quality video, high quality audio, medium bitrate
    """
    return regular_convert(inputfile, outputfile, volume, start, end, keyframeinterval)
    outputfile += "-unscaled.webm"
    log("unscaled conversion started")
    title = "AMQ unscaled convert"
    audioencode = "-c:a libopus -b:a 320k"  # default encoding
    videoencoder = "libvpx-vp9"
    start = float(start)
    end = float(end)
    keyframeinterval = int(keyframeinterval)
    volume = float(volume)
    volumesettings = ""
    ss = ""
    to = ""
    if volume == 0.0 and start == 0 and end == 0:
        pass
        # TODO: in the rare occasion that no audio editing is necessary,
        # consider copying audio stream
    if volume != 0.0:
        volumesettings = '-af "volume=%.1fdB"' % (volume)
    if start != 0.0:
        ss = "-ss %f" % (start)
    if end != 0.0:
        to = "-to %f" % (end)
    command  = '%s -y %s %s -i "%s" ' % (ffmpeg, ss, to, inputfile)
    command += '-map_metadata -1 -map_chapters -1 '
    command += '-metadata title="%s" ' % title
    command += '-c:v %s -b:v 3250k -crf 24 ' % videoencoder
    command += '-g %d -pass 1 -threads 16 ' % keyframeinterval
    command += '-tile-columns 4 -frame-parallel 1 -cpu-used 4 -pix_fmt yuv420p '
    command += '-an -map 0:v:0 -max_muxing_queue_size 4096 -f webm NUL && '

    command += '%s -y %s %s -i "%s" ' % (ffmpeg, ss, to, inputfile)
    command += '-map_metadata -1 -map_chapters -1 '
    command += '-metadata title="%s" ' % title
    command += '-c:v %s -b:v 3250k -crf 24 ' % videoencoder
    command += '-g %d -pass 2 -threads 16 ' % keyframeinterval
    command += '-tile-columns 4 -frame-parallel 1 -cpu-used 4 -pix_fmt yuv420p '
    command += '%s %s -map 0:v:0 ' % (audioencode, volumesettings)
    command +='-max_muxing_queue_size 4096 -map 0:a:0 "%s"' % outputfile
    log(command)
    system_call_wait(command)
    log("conversion complete")
    return outputfile


def mp3convert(inputfile, outputfile, volume=0.0, start=0.0, end=0.0):  # mp3
    """
    High quality audio, no video, low bitrate
    """
    print("mp3convert started to %s" % outputfile)
    outputfile += ".mp3"
    title = "AMQ mp3 convert"
    start = float(start)
    end = float(end)
    volume = float(volume)
    ss = ""
    to = ""
    volumesettings = ""
    if start != 0.0:
        ss = "-ss %f" % (start)
        title = "AMQ mp3(c) convert"
    if end != 0.0:
        to = "-to %f" % (end)
        title = "AMQ mp3(c) convert"
    if volume != 0.0:
        volumesettings = '-af "volume=%.1fdB"' % (volume)
    command = '%s %s %s -i "%s" -vn -sn -c:a libmp3lame -b:a 320k -ac 2 %s \
-map_metadata -1 -metadata title="%s" -max_muxing_queue_size 4096 "%s"' % (
        ffmpeg, ss, to, inputfile, volumesettings, title, outputfile)
    system_call_wait(command)
    log(command)
    print(command)
    return outputfile


# still image conversion, follows its own rules
def stillconvert(inputfile, outputfile, targetResolution, volume=0.0,
                 start=0.0, end=0.0, keyframeinterval=5):
    """
    The video conists of a still image
    audio quality depends on target resolution
    low bitrate
    """
    # get the still image
    outputfile += "-still-%dp.webm" % targetResolution
    # find the length of the sound
    # This will return a single line, giving duration in milliseconds
    command = '%s "%s" --output=Video;%%Duration%%' % (mediainfo, inputfile)
    process = os.popen(command)
    duration = float(process.read()) / 1000.0  # from previous cmd
    ss = ""
    t = ""
    if start != 0.0:
        if end != 0.0:
            duration = end - start
        else:
            duration = duration - start
        ss = "-ss %f" % start
    elif end != 0.0:
        duration = end

    t = "-t %f" % duration
    soundsettings = ""
    volumesettings = ""
    if volume != 0.0:
        volumesettings = '-af "volume=%.1fdB"' % volume
    if targetResolution == 480:
        soundsettings = "-c:a libopus -b:a 192k"
    elif targetResolution == 720:
        soundsettings = "-c:a libopus -b:a 320k"
    else:
        return None
    # get the image
    command = 'ffmpeg -ss 0 -i "%s" -vframes 1 stillimagetemp.png' % inputfile
    system_call_wait(command)
    # create the sound
    command = '%s %s %s -i "%s" -vn %s %s -map_metadata -1 -map_chapters -1 \
-metadata title="AMQ sound" -ac 2 -max_muxing_queue_size 4096 \
stillimagetemp.mka' % (ffmpeg, ss, t, inputfile, soundsettings, volumesettings)
    system_call_wait(command)
    # REM create still video
    command = '%s -loop 1 -framerate 1 -i stillimagetemp.png -g %d \
-vf scale=-1:%d -c:v libvpx-vp9 %s -sn -an -map_metadata -1 -map_chapters -1 \
-metadata title="AMQ still image convert video %dp" -r 1 -pix_fmt yuv420p \
-max_muxing_queue_size 4096 stillimagetemp.webm' % (
        ffmpeg, keyframeinterval, targetResolution, t, targetResolution)
    system_call_wait(command)
    # REM mux them together
    command = '%s -i stillimagetemp.webm -i stillimagetemp.mka -c copy \
-metadata title="AMQ still image convert %dp" -max_muxing_queue_size 4096 \
-map 0:v:0 -map 1:a:0 "%s"' % (ffmpeg, targetResolution, outputfile)
    system_call_wait(command)
    # REM delete temporary files
    os.remove("stillimagetemp.png")
    os.remove("stillimagetemp.webm")
    os.remove("stillimagetemp.mka")
    return outputfile


# resolution agnostic conversion to webm,
# favouring quality over speed and file size
def sourceconvert(inputfile, outputfile, volume=0.0, start=0.0, end=0.0,
                  keyframeinterval=120, crf=18):
    """
    High quality video, pretty much lossless audio, high bitrate
    """
    outputfile += "-Source.webm"
    title = "AMQ Source convert"
    audioencode = "-c:a libopus -b:a 510k"  # default encoding
    start = float(start)
    end = float(end)
    keyframeinterval = int(keyframeinterval)
    volume = float(volume)
    crf = int(crf)
    volumesettings = ""
    ss = ""
    to = ""
    if volume == 0.0 and start == 0 and end == 0:
        pass
        # TODO: in the rare occasion that no audio editing is necessary,
        # consider copying audio stream
        # NB: if you want to do that, remember that webm only accepts
        # OGG vorbis and opus, which are pretty uncommon in anime distribution
    if volume != 0.0:
        volumesettings = '-af "volume=%.1fdB"' % (volume)
    if start != 0.0:
        ss = "-ss %f" % (start)
    if end != 0.0:
        to = "-to %f" % (end)

    command = '%s %s %s -i "%s" -map_metadata -1 -map_chapters -1 \
-metadata title="%s" -c:v libvpx-vp9 -b:v 0 -crf %d -deadline best \
-cpu-used 0 -g %d -tile-columns 0 -frame-parallel 0 -pix_fmt yuv420p %s %s \
-map 0:v:0 -map 0:a:0 -max_muxing_queue_size 4096 %s' % (
        ffmpeg, ss, to, inputfile, title, crf, keyframeinterval, audioencode,
        volumesettings, outputfile)
    print(command)
    log(command)
    system_call_wait(command)
    return outputfile


def createFileName(animeTitle, songType, songTitle, songArtist):
    """
    Creates a windows-compliant filename by capitalizing each "word"
    from the anime title, song type, song title and song artist and
    then removing all bad characters
    """
    titlelist = animeTitle.split()
    title = ""
    for w in titlelist:
        title = title + w.capitalize()
    title += "-"
    titlelist = songType.split()
    for w in titlelist:
        title = title + w.capitalize()
    title += "-"
    titlelist = songTitle.split()
    for w in titlelist:
        title = title + w.capitalize()
    title += "-"
    titlelist = songArtist.split()
    for w in titlelist:
        title = title + w.capitalize()
    title = re.sub(r"\\|\/|\<|\>|\:|\"|\||\?|\*|&|\^|\$|\:|", '', title)
    return title


def autoconvert(inputfile, targetResolution, animeTitle, songType="",
                songTitle="", songArtist="", start=0.0, end=0.0, crf=18):
    """
    the core of the module, takes the inputfile, makes a copy with
    stereo audio, then uses that copy for deciding where to cut
    and how much the audio should be adjusted
    can be told where to start for start/silence detection
    """
    # stage three: check if still image
    log("started converting to %s of %s %s: %s by %s" %
        (targetResolution, animeTitle, songType, songTitle, songArtist))
    # This will return a single line, giving framerate in frames per second
    command = '%s "%s" --output=Video;%%FrameRate%%' % (mediainfo, inputfile)
    process = os.popen(command)
    framerate = process.read()  # from previous cmd
    stillimage = False
    if framerate == "1.000":
        stillimage = True
    # stage four: check audio for cut points (important, -vn for mp3 only)
    dummyfile = "dummy%sfor%d.mkv" % (createFileName(
        animeTitle, songType, songTitle, songArtist), targetResolution)
    mp3 = ""
    videosettings = "-c:v copy -map 0:v:0"
    if targetResolution == 0 or stillimage:  # stillimage/sound-only: -vn
        mp3 = "-vn"  # this is to avoid desync in ffmpeg between normal and -vn
        dummyfile = "dummy%sfor%d.mka" % (createFileName(
            animeTitle, songType, songTitle, songArtist), targetResolution)
        videosettings = "-sn"

    command = '%s -y -i "%s" %s -hide_banner -nostats %s -map 0:a:0 -ac 2 \
-c:a flac -max_muxing_queue_size 4096 "%s"' % (ffmpeg, inputfile, mp3,
                                               videosettings, dummyfile)
    log(command)
    system_call_wait(command)
    command = '%s -i "%s" %s %s -sn -hide_banner -nostats \
-af "silencedetect=n=-60dB:d=0.1" -map 0:a:0 -ac 2 \
-max_muxing_queue_size 4096 -f null -' % (ffmpeg, dummyfile, mp3,
                                          videosettings)
    process = subprocess.run(command, stderr=subprocess.PIPE)
    # process=open("dummy.txt","r",encoding="utf-8")
    string = str(process.stderr.decode())
    # process.close()
    print(string)
    if targetResolution == 0 or stillimage:
        # This will return a single line, giving duration in milliseconds
        command = '%s "%s" --output=Audio;%%Duration%%' % (
            mediainfo, dummyfile)
    else:
        # This will return a single line, giving duration in milliseconds
        command = '%s "%s" --output=Video;%%Duration%%' % (
            mediainfo, dummyfile)
    process = os.popen(command)
    duration = float(process.read()) / 1000.0  # from previous cmd
    if targetResolution != 0 and not stillimage:
        # dummy file is possibly not subjected to variable framerate errors
        command = '%s "%s" --output=Video;%%FrameRate%%' % (
            mediainfo, dummyfile)
        process = os.popen(command)
        framerate = process.read()  # from previous cmd
    # start = "-ss 0"#default placeholder value
    # end = "-to 9999"#default placeholder value
    currentstart = start
    # currentstart = 0 #0 means no start specified, for cleaner logs
    if end != 0.0:
        currentend = end
    else:
        currentend = duration
    # currentend = duration #0 means no cut, mostly for cleaner logs
    print("duration: %f" % duration)
    # print(currentend)

    # this is the silence removal section
    # it's assumed that a silence_end always have a corresponding silence_start
    # but a silence_start does not always have a correspondance
    # if end of file is reached during the silence
    findsilencestart = re.compile(
        r"\[silencedetect @ [0-9a-zA-Z]+\] silence_start: (\-?\d+\.?\d*)")
    findsilenceend = re.compile(r"\[silencedetect @ [0-9a-zA-Z]+\] " +
                                r"silence_end: (\-?\d+\.?\d*) \| " +
                                r"silence_duration: (\-?\d+\.?\d*)")
    silencestarts = findsilencestart.findall(string)
    # silence ends [x][0] duration [x][1]
    silenceends = findsilenceend.findall(string)

    # upgrade idea, increase search range if very large silence found
    for n in range(0, len(silencestarts)):
        tolerance = 0.8
        if n < len(silenceends):
            tolerance = min(0.4 + float(silenceends[n][1]) / 2, 20)
        if float(silencestarts[n]) - currentstart < tolerance:
            if n <= len(silenceends) - 1:
                currentstart = float(silenceends[n][0])
                if currentstart < start:
                    currentstart = start
            else:
                # of course this is a completely uninteresting result,
                # but neat for debugging
                currentstart = duration
        else:
            break
    # an unmatched silencestart would mean the end of file was reached
    # after silence_start
    if len(silencestarts) > len(silenceends):
        currentend = silencestarts[len(silencestarts) - 1]
        if currentend > end and end != 0.0:
            currentend = end
    for n in range(len(silenceends) - 1, -1, -1):
        if (currentend - float(silenceends[n][0]) < (
                0.4 + float(silenceends[n][1]) / 2)):
            if float(silencestarts[n]) >= 0.0:
                currentend = float(silencestarts[n])
                if currentend > end and end != 0.0:
                    currentend = end
            else:
                currentend = 0  # this would mean we have reached the beginning
                break
        else:
            break
    if currentend - currentstart <= 0:
        log("[ERROR] %s has a length of zero nonsilence" % inputfile)
        return None
    # silencestart=3
    # silenceend=4
    print("Start: %f" % currentstart)
    print("End: %f" % currentend)
    if currentend == duration:
        currentend = 0  # for cleaner logfiles and possibility of copying audio
    if currentstart != 0:
        start = "-ss %s" % currentstart
    else:
        start = ""
    if currentend != 0:
        end = "-to %s" % currentend
    else:
        end = ""
    # stage five: check audio for loudness
    audiochange = 0.0
    peak = 0.0
    mean = 0.0
    findaudiomean = re.compile(r"\[Parsed_volumedetect_\d+ @ [0-9a-zA-Z]+\] " +
                               r"mean_volume: (\-?\d+\.\d) dB")
    findaudiopeak = re.compile(r"\[Parsed_volumedetect_\d+ @ [0-9a-zA-Z]+\] " +
                               r"max_volume: (\-?\d+\.\d) dB")
    while peak > maxpeak or mean > maxmean:
        command = '%s %s %s -i "%s" %s -ac 2 -map 0:a:0 -af "volume=%.1fdB, \
volumedetect" -sn -hide_banner -nostats -max_muxing_queue_size 4096 -f null \
-' % (ffmpeg, start, end, dummyfile, mp3, audiochange)
        process = subprocess.run(command, stderr=subprocess.PIPE)
        # process=open("dummy2.txt","r",encoding="utf-8")
        # while True:
        #    w=process.read()
        #    if w != None:
        #        string+=w
        #        print(w)
        #        time.sleep(0.5)
        #    else:
        #        break
        string = str(process.stderr.decode())
        print(string)
        # process.close()
        # os.remove("dummy2.txt")

        # print("Heyo")
        mean = float(findaudiomean.search(string).group(1))
        peak = float(findaudiopeak.search(string).group(1))
        print("mean: %.1f" % mean)
        print("peak: %.1f" % peak)
        if peak == 0.0:
            audiochange -= 10.0
            # attempts to find a place where the peak is nonzero
        else:
            audiochange += min(maxpeak - peak, maxmean - mean)
        print(audiochange)
        # sets audiochange so that the peak is not louder than -1.0dB and the
        # mean is not louder than -16db
    currentnumber = 0
    # os.remove(dummyfile)
    if not os.path.isfile("currentnumber.txt"):
        f = open("currentnumber.txt", "w")
        f.write("1")
        f.close()
    else:
        f = open("currentnumber.txt", "r")
        currentnumber = int(f.read())
        f.close()
        f = open("currentnumber.txt", "w")
        newnumber = currentnumber + 1
        f.write("%d" % newnumber)
        f.close()
    filename = outputFolder + "AAMQ%04d-" % currentnumber + \
        createFileName(animeTitle, songType, songTitle, songArtist)
    if currentend == 0.0:
        duration = duration - currentstart
    else:
        duration = currentend - currentstart
    if targetResolution != 0:
        # sets the keyframe interval so that it has at least 11,
        # or one every 5 seconds
        keyframeinterval = min(
            float(framerate) * duration / 11, 5 * float(framerate))
    # stage six: convert
    ret = None
    if targetResolution == -1:
        ret = sourceconvert(dummyfile, filename, audiochange,
                            currentstart, currentend, keyframeinterval, crf)
    elif targetResolution == -2:
        ret = unscaled_convert(dummyfile, filename, audiochange,
                            currentstart, currentend, keyframeinterval)
    elif targetResolution == 0:
        ret = mp3convert(dummyfile, filename, audiochange,
                         currentstart, currentend)
    elif stillimage:
        ret = stillconvert(dummyfile, filename, targetResolution,
                           audiochange, currentstart, currentend,
                           keyframeinterval)
    elif targetResolution == 480:
        ret = SDconvert(dummyfile, filename, audiochange,
                        currentstart, currentend, keyframeinterval)
    elif targetResolution == 720:
        ret = HDconvert(dummyfile, filename, audiochange,
                        currentstart, currentend, keyframeinterval)
    os.remove(dummyfile)
    return ret
    # stage seven: verify conversion success
