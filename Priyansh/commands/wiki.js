const axios = require("axios");

module.exports.config = {
    name: "wiki",
    version: "2.0",
    hasPermission: 0,
    credits: "MirryKal",
    description: "Search anything on Wikipedia with language support!",
    commandCategory: "study",
    usages: "[query] [language_code]",
    cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
    if (!args[0]) {
        return api.sendMessage("बोलो न, क्या सर्च करना है? 😜", event.threadID, event.messageID);
    }

    // 🔹 Check if last argument is a language code (e.g., "hi", "en", "fr")
    let langCode = "en";  // Default is English
    const lastArg = args[args.length - 1].toLowerCase();
    const validLangs = ["hi", "en", "fr", "es", "de", "ru", "zh", "ja"]; // Add more as needed

    if (validLangs.includes(lastArg)) {
        langCode = lastArg;
        args.pop(); // Remove language code from the query
    }

    let query = args.join(" ");
    let apiUrl = `https://${langCode}.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&exintro=true&explaintext=true&pithumbsize=500&generator=search&gsrsearch=${encodeURIComponent(query)}`;

    try {
        const response = await axios.get(apiUrl);
        const pages = response.data.query?.pages;

        if (!pages) {
            return api.sendMessage(`Oops! 🤔 "${query}" के बारे में कुछ नहीं मिला!`, event.threadID, event.messageID);
        }

        // 🔹 Pick the first available page
        const page = Object.values(pages)[0];
        const title = page.title || "No Title";
        const extract = page.extract ? page.extract.substring(0, 400) + "..." : "कोई जानकारी उपलब्ध नहीं।";
        const imageUrl = page.thumbnail?.source || null;
        const wikiUrl = `https://${langCode}.wikipedia.org/wiki/${encodeURIComponent(title)}`;

        let message = `📚 *${title}*\n\n${extract}\n\n🔗 अधिक जानकारी: ${wikiUrl}`;

        if (imageUrl) {
            return api.sendMessage({ body: message, attachment: await global.utils.getStreamFromURL(imageUrl) }, event.threadID, event.messageID);
        } else {
            return api.sendMessage(message, event.threadID, event.messageID);
        }
    } catch (error) {
        console.error("Wikipedia Error:", error);
        return api.sendMessage("Oops! Wikipedia से डेटा लाने में दिक्कत आ रही है। थोड़ी देर में try करो! 🤕", event.threadID, event.messageID);
    }
};
