const axios = require("axios");
const config = { 
  name: "mishu", 
  version: "1.0.0", 
  hasPermission: 0, 
  credits: "𝙉𝘼𝙐𝙂𝙃𝙏𝙔 ツ", 
  description: "[ 𝗠𝗶𝘀𝗵𝗮 𝗔𝙞 ]", 
  commandCategory: "no prefix", 
  usages: "𝘼𝙨𝙠 𝘼 𝙌𝙪𝙚𝙨𝙩𝙞𝙤𝙣 𝙁𝙧𝙤𝙢 𝗠𝗶𝘀𝗵𝗮 𝘼𝙞", 
  cooldowns: 0 
};
const handleEvent = async function ({ api, event, client, __GLOBAL }) {
  if (event.body.indexOf("siri") === 0 || 
      event.body.indexOf("Siri") === 0 || 
      event.body.indexOf("misha") === 0 || 
      event.body.indexOf("Misha") === 0) {
    const { threadID, messageID } = event;
    const input = event.body;
    const message = input.split(" ");
    if (message.length < 2) {
      api.sendMessage("✨ 𝙷𝚎𝚕𝚕𝚘 𝙸 𝙰𝚖 𝙼𝚒𝚜𝚑𝚎 𝙿𝚕𝚎𝚊𝚜𝚎 𝚙𝚛𝚘𝚟𝚒𝚍𝚎 𝙼𝚎 ", event.threadID);
    } else {
      const text = message.slice(1).join(" ");
      try {
api.sendMessage(`𝙼𝚒𝚜𝚑𝚎 𝙰𝚒 𝙸𝚜 𝚆𝚘𝚛k𝚒𝚗𝚐`, event.threadID);
const encodedText = encodeURIComponent(text);
const ris = await axios.get(`https://api.dreaded.site/api/chatgpt?text=${encodedText}`);
const resultai = ris.data.result.prompt;
api.sendMessage(`${resultai}
༺═─────────═༻
𝚃𝚑𝚒𝚜 𝙸𝚜 𝙰𝚗 𝙰𝚒 𝙻𝚒𝚗𝚎 𝙱𝚎𝚛𝚍 𝙲𝚛𝚎𝚎𝚝𝚎𝚍 𝙱𝚢 𝙽𝚎𝚞𝚐𝚑𝚝𝚢 𝙰𝚗𝚍 𝙸𝚝 𝙰𝚕𝚜𝚘 𝚁𝚎𝚎𝚕-𝚝𝚒𝚖𝚎 𝚍𝚎𝚝𝚎 𝙰𝚌𝚎𝚜𝚜 
༺═─────────═༻`, event.threadID);
} catch (err) {
console.error(err);
api.sendMessage("❌ 𝙽𝚘 𝚁𝚎𝚜𝚙𝚘𝚗𝚜𝚎 𝚁𝚎𝚌𝚎𝚒𝚟𝚎𝚍 𝙵𝚛𝚘𝚖 𝚃𝚑𝚎 𝚂𝚎𝚛𝚟𝚎𝚛 " + err + "🥲", event.threadID);
} 
} 
}; 
const run = function ({ api, event, client, __GLOBAL }) { 
}; 
module.exports = { 
  config, handleEvent, run 
};
