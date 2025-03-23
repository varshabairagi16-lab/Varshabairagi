const axios = require("axios");

module.exports.config = {
    name: "imdb",
    version: "1.0.2",
    hasPermission: 0,
    credits: "MirryKal",
    description: "Find movie or series details from IMDb",
    commandCategory: "search",
    usages: "[movie/series name]",
    cooldowns: 3
};

module.exports.run = async ({ event, args, api }) => {
    if (!args.length) {
        return api.sendMessage("❗ कृपया कोई फ़िल्म या सीरीज़ का नाम दर्ज करें!", event.threadID, event.messageID);
    }

    const query = args.join(" ");
    const apiKey = "8f50e26e"; // अपना IMDb API Key डालो
    const url = `http://www.omdbapi.com/?t=${encodeURIComponent(query)}&apikey=${apiKey}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (data.Response === "False") {
            return api.sendMessage(`❌ IMDb पर *${query}* से संबंधित कोई जानकारी नहीं मिली।`, event.threadID, event.messageID);
        }

        // 🎬 पहले Movie Info भेजें
        const message = `🎬 *${data.Title}* (${data.Year})\n⭐ IMDB रेटिंग: ${data.imdbRating}/10\n🎭 Genre: ${data.Genre}\n🎬 डायरेक्टर: ${data.Director}\n📜 कहानी: ${data.Plot}\n🌍 देश: ${data.Country}\n\n🔗 IMDb: https://www.imdb.com/title/${data.imdbID}/`;
        
        api.sendMessage(message, event.threadID, event.messageID);

        // 🖼 फिर Poster अलग से भेजें
        if (data.Poster && data.Poster !== "N/A") {
            let posterURL = data.Poster;
            
            if (!posterURL.endsWith(".jpg") && !posterURL.endsWith(".png")) {
                posterURL += ".jpg";
            }

            let attachment = await global.utils.getStreamFromURL(posterURL);
            api.sendMessage({ body: "🎥 Movie Poster:", attachment }, event.threadID);
        }

    } catch (error) {
        console.error(error);
        return api.sendMessage("⚠️ IMDb API से डेटा लाने में समस्या हो रही है। बाद में पुनः प्रयास करें!", event.threadID, event.messageID);
    }
};
