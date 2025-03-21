const axios = require("axios");
const { exec } = require("child_process");
const fs = require("fs");
const ytsr = require("ytsr");

module.exports.config = {
    name: "mp3",
    version: "2.0",
    hasPermission: 0,
    credits: "Mirrykal",
    description: "Download and send MP3 from YouTube",
    commandCategory: "music",
    usages: "[song name]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    if (args.length === 0) {
        return api.sendMessage("Please enter a song name!", event.threadID, event.messageID);
    }

    const query = args.join(" ");
    api.sendMessage(`🔍 Searching for: ${query}...`, event.threadID, event.messageID);

    try {
        // 🔹 Step 1: YouTube पर गाना सर्च करो
        const searchResults = await ytsr(query, { limit: 1 });
        if (searchResults.items.length === 0) {
            return api.sendMessage("❌ No results found!", event.threadID, event.messageID);
        }

        const video = searchResults.items[0];
        const videoUrl = video.url;
        const title = video.title.replace(/[^a-zA-Z0-9]/g, "_"); // Invalid characters remove

        api.sendMessage(`⬇ Downloading: ${title}`, event.threadID, event.messageID);

        // 🔹 Step 2: MP3 डाउनलोड करो (yt-dlp से)
        const filePath = `./temp/${title}.mp3`;
        const command = `yt-dlp -x --audio-format mp3 -o "${filePath}" "${videoUrl}"`;

        exec(command, async (error, stdout, stderr) => {
            if (error) {
                console.error("❌ Download Error:", error);
                return api.sendMessage("❌ Failed to download MP3.", event.threadID, event.messageID);
            }

            // 🔹 Step 3: File को Messenger पर भेजो
            api.sendMessage({
                body: `🎵 Here is your song: ${title}`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => {
                fs.unlinkSync(filePath); // ✅ File डिलीट करो बाद में
            }, event.messageID);
        });

    } catch (error) {
        console.error("❌ Error:", error);
        return api.sendMessage("⚠ An error occurred while processing your request.", event.threadID, event.messageID);
    }
};
