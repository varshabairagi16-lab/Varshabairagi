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

// ✅ YouTube URL check function
function isYouTubeURL(url) {
  return url.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/);
}

module.exports = {
  config: {
    name: "music",
    version: "1.5.0",
    hasPermssion: 0,
    credits: "Mirrykal",
    description: "Download YouTube song with thumbnail (Sent Separately)",
    commandCategory: "Media",
    usages: "[songName or YouTube Link]",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    if (args.length === 0) {
      return api.sendMessage("Awww! Pehle mujhe gaane ka naam toh do naaa~ 😗🎶", event.threadID);
    }

    let videoUrl, thumbnailUrl;
    let songName = args.join(" ");

    // ✅ **अगर यूजर ने Direct YouTube URL दिया है तो उसको सीधे Process करो**
    let processingMessage = await api.sendMessage(
      `Haye, ruko naa~ 😚 Gaana dhund rahi hoon.. 🎧💖`,
      event.threadID
    );

    if (isYouTubeURL(songName)) {
      videoUrl = songName;
      const videoId = songName.split("v=")[1]?.split("&")[0];
      thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; // ✅ High-quality thumbnail
    } else {
      try {
        // 🔎 **YouTube पर Search**
        const searchResults = await ytSearch(songName);
        if (!searchResults || !searchResults.videos.length) {
          throw new Error("Ufff! Yeh gaana kahaan chhupa hai? Mujhe nahi mil raha 😭💔");
        }

        // 🎵 **टॉप Result का URL aur Thumbnail**
        const topResult = searchResults.videos[0];
        videoUrl = `https://www.youtube.com/watch?v=${topResult.videoId}`;
        thumbnailUrl = topResult.thumbnail;

        // 🔄 **Update the "Please wait" message with song title**
        api.editMessage(
          `Eeee! Mil gaya~ 😍 Gaana hai: *${topResult.title}* 💃 \nAbhi lekar aati hoon, bas ek sec! 🎀`,
          processingMessage.messageID,
          event.threadID
        );
      } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        return api.sendMessage(`Ufff! Kuch toh gadbad hai! 😫 Error: ${error.message} 💔`, event.threadID, event.messageID);
      }
    }

    // 📥 **Thumbnail Download**
    const thumbnailPath = path.join(__dirname, "cache", `thumb_${Date.now()}.jpg`);
    try {
      const response = await axios({
        url: thumbnailUrl,
        responseType: "stream",
      });

      const writer = fs.createWriteStream(thumbnailPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // 📸 **Thumbnail bhejo alag message me**
      await api.sendMessage(
        {
          attachment: fs.createReadStream(thumbnailPath),
          body: `✨ Lo na, pehle thumbnail dekh lo! 👀💖`,
        },
        event.threadID
      );

      // 🗑 **Delete Thumbnail After 5 Seconds**
      deleteAfterTimeout(thumbnailPath, 5000);
    } catch (error) {
      console.error(`❌ Thumbnail download error: ${error.message}`);
      return api.sendMessage("Arrey yaar! Thumbnail nahi mil raha 😭", event.threadID);
    }

    // 🖥 **API Call to Your YouTube Downloader**
    const apiUrl = `https://mirrykal.onrender.com/download?url=${encodeURIComponent(videoUrl)}`;
    try {
      const downloadResponse = await axios.get(apiUrl);
      if (!downloadResponse.data.file_url) {
        throw new Error("Ughh! Download ka link nahi mila! 😩");
      }

      const downloadUrl = downloadResponse.data.file_url.replace("http:", "https:"); // 🛠 Fix http → https

      // 📂 **Set Download Path**
      const downloadDir = path.join(__dirname, "cache");
      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
      }

      const safeTitle = `song_${Date.now()}.mp3`;
      const downloadPath = path.join(downloadDir, safeTitle);

      // ⬇️ **Download File**
      const file = fs.createWriteStream(downloadPath);
      await new Promise((resolve, reject) => {
        https.get(downloadUrl, (response) => {
          if (response.statusCode === 200) {
            response.pipe(file);
            file.on("finish", () => {
              file.close(resolve);
            });
          } else {
            reject(new Error(`Huh! Download nahi ho raha, status code: ${response.statusCode} 😭`));
          }
        }).on("error", (error) => {
          fs.unlinkSync(downloadPath);
          reject(new Error(`Haye re! Error aa gaya: ${error.message} 😵`));
        });
      });

      api.setMessageReaction("💖", event.messageID, () => {}, true);

      // 🎧 **Send the MP3 File**
      await api.sendMessage(
        {
          attachment: fs.createReadStream(downloadPath),
          body: `🎶 Ye lo gaana! **Mast suno aur mujhe yaad karo!** 😘💖`,
        },
        event.threadID
      );

      // 🗑 **Auto Delete File After 5 Seconds**
      deleteAfterTimeout(downloadPath, 5000);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      api.sendMessage(`Huhuhu~! 😢 Phir se try kar! Error: ${error.message} 💔`, event.threadID, event.messageID);
    }
  },
};
