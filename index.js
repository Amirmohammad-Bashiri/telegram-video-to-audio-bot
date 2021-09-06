const path = require("path");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ytdl = require("ytdl-core");
const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

// Bot shit
const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

bot.on("message", msg => {
  const chatId = msg.chat.id;
  let url;
  const fileOptions = {
    contentType: "audio/mpeg",
  };

  try {
    if (msg.text !== "/start") {
      url = new URL(msg.text);

      bot.sendMessage(chatId, "Getting video Info...");
      getVideoDetails(msg.text).then(data => {
        const mp3Filepath = path.join(
          process.cwd(),
          "downloads",
          `${data.filename}.mp3`
        );

        const mp4Filepath = path.join(
          process.cwd(),
          "downloads",
          `${data.filename}.mp4`
        );

        convertVideoToMp3(data.url, data.filename, chatId).then(() => {
          bot.sendMessage(chatId, "Uploading...");
          bot.sendAudio(chatId, mp3Filepath, {}, fileOptions).then(() => {
            fs.unlinkSync(mp3Filepath);
            fs.unlinkSync(mp4Filepath);
            console.log("sent");
          });
        });
      });
    }
  } catch {
    bot.sendMessage(chatId, "Please enter a valid url");
  }
});

// Video to mp3 conversion
const dir = "./downloads";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

function convertVideoToMp3(url, filename, chatId) {
  console.log("Getting video");
  return new Promise((resolve, reject) => {
    bot.sendMessage(chatId, "Downloading video...");
    ytdl(url, { quality: "highestaudio" })
      .pipe(fs.createWriteStream(`./downloads/${filename}.mp4`))
      .on("close", () => {
        bot.sendMessage(chatId, "Converting to mp3...");
        new ffmpeg({ source: `./downloads/${filename}.mp4`, nolog: true })
          .toFormat("mp3")
          .on("end", () => resolve())
          .on("error", err => reject(err))
          .saveToFile(`./downloads/${filename}.mp3`);
      });
  });
}

function getVideoDetails(url) {
  console.log("Started");
  return new Promise((resolve, reject) => {
    ytdl
      .getBasicInfo(url)
      .then(data => resolve({ url, filename: data.videoDetails.title }))
      .catch(err => reject(err));
  });
}
