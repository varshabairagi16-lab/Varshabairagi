const axios = require("axios");

module.exports = {
  config: {
    name: "imgur",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Shankar Suman",
    description: "Upload an image to Imgur and get a direct link",
    commandCategory: "Tools",
    usages: "[Reply to an image]",
    cooldowns: 5,
  },

  run: async function ({ api, event }) {
    try {
      if (
        !event.messageReply ||
        !event.messageReply.attachments ||
        event.messageReply.attachments.length === 0
      ) {
        return api.sendMessage(
          "[⚜️]➜ Please reply to the photo you need to upload.",
          event.threadID,
          event.messageID
        );
      }

      const imageLinks = [];

      // Upload all attached images
      for (let attachment of event.messageReply.attachments) {
        const imageUrl = attachment.url;
        const uploadedLink = await uploadToImgur(imageUrl);
        if (uploadedLink) {
          imageLinks.push(uploadedLink);
        }
      }

      if (imageLinks.length === 0) {
        throw new Error("Failed to upload images.");
      }

      const responseMessage = `[\uD83C\uDF1F] IMGUR UPLOAD SUCCESS ✅\n➝ Uploaded: ${imageLinks.length} images\n➝ Image link(s):\n${imageLinks.join("\n")}`;
      api.sendMessage(responseMessage, event.threadID, event.messageID);
    } catch (error) {
      console.error("Imgur Upload Error:", error.message);
      api.sendMessage(
        `❌ Image upload failed.\n➝ Error: ${error.message}`,
        event.threadID,
        event.messageID
      );
    }
  },
};

// Function to upload an image to Imgur
async function uploadToImgur(imageUrl) {
  try {
    const clientId = "1ef5dda0e315e20"; // Your Imgur Client ID
    const response = await axios.post(
      "https://api.imgur.com/3/upload",
      { image: imageUrl },
      {
        headers: {
          Authorization: `Client-ID ${clientId}`,
        },
      }
    );
    return response.data.data.link;
  } catch (error) {
    console.error("Imgur API Error:", error.message);
    return null;
  }
}
