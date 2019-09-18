"""
This module automates the process of uploading on Anime Music Quiz.
Dependencies:
mediainfo
ffmpeg
selenium
Firefox
geckodriver
"""
import datetime
import time
import re
import os
import random
import _thread
import subprocess
import json
import sqlite3

import requests
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains

from autoconvert import autoconvert as autoc
import catbox

def init_database(conn):
    conn.execute("""CREATE TABLE IF NOT EXISTS upload(
    source TEXT,
    resolution INTEGER,
    anime TEXT,
    title TEXT,
    type TEXT,
    artist TEXT,
    filename TEXT,
    url TEXT
    );""")
    conn.execute("""CREATE TABLE IF NOT EXISTS catbox(
    source TEXT NOT NULL,
    resolution INTEGER NOT NULL,
    filename TEXT,
    url TEXT NOT NULL
    );""")
    conn.commit()


def save_upload(conn, source, res, anime, title, type, artist, url,
                filename=None):
    conn.execute("""INSERT INTO upload VALUES(
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?
    )""", (source, res, anime, title, type, artist, filename, url,))
    conn.commit()


def save_catbox(conn, source, res, url, filename=None):
    conn.execute("""INSERT INTO catbox VALUES(
    ?,
    ?,
    ?,
    ?
    )""", (source, res, filename, url,))
    conn.commit()


def already_uploaded_catbox(conn, source, res):
    c = conn.cursor()
    c.execute("""
    SELECT url
    FROM catbox
    WHERE source=(?)
    AND resolution = ?""", (source, res,))
    result = c.fetchone()
    if result is None:
        return None
    else:
        return result[0]


def already_submitted(conn, source, res, anime, title, type, artist):
    c = conn.cursor()
    c.execute("""
    SELECT url
    FROM upload
    WHERE source=(?)
    AND resolution = ?
    AND anime = ?
    AND title = ?
    AND type = ?
    AND artist = ?""", (source, res, anime, title, type, artist,))
    result = c.fetchone()
    if result is None:
        return None
    else:
        return result[0]


def autoconvert(file, res, anime, type, title, artist):
    try:
        return autoc(file, res, anime, type, title, artist)
    except Exception:
        return None


def log(message):
    """
    logs events to the logfile
    """
    # write timestamp message newline to file
    timestamp = datetime.datetime.fromtimestamp(
        datetime.datetime.now().timestamp()).isoformat()
    msg = "[%s]: %s\n" % (timestamp, message)
    file = open(logfile, "a", encoding="utf-8")
    file.write(msg)
    file.close()
    print(msg)


def enter_and_submit(driver, link):
    input_field = driver.find_element_by_id("elQuestionInput")
    button = driver.find_element_by_id("elQuestionSubmitButton")
    warning_triangle = driver.find_element_by_id("elQuestionInputWarning")
    spinner = driver.find_element_by_id("elQuestionInputSpinner")
    input_field = driver.find_element_by_id("elQuestionInput")
    for i in range(50):
        input_field.send_keys(Keys.BACKSPACE)
    input_field.send_keys(link)
    time.sleep(1)
    for i in range(120):
        if "hide" in spinner.get_attribute("class"):
            break
        if i == 60:
            input_field.send_keys("a")
            time.sleep(0.5)
            input_field.send_keys(Keys.BACKSPACE)
        time.sleep(1)
    else:
        for i in range(len(link)+5):
            input_field.send_keys(Keys.BACKSPACE)
        return False
    if "hide" not in warning_triangle.get_attribute("class"):
        for i in range(len(link)+5):
            input_field.send_keys(Keys.BACKSPACE)
        return False
    #input("Confirm\n")
    button.click()
    time.sleep(1)
    return True


def update_anime_lists(driver, anilist="", kitsu=""):
    driver.execute_script('document.getElementById("mpNewsContainer").innerHTML = "Updating AniList...";')
    status = driver.find_element_by_id("mpNewsContainer")
    driver.execute_script("""new Listener("anime list update result", function (result) {
		if (result.success) {
			document.getElementById("mpNewsContainer").innerHTML = "Updated Successful: " + result.message;
		} else {
			document.getElementById("mpNewsContainer").innerHTML = "Update Unsuccessful: " + result.message;
		}
    }).bindListener()""")
    driver.execute_script("""
    socket.sendCommand({
		type: "library",
		command: "update anime list",
		data: {
			newUsername: arguments[0],
			listType: 'ANILIST'
		}
	});""", anilist)
    while True:
        if status.text != "Updating AniList...":
            break
        time.sleep(0.5)
    driver.execute_script('document.getElementById("mpNewsContainer").innerHTML = "Updating Kitsu...";')
    driver.execute_script("""
    socket.sendCommand({
		type: "library",
		command: "update anime list",
		data: {
			newUsername: arguments[0],
			listType: 'KITSU'
		}
	});""", kitsu)
    while True:
        if status.text != "Updating Kitsu...":
            break
        time.sleep(0.5)


