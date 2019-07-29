import requests
import datetime
import os
import re

def upload(file):
    origname = file
    if(re.match(r"^.*\.png$", file)):
        mime_type = "image/png"
        ext = ".png"
    elif(re.match(r"^.*\.jpe?g$", file)):
        mime_type = "image/jpeg"
        ext = ".jpg"
    elif(re.match(r"^.*\.gif$", file)):
        mime_type = "image/gif"
        ext = ".gif"
    else:
        return None
    if userhash:
        payload = {'reqtype': 'fileupload', 'userhash': userhash}
    else:
        payload = {'reqtype': 'fileupload'}
    timestamp = str(int(datetime.datetime.now().timestamp()))
    file = "temp" + timestamp + ext
    os.rename(origname, file)  # fixes special character errors
    f = open(file, 'rb')
    files = {'fileToUpload': (file, f, mime_type)}
    response = requests.post(host, data=payload, files=files)
    f.close()
    os.rename(file, origname)
    if response.ok:
        print("upload success: %s" % response.text)
        return response.text
    else:
        print("upload failed: %s" % response.text)
        return None


def upload_from_url(url):
    print("mirroring %s to catbox" % url)
    if userhash:
        payload = {"reqtype": "urlupload", "userhash": userhash, "url": url}
    else:
        payload = {"reqtype": "urlupload", "url": url}
    response = requests.post(host, data=payload)
    if response.ok:
        print("mirror success: %s" % response.text)
        return response.text
    else:
        print("mirror failed: %s" % response.text)
        return None


def create_album(file_list, title, description):
    files = ""
    for f in file_list:
        files += re.search(r".*/(.*)$", f).group(1)+ " "
    payload = {"reqtype": "createalbum", "userhash": userhash, "title":title, "desc":description, "files": files}
    response = requests.post(host, data=payload)
    if response.ok:
        print("album success: %s" % response.text)
        return response.text
    else:
        print("album failed: %s" % response.text)
        return None


userhash = None
host = "https://catbox.moe/user/api.php"
try:
    with open("catbox.config") as file:
        match = re.search("userhash" + r"\s?=[ \t\r\f\v]*(.+)$", file.read(), re.I | re.M)
        if match is None:
            print("catbox.py: no userhash present")
        else:
            userhash = match.group(1)
except Exception:
    print("catbox.py: no config file present")

if not userhash:
    exit(0)

if __name__ == "__main__":
    f = input("select file to upload")
    print(upload(f))
