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
      return api.sendMessage("😡 Gaana toh batao pehle, mujhe bhav khaane ka shauk nahi!", event.threadID);
    }

    const songName = args.join(" ");
    await api.sendMessage(`🔍 "${songName}" dhundh rahi hoon, thoda ruk ja!`, event.threadID);

    try {
      // 🔎 **YouTube Search**
      const searchResults = await ytSearch(songName);
      if (!searchResults || !searchResults.videos.length) {
        throw new Error("😢 Koi gaana nahi mila! Thoda sahi likho.");
      }

      // 🎵 **Get Top Result**
      const topResult = searchResults.videos[0];
      const videoUrl = `https://www.youtube.com/watch?v=${topResult.videoId}`;
      console.log("🎶 Video Found:", videoUrl);

      // 🖥 **API Call to Your YouTube Downloader**
      const apiUrl = `https://mirrykal.onrender.com/download?url=${encodeURIComponent(videoUrl)}`;
      console.log("🔗 Calling API:", apiUrl);
      const downloadResponse = await axios.get(apiUrl);

      if (!downloadResponse.data.file_url) {
        throw new Error("⚠️ API ne koi file nahi di! Kahin gadbad hai.");
      }

      const downloadUrl = downloadResponse.data.file_url.replace("http:", "https:");
      console.log("📥 Download URL:", downloadUrl);

      // 📂 **Set Download Path**
      const downloadDir = path.join(__dirname, "cache");
      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
      }

      const safeTitle = topResult.title.replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `${safeTitle}.mp3`;
      const downloadPath = path.join(downloadDir, filename);

      // ⬇️ **Download File**
      console.log("📂 Downloading to:", downloadPath);
      const file = fs.createWriteStream(downloadPath);

      await new Promise((resolve, reject) => {
        https.get(downloadUrl, (response) => {
          if (response.statusCode === 200) {
            response.pipe(file);
            file.on("finish", () => {
              file.close(() => {
                console.log("✅ Download Complete:", filename);
                resolve();
              });
            });
          } else {
            reject(new Error(`❌ Failed to download file. Status code: ${response.statusCode}`));
          }
        }).on("error", (error) => {
          reject(new Error(`❌ Error downloading file: ${error.message}`));
        });
      });

      // 🎧 **Send the MP3 File**
      api.sendMessage(
        {
          attachment: fs.createReadStream(downloadPath),
          body: `🎶 Ye lo, "${topResult.title}" ka full enjoy lo! 😌`,
        },
        event.threadID,
        (err) => {
          if (err) {
            console.error("❌ Send Message Error:", err);
            api.sendMessage("😩 Gaana bhejne me dikkat aa rahi hai!", event.threadID);
          } else {
            console.log("✅ Gaana bhej diya!");
          }
        }
      );

      // 🗑 **Auto Delete File After 5 Seconds**
      deleteAfterTimeout(downloadPath, 5000);

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      api.sendMessage(`😞 Oops! Error: ${error.message}`, event.threadID);
    }
  },
};
