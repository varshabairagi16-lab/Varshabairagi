const axios = require("axios");

module.exports.config = {
    name: "spygame",
    version: "1.0.1",
    hasPermission: 0,
    credits: "MirryKal",
    description: "A fun spy game for group chats with 6 categories and 10 words each!",
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
    const { threadID, messageID, mentions } = event;

    if (Object.keys(mentions).length < 3 || Object.keys(mentions).length > 6) {
        return api.sendMessage("⚠ कम से कम 3 और अधिकतम 6 प्लेयर्स मेंशन करें!", threadID, messageID);
    }

    const categories = Object.keys(wordCategories);
    const chosenCategory = categories[Math.floor(Math.random() * categories.length)];
    let words = [...wordCategories[chosenCategory]];

    let players = Object.keys(mentions);
    let spyIndex = Math.floor(Math.random() * players.length);
    let spy = players[spyIndex];
    let wordForSpy = words[Math.floor(Math.random() * words.length)];  
    let assignedWords = {};

    players.forEach((player, index) => {
        if (index === spyIndex) {
            assignedWords[player] = wordForSpy;  
        } else {
            assignedWords[player] = words[0];  
        }
    });

    for (let playerID in assignedWords) {
        api.sendMessage(`🤫 आपका गुप्त शब्द: *${assignedWords[playerID]}*`, playerID);
    }

    api.sendMessage(
        `🎭 *Spy Game शुरू हो चुका है!*\n\n**श्रेणी:** ${chosenCategory}\n📢 हर खिलाड़ी को अपने शब्द को अच्छे से समझाना होगा, लेकिन शब्द नहीं बताना है!\n\n🔍 *Bot अब रैंडम प्लेयर को चुनेगा और उनसे उनका शब्द समझाने को कहेगा!*`,
        threadID
    );

    let playerTurn = 0;
    const playTurn = () => {
        if (playerTurn >= players.length) {
            return startVoting();
        }
        let player = players[playerTurn];
        playerTurn++;

        api.sendMessage(`📢 *${mentions[player].replace("@", "")}*, अपने शब्द को **एक वाक्य में समझाओ**!`, threadID);
    };

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
                    api.sendMessage(`✅ **बधाई हो!** आप सही थे! **${mentions[spy]}** असली Spy निकला!`, threadID);
                } else {
                    api.sendMessage(`❌ गलत वोटिंग! असली Spy **${mentions[spy]}** था!`, threadID);
                }
            });
        }, 30000);
    };

    setTimeout(playTurn, 5000);
};
