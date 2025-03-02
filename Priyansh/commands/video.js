const fs = require("fs");
const path = require("path");
const axios = require("axios");
const yts = require("yt-search");

module.exports.config = {
  name: "video2",
  hasPermission: 0,
  version: "1.0.0",
  description: "Download YouTube videos (under 25MB) or provide link",
  credits: "Raj",
  cooldowns: 10,
  commandCategory: "Utility"
};

module.exports.run = async function ({ api, event, args }) {
  if (!args[0]) {
    return api.sendMessage(`❌ | jis song ki video dekhni ho uska name likho..!`, event.threadID);
  }

  try {
    const query = args.join(" ");
    const findingMessage = await api.sendMessage(`🔍 | "${query}" Song dhondh Kar send karti hun...`, event.threadID);

    const searchResults = await yts(query);
    const firstResult = searchResults.videos[0];

    if (!firstResult) {
      await api.sendMessage(`❌ | "${query}" No results found for .`, event.threadID);
      return;
    }

    const { title, url } = firstResult;
    await api.editMessage(`⏳ | "${title}" Download ka link mil raha hai...`, findingMessage.messageID);

    const apiUrl = `https://mr-prince-malhotra-ytdl.vercel.app/video?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);
    const responseData = response.data;

    if (!responseData.result || !responseData.result.url) {
      await api.sendMessage(`❌ | "${title}" download ke liye koi link nhi mile`, event.threadID);
      return;
    }

    const downloadUrl = responseData.result.url;
    const filePath = path.resolve(__dirname, "cache", `${Date.now()}-${title}.mp4`);

    const videoResponse = await axios.get(downloadUrl, {
      responseType: "stream",
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const fileStream = fs.createWriteStream(filePath);
    videoResponse.data.pipe(fileStream);

    fileStream.on("finish", async () => {
      const stats = fs.statSync(filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);

      if (fileSizeInMB > 25) {
        await api.sendMessage(`❌ | "${title}" Ka size ${fileSizeInMB.toFixed(2)}MB Hai, Jo 25 MB C Zada Hai ।📥 download link: ${downloadUrl}`, event.threadID);
        fs.unlinkSync(filePath);
        return;
      }

      await api.sendMessage({
        body: `🎥 | Apki video ko"${title}" download karliya gaya hai!💞`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID);

      fs.unlinkSync(filePath);
      api.unsendMessage(findingMessage.messageID);
    });

    videoResponse.data.on("error", async (error) => {
      console.error(error);
      await api.sendMessage(`❌ | video download karne me ak masla aya tha: ${error.message}`, event.threadID);
      fs.unlinkSync(filePath);
    });

  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    await api.sendMessage(`❌ | Mujhe video download karne me kuch issues arahe hai: ${error.response ? error.response.data : error.message}`, event.threadID);
  }
};
