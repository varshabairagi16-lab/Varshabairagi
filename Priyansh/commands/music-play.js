const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");
const https = require("https");

function deleteAfterTimeout(filePath, timeout = 5000) {
  setTimeout(() => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (!err) {
          console.log(`✅ Deleted file: ${filePath}`);
        } else {
          console.error(`❌ Error deleting file: ${err.message}`);
        }
      });
    }
  }, timeout);
}

module.exports = {
  config: {
    name: "play",
    version: "3.1.0",
    hasPermssion: 0,
    credits: "Mirrykal",
    description: "Choose YouTube song by number",
    commandCategory: "Media",
    usages: "[songName]",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    if (args.length === 0) {
      return api.sendMessage("⚠️ Gaane ka naam to likho na! 😒", event.threadID);
    }

    const songName = args.join(" ");

    const processingMessage = await api.sendMessage(
      `🔍 "${songName}" dhoondh rahi hoon... Ruko zara! 😏`,
      event.threadID,
      null,
      event.messageID
    );

    try {
      const searchResults = await ytSearch(songName);
      if (!searchResults || searchResults.videos.length < 1) {
        throw new Error("Kuch nahi mila! Gaane ka naam sahi likho. 😑");
      }

      const topResults = searchResults.videos.slice(0, 7);
      let searchReply = `📌 **Choose a song number (1-7):**\n\n`;

      topResults.forEach((video, index) => {
        searchReply += `${index + 1}. ${video.title} (${video.timestamp})\n`;
      });

      searchReply += `\n🔢 **Reply with a number (1-7) to select a song!**`;

      api.sendMessage(searchReply, event.threadID, (error, info) => {
        global.client.handleReply.push({
          type: "music-selection",
          name: "music",
          author: event.senderID,
          messageID: info.messageID,
          results: topResults,
        });
      });
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      api.sendMessage(`❌ Error: ${error.message} 😢`, event.threadID, event.messageID);
    }
  },

  handleReply: async function ({ api, event, handleReply }) {
    if (handleReply.type !== "music-selection") return;
    if (event.senderID !== handleReply.author) return;

    const choice = parseInt(event.body);
    if (isNaN(choice) || choice < 1 || choice > 7) {
      return api.sendMessage("❌ **Invalid choice!** Choose between **1-7**.", event.threadID);
    }

    const selectedVideo = handleReply.results[choice - 1];
    const videoUrl = `https://www.youtube.com/watch?v=${selectedVideo.videoId}`;
    const apiUrl = `https://mirrykal.onrender.com/download?url=${encodeURIComponent(videoUrl)}&type=audio`;

    // **Delete the song selection message**
    api.unsendMessage(handleReply.messageID);

    // **Send Title + Processing Message**
    api.sendMessage(
      `🎵 **Title:** ${selectedVideo.title}\n⏳ **Processing...**`,
      event.threadID
    );

    try {
      const downloadResponse = await axios.get(apiUrl);
      if (!downloadResponse.data.file_url) {
        throw new Error("Download fail ho gaya. 😭");
      }

      const downloadUrl = downloadResponse.data.file_url.replace("http:", "https:");
      const downloadDir = path.join(__dirname, "cache");
      if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true });

      const safeTitle = selectedVideo.title.replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `${safeTitle}.mp3`;
      const downloadPath = path.join(downloadDir, filename);

      const file = fs.createWriteStream(downloadPath);
      await new Promise((resolve, reject) => {
        https.get(downloadUrl, (response) => {
          if (response.statusCode === 200) {
            response.pipe(file);
            file.on("finish", () => {
              file.close(resolve);
            });
          } else {
            reject(new Error(`Download fail ho gaya. Status: ${response.statusCode}`));
          }
        }).on("error", (error) => {
          fs.unlinkSync(downloadPath);
          reject(new Error(`Error downloading file: ${error.message}`));
        });
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      await api.sendMessage(
        {
          attachment: fs.createReadStream(downloadPath),
          body: `🎶 **Title:** ${selectedVideo.title}\nLijiye! Aapka pasandida gaana! 😍`,
        },
        event.threadID
      );

      deleteAfterTimeout(downloadPath, 5000);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      api.sendMessage(`❌ Error: ${error.message} 😢`, event.threadID);
    }
  },
};
