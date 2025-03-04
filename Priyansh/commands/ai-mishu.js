```
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
  if (event.body.indexOf("siri") === 0 || event.body.indexOf("Siri") === 0 || event.body.indexOf("misha") === 0 || event.body.indexOf("Misha") === 0) {
    const { threadID, messageID } = event;
    const input = event.body;
    const message = input.split(" ");

    if (message.length < 2) {
      api.sendMessage("✨ 𝙷𝚎𝚕𝚕𝚘 𝙸 𝙰𝚖 𝙼𝚒𝚜𝚑𝚊 𝙿𝚕𝚎𝚊𝚜𝚎 𝚙𝚛𝚘𝚟𝚒𝚍𝚎 𝙼𝚎 ", event.threadID);
    } else {
      try {
        api.sendMessage(`𝙼𝚒𝚜𝚑𝚊 𝙰𝚒 𝙸𝚜 𝚆𝚘𝚛𝚔𝚒𝚗𝚐`, event.threadID);

        const text = message.slice(1).join(" ");
        const encodedText = encodeURIComponent(text);

        const response = await axios.get(`https://api.dreaded.site/api/chatgpt?text=${encodedText}`);
        const data = response.data;

        api.sendMessage(data, event.threadID);
      } catch (error) {
        console.error(error);
      }
    }
  }
};

module.exports = {
  config,
  handleEvent
};
```
