const path = require("path");
const fs = require("fs");
// External modules
const dotenv = require("dotenv");
const TelegramBot = require("node-telegram-bot-api");

const runDB = require("./db");
const getVideoDetails = require("./getVideoDetails");
const convertVideoToAudio = require("./convertVideoToAudio");
const removeSpecialChars = require("./utils/removeSpecialChars");
const isValidUrl = require("./utils/isValidUrl");
const checkFileSize = require("./utils/checkFileSize");
const userDetailsLogger = require("./utils/userDetailsLogger");
// Global constants
dotenv.config({ path: "./config.env" });

// Create the download folder
const dir = "./downloads";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

// Bot shit
const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, {
  polling: true,
});

bot.on("message", msg => {
  const chatId = msg.chat.id;
  runDB(chatId);
  let url;
  const fileOptions = {
    contentType: "audio/mpeg",
  };

  try {
    if (msg.text !== "/start") {
      userDetailsLogger(bot, chatId);
      url = new URL(msg.text);
      if (!isValidUrl(msg.text)) throw new Error();

      bot.sendMessage(chatId, "Getting video info...");

      getVideoDetails(msg.text, chatId, bot)
        .then(data => {
          const cleanedFilename = removeSpecialChars(data.filename);
          const mp3FilePath = path.join(
            process.cwd(),
            "downloads",
            `${cleanedFilename}.mp3`
          );

          const mp4FilePath = path.join(
            process.cwd(),
            "downloads",
            `${cleanedFilename}.mp4`
          );

          const thumbFilePath = path.join(
            process.cwd(),
            "downloads",
            `${cleanedFilename}.jpg`
          );

          convertVideoToAudio(data.url, cleanedFilename, chatId, bot)
            .then(() => {
              if (!checkFileSize(mp3FilePath)) {
                bot.sendMessage(chatId, "File is too large.");
                fs.unlinkSync(mp3FilePath);
                fs.unlinkSync(mp4FilePath);
                fs.unlinkSync(thumbFilePath);
                return;
              }
              console.log("Uploading...");
              bot.sendMessage(chatId, "Uploading...");
              bot
                .sendAudio(
                  chatId,
                  mp3FilePath,
                  {
                    caption: "\nID: @yt_video_to_audio_bot",
                    thumb: thumbFilePath,
                  },
                  fileOptions
                )
                .then(() => console.log("Uploaded"))
                .catch(err => {
                  bot.sendMessage(
                    chatId,
                    "There was an error, Please try again later."
                  );
                  console.log(err);
                })
                .finally(() => {
                  fs.unlinkSync(mp3FilePath);
                  fs.unlinkSync(mp4FilePath);
                  fs.unlinkSync(thumbFilePath);
                });
            })
            .catch(err => {
              console.log(err);
              bot.sendMessage(
                chatId,
                "We are having an issue with uploading the video, Please try again later."
              );
            });
        })
        .catch(err => {
          console.log(err);
          bot.sendMessage(
            chatId,
            "Failed to get video info, Please try again later."
          );
        });
    }
  } catch (err) {
    bot.sendMessage(chatId, "Please enter a valid youtube url");
    console.log(err);
  }
});
