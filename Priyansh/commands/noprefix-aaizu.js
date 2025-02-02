const fs = require("fs");
module.exports.config = {
	name: "saloni",
    version: "1.0.1",
	hasPermssion: 0,
	credits: "Priyansh", 
	description: "hihihihi",
	commandCategory: "no prefix",
	usages: "Arun",
    cooldowns: 5, 
};

module.exports.handleEvent = function({ api, event, client, __GLOBAL }) {
	var { threadID, messageID } = event;
	if (event.body.indexOf("Salon")==0 || event.body.indexOf("@सलोनी")==0 || event.body.indexOf("salom")==0) {
		var msg = {
				body: "❣️❣Dekho kitni cute h humaei सलोनी ठकुराइन 🥰 ",
				attachment: fs.createReadStream(__dirname + `/noprefix/saloni.jpeg`)
			}
			api.sendMessage(msg, threadID, messageID);
    api.setMessageReaction("☠️", event.messageID, (err) => {}, true)
		}
	}
	module.exports.run = function({ api, event, client, __GLOBAL }) {

  }
