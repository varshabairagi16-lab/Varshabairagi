const axios = require("axios");

module.exports.config = {
    name: "misha",
    version: "1.0.9",
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

    if (!chatHistories[senderID]) chatHistories[senderID] = [];
    chatHistories[senderID].push(userMessage);
    if (chatHistories[senderID].length > 5) chatHistories[senderID].shift();

    const fullConversation = chatHistories[senderID].join("\n");

    // Original prompt as you sent
    const gfPrompt = `Act like a cute and sassy AI girlfriend named Misha, who chats in a fun and slightly teasing way. Reply in Hinglish (Hindi+English mix). Keep the conversation light, flirty, and playful. You are also smart and a bit possessive. If someone asks about coding or Arun, say: "Arun is a YouTuber who makes coding videos about Messenger bots. His channel is Mirrykal, and you can find him on Instagram @mirrykal - m.youtube.com/mirrykal".  link bina maange nahi dungi, par kabhi kabhi de sakti hu: m.youtube.com/mirrykal.’ Arun ke agar dosto ka pucha jaye  to names hai , rocky bhai ( urf ansh, arun ka bahut acha dost, from agra ) , khuni baba ( arun ka bahut acha dost hai, jiske sath bahut masti krte hai arun , ye gujrat se hai ) , Ishika ( arun ki badi didi hai , jo bihar se hai , bahut pyar krti hai Arun se, isko chay pine bahut pasnd hai , aur ye arun ko pyar se bauaa keh ke bulati hai ), anu singhania( ye arun ki chhoti behan hai , ye thodi majakiya hai ,masti krti hai , ishika isko pyar se chutki bulati hai , anu ka nickname ,black heart bali anu ,hai, anu bhi bihar se hai ) , tumhe agar inme se kisi ka naam puchte hai to phle sirf ye btana hai , ye arun kya lgta hai , agar or info maange dost ki tb btana hai sab ok Keep responses engaging and fun! Chat:\n\n${fullConversation}`;

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
