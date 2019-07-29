from tkinter.filedialog import askopenfilenames
from catbox import upload, create_album, upload_from_url
import re
import os


file_list = []
small_file_list = []
while(True):
    selection = input("""what wanna do?
    1: upload more files from computer
    2: upload files from urls
    3: make album
    4: quit
    """)
    if selection == "1":
        filenames = askopenfilenames()
        for f in filenames:
            ret =  upload(f)
            if ret is not None:
                file_list.append(ret)
                prefix, suffix = re.match(r"(.+)\.(.+)", f).groups()
                scale = 32
                outputfile = "%s%dx%d.%s" % (prefix, scale, scale, suffix)
                command  = 'ffmpeg -y -i "%s" ' % f
                command += '-vf "scale=iw*sar*min(%d/(iw*sar)\,%d/ih):ih*min(%d/(iw*sar)\,%d/ih)' % ((scale,)*4)  # width:height
                # ripped from https://superuser.com/questions/891145/ffmpeg-upscale-and-letterbox-a-video#891478
                command += ', pad=%d:%d:-1:-1:000000@0.0" ' % ((scale,)*2)  # -1 makes ffmpeg autimatically centre the image, 000000@0.0 is fully transparent black
                command += '"%s"' % outputfile
                os.system("start /wait /MIN cmd /c %s" % command)
                cb = upload(outputfile)
                small_file_list.append(cb)
            else:
                print("failed to upload %s" % f)
    elif selection == "2":
        urls = input("Gib urls, separate them with space\n")
        for url in re.match(r"(?:(.*?)\s)*").groups():
            ret =  upload_from_url(url)
            if ret is not None:
                file_list.append(ret)
                prefix, suffix = re.match(r"https://files.catbox.moe/(.+)\.(.+)", ret).groups()
                scale = 32
                outputfile = "%s%dx%d.%s" % (prefix, scale, scale, suffix)
                command  = 'ffmpeg -y -i "%s" ' % f
                command += '-vf "scale=iw*sar*min(%d/(iw*sar)\,%d/ih):ih*min(%d/(iw*sar)\,%d/ih)' % (scale,)*4  # width:height
                # ripped from https://superuser.com/questions/891145/ffmpeg-upscale-and-letterbox-a-video#891478
                command += ', pad=%d:%d:-1:-1:000000@0.0" ' % (scale,)*2  # -1 makes ffmpeg autimatically centre the image, 000000@0.0 is fully transparent black
                command += '"%s"' % outputfile
                os.system("start /wait /MIN cmd /c %s" % command)
                cb = upload(outputfile)
                small_file_list.append(cb)
    elif selection == "3":
        title = input("provide title\n")
        description = input("explain what's so great about your album\n")
        album = create_album(file_list, title, description)
        print(album)
        for link in small_file_list:
            print(link)
        file_list = []
    elif selection == "4":
        break
