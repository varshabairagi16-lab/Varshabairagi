const axios = require("axios");

module.exports.config = {
    name: "misha",
    version: "1.3.0",
    hasPermssion: 0,
    credits: "MirryKal",
    description: "Misha AI - Smart Memory & Reply",
    commandCategory: "ai",
    usages: "[ask]",
    cooldowns: 2,
    dependencies: {
        "axios": "1.4.0"
    }
};

// 🔹 API URL
const API_URL = "https://silly-5smc.onrender.com/chat";

// 🔹 User memory storage
const chatHistories = {};
const autoReplyEnabled = {};

// ✅ **Misha Command Function**
module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    let userMessage = args.join(" ").toLowerCase();

    // 🔹 Auto-reply toggle system
    if (userMessage === "on") {
        autoReplyEnabled[senderID] = true;
        return api.sendMessage("Misha auto-reply mode **ON** ho gaya! 😘", threadID);
    }
    if (userMessage === "off") {
        autoReplyEnabled[senderID] = false;
        return api.sendMessage("Misha auto-reply mode **OFF** kar diya! 🤐", threadID);
    }

    if (!userMessage) return;

    // 🔹 Memory Optimization (Sirf last 6 messages yaad rakho)
    if (!chatHistories[senderID]) chatHistories[senderID] = [];
    chatHistories[senderID].push(`User: ${userMessage}`);
    if (chatHistories[senderID].length > 6) chatHistories[senderID].shift();

    // 🔹 AI typing reaction
    api.setMessageReaction("⌛", messageID, () => {}, true);

    try {
        const response = await axios.get(`${API_URL}?message=${encodeURIComponent(chatHistories[senderID].join("\n"))}&short=true`);
        let botReply = response.data.reply || "Mujhe samajh nahi aaya. 😕";

        // 🔹 AI ka reply history me add karna
        chatHistories[senderID].push(`${botReply}`);
        if (chatHistories[senderID].length > 6) chatHistories[senderID].shift();

        // 🔹 AI ka response bhejna
        api.sendMessage(botReply, threadID, messageID);
        api.setMessageReaction("✅", messageID, () => {}, true);
    } catch (error) {
        console.error("Error fetching AI response:", error);
        api.sendMessage("Oops! Koi error aayi, thodi der baad try karo! 😔", threadID, messageID);
        api.setMessageReaction("❌", messageID, () => {}, true);
    }
};

// ✅ **Auto-Reply System**
module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, senderID, messageReply, body } = event;

    if (!autoReplyEnabled[senderID]) return;

    if (messageReply && messageReply.senderID === api.getCurrentUserID()) {
        const args = body.split(" ");
        module.exports.run({ api, event, args });
    }
};
