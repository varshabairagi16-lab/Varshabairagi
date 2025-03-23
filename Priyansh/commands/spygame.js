const axios = require("axios");

module.exports.config = {
    name: "spygame",
    version: "1.0.4",
    hasPermission: 0,
    credits: "MirryKal",
    description: "A fun spy game for group chats with auto-player inclusion!",
    commandCategory: "games",
    usages: "+spygame @players",
    cooldowns: 5
};

const wordCategories = {
    "Fruits": ["Apple", "Banana", "Mango", "Pineapple", "Grapes", "Strawberry", "Watermelon", "Peach", "Guava", "Pomegranate"],
    "Animals": ["Lion", "Tiger", "Elephant", "Cheetah", "Leopard", "Kangaroo", "Giraffe", "Zebra", "Panda", "Wolf"],
    "Sports": ["Football", "Cricket", "Basketball", "Tennis", "Hockey", "Volleyball", "Badminton", "Golf", "Wrestling", "Boxing"],
    "Vehicles": ["Car", "Bike", "Train", "Aeroplane", "Bus", "Truck", "Scooter", "Ship", "Tractor", "Bicycle"],
    "Jobs": ["Doctor", "Engineer", "Teacher", "Scientist", "Police", "Lawyer", "Chef", "Pilot", "Actor", "Writer"],
    "Beverages": ["Tea", "Coffee", "Juice", "Milk", "Soda", "Wine", "Beer", "Coconut Water", "Smoothie", "Energy Drink"]
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, mentions, senderID } = event;

    // 🏆 Auto-Include Command User
    let players = Object.keys(mentions);
    if (!players.includes(senderID)) {
        players.push(senderID);
    }

    if (players.length < 3 || players.length > 6) {
        return api.sendMessage("⚠ कम से कम 3 और अधिकतम 6 प्लेयर्स मेंशन करें!", threadID, messageID);
    }

    const categories = Object.keys(wordCategories);
    const chosenCategory = categories[Math.floor(Math.random() * categories.length)];
    let words = [...wordCategories[chosenCategory]];

    let spyIndex = Math.floor(Math.random() * players.length);
    let spy = players[spyIndex];
    let wordForSpy = words[Math.floor(Math.random() * words.length)];
    let assignedWords = {};

    players.forEach((player, index) => {
        assignedWords[player] = index === spyIndex ? wordForSpy : words[0];
    });

    api.sendMessage(`🎭 *Spy Game शुरू हो चुका है!*\n\n**श्रेणी:** ${chosenCategory}\n📢 हर खिलाड़ी को अपने शब्द को समझाना होगा, लेकिन शब्द नहीं बताना है!\n\n🔍 *Bot अब सभी प्लेयर्स को उनके शब्द भेज रहा है...*`, threadID);

    // 🔥 Async function for DM
    const sendWordToPlayer = async (playerID, word) => {
        try {
            await api.sendMessage(`🤫 आपका गुप्त शब्द: *${word}*`, playerID);
        } catch (err) {
            api.sendMessage(`⚠ *${mentions[playerID] || "Player"}* को DM नहीं भेज सका, उनका शब्द है: *${word}*`, threadID);
        }
    };

    for (let playerID of players) {
        await sendWordToPlayer(playerID, assignedWords[playerID]);
    }

    api.sendMessage(`✅ सभी प्लेयर्स को उनके शब्द मिल चुके हैं! बोट अब बारी-बारी से प्लेयर्स को बुलाएगा।`, threadID);

    let playerTurn = 0;
    
    // 🎯 Function to ask players to explain their word
    const playTurn = () => {
        if (playerTurn >= players.length) {
            return startVoting();
        }
        let player = players[playerTurn];
        playerTurn++;

        api.sendMessage(`📢 *${mentions[player] || "Player"}*, अपने शब्द को **एक वाक्य में समझाओ!**`, threadID, (err, info) => {
            if (!err) {
                let messageID = info.messageID;
                // ⏳ 30 सेकंड का टाइम मिलेगा जवाब देने के लिए
                setTimeout(() => {
                    api.getMessageInfo(messageID, (err, msgInfo) => {
                        if (err || !msgInfo.body) {
                            api.sendMessage(`⚠ *${mentions[player] || "Player"}* ने कोई जवाब नहीं दिया!`, threadID);
                        }
                        // 🔄 अगले प्लेयर को बुलाओ
                        playTurn();
                    });
                }, 30000);
            }
        });
    };

    // 🗳 Voting Function
    const startVoting = () => {
        api.sendMessage(`🔍 **अब वोटिंग शुरू होगी!**\n\n👉 जिस प्लेयर को आप **Spy** समझते हैं, उसके मैसेज पर ❌ रिएक्शन दें।\n\n⏳ वोटिंग 30 सेकंड में ख़त्म होगी।`, threadID);
        
        setTimeout(() => {
            api.getThreadInfo(threadID, (err, info) => {
                if (err) return api.sendMessage("⚠ वोटिंग में कुछ समस्या हुई!", threadID);

                let maxVotes = 0;
                let accused = "";
                for (let reaction of info.message_reactions) {
                    if (reaction.reaction === "❌" && reaction.count > maxVotes) {
                        maxVotes = reaction.count;
                        accused = reaction.userID;
                    }
                }

                if (accused === spy) {
                    api.sendMessage(`✅ **बधाई हो!** आप सही थे! **${mentions[spy] || "Spy"}** असली Spy निकला!`, threadID);
                } else {
                    api.sendMessage(`❌ गलत वोटिंग! असली Spy **${mentions[spy] || "Spy"}** था!`, threadID);
                }
            });
        }, 30000);
    };

    setTimeout(playTurn, 5000);
};
