module.exports.config = {
    name: "botinfo",
    version: "1.0.2", 
    hasPermssion: 0,
    credits: "Arun Kumar", // Please don't change the credits
    description: "Displays bot information.",
    commandCategory: "system",
    cooldowns: 1
};

module.exports.run = async function({ api, event }) {
    const time = process.uptime(),
        hours = Math.floor(time / (60 * 60)),
        minutes = Math.floor((time % (60 * 60)) / 60),
        seconds = Math.floor(time % 60);
    const moment = require("moment-timezone");
    const currentTime = moment.tz("Asia/Kolkata").format("『D/MM/YYYY』 【HH:mm:ss】");

    const botInfo = `=== 𝙍𝘼𝙅 𝙓𝙒𝘿 '𝙎 𝘽𝙊𝙏 ===\n\n`
        + `☄️ 𝘽𝙊𝙏 𝙉𝘼𝙈𝙀 ☄️ »» ${global.config.BOTNAME}\n`
        + `🌸 𝙋𝙍𝙀𝙁𝙄𝙓 🌸 »» ${global.config.PREFIX} ««\n\n`
        + `🥳 𝙐𝙋𝙏𝙄𝙈𝙀 🥳\n`
        + `📅 𝘿𝘼𝙏𝙀 & 𝙏𝙄𝙈𝙀: ${currentTime}\n`
        + `⚡ 𝘽𝙊𝙏 𝙄𝙎 𝙍𝙐𝙉𝙉𝙄𝙉𝙂 ⚡\n`
        + `🕛 ${hours}h ${minutes}m ${seconds}s 🕧`;

    return api.sendMessage(botInfo, event.threadID, event.messageID);
};
