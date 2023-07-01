const { Telegraf } = require('telegraf');
const { Configuration, OpenAIApi } = require("openai");
const { BOT_TOKEN, OWNER_ID, MAX_TOKEN } = setting = require('./setting.json');
const configuration = new Configuration({
apiKey: setting.OPENAI_APIKEY,
});
const openai = new OpenAIApi(configuration);
const mtz = require("moment-timezone");
const fetch = require("node-fetch");
const bot = new Telegraf(BOT_TOKEN);
const client = bot.telegram;
chatbot = {};

function reply(chatid, message, msgid, opts) {
    return client.sendMessage(chatid, message, { reply_to_message_id: msgid, ...opts });
}

/* 
function replyMulti(chatid, message, msgid, opts) {
    let messages = message.split('');
    let messageCount = messages.length;
    let i = 0;
    while (i < messageCount) {
        let messagePart = messages.slice(i, i + 4096).join('');
        client.sendMessage(chatid, messagePart, { reply_to_message_id: msgid, ...opts });
        i += 4096;
    }
}
*/
bot.on('message', async (ctx) => {
    try {
    let body = ctx.message.text || ctx.message.caption || "";
    let chatId = ctx.message.chat.id;
    let userId = ctx.message.from.id;
    let messageId = ctx.message.message_id;
    let username = ctx.message.from.username;
    let isOwner = OWNER_ID.includes(userId);
    let name = ctx.message.from.first_name;
    let lastName = ctx.message.from.last_name;
    let chatType = ctx.message.chat.type;
    let fullName = (name + " ") + (lastName ? lastName : "").trim();
    let mention = (username ? "@" + username : fullName);
    let mentionId = (fullName ? fullName : username ? "@" + username : userId);
    let userIdLink = "tg://user?id=" + userId;
    let args = body.split(" ").slice(1);
    let command = body.split(" ")[0].toLowerCase();
    if (!global.chatbot[userId]) {
    chatbot[userId] = [{ role: "assistant", content: "Hai, saya adalah chatbot yang akan membantu kamu menjawab pertanyaan kamu." }];
    }

    switch (command) {
    case "/start":
    let shareText = `Cobain Nih!!
Chat Bot AI yang akan membantu kamu. 
Kirimkan pertanyaan kamu disini, nanti bot akan menjawab pertanyaan kamu.

https://t.me/${bot.botInfo.username.toLowerCase()}`;

    reply(chatId, `Hai 👋\n\nSaya adalah Robot AI untuk menjawab pertanyaan anda, Silahkan kirim Pertanyaan kamu, nanti jawaban kamu akan dijawab oleh robot.\n\n_AI (Artificial Intelligence) adalah teknologi yang menggunakan algoritma kompleks untuk membuat mesin yang dapat berpikir dan bertindak seperti manusia. AI dapat digunakan untuk menyelesaikan masalah yang rumit dan membuat keputusan yang lebih tepat daripada manusia. AI juga dapat digunakan untuk menganalisis data dan mengambil keputusan berdasarkan data tersebut. AI juga dapat digunakan untuk meningkatkan produktivitas dan efisiensi, serta membantu manusia dalam menyelesaikan tugas-tugas yang rumit._\n\n_bot dibatasi menjawab maximal ${MAX_TOKEN} kata_\n\n*Created by @caliphdev*`, messageId, { parse_mode: "Markdown", reply_markup: {
    inline_keyboard: [
      [{ text: '💌 Owner', url: "tg://user?id="+OWNER_ID[0] }, { text: "🔗 Source Code", url: "https://github.com/caliphdev/openai-telebot" }],
      [{ text: "❤️ Share Bot ini", url: "https://t.me/share/url?"+new URLSearchParams({ text: shareText }) }]
    ]
  } }).catch((e) => console.log(e));
    break;
        
        case ">":
        if (!isOwner) return reply(chatId, "You are not my owner.", messageId);
        if (args.length == 0) return reply(chatId, "Send me a code for execute.", messageId);
        let code = args.join(" ");
        try {
            let evaled = await eval(`(async () => { ${code} })()`);
            if (typeof evaled !== "string") evaled = require("util").inspect(evaled, { depth: 7 });
            reply(chatId,  evaled, messageId);
        } catch (err) {
            reply(chatId, err, messageId);
        }
        break;
        case "/reset":
        chatbot[userId] = chatbot[userId] ? chatbot[userId].slice(0, 1) : ["Ai: Aku Adalah Chatbot Yang Di Ciptakan oleh Caliph Dev!"];
        reply(chatId, "Sesi pesan kamu berhasil direset!", messageId);
        break;
        case "/ping":
                det = new Date
                reply(chatId, "Testing ping...", messageId).then(async (x) => {
                dex = new Date - det;
                sai = new Date();
                await client.editMessageText(chatId, x.message_id, null, `Try Connecting to openai...`);
                await fetch("https://api.openai.com");
                let zzz = new Date - sai;
                client.editMessageText(chatId, x.message_id, null, `Pong!!!\nSpeed : ${dex < 1000 ? dex : dex / 1000} ${dex < 1000 ? "ms" : "Seconds"}\nAPI OpenAI : ${zzz < 1000 ? zzz : zzz / 1000} ${zzz < 1000 ? "ms" : "Seconds"}`);
                });
                break
        default:
        if (!body) return 
        client.sendChatAction(chatId, "typing");
        chatbot[userId].push({role: "user", content: body});
        openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: chatbot[userId],
          }).then(response => {
        if (setting.debug) console.log(response.data);
        chatbot[userId].push(response.data.choices[0].message);
reply(chatId, response.data.choices[0].message.content.trim(), messageId);
}).catch(e => {
    console.log(e);
reply(chatId, "Server Error, AI Not Responding...", messageId);
});
        break;
    }
    } catch (e) {
        console.log(e)
    }
});

bot.launch().then(() => {
    console.log("Bot started!");
}).catch((err) => {
    console.log(err);
});
