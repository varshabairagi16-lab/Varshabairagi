const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "coupledp",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Raj xd",
  description: "Fetch couple dp images from Google search",
  commandCategory: "fun",
  usages: "+coupledp your+query - number",
  cooldowns: 3
};

module.exports.run = async ({ api, event, args }) => {
  const q = args.join(" ");
  if (!q.includes("-")) return api.sendMessage("📌 Usage: +coupledp your query - number", event.threadID);

  const query = q.substring(0, q.indexOf("-")).trim();
  const count = parseInt(q.split("-").pop().trim()) || 1;

  const url = `https://rudra-pintrest-server.onrender.com/dp?q=${encodeURIComponent(query)}&n=${count}`;
  try {
    const res = await axios.get(url);
    const images = res.data.data;

    let imgData = [];
    for (let i = 0; i < images.length; i++) {
      const imgPath = path.join(__dirname, "cache", `dp${i}.jpg`);
      const imgBuffer = (await axios.get(images[i], { responseType: "arraybuffer" })).data;
      fs.writeFileSync(imgPath, imgBuffer);
      imgData.push(fs.createReadStream(imgPath));
    }

    api.sendMessage({
      body: `📷 Here's your *${count}* Couple DP:\n🔍 ${query}`,
      attachment: imgData
    }, event.threadID, event.messageID);

    // Clean cache
    for (let i = 0; i < images.length; i++) {
      const imgPath = path.join(__dirname, "cache", `dp${i}.jpg`);
      fs.unlinkSync(imgPath);
    }

  } catch (err) {
    console.log(err.message);
    api.sendMessage("❌ Failed to fetch couple DP. Try again.", event.threadID, event.messageID);
  }
};
