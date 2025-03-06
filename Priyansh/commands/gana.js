umodule.exports.config = {
  name: "gana",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Modded By Arun",
  description: "RANDOM mp3 song",
  commandCategory: "Random mp3",
  usages: "gana",
  cooldowns: 2,
  dependencies: {
    "request":"",
    "fs-extra":"",
    "axios":""
  }
    
};

module.exports.run = async({api,event,args,Users,Threads,Currencies}) => {
const axios = global.nodemodule["axios"];
const request = global.nodemodule["request"];
const fs = global.nodemodule["fs-extra"];
    var link = [
"https://s5.aconvert.com/convert/p3r68-cdx67/vca1w-4cu6k.mp3"
     ];
     var callback = () => api.sendMessage({body:`💝 𝗛𝗼𝗽𝗲 𝘆𝗼𝘂 𝗟𝗶𝗸𝗲 𝗜𝘁, \n♥️    𝗠𝗮𝗱𝗲 𝗕𝘆 𝗔𝗿𝘂𝗻🫥`,attachment: fs.createReadStream(__dirname + "/cache/1.mp3")}, event.threadID, () => fs.unlinkSync(__dirname + "/cache/1.mp3"));
      return request(encodeURI(link[Math.floor(Math.random() * link.length)])).pipe(fs.createWriteStream(__dirname+"/cache/1.mp3")).on("close",() => callback());
   };
