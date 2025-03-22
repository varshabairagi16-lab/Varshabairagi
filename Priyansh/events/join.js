module.exports.config = {
    name: "joinNoti",
    eventType: ["log:subscribe"],
    version: "1.1.0",
    credits: "Mirrykal",
    description: "Send fun welcome messages with random Instagram videos"
};

module.exports.run = async function({ api, event }) {
    const { threadID } = event;
    const { createReadStream } = require("fs");

    // Random Instagram video links
    const videoLinks = [
        "https://i.imgur.com/p8wkPBI.mp4",
        "https://i.imgur.com/zIoaoc0.mp4",
        "https://i.imgur.com/tYHkSuj.mp4",
        "https://i.imgur.com/71Ftuzt.mp4",
        "https://i.imgur.com/y7GOEob.mp4",
        "https://i.imgur.com/Q4Yebey.mp4",
        "https://i.imgur.com/cLBLMpe.mp4"
    ];

    // Select a random video
    const randomVideo = videoLinks[Math.floor(Math.random() * videoLinks.length)];

    // Get the bot name and prefix
    const botname = global.config.BOTNAME || "Bot";
    const prefix = global.config.PREFIX || "/";

    // Get current date & time in IST
    const time = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

    // If bot is added to a group
    if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
        const botMessage = `🔔 **बॉट ऑनलाइन हो गया!**  
🤖 *नाम:* ${botname}  
⚡ *Prefix:* ${prefix}  
🕰 *समय:* ${time} (Asia/Kolkata)  

अब मज़े लो, और *${prefix}help* टाइप करके देखो, मैं क्या-क्या कर सकता हूँ! 😎🎶`;

        return api.sendMessage(botMessage, threadID);
    } 
    
    // If a new member joins
    else {
        try {
            let { threadName, participantIDs } = await api.getThreadInfo(threadID);
            const nameArray = event.logMessageData.addedParticipants.map(p => p.fullName);
            const mentions = nameArray.map((name, index) => ({ tag: name, id: event.logMessageData.addedParticipants[index].userFbId }));

            const welcomeMessage = `👋 **${nameArray.join(", ")}**, तुम्हारा स्वागत है **${threadName}** में!  
यहाँ आकर पछताना मत, क्योंकि अब निकलने का कोई रास्ता नहीं... 😈😆`;

            const attachment = await global.utils.getStreamFromURL(randomVideo);

            return api.sendMessage({ body: welcomeMessage, mentions, attachment }, threadID);
        } catch (e) {
            console.log(e);
        }
    }
};
