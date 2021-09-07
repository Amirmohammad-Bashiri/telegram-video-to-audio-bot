const path = require("path");
const fs = require("fs");
const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");

const isValidUrl = require("./utils/isValidUrl");
const removeSpecialChars = require("./utils/removeSpecialChars");
const convertVideoToMp3 = require("./convertVideoToMp3");
const getVideoDetails = require("./getVideoDetails");

dotenv.config({ path: "./config.env" });

const dir = "./downloads";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

// Bot shit
const token = process.env.BOT_TOKEN;

bot = new TelegramBot(token, {
  polling: true,
  baseApiUrl: "http://localhost:8081",
});

bot.on("message", msg => {
  const chatId = msg.chat.id;
  let url;
  const fileOptions = {
    contentType: "audio/mpeg",
  };

  try {
    if (msg.text !== "/start") {
      url = new URL(msg.text);
      console.log(chatId);
      if (!isValidUrl(msg.text)) throw new Error();

      bot.sendMessage(chatId, "Getting video Info...");
      getVideoDetails(msg.text, chatId).then(data => {
        const mp3Filepath = path.join(
          process.cwd(),
          "downloads",
          `${removeSpecialChars(data.filename)}.mp3`
        );

        const mp4Filepath = path.join(
          process.cwd(),
          "downloads",
          `${removeSpecialChars(data.filename)}.mp4`
        );

        convertVideoToMp3(data.url, data.filename, chatId, bot)
          .then(() => {
            console.log("Uploading...");
            bot.sendMessage(chatId, "Uploading...");
            bot
              .sendAudio(
                chatId,
                mp3Filepath,
                {
                  caption: `${data.caption}\n\n ID: @yt_video_to_audio_bot`,
                },
                fileOptions
              )
              .then(() => {
                console.log("Uploaded");
              })
              .catch(err => {
                bot.sendMessage(
                  chatId,
                  "There was an error, Please try again later."
                );
                console.log(err);
              })
              .finally(() => {
                fs.unlinkSync(mp3Filepath);
                fs.unlinkSync(mp4Filepath);
              });
          })
          .catch(err => console.log(err));
      });
    }
  } catch {
    bot.sendMessage(chatId, "Please enter a valid youtube url");
  }
});
