const axios = require("axios");

module.exports.config = {
    name: "spygame",
    version: "1.3.0",
    hasPermission: 0,
    credits: "MirryKal",
    description: "Play the Spy Game in chat",
    commandCategory: "games",
    usages: "[mentions]",
    cooldowns: 5
};

const sendMessageToUID = async (userID, message) => {
    try {
        await axios.post("http://localhost:PORT/send-message", { 
            uid: userID, 
            message: message 
        });
    } catch (error) {
        console.error(`❌ Error sending message to ${userID}:`, error);
    }
};

// Categories with 10 words each
const categories = {
    "Food": ["Pizza", "Burger", "Pasta", "Sushi", "Tacos", "Sandwich", "Salad", "Noodles", "Biryani", "Steak"],
    "Sports": ["Football", "Basketball", "Tennis", "Cricket", "Hockey", "Baseball", "Boxing", "Golf", "Cycling", "Swimming"],
    "Nature": ["River", "Mountain", "Forest", "Desert", "Ocean", "Waterfall", "Valley", "Island", "Cave", "Glacier"],
    "Animals": ["Lion", "Tiger", "Elephant", "Giraffe", "Panda", "Kangaroo", "Dolphin", "Cheetah", "Wolf", "Eagle"],
    "Technology": ["Laptop", "Smartphone", "Keyboard", "Mouse", "Router", "Headphones", "Camera", "Monitor", "Drone", "Speaker"],
    "Movies": ["Inception", "Titanic", "Avatar", "Gladiator", "Interstellar", "Joker", "Parasite", "The Matrix", "Godfather", "Frozen"]
};

// Active games (to track turns)
const activeGames = {};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID, mentions } = event;
    const players = Object.keys(mentions);
    
    if (players.length < 2 || players.length > 5) {
        return api.sendMessage("⚠️ Please mention 2-5 players!", threadID, messageID);
    }

    players.push(senderID); // Include the sender

    const categoryNames = Object.keys(categories);
    const chosenCategory = categoryNames[Math.floor(Math.random() * categoryNames.length)];
    const words = [...categories[chosenCategory]];

    if (words.length < players.length) {
        return api.sendMessage("❌ Not enough words available!", threadID, messageID);
    }

    let selectedWords = words.sort(() => 0.5 - Math.random()).slice(0, players.length);
    let spyIndex = Math.floor(Math.random() * players.length);
    let spyWord = "❓ (You are the Spy! Figure out others' words.)";
    
    for (let i = 0; i < players.length; i++) {
        const playerID = players[i];
        const word = i === spyIndex ? spyWord : selectedWords[i];

        await sendMessageToUID(playerID, `🕵️‍♂️ Your Secret Word: *${word}*\n🔍 Category: ${chosenCategory}`);
    }

    activeGames[threadID] = { players, currentTurn: 0, category: chosenCategory };

    api.sendMessage(`🎭 **Spy Game Started!** 🎭\n🔹 **Category:** ${chosenCategory}\n📝 All players have received their secret words.\n\n👉 **${mentions[players[0]] || "First player"}**, please explain your word!`, threadID, messageID);
};

// Handle Player Turns
module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, senderID, body } = event;
    
    if (!activeGames[threadID]) return;
    let game = activeGames[threadID];

    if (senderID !== game.players[game.currentTurn]) return;

    game.currentTurn++;

    if (game.currentTurn < game.players.length) {
        api.sendMessage(`✅ **Next Player:** ${game.players[game.currentTurn]}\nPlease explain your word!`, threadID);
    } else {
        api.sendMessage("🎭 **All players have explained their words!**\n🗳️ Time to vote! React to the person you think is the Spy.", threadID);
    }
};
