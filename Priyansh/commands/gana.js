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
"https://m.soundcloud.com/sandhya-g-708206560/dil-ibaadat?ref=clipboard&p=a&c=0&si=072920cc4361481688c07502197d9508&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing"
     ];
     var callback = () => api.sendMessage({body:`💝 𝗛𝗼𝗽𝗲 𝘆𝗼𝘂 𝗟𝗶𝗸𝗲 𝗜𝘁, \n♥️    𝗠𝗮𝗱𝗲 𝗕𝘆 𝗔𝗿𝘂𝗻🫥`,attachment: fs.createReadStream(__dirname + "/cache/nn.mp3")}, event.threadID, () => fs.unlinkSync(__dirname + "/cache/nn.mp3"));
      return request(encodeURI(link[Math.floor(Math.random() * link.length)])).pipe(fs.createWriteStream(__dirname+"/cache/nn.mp3")).on("close",() => callback());
   };
