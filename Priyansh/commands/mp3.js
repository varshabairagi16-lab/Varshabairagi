const ytSearch = require("yt-search");
const ytdl = require("@distube/ytdl-core");
const axios = require("axios");
const fs = require("fs-extra");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

module.exports.config = {
  name: "mp3",
  usePrefix: false,
  version: "1.0",
  credits: "Modified by Mirrykal",
  cooldowns: 5,
  hasPermission: 0,
  description: "Download and play MP3 from YouTube",
  commandCategory: "music",
  usages: "music [song name]"
};

module.exports.run = async function ({ api, event, args }) {
  if (!args.length) {
    return api.sendMessage("Please provide a song name!", event.threadID, event.messageID);
  }

  const query = args.join(" ");
  api.sendMessage(`Searching for: ${query}`, event.threadID);

  try {
    // YouTube पर सॉन्ग सर्च करो
    const searchResults = await ytSearch(query);
    if (!searchResults.videos.length) {
      return api.sendMessage("No results found.", event.threadID, event.messageID);
    }

    const video = searchResults.videos[0]; // पहला रिजल्ट लो
    const videoUrl = video.url;
    const videoTitle = video.title;
    const filePath = path.join(__dirname, `${videoTitle}.mp3`);

    api.sendMessage(`Downloading: ${videoTitle}`, event.threadID);

    // YouTube से ऑडियो डाउनलोड करो
    const stream = ytdl(videoUrl, { quality: "highestaudio" });
    const writeStream = fs.createWriteStream(filePath);

    ffmpeg(stream)
      .audioBitrate(128)
      .save(filePath)
      .on("end", async () => {
        api.sendMessage(
          {
            body: `Here is your song: ${videoTitle}`,
            attachment: fs.createReadStream(filePath),
          },
          event.threadID,
          () => fs.unlinkSync(filePath), // फाइल डिलीट करो
          event.messageID
        );
      });
  } catch (error) {
    console.error(error);
    return api.sendMessage("An error occurred while processing your request.", event.threadID, event.messageID);
  }
};