def load_song_info(driver, song_info, animeId, animeName):
    print(song_info_pretty(animeId, animeName, song_info))
    driver.execute_script('expandLibrary.songOpened(new ExpandQuestionSongEntry(eval( "(" + arguments[0] + ")" ), arguments[1], arguments[2]))', json.dumps(song_info), animeId, animeName)


def get_question_list(driver):
    driver.execute_script('document.getElementById("mpNewsContainer").innerHTML = "Loading Expand...";')
    script ="""new Listener("expandLibrary questions", function (payload) {
    expandLibrary.tackyVariable = (JSON.stringify(payload.questions));
    document.getElementById("mpNewsContainer").innerHTML = "Expand Loaded!"
}).bindListener();
socket.sendCommand({
    type: "library",
    command: "expandLibrary questions"
});"""
    driver.execute_script(script)
    status = driver.find_element_by_id("mpNewsContainer")
    while True:
        if status.text != "Loading Expand...":
            break
        time.sleep(0.5)
    time.sleep(3)
    pure_string = driver.execute_script('return expandLibrary.tackyVariable')
    driver.execute_script('expandLibrary.tackyVariable = ""')
    ret = json.loads(pure_string)
    driver.execute_script('document.getElementById("mpNewsContainer").innerHTML = "";')
    return ret


def update_question_list(driver, new_list):
    driver.execute_script('expandLibrary.questionListHandler.update_question_list(arguments[0])',json.dumps(new_list))


def open_expand_library(driver):
    driver.execute_script(""" document.getElementById("mpNewsContainer").innerHTML = '<button id="myfunnyvalentine" onclick="expandLibrary.afkKicker = afkKicker">Click me!</button>' """)
    ActionChains(driver).move_to_element(driver.find_element_by_id("myfunnyvalentine")).click().perform()
    driver.execute_script(""" document.getElementById("mpNewsContainer").innerHTML = '' """)
    script = """expandLibrary.openView = function (callback) {
    	if (xpBar.level < 5) {
    		displayMessage("Level 5+ required", "To use the Expand Library function, you must be at least level 5");
    		viewChanger.changeView("main");
    	} else {
    		this.open = true;
    		//Add question listener
    		this._newAnswerListener.bindListener();
    				this.$view.removeClass("hidden");
                    expandLibrary.afkKicker.setInExpandLibrary(true);
    				callback();
    				this.questionListHandler.updateQuestionList([{"annId":-1,"name":"AUTOMATION","songs":[{"annSongId":-11,"name":"BOT","type":1,"number":1,"artist":"CONTROL","examples":{"720":"https://files.catbox.moe/ll526i.webm","mp3":"https://files.catbox.moe/q2hkle.mp3"},"versions":{"open":{"catbox":{"480":3,"720":1,"mp3":1}},"closed":{"animethemes":{"resolution":null,"status":3},"openingsmoe":{"resolution":null,"status":3}}}}]}]);
    	}
    };"""
    driver.execute_script(script)
    driver.execute_script('viewChanger.changeView("expandLibrary");')


logfile = "AMQ-automator.log"
outputFolder = "../OUTPUT/"  # path to output folder
lasttimeout = None


