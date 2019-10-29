// ==UserScript==
// @name         Amq Chat Improvement
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Makes chat a lot cooler
// @author       Zolhungaj
// @match        https://animemusicquiz.com/*
// @grant        none
// @copyright MIT license
// ==/UserScript==

if (!window.GameChat) return;



GameChat.prototype.insertMsg = function (msg) {
    if(msg instanceof Object){
        let sum = 0;
        let usr = "";
        let self = this;
        this.$chatMessageContainer.find('li').each(function () {
            let $entry = $(this);
            if($entry.find('.gcMessage').length == 0){
                return;
            }
            if($entry.find('.gcMessage')[0].innerHTML.trim().toLowerCase() === msg.find('.gcMessage')[0].innerHTML.trim().toLowerCase()){
                msg.find('.gcMessage')[0].innerHTML = $entry.find('.gcMessage')[0].innerHTML;
                let username = $entry.find('.gcUserName').text();
                let pattern2 = /\w+/;
                usr = pattern2.exec(username)[0];
                //if(usr === msg.find('.gcUserName').text()){
                //    sum--;  //this was silly, anyone else but the original can spam the count up so why not?
                //}
                let pattern = /\+\d+/;
                let result = pattern.exec(username);
                if(result){
                    sum += + result;
                }
                sum++;
                $entry.remove();
                self.currentMessageCount--;
            }
        });
        if(sum){
            msg.find('.gcUserName').text(usr + " +" + sum + " (" + msg.find('.gcUserName').text()+ ")");
        }
    }
	let atBottom = this.$chatMessageContainer.scrollTop() + this.$chatMessageContainer.innerHeight() >= this.$chatMessageContainer[0].scrollHeight - 100;
	this.$chatMessageContainer.append(msg);
	if (atBottom) {
		this.$chatMessageContainer.scrollTop(this.$chatMessageContainer.prop("scrollHeight"));
	}
	this.$SCROLLABLE_CONTAINERS.perfectScrollbar('update');
};