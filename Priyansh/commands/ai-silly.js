const axios = require("axios");
const express = require("express");
const cors = require("cors");

const config = {
  name: "chatbase",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Mirrykal",
  description: "[Chatbase AI]",
  commandCategory: "no prefix",
  usages: "Ask a Question From Chatbase AI",
  cooldowns: 0
};

const CHATBASE_IFRAME_URL = "https://www.chatbase.co/chatbot-iframe/MILSsaxoDSYQMCAFZDueb";

const handleEvent = async function ({ api, event }) {
  if (event.body.toLowerCase().startsWith("chatbase")) {
    const { threadID } = event;
    const input = event.body;
    const message = input.split(" ");

    if (message.length < 2) {
      api.sendMessage("✨ 𝙷𝚎𝚕𝚕𝚘, Type✍🏻 'Chatbase' aur Apna question pucho", threadID);
    } else {
      try {
        api.sendMessage("⏳ Processing...", threadID);

        const text = message.slice(1).join(" ");
        const encodedText = encodeURIComponent(text);

        // **Chatbase IFrame Scraper (Without API Key)**
        const response = await axios.get(`${CHATBASE_IFRAME_URL}?q=${encodedText}`);

        if (response.data) {
          api.sendMessage(response.data, threadID);
        } else {
          api.sendMessage("❌ Chatbase से कोई जवाब नहीं मिला!", threadID);
        }
      } catch (err) {
        console.error(err);
        api.sendMessage("❌ Chatbase से जवाब लाने में दिक्कत हो रही है!", threadID);
      }
    }
  }
};

const run = function () {};

module.exports = { config, handleEvent, run };
