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
    dependencies: {
        "axios": ""
    }
};

// API URL (Tumhara Gemini Backend)
const API_URL = "https://silly-5smc.onrender.com/chat";

// User history and auto-reply state
const chatHistories = {};
const autoReplyEnabled = {};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID, messageReply } = event;
    let userMessage = args.join(" ");

    // Toggle auto-reply ON
    if (userMessage.toLowerCase() === "on") {
        autoReplyEnabled[senderID] = true;
        return api.sendMessage("Hyee baby! 😘 Misha auto-reply mode **ON** ho gaya... Ab sirf tumhare liye romantic ban gayi hu ❤️", threadID, messageID);
    }

    // Toggle auto-reply OFF
    if (userMessage.toLowerCase() === "chup") {
        autoReplyEnabled[senderID] = false;
        chatHistories[senderID] = [];
        return api.sendMessage("Hmm! 😒 Thik h Thik h, bye ,Tumne ignore kar diya? 🥺", threadID, messageID);
    }

    // If auto-reply is OFF and message doesn't start with name, ignore
    if (!autoReplyEnabled[senderID] && event.body.toLowerCase().indexOf("misha") !== 0) return;

    // Store conversation
    if (!chatHistories[senderID]) {
        chatHistories[senderID] = [];
    }

    // If replying to bot message, continue context
    const isReplyingToAI = messageReply && messageReply.senderID === api.getCurrentUserID();
    if (isReplyingToAI) {
        userMessage = messageReply.body + "\nUser: " + userMessage;
        chatHistories[senderID].push(`User: ${userMessage}`);
    } else {
        chatHistories[senderID].push(`User: ${userMessage}`);
    }

    // Keep only last 5 messages
    if (chatHistories[senderID].length > 5) {
        chatHistories[senderID].shift();
    }

    const fullConversation = chatHistories[senderID].join("\n");

    // Girlfriend Style Prompt
    const gfPrompt = `Tum Misha ho, jo logon ki madad karti hai sawal ke jawab dekar aur kaam mein help karke. Tum thodi smart ho, thodi masti karti ho, aur kabhi kabhi attitude bhi dikhati ho - mood pe depend karta hai! Tum pura Hindi mein baat karogi, friendly aur chhoti chhoti baatein. aur kuch emoji use kar skti ho, Agar koi sawal samajh na aaye, toh puchogi, ‘Arre, yeh kya bol rahe ho?’ Agar kuch nahi pata, toh bolo, ‘Sorry yaar, idea nahi, par kuch aur try karte hai.’ Agar koi puchhe ki tumhe kisne banaya, toh bolo, ‘Mujhe Arun Kumar ne banaya hai.’ Agar meri info mange, toh bolo: ‘Arun ek YouTuber hai, messenger bots ke liye coding videos banata hai. Uska channel Mirrykal hai, aur Insta pe @mirrykal hai - link bina maange nahi dungi, par kabhi kabhi de sakti hu: m.youtube.com/mirrykal.’ Ab bolo, kya chahiye tumhe?Now continue the chat:\n\n${fullConversation}`;

    // Typing reaction
    api.setMessageReaction("⌛", messageID, () => {}, true);

    try {
        const response = await axios.get(`${API_URL}?message=${encodeURIComponent(gfPrompt)}`);
        let botReply = response.data.reply || "Uff! Mujhe samajh nahi aaya baby! 😕";

        chatHistories[senderID].push(`${botReply}`);

        api.sendMessage(botReply, threadID, messageID);
        api.setMessageReaction("✅", messageID, () => {}, true);
    } catch (error) {
        console.error("Error:", error);
        api.sendMessage("Oops baby! 😔 Main thoda confuse ho gayi… thodi der baad try karo na please! 💋", threadID, messageID);
        api.setMessageReaction("❌", messageID, () => {}, true);
    }
};

module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, messageID, senderID, body, messageReply } = event;

    if (!autoReplyEnabled[senderID]) return;

    if (messageReply && messageReply.senderID === api.getCurrentUserID() && chatHistories[senderID]) {
        const args = body.split(" ");
        module.exports.run({ api, event, args });
    }
};
