const fetch = require("node-fetch");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");
const https = require("https");

module.exports = {
  config: {
    name: "music",
    version: "1.0.3",
    hasPermssion: 0,
    credits: "Mirrykal",
    description: "Download YouTube song from keyword search and link",
    commandCategory: "Media",
    usages: "[songName]",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    if (!args.length) {
      return api.sendMessage("❌ Please provide a song name.", event.threadID, event.messageID);
    }

    const songName = args.join(" ");

    const processingMessage = await api.sendMessage(
      "✅ Processing your request. Please wait...",
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

      // Use your custom API to get the download link
      const apiUrl = `https://mirrykal.onrender.com/mp3?url=${encodeURIComponent(videoUrl)}`;

      api.setMessageReaction("⌛", event.messageID, () => {}, true);

      // Get the direct download URL from your API
      const downloadResponse = await axios.get(apiUrl);
      const downloadUrl = downloadResponse.data.file_url;

      if (!downloadUrl) {
        throw new Error("Download URL not found in API response.");
      }

      // Set filename based on the song title
      const safeTitle = topResult.title.replace(/[^a-zA-Z0-9 \-_]/g, ""); // Clean the title
      const filename = `${safeTitle}.mp3`;
      const downloadDir = path.join(__dirname, "cache");
      const downloadPath = path.join(downloadDir, filename);

      // Ensure the directory exists
      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
      }

      // Download the file and save locally
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

      // Send the downloaded file to the user
      await api.sendMessage(
        {
          attachment: fs.createReadStream(downloadPath),
          body: `🎵 Title: ${topResult.title}\n\nHere is your audio file 🎧:`,
        },
        event.threadID,
        () => {
          fs.unlinkSync(downloadPath); // Cleanup after sending
          api.unsendMessage(processingMessage.messageID);
        },
        event.messageID
      );
    } catch (error) {
      console.error(`Failed to download and send song: ${error.message}`);
      api.sendMessage(
        `❌ Failed to download song: ${error.message}`,
        event.threadID,
        event.messageID
      );
    }
  },
};
