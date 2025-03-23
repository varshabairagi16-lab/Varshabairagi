const axios = require("axios");

module.exports.config = {
    name: "imdb",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "MirryKal",
    description: "Find Movie/Series details from IMDb",
    commandCategory: "entertainment",
    usages: "[movie/series name]",
    cooldowns: 2
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    
    if (args.length === 0) {
        return api.sendMessage("⚠ कृपया कोई फ़िल्म या सीरीज़ का नाम दर्ज करें!", threadID, messageID);
    }

    const query = args.join(" ");
    const API_KEY = "8f50e26e";  // ✅ तुम्हारी API Key सेट कर दी गई है
    const API_URL = `http://www.omdbapi.com/?t=${encodeURIComponent(query)}&apikey=${API_KEY}`;

    try {
        const res = await axios.get(API_URL);
        const data = res.data;

        if (data.Response === "False") {
            throw new Error("No movie found");
        }

        let response = `🎬 *${data.Title}* (${data.Year})\n\n⭐ IMDb Rating: ${data.imdbRating}\n📺 Type: ${data.Type}\n🕰 Duration: ${data.Runtime}\n🎭 Genre: ${data.Genre}\n🎬 Director: ${data.Director}\n👥 Actors: ${data.Actors}\n📝 Plot: ${data.Plot}\n\n🌐 More Info: https://www.imdb.com/title/${data.imdbID}`;

        if (data.Poster && data.Poster !== "N/A") {
            return api.sendMessage({
                body: response,
                attachment: await global.utils.getStreamFromURL(data.Poster)
            }, threadID, messageID);
        } else {
            return api.sendMessage(response, threadID, messageID);
        }

    } catch (error) {
        return api.sendMessage(`❌ IMDb पर *${query}* से संबंधित कोई जानकारी नहीं मिली।`, threadID, messageID);
    }
};
