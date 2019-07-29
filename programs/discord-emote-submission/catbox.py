import requests
import datetime
import os
import re

def upload(file):
    host = "https://catbox.moe/user/api.php"
    origname = file
    if(re.match(r"^.*\.webm$", file)):
        mime_type = "video/webm"
        ext = ".webm"
    elif(re.match(r"^.*\.mp3$", file)):
        mime_type = "audio/mpeg"
        ext = ".mp3"
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
    host = "https://catbox.moe/user/api.php"
    if userhash:
        payload = {"reqtype": "urlupload", "userhash": userhash, "url": url}
    else:
        payload = {"reqtype": "urlupload", "url": url}
    response = requests.post(host, data=payload)
    if response.ok:
        print("mirror success: %s" % response.text)
        try:
            caturl = response.text
            source_extension = re.match(r".*\.(\w+)$", url).group(1)
            cat_extension = re.match(r".*\.(\w+)$", caturl).group(1)
            if cat_extension != source_extension:
                f = open("catfail.txt", "a", encoding="utf-8")
                f.write("%s -> %s\n" % (url, caturl))
                f.close()
                print("%s -> %s" % (url, caturl))
        except Exception:
            pass
        return response.text
    else:
        print("mirror failed: %s" % response.text)
        return None


userhash = None
try:
    with open("catbox.config") as file:
        match = re.search("userhash" + r"\s?=[ \t\r\f\v]*(.+)$", file.read(), re.I | re.M)
        if match is None:
            print("catbox.py: no userhash present")
        else:
            userhash = match.group(1)
except Exception:
    print("catbox.py: no config file present")

if __name__ == "__main__":
    f = input("select file to upload")
    print(upload(f))
