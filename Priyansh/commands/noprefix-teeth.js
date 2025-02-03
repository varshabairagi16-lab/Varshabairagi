const fs = require("fs");
module.exports.config = {
	name: "teeth",
    version: "1.0.1",
	hasPermssion: 0,
	credits: "Mirrykal", 
	description: "hihihihi",
	commandCategory: "no prefix",
	usages: "he😁😁",
    cooldowns: 5, 
};

module.exports.handleEvent = function({ api, event, client, __GLOBAL }) {
	var { threadID, messageID } = event;
	if (event.body.indexOf("😁")==0 || event.body.indexOf("😆")==0 || event.body.indexOf("😁😁")==0 || event.body.indexOf("😁😁😁")==0) {
		var msg = {
				body: "🤭𝙺𝚢𝚊 𝚊𝚙𝚔𝚎 𝚃𝚘𝚘𝚝𝚑𝚙𝚊𝚜𝚝𝚎 𝚖𝚎 𝙽𝚊𝚖𝚊𝚔 𝚑𝚊𝚒 \n  ᴋɪᴛɴᴀ ꜱʜɪɴᴇ ᴋʀᴛᴇ ʜᴀɪ🤔🤔🙄",
				attachment: fs.createReadStream(__dirname + `/noprefix/teeth.mp4`)
			}
			api.sendMessage(msg, threadID, messageID);
    api.setMessageReaction("🦷", event.messageID, (err) => {}, true)
		}
	}
	module.exports.run = function({ api, event, client, __GLOBAL }) {

  }
