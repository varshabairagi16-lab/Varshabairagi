const fetch = require("node-fetch");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const https = require("https");

module.exports = {
  config: {
    name: "play",
    version: "1.0.6",
    hasPermssion: 0,
    credits: "Mirrykal",
    description: "Download YouTube song from keyword search and link",
    commandCategory: "Media",
    usages: "[songName]",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    let songName = args.join(" ");

    const processingMessage = await api.sendMessage(
      "✅ Thodi der Sabar karna, time lgega 🥺...",
      event.threadID,
      null,
      event.messageID
    );

    try {
      // API से song details fetch करना
      const apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?query=${encodeURIComponent(songName)}`;
      api.setMessageReaction("⌛", event.messageID, () => {}, true);

      const { data } = await axios.get(apiUrl);
      if (!data.success) throw new Error("Failed to fetch song details.");

      const { title, image, downloadUrl } = data.result;

      // ✅ Image Download करना
      const imagePath = path.join(__dirname, "cache", `${title.replace(/[^a-zA-Z0-9]/g, "_")}.jpg`);
      const response = await axios({ url: image, responseType: "stream" });
      response.data.pipe(fs.createWriteStream(imagePath));

      await new Promise((resolve) => response.data.on("end", resolve));

      // ✅ Image के साथ Title और Link भेजना
      await api.sendMessage(
        {
          attachment: fs.createReadStream(imagePath),
          body: `🎵 *Title:* ${title}\n🔗 *Download Link:* ${downloadUrl}`,
        },
        event.threadID,
        () => fs.unlinkSync(imagePath),
        event.messageID
      );

      // ✅ Song Download करना
      const songPath = path.join(__dirname, "cache", `${title.replace(/[^a-zA-Z0-9]/g, "_")}.mp3`);
      const file = fs.createWriteStream(songPath);

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
          fs.unlinkSync(songPath);
          reject(new Error(`Error downloading file: ${error.message}`));
        });
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      // ✅ अब केवल song भेजना (कोई extra text नहीं)
      await api.sendMessage(
        {
          attachment: fs.createReadStream(songPath),
        },
        event.threadID,
        () => {
          fs.unlinkSync(songPath);
          api.unsendMessage(processingMessage.messageID);
        },
        event.messageID
      );
    } catch (error) {
      console.error(`Failed to download and send song: ${error.message}`);
      api.sendMessage(
        `❌ *Failed to download song:*\n${error.message}`,
        event.threadID,
        event.messageID
      );
    }
  },
};
