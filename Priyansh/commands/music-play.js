const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports.config = {
    name: "play",
    version: "1.0.3",
    hasPermssion: 0,
    credits: "Mirrykal",
    description: "Play music from YouTube search",
    commandCategory: "music",
    usages: "[songName]",
    cooldowns: 0
};

const cacheDir = path.join(__dirname, "cache");
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

// Auto-delete function
function deleteAfterTimeout(filePath, timeout = 5000) {
    setTimeout(() => {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (!err) {
                    console.log(`✅ Deleted: ${filePath}`);
                } else {
                    console.error(`❌ Error deleting file: ${err.message}`);
                }
            });
        }
    }, timeout);
}

// Store search results
global.songSearchCache = {};

module.exports.run = async function ({ api, event, args }) {
    const userId = event.senderID;
    const userInput = args.join(" ");

    // Check if user input is a number (1-7) after a search
    if (global.songSearchCache[userId] && /^[1-7]$/.test(userInput)) {
        const selectedVideo = global.songSearchCache[userId][parseInt(userInput) - 1];
        delete global.songSearchCache[userId]; // Remove stored results

        if (!selectedVideo) {
            return api.sendMessage("❌ Invalid choice! Please search again.", event.threadID);
        }

        const videoUrl = `https://www.youtube.com/watch?v=${selectedVideo.videoId}`;
        const apiUrl = `https://mirrykal.onrender.com/download?url=${encodeURIComponent(videoUrl)}&type=audio`;

        const processingMessage = await api.sendMessage(`🎵 Downloading **${selectedVideo.title}**...`, event.threadID, event.messageID);

        try {
            const downloadResponse = await axios.get(apiUrl);
            if (!downloadResponse.data.file_url) {
                throw new Error("Download failed! 😭");
            }

            const downloadUrl = downloadResponse.data.file_url.replace("http:", "https:");
            const downloadPath = path.join(cacheDir, `${selectedVideo.videoId}.mp3`);

            // Download music
            const file = fs.createWriteStream(downloadPath);
            await new Promise((resolve, reject) => {
                axios({
                    method: "get",
                    url: downloadUrl,
                    responseType: "stream"
                }).then(response => {
                    response.data.pipe(file);
                    file.on("finish", () => {
                        file.close(resolve);
                    });
                }).catch(error => {
                    fs.unlinkSync(downloadPath);
                    reject(new Error(`Download error: ${error.message}`));
                });
            });

            api.unsendMessage(processingMessage.messageID);
            api.sendMessage({
                body: `🎶 **Title:** ${selectedVideo.title}\n🎤 **Author:** ${selectedVideo.channelTitle}\n📺 **Views:** ${selectedVideo.viewCount}\n🕒 **Duration:** ${selectedVideo.duration}\n\nLijiye! Aapka gaana tayar hai! 🎵`,
                attachment: fs.createReadStream(downloadPath)
            }, event.threadID, () => deleteAfterTimeout(downloadPath, 5000), event.messageID);
        } catch (error) {
            console.error(`❌ Error: ${error.message}`);
            api.sendMessage(`❌ Error: ${error.message} 😢`, event.threadID);
        }

        return;
    }

    // If not a number, proceed with search
    if (!args.length) {
        return api.sendMessage("⚠️ Gaane ka naam likho! 😒", event.threadID);
    }

    const searchUrl = `https://mirrykal.onrender.com/search?query=${encodeURIComponent(userInput)}`;

    const processingMessage = await api.sendMessage(`🔍 "${userInput}" dhoondh rahi hoon... Ruko zara! 😏`, event.threadID, event.messageID);

    try {
        const searchResults = await axios.get(searchUrl);
        if (!searchResults.data || searchResults.data.length < 1) {
            throw new Error("Kuch nahi mila! 😑");
        }

        const topResults = searchResults.data.slice(0, 7);
        global.songSearchCache[userId] = topResults; // Store search results for the user

        let searchReply = `📌 **Choose a song number (1-7):**\n\n`;
        let attachments = [];

        for (let i = 0; i < topResults.length; i++) {
            const video = topResults[i];
            searchReply += `${i + 1}. ${video.title} (${video.duration})\n`;

            // Download thumbnails
            const thumbnailPath = path.join(cacheDir, `${video.videoId}.jpg`);
            const thumbnail = fs.createWriteStream(thumbnailPath);
            await axios({
                method: "get",
                url: video.thumbnail,
                responseType: "stream"
            }).then(response => {
                response.data.pipe(thumbnail);
                attachments.push(fs.createReadStream(thumbnailPath));
                deleteAfterTimeout(thumbnailPath, 5000);
            }).catch(() => console.error(`❌ Thumbnail download failed for: ${video.videoId}`));
        }

        api.sendMessage({
            body: searchReply + `\n🔢 **Reply with a number (1-7) to select a song!**`,
            attachment: attachments
        }, event.threadID);

        api.unsendMessage(processingMessage.messageID);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        api.sendMessage(`❌ Error: ${error.message} 😢`, event.threadID);
    }
};
