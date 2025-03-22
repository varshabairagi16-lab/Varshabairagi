module.exports.config = {
    name: "joinNoti",
    eventType: ["log:subscribe"],
    version: "1.0.1",
    credits: "Mirrykal",
    description: "Welcome message with a random video",
    dependencies: {}
};

module.exports.run = async function({ api, event }) {
    const { threadID, logMessageData } = event;

    // ✅ जब Bot को Add किया जाता है
    if (logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
        const botName = global.config.BOTNAME || "Bot";
        const prefix = "+"; // Fixed prefix
        const timeZone = "Asia/Kolkata";
        const currentTime = new Date().toLocaleString("en-US", { timeZone });

        const botEntryMessage = `🤖 Hello! I'm ${botName}  
📅 Date & Time: ${currentTime} (IST)  
🔹 My Prefix: ${prefix}  
💡 Type ${prefix}help to see my commands!`;

        return api.sendMessage(botEntryMessage, threadID);
    }

    // ✅ जब कोई नया सदस्य Group में Join करता है
    try {
        const { getUserInfo, getThreadInfo } = api;
        const { participantIDs, threadName } = await getThreadInfo(threadID);

        let nameArray = [];
        for (const user of logMessageData.addedParticipants) {
            const userInfo = await getUserInfo(user.userFbId);
            nameArray.push(userInfo[user.userFbId].name);
        }

        const randomWelcomeMessages = [
            `🎉 Welcome, {name}! You're now part of *{threadName}*! Enjoy your stay!`,
            `✨ {name} has entered the chat! Let's give them a warm welcome in *{threadName}*!`,
            `🔥 {name} just joined *{threadName}*! Hope you're ready for some fun!`,
            `👋 Hey {name}, welcome to *{threadName}*! We were expecting you!`,
            `🚀 {name} has landed in *{threadName}*! Buckle up for an awesome ride!`
        ];

        const randomVideos = [
            "https://i.imgur.com/p8wkPBI.mp4",
            "https://i.imgur.com/zIoaoc0.mp4",
            "https://i.imgur.com/tYHkSuj.mp4",
            "https://i.imgur.com/71Ftuzt.mp4",
            "https://i.imgur.com/y7GOEob.mp4",
            "https://i.imgur.com/Q4Yebey.mp4",
            "https://i.imgur.com/cLBLMpe.mp4"
        ];

        // ✅ Random Video & Message Select करना
        const welcomeMessage = randomWelcomeMessages[Math.floor(Math.random() * randomWelcomeMessages.length)]
            .replace("{name}", nameArray.join(", "))
            .replace("{threadName}", threadName);

        const randomVideo = randomVideos[Math.floor(Math.random() * randomVideos.length)];

        // ✅ Final Message Send करना
        return api.sendMessage({
            body: welcomeMessage,
            attachment: await global.utils.getStreamFromURL(randomVideo)
        }, threadID);

    } catch (error) {
        console.error("Error in joinNoti script:", error);
    }
};
