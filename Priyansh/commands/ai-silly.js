const axios = require("axios");

module.exports.config = {
    name: "misha",
    version: "1.0.9",
    hasPermssion: 0,
    credits: "MirryKal",
    description: "Misha AI with Memory, Reply Support & Fun Mode (Ladki Style)",
    commandCategory: "ai",
    usages: "[ask]",
    cooldowns: 2,
    dependencies: {
        "axios": "1.4.0"
    }
};

// 🔹 API URL
const API_URL = "https://silly-5smc.onrender.com/chat";

// 🔹 User conversation history & auto-reply mode
const chatHistories = {};
const autoReplyEnabled = {};

// ✅ **AI Command Function**
module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    let userMessage = args.join(" ").toLowerCase();

    // 🔹 Auto-reply toggle system
    if (userMessage === "on") {
        autoReplyEnabled[senderID] = true;
        return api.sendMessage("Hyee! 😘 Misha auto-reply mode **ON** ho gaya baby! 💖", threadID);
    }
    if (userMessage === "off") {
        autoReplyEnabled[senderID] = false;
        return api.sendMessage("Uff! 😒 Misha auto-reply mode **OFF** kar diya baby! 🤐", threadID);
    }

    // 🔹 Misha AI response system
    if (!userMessage) return api.sendMessage("Haanji baby? Bolo kya baat hai? 😘", threadID, messageID);

    // 🔹 Conversation history store
    if (!chatHistories[senderID]) chatHistories[senderID] = [];

    // 🔹 Sirf last 5 messages yaad rakho
    chatHistories[senderID].push(`User: ${userMessage}`);
    if (chatHistories[senderID].length > 5) chatHistories[senderID].shift();

    // 🔹 AI typing reaction
    api.setMessageReaction("⌛", messageID, () => {}, true);

    try {
        const response = await axios.get(`${API_URL}?message=${encodeURIComponent(chatHistories[senderID].join("\n"))}`);
        let botReply = response.data.reply || "Uff! Mujhe samajh nahi aaya baby! 😕";

        // 🔹 Fun Mode - Ladki Style
        const funReplies = [
            "Awww! Kitna cute bola tumne! 😍",
            "Hyee! Tum na bade naughty ho! 🤭",
            "Uff! Tum mujhe impress kar rahe ho kya? 😉",
            "Arre arre, kya baat hai! Tum toh bade interesting ho! 💃",
            "Hahaha! Tum na full mast lagte ho! 😘"
        ];

        botReply = `${botReply}\n\n💖 ${funReplies[Math.floor(Math.random() * funReplies.length)]}`;

        // 🔹 AI ka reply history me add karna
        chatHistories[senderID].push(`${botReply}`);

        // 🔹 AI ka response bhejna
        api.sendMessage(botReply, threadID, messageID);

        // 🔹 Reaction update karna
        api.setMessageReaction("✅", messageID, () => {}, true);
    } catch (error) {
        console.error("Error fetching AI response:", error);
        api.sendMessage("Uff! 😔 AI response me error aayi, thodi der baad try karo baby! 💋", threadID, messageID);
        api.setMessageReaction("❌", messageID, () => {}, true);
    }
};

// ✅ **Auto-Reply System (Reply pe AI reply de)**
module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, senderID, messageReply, body } = event;

    if (!autoReplyEnabled[senderID]) return;

    if (messageReply && messageReply.senderID === api.getCurrentUserID()) {
        const args = body.split(" ");
        module.exports.run({ api, event, args });
    }
};
