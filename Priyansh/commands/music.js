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
          console.error(`❌ Error deleting file: ${filePath}`);
        }
      });
    }
  }, timeout);
}

module.exports = {
  config: {
    name: "music",
    version: "1.0.5",
    hasPermssion: 0,
    credits: "Mirrykal",
    description: "Download YouTube song from keyword search",
    commandCategory: "Media",
    usages: "[songName]",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    if (args.length === 0) {
      return api.sendMessage("⚠️ Arrey babu, koi gaane ka naam toh do na! 😤🎵", event.threadID);
    }

    const songName = args.join(" ");
    const processingMessage = await api.sendMessage(
      `🔍 *Ruko zara... ${songName} dhundhne ja rahi hoon!* 🧐🎶`,
      event.threadID,
      null,
      event.messageID
    );

    try {
      // 🔎 **YouTube Search**
      const searchResults = await ytSearch(songName);
      if (!searchResults || !searchResults.videos.length) {
        throw new Error("Arey re... kuch nahi mila is naam se! 🤦‍♀️");
      }

      // 🎵 **Get Top Result URL**
      const topResult = searchResults.videos[0];
      const videoUrl = `https://www.youtube.com/watch?v=${topResult.videoId}`;

      // 🎧 **Send title first**
      await api.sendMessage(
        `🎶 *Lo ji, mil gaya!* \n**${topResult.title}**\nAbhi bhej rahi hoon, ruk jaa na! 😘`,
        event.threadID,
        event.messageID
      );

      // 🖥 **API Call**
      const apiUrl = `https://mirrykal.onrender.com/download?url=${encodeURIComponent(videoUrl)}`;
      const downloadResponse = await axios.get(apiUrl);

      if (!downloadResponse.data.file_url) {
        throw new Error("Arey yaar... kuch gadbad ho gaya! 😭");
      }

      const downloadUrl = downloadResponse.data.file_url.replace("http:", "https:");

      // 📂 **Download File**
      const downloadDir = path.join(__dirname, "cache");
      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
      }

      const safeTitle = topResult.title.replace(/[^a-zA-Z0-9]/g, "_");
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
            reject(new Error(`Arrey! Download fail ho gaya. Code: ${response.statusCode}`));
          }
        }).on("error", (error) => {
          fs.unlinkSync(downloadPath);
          reject(new Error(`Network ka masla hai kya? 😭 Error: ${error.message}`));
        });
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      // 🎧 **Send the MP3 File**
      await api.sendMessage(
        {
          attachment: fs.createReadStream(downloadPath),
          body: `🎵 *Le lo babu!* 💖\n**${topResult.title}**\nEnjoyyyy~! 😘🎶`,
        },
        event.threadID,
        event.messageID
      );

      // 🗑 **Auto Delete File After 5 Seconds**
      deleteAfterTimeout(downloadPath, 5000);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      api.sendMessage(`❌ Oh no! Error: ${error.message}`, event.threadID, event.messageID);
    }
  },
};
