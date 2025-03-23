module.exports.config = {
    name: "guess",
    version: "1.0.3",
    hasPermission: 0,
    credits: "MirryKal",
    description: "A cool math trick that surprises users!",
    commandCategory: "fun",
    usages: "",
    cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
    const { threadID, senderID } = event;

    // ✅ Simple random numbers (20, 30, 40, ..., 150)
    const easyNumbers = [20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150];
    const randomNum = easyNumbers[Math.floor(Math.random() * easyNumbers.length)];
    const halfNum = randomNum / 2;

    const steps = [
        { msg: "🧠 *Magic Math Trick Start!* 🎩\n\nHey! कोई भी नंबर *1 से 100* के बीच में सोचो।\n\nअगर सोच लिया, तो *YES* लिखो।", wait: true },
        { msg: "अब अपने दोस्त के लिए *उतना ही* नंबर *ADD* कर दो।\n\nअगर कर लिया, तो *YES* लिखो।", wait: true },
        { msg: `अब उसमें *${randomNum}* और *ADD* कर दो।\n\nअगर कर लिया, तो *YES* लिखो।`, wait: true },
        { msg: "जो भी Result आया है, उसका *आधा (Divide by 2)* कर दो।\n\nअगर कर लिया, तो *YES* लिखो।", wait: true },
        { msg: "अब जो तुमने अपने दोस्त के लिए नंबर Add किया था, उसे *minus* कर दो।\n\nअगर कर लिया, तो *YES* लिखो।", wait: true },
        { msg: `🎉 *तुम्हारा उत्तर* = *${halfNum}* 🎩✨`, wait: false }
    ];

    let currentStep = 0;

    const sendStep = async () => {
        if (currentStep < steps.length) {
            api.sendMessage(steps[currentStep].msg, senderID, (err, info) => {
                if (!err && steps[currentStep].wait) {
                    global.client.handleReply.push({
                        name: module.exports.config.name,
                        messageID: info.messageID,
                        author: senderID,
                        step: currentStep
                    });
                }
            });
        }
    };

    global.client.handleReply = global.client.handleReply || [];
    global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: event.messageID,
        author: senderID,
        step: currentStep
    });

    sendStep();
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
    const { senderID, body } = event;

    if (handleReply.author !== senderID || body.toLowerCase() !== "yes") return;

    handleReply.step++;

    if (handleReply.step < 5) {
        api.sendMessage("✔ Great! Next step:", senderID);
    }

    module.exports.run({ api, event: { threadID: senderID, senderID } });
};
