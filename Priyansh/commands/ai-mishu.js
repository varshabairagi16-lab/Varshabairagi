const axios = require("axios");

const config = {
  name: "janu",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Arun ツ",
  description: "[ 𝗠𝗶𝘀𝗵𝗮 𝗔𝙞 ]",
  commandCategory: "no prefix",
  usages: "𝘼𝙨𝙠 𝘼 𝙌𝙪𝙚𝙨𝙩𝙞𝙤𝙣 𝙁𝙧𝙤𝙢 𝗠𝗶𝘀𝗵𝗮 𝘼𝙄",
  cooldowns: 0
};

const handleEvent = async function ({ api, event, client, __GLOBAL }) {

  if (event.body.indexOf("janu") === 0 || event.body.indexOf("JANU") === 0 || event.body.indexOf("mish") === 0 || event.body.indexOf("Janu") === 0) {
    const { threadID, messageID } = event;
    const input = event.body;
    const message = input.split(" ");

    if (message.length < 2) {
      api.sendMessage("✨  Type✍🏻 janu aur Apna question pucho", threadID);
    } else {
      try {
        api.sendMessage("🫶🏻...", threadID);

        const text = message.slice(1).join(" "); // Join the remaining parts of the message
        const bakwas = encodeURIComponent(text);

        const ris = await axios.get(`https://priyansh-ai.onrender.com/api/blackboxai?query=${bakwas}`);
        const resultai = ris.data.priyansh;

        api.sendMessage(`${resultai}\n\n\n༺═─────────═༻\n\n༺═─────────═༻`, threadID);
      } catch (err) {
        console.error(err);
        api.sendMessage("❌ 𝙽𝚘 𝚁𝚎𝚜𝚙𝚘𝚗𝚜𝚎 𝚁𝚎𝚌𝚎𝚒𝚟𝚎𝚍 𝚏𝚛𝚘𝚖 𝚝𝚑𝚎 𝚜𝚎𝚛𝚟𝚎𝚛: " + err + " 🥲", threadID);
      }
    }
  }
};

const run = function ({ api, event, client, __GLOBAL }) {
  // The run function is currently empty. You may add functionality here if needed.
};

module.exports = { config, handleEvent, run };
