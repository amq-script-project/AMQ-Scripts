from tkinter.filedialog import askopenfilenames
import re

file_list = []
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
            ret =  upload_catbox(f)
            if ret is not None:
                file_list.append(ret)
    elif selection == "2":
        urls = input("Gib urls, separate them with space\n")
        for url in re.match(r"(?:(.*?)\s)*").groups():
            ret =  upload_catbox_from_url(url)
            if ret is not None:
                file_list.append(ret)
    elif selection == "3":
        title = input("provide title\n")
        description = input("explain what's so great about your album\n")
        create_album(file_list, title, description)
        file_list = []
    elif selection == "4":
        break
