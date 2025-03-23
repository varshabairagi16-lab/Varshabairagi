module.exports.config = {
    name: "magic",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "MirryKal",
    description: "A magic trick game using reactions!",
    commandCategory: "fun",
    usages: "",
    cooldowns: 5
};

let gameState = {}; // हर यूज़र का स्टेट ट्रैक करने के लिए
let randomNum = 0; // जो नंबर बॉट एड करवाएगा

module.exports.run = async function({ api, event }) {
    let { threadID, senderID } = event;

    randomNum = Math.floor(Math.random() * 7) * 10 + 30; // 30 से 150 तक कोई एक नंबर
    
    gameState[senderID] = { step: 1 };

    return api.sendMessage(
        "Hey! सोचो कोई भी नंबर 1 से 100 तक! 🤔\n\nअगर सोच लिया तो *कोई भी reaction दो*।",
        threadID,
        (err, info) => {
            gameState[senderID].msgID = info.messageID;
        }
    );
};

module.exports.handleReaction = async function({ api, event }) {
    let { threadID, messageID, userID } = event;

    if (!gameState[userID] || gameState[userID].msgID !== messageID) return;

    if (gameState[userID].step === 1) {
        api.sendMessage("अच्छा! अब अपने दोस्त के लिए उतना ही नंबर add करो जितना सोचा था।", threadID);
        gameState[userID].step = 2;
    } 
    else if (gameState[userID].step === 2) {
        api.sendMessage(`अब उसमें *${randomNum}* add करो।`, threadID);
        gameState[userID].step = 3;
    } 
    else if (gameState[userID].step === 3) {
        api.sendMessage("अब जो result आया है, उसका आधा Admin को दे दो।", threadID);
        gameState[userID].step = 4;
    } 
    else if (gameState[userID].step === 4) {
        api.sendMessage("अब अपने दोस्त वाला नंबर वापिस घटा दो!", threadID);
        gameState[userID].step = 5;
    } 
    else if (gameState[userID].step === 5) {
        api.sendMessage(`तुम्हारा answer *${randomNum / 2}* है! 🎩`, threadID);
        delete gameState[userID]; // गेम खत्म
    }
};
