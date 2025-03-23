const axios = require("axios");

module.exports.config = {
    name: "wiki",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "MirryKal",
    description: "Get Wikipedia search results with image and multilingual support",
    commandCategory: "information",
    usages: "[query] [language_code (optional)]",
    cooldowns: 2
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    
    if (args.length === 0) {
        return api.sendMessage("⚠ कृपया कोई टॉपिक दर्ज करें जिसे आप Wikipedia पर खोजना चाहते हैं!", threadID, messageID);
    }

    let lang = "en"; // Default English
    let query = args.join(" ");

    // अगर लास्ट में language code दिया गया है तो उसे अलग कर लो
    if (args.length > 1) {
        const lastArg = args[args.length - 1];
        if (/^[a-z]{2}$/.test(lastArg)) {
            lang = lastArg;
            query = args.slice(0, -1).join(" ");
        }
    }

    const API_URL = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;

    try {
        const res = await axios.get(API_URL);
        const data = res.data;

        if (!data.extract) {
            throw new Error("No content found");
        }

        let response = `📖 *${data.title}*\n\n${data.extract}\n\n🌐 और पढ़ें: ${data.content_urls.desktop.page}`;

        if (data.thumbnail?.source) {
            return api.sendMessage({
                body: response,
                attachment: await global.utils.getStreamFromURL(data.thumbnail.source)
            }, threadID, messageID);
        } else {
            return api.sendMessage(response, threadID, messageID);
        }

    } catch (error) {
        return api.sendMessage(`❌ Wikipedia पर *${query}* से संबंधित कोई जानकारी नहीं मिली।`, threadID, messageID);
    }
};
