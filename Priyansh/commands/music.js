const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");
const https = require("https");

module.exports = {
  config: {
    name: "music",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "Mirrykal",
    description: "Download YouTube song from search",
    commandCategory: "Media",
    usages: "[songName]",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    if (args.length === 0) {
      return api.sendMessage("⚠️ Please provide a song name to search.", event.threadID);
    }

    const songName = args.join(" ");
    const processingMessage = await api.sendMessage(
      `🔍 Searching for "${songName}"...`,
      event.threadID,
      null,
      event.messageID
    );

    try {
      // Search for the song on YouTube
      const searchResults = await ytSearch(songName);
      if (!searchResults || !searchResults.videos.length) {
        throw new Error("No results found for your search query.");
      }

      // Get the top result from the search
      const topResult = searchResults.videos[0];
      const videoUrl = `https://www.youtube.com/watch?v=${topResult.videoId}`;

      api.setMessageReaction("⌛", event.messageID, () => {}, true);

      // Call your API to process the video
      const apiUrl = `https://mirrykal.onrender.com/download?url=${encodeURIComponent(videoUrl)}`;
      const response = await axios.get(apiUrl);

      if (!response.data.file_url) {
        throw new Error("Failed to process video. API did not return a file URL.");
      }

      const downloadUrl = response.data.file_url;
      const safeTitle = topResult.title.replace(/[^a-zA-Z0-9 \-_]/g, ""); // Clean the title
      const filename = `${safeTitle}.mp3`;
      const downloadDir = path.join(__dirname, "cache");
      const downloadPath = path.join(downloadDir, filename);

      // Ensure the cache directory exists
      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
      }

      // Download the file
      const file = fs.createWriteStream(downloadPath);
      await new Promise((resolve, reject) => {
        https.get(downloadUrl, (response) => {
          if (response.statusCode === 200) {
            response.pipe(file);
            file.on("finish", () => {
              file.close(resolve);
            });
          } else {
            reject(new Error(`Failed to download file. Status code: ${response.statusCode}`));
          }
        }).on("error", (error) => {
          fs.unlinkSync(downloadPath);
          reject(new Error(`Error downloading file: ${error.message}`));
        });
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      // Send the file
      await api.sendMessage(
        {
          attachment: fs.createReadStream(downloadPath),
          body: `🎶 Title: ${topResult.title}\n\nHere is your audio file 🎧:`,
        },
        event.threadID,
        () => {
          fs.unlinkSync(downloadPath); // Cleanup
          api.unsendMessage(processingMessage.messageID);
        },
        event.messageID
      );
    } catch (error) {
      console.error(`Error: ${error.message}`);
      api.sendMessage(`❌ Error: ${error.message}`, event.threadID, event.messageID);
    }
  },
};
