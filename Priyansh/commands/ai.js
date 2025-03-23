const axios = require("axios");

module.exports.config = {
    name: "ai",
    version: "1.0.5",
    hasPermssion: 0,
    credits: "MirryKal",
    description: "Gemini AI with Memory & Reply Support",
    commandCategory: "ai",
    usages: "[ask]",
    cooldowns: 2,
    dependencies: {
        "axios": "1.4.0"
    }
};

// 🔹 API URL (Apni API ka link yahan daalo)
const API_URL = "https://silly-5smc.onrender.com/chat";  

// 🔹 User conversation history store karne ka system
const chatHistories = {};

module.exports.run = async function ({ api, event, args, Users }) {
    const { threadID, messageID, senderID, body, type, messageReply } = event;

    var userMessage = args.join(" ");

    // 🔹 Agar AI ke reply pe reply kiya gaya hai toh uska previous conversation yaad rakho
    const isReplyingToAI = messageReply && chatHistories[senderID] && chatHistories[senderID].length > 0;

    // 🔹 Agar user pehli baar likh raha hai toh history reset ho jayegi
    if (!chatHistories[senderID]) {
        chatHistories[senderID] = [];
    }

    // 🔹 Agar AI ka pehle se koi context hai toh uske sath continue karo
    if (isReplyingToAI && messageReply.senderID === api.getCurrentUserID()) {
        userMessage = messageReply.body + "\nUser: " + userMessage; // Pichla AI ka msg bhi bhejna
        chatHistories[senderID].push(`User: ${userMessage}`);
    } else {
        // Naya conversation start ho raha hai, toh purani history delete kar do
        chatHistories[senderID] = [`User: ${userMessage}`];
    }

    // 🔹 Sirf last 5 messages yaad rakho (taaki memory overload na ho)
    if (chatHistories[senderID].length > 5) {
        chatHistories[senderID].shift();
    }

    // 🔹 AI ko pura conversation bhejna
    const fullConversation = chatHistories[senderID].join("\n");

    // 🔹 AI typing reaction
    api.setMessageReaction("⌛", event.messageID, () => { }, true);

    try {
        const response = await axios.get(`${API_URL}?message=${encodeURIComponent(fullConversation)}`);

        const botReply = response.data.reply || "Mujhe samajh nahi aaya. 😕";

        // 🔹 AI ka reply history me add karna
        chatHistories[senderID].push(`AI: ${botReply}`);

        // 🔹 AI ka response bhejna
        api.sendMessage(botReply, threadID, messageID);

        // 🔹 Reaction update karna
        api.setMessageReaction("✅", event.messageID, () => { }, true);
    } catch (error) {
        console.error("Error fetching AI response:", error);
        api.sendMessage("AI response me error aayi, thodi der baad try karo! 😔", threadID, messageID);
    }
};

// 🔹 Automatic Reply System (Agar koi AI ke reply pe reply kare)
module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, messageID, senderID, body, messageReply } = event;

    // 🔹 AI ka reply check karne ke liye
    if (messageReply && messageReply.senderID === api.getCurrentUserID() && chatHistories[senderID]) {
        const args = body.split(" ");
        module.exports.run({ api, event, args });
    }
};
