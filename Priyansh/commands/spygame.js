const sessions = {}; // यूज़र स्टेट को ट्रैक करने के लिए

module.exports.config = {
    name: "magic",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Arun Kumar",
    description: "A mind-reading number trick game.",
    commandCategory: "fun",
    usages: "[start]",
    cooldowns: 2
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, senderID, messageID } = event;

    if (!sessions[senderID]) {
        sessions[senderID] = { step: 1 };
        return api.sendMessage("Hey! सोचो कोई भी नंबर 1 से 100 तक! 🤔\n\nअगर सोच लिया तो *reply* में 'Yes' लिखो।", threadID, messageID);
    }
};

module.exports.handleReply = async function({ api, event }) {
    const { senderID, threadID, messageID, body } = event;
    if (!sessions[senderID]) return;

    const userSession = sessions[senderID];

    if (userSession.step === 1 && body.toLowerCase() === "yes") {
        userSession.step = 2;
        return api.sendMessage("अब उस नंबर में अपने दोस्त का भी उतना ही नंबर जोड़ दो! 😊\n\nअगर जोड़ लिया तो 'Done' लिखो।", threadID, messageID);
    }

    if (userSession.step === 2 && body.toLowerCase() === "done") {
        userSession.step = 3;
        userSession.randomAdd = [20, 30, 40, 50, 60, 80, 100, 120][Math.floor(Math.random() * 8)]; // Random नंबर चुनना
        return api.sendMessage(`अब उसमें *${userSession.randomAdd}* और जोड़ दो! 🔢\n\nअगर जोड़ लिया तो 'OK' लिखो।`, threadID, messageID);
    }

    if (userSession.step === 3 && body.toLowerCase() === "ok") {
        userSession.step = 4;
        return api.sendMessage("अब जो भी answer आया है, उसका आधा निकालकर admin को दे दो! 🧮\n\nअगर कर लिया तो 'Next' लिखो।", threadID, messageID);
    }

    if (userSession.step === 4 && body.toLowerCase() === "next") {
        userSession.step = 5;
        return api.sendMessage("अब जो दोस्त का नंबर था, उसे वापस हटा दो (minus करो)!\n\nअगर कर लिया तो 'Finish' लिखो।", threadID, messageID);
    }

    if (userSession.step === 5 && body.toLowerCase() === "finish") {
        const answer = userSession.randomAdd / 2; // Answer निकालना
        delete sessions[senderID]; // Session को खत्म करना
        return api.sendMessage(`🎉 तुम्हारा जवाब *${answer}* है! सही था ना? 😉`, threadID, messageID);
    }
};
