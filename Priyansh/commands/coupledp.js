const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const crypto = require("crypto");

module.exports.config = {
  name: "coupledp",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Rudra",
  description: "Fetch couple dp images from Pinterest API server",
  commandCategory: "fun",
  usages: "+coupledp your query - number",
  cooldowns: 3
};

// 🔒 CREDIT LOCK: Don't remove these lines!
(() => {
  const code = fs.readFileSync(__filename, "utf8");
  if (!code.includes('credits: "Rudra"') || !code.includes("Powered by Rudra")) {
    console.error("❌ Credit ya powered by Rudra chhed diya gaya hai. Code bandh.");
    process.exit(1); // End script immediately
  }
})();

module.exports.run = async ({ api, event, args }) => {
  try {
    const q = args.join(" ");
    if (!q.includes("-")) {
      return api.sendMessage("⚠️ Usage: +coupledp your query - number\nExample: +coupledp mohit riya - 2", event.threadID);
    }

    const query = q.substring(0, q.indexOf("-")).trim();
    const count = parseInt(q.split("-").pop().trim()) || 1;

    const cachePath = path.join(__dirname, "cache");
    if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);

    const url = `https://rudra-pintrest-server.onrender.com/dp?q=${encodeURIComponent(query)}&n=${count}`;
    const res = await axios.get(url);

    if (!res.data || res.data.status !== "success" || !res.data.data.length) {
      return api.sendMessage("❌ Couldn't fetch DPs. Try another keyword.", event.threadID);
    }

    const images = res.data.data;
    const attachments = [];

    for (let i = 0; i < images.length; i++) {
      const imgPath = path.join(cachePath, `dp${i}.jpg`);
      const imgBuffer = (await axios.get(images[i], { responseType: "arraybuffer" })).data;
      fs.writeFileSync(imgPath, imgBuffer);
      attachments.push(fs.createReadStream(imgPath));
    }

    api.sendMessage({
      body: `📸 Here's your *${count}* Couple DP (${query})\n🖤 Powered by Rudra x raj xd `,
      attachment: attachments
    }, event.threadID, () => {
      for (let i = 0; i < images.length; i++) {
        const imgPath = path.join(cachePath, `dp${i}.jpg`);
        fs.unlinkSync(imgPath);
      }
    }, event.messageID);

  } catch (err) {
    console.error("[CoupleDP ERROR]", err.message);
    api.sendMessage("🚫 Something went wrong while fetching Couple DPs. Try again later.", event.threadID, event.messageID);
  }
};
