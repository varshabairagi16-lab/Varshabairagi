module.exports.config = {
    name: "join",
    eventType: ["log:subscribe"],
    version: "1.2.0",
    credits: "Priyansh Rajput",
    description: "Welcomes new members, updates bot nickname, and sends a fun message with a video",
};

module.exports.run = async function({ api, event, Users, Threads }) {
    const { threadID } = event;
    const userID = event.logMessageData.addedParticipants[0].userFbId;
    const botID = api.getCurrentUserID();
    const botName = global.config.BOTNAME || "🔥 Bot 🔥"; // Bot name from config
    const userName = await Users.getNameUser(userID);
    
    // Random Fun Welcome Messages
    const welcomeMessages = [
        `👋 Hey ${userName}, welcome to the group! Ab dosti nibhaane ka time aa gaya! 😎`,
        `🎉 ${userName} aaya hai, masti shuru karo! Yeh group ab aur bhi interesting hone wala hai!`,
        `🔥 Welcome ${userName}! Ab party shuru hogi!`,
        `✨ ${userName}, group me welcome! Apna mask utaaro aur asli chehra dikhane ka time aa gaya! 🤣`,
        `🌟 ${userName}, aakhir aa hi gaye tum! Ab maze hi maze!`
    ];
    
    // Random Instagram Video Links
    const videoLinks = [
        "https://i.imgur.com/OHTcAGv.mp4",
        "https://i.imgur.com/QCsxN6h.mp4",
        "https://i.imgur.com/CM6uGry.mp4",
        "https://i.imgur.com/RDji9aR.mp4",
        "https://i.imgur.com/7CaCDQX.mp4",
        "https://i.imgur.com/iusgHyQ.mp4",
        "https://i.imgur.com/isBR9V8.mp4"
    ];

    // Select Random Message & Video
    const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    const randomVideo = videoLinks[Math.floor(Math.random() * videoLinks.length)];

    // Set Bot Nickname
    try {
        api.changeNickname(botName, threadID, botID);
    } catch (error) {
        console.error("Nickname change failed:", error);
    }

    // Send Welcome Message with Video
    return api.sendMessage({ body: randomMessage, attachment: await global.utils.getStreamFromURL(randomVideo) }, threadID);
};
