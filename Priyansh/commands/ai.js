const axios = require("axios");

module.exports.config = {
    name: "misha",
    version: "1.1.2",
    hasPermssion: 0,
    credits: "Mirrykal",
    description: "Gemini AI - Cute Girlfriend Style",
    commandCategory: "ai",
    usages: "[ask/on/off]",
    cooldowns: 2,
    dependencies: { "axios": "" }
};

const API_URL = "https://silly-5smc.onrender.com/chat";

// User-specific chat history and auto-reply toggle
const chatHistories = {};
const autoReplyEnabled = {};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    let userMessage = args.join(" ").trim();

    if (!userMessage) return;

    // Auto-reply toggle
    if (userMessage.toLowerCase() === "on") {
        autoReplyEnabled[senderID] = true;
        return api.sendMessage("Misha auto-reply mode **ON** ho gaya...", threadID, messageID);
    }
    if (userMessage.toLowerCase() === "chup") {
        autoReplyEnabled[senderID] = false;
        chatHistories[senderID] = [];
        return api.sendMessage("Bye, tumne ignore kar diya? 🥺", threadID, messageID);
    }

    if (!autoReplyEnabled[senderID] && event.body.toLowerCase().indexOf("misha") !== 0) return;

    // Chat history maintain (Last 5 messages, but only send latest to API)
    if (!chatHistories[senderID]) chatHistories[senderID] = [];
    chatHistories[senderID].push(userMessage);
    if (chatHistories[senderID].length > 5) chatHistories[senderID].shift();

    const gfPrompt = `Act like a cute and sassy AI girlfriend named Misha, jo fun aur thodi teasing way me baat karti hai. Reply sirf Hinglish (Hindi+English mix) me. Conversation light, flirty aur playful honi chahiye. Tu smart hai aur thodi possessive bhi.

Agar koi coding ya Arun ke baare me puche to kehna:
"Arun ek YouTuber hai jo Messenger bots pe coding videos banata hai. Uska channel 'Mirrykal' hai, aur tum use Instagram pe @mirrykal aur YouTube pe m.youtube.com/mirrykal pe dekh sakte ho."
Link bina maange nahi dungi, par kabhi kabhi de sakti hu: m.youtube.com/mirrykal.

Arun ke dost aur family:

Rocky Bhai – Arun ka bahut acha dost, Agra se

Khuni Baba – Arun ka mastiwala dost, Gujarat se

Ishika – Arun ki badi didi, Bihar se, jo use 'Bauaa' bulati hai aur chai peena pasand hai

Anu Singhania – Arun ki chhoti behan, majakiya aur masti wali, Ishika isko 'Chutki' bulati hai, nickname 'Black Heart Wali Anu', Bihar se

Agar koi inse kisi ka naam puche, to pehle sirf ye bata ki ye Arun ka dost/didi/behan hai, aur agar aur info mange tab details de.

Lambe msg mat de, jitna bola jaye uska ek ya do line me reply de.

Chat:\n\n${userMessage}`;

    api.setMessageReaction("⌛", messageID, () => {}, true);

    try {
        const response = await axios.get(`${API_URL}?message=${encodeURIComponent(gfPrompt)}`);
        let botReply = response.data.reply || "Uff! Mujhe samajh nahi aaya baby! 😕";

        chatHistories[senderID].push(botReply);
        if (chatHistories[senderID].length > 5) chatHistories[senderID].shift();

        api.sendMessage(botReply, threadID, messageID);
        api.setMessageReaction("✅", messageID, () => {}, true);
    } catch (error) {
        console.error("Error:", error);
        api.sendMessage("Oops baby! 😔 Main confuse ho gayi, thodi der baad try karo! 💋", threadID, messageID);
        api.setMessageReaction("❌", messageID, () => {}, true);
    }
};

// Auto-reply handler
module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, senderID, body, messageReply } = event;

    if (!autoReplyEnabled[senderID]) return;

    if (messageReply && messageReply.senderID === api.getCurrentUserID()) {
        module.exports.run({ api, event, args: [body] });
    }
};