def main():
    """
    the main function, where the magic happens
    """
    log("AMQ-automator started")
    with open("automator.config") as file:
        data = file.readlines()
        username = data[0][:-1]
        password = data[1][:-1]
        anilist = data[2][:-1]
        kitsu = data[3][:-1]
        mode = data[4][:-1].lower()
        geckodriver_location = data[5][:-1]
        enables = ["720" in mode, "480" in mode, "mp3" in mode]
        types = ["op" in mode, "ed" in mode, "in" in mode]
        if types == [False, False, False]:
            types = [True, True, True]
        random_order = "random" in mode
    if mode.startswith("convert"):
        print("convert mode is disabled")
        return
        handle_song = convert_song
        if enables == [False, False, False]:
            enables = [True, True, True]
    elif mode.startswith("seek"):
        handle_song = find_song_to_upload
    else:
        handle_song = find_song_to_upload
        return

    driver = webdriver.Firefox(executable_path='geckodriver_location')
    driver.get('https://animemusicquiz.com')
    driver.find_element_by_id("loginUsername").send_keys(username)
    driver.find_element_by_id("loginPassword").send_keys(password)
    driver.find_element_by_id("loginButton").click()
    conn = sqlite3.connect("automator.db")
    init_database(conn)
    time.sleep(5)
    update_anime_lists(driver, anilist, kitsu)
    questions = get_question_list(driver)
    open_expand_library(driver)
    if random_order:
        questions = random.sample(questions, len(questions))
    for question in questions:
        annId = question["annId"]
        name = question["name"]
        songs = question["songs"]
        if random_order:
            songs = random.sample(songs, len(songs))
        for song in songs:
            handle_song(driver, conn, annId,name, song, enables, types)
    driver.execute_script("options.logout();")
    driver.close()


def find_song_to_upload(driver, conn, annId, anime, song, exists=[False,False,False], types=[True,True,True]):
    source_720 = song["examples"].get("720", None)
    source_480 = song["examples"].get("480", None)
    source_mp3 = song["examples"].get("mp3", None)
    if (source_720 and not exists[0]) or (source_480 and not exists[1]) or (source_mp3 and not exists[2]) or (not source_720 and exists[0]) or (not source_480 and exists[1]) or (not source_mp3 and exists[2]):
        return
    open_mapping = [False,False,False,True]
    catbox_status_720_open = open_mapping[song["versions"]["open"]["catbox"]["720"]]
    catbox_status_480_open = open_mapping[song["versions"]["open"]["catbox"]["480"]]
    catbox_status_mp3_open = open_mapping[song["versions"]["open"]["catbox"]["mp3"]]
    if not (catbox_status_720_open or catbox_status_480_open or catbox_status_mp3_open):
        return
    title = song["name"]
    artist = song["artist"]
    type = ["UN", "OP", "ED", "IN"][song["type"]]
    if type != "UN" and not types[song["type"]-1]:
        return
    if type != "IN":
        type += str(song["number"])
    load_song_info(driver, song, annId, anime)
    source = input("enter filename for a suitable source:\n")
    if source == "":
        return
    video_720 = autoconvert(source, 720, anime, type, title, artist)
    if not video_720:
        video_720 = autoconvert(source, -2, anime, type, title, artist)
        if not video_720:
            return
    video_480 = autoconvert(source, 480, anime, type, title, artist)
    video_mp3 = autoconvert(source, 0, anime, type, title, artist)
    if video_720:
        cblink = catbox.upload(video_720)
        if cblink is not None:
            sourceold = source
            source = cblink
            save_catbox(conn, sourceold, 720, cblink, video_720)
            ret = enter_and_submit(driver, cblink)
            if ret:
                save_upload(conn, sourceold, 720, anime, title, type, artist, cblink, video_720)
        else:
            return
    if video_480:
        cblink = catbox.upload(video_480)
        if cblink is not None:
            save_catbox(conn, source, 480, cblink, video_480)
            ret = enter_and_submit(driver, cblink)
            if ret:
                save_upload(conn, source, 480, anime, title, type, artist, cblink, video_480)
    if video_mp3:
        cblink = catbox.upload(video_mp3)
        if cblink is not None:
            save_catbox(conn, source, 0, cblink, video_mp3)
            ret = enter_and_submit(driver, cblink)
            if ret:
                save_upload(conn, source, 0, anime, title, type, artist, cblink, video_mp3)


def song_info_pretty(annId, anime, song, reason=None):
    ret = ""
    ret += "**ANNID**: %d\n" % annId
    ret += "**AnnSongId**: %d\n" % song["annSongId"]
    ret += "**Anime**: '%s'\n" % anime
    ret += "**Title**: '%s'\n" % song["name"]
    ret += "**Artist**: '%s'\n" % song["artist"]
    ret += "**Type**: %s" % ["UN","OP","ED","IN"][song["type"]]
    ret += "%d" % song["number"] if song["type"] != 3 else ""
    ret += "\n"
    return ret


if __name__ == "__main__":
    main()
