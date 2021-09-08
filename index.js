const path = require("path");
const fs = require("fs");
// External modules
const dotenv = require("dotenv");
const TelegramBot = require("node-telegram-bot-api");

const getVideoDetails = require("./getVideoDetails");
const convertVideoToAudio = require("./convertVideoToAudio");
const removeSpecialChars = require("./utils/removeSpecialChars");
const isValidUrl = require("./utils/isValidUrl");
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
  let url;
  const fileOptions = {
    contentType: "audio/mpeg",
  };

  try {
    if (msg.text !== "/start") {
      url = new URL(msg.text);
      console.log(chatId);
      if (!isValidUrl(msg.text)) throw new Error();

      bot.sendMessage(chatId, "Getting video info...");

      getVideoDetails(msg.text, chatId).then(data => {
        const filePath = path.join(
          process.cwd(),
          "downloads",
          `${removeSpecialChars(data.filename)}.mp3`
        );

        const thumbFilePath = path.join(
          process.cwd(),
          "downloads",
          `${removeSpecialChars(data.filename)}.jpg`
        );

        console.log(thumbFilePath);

        convertVideoToAudio(data.url, filePath, chatId, bot)
          .then(() => {
            console.log("Uploading...");
            bot.sendMessage(chatId, "Uploading...");
            bot
              .sendAudio(
                chatId,
                filePath,
                {
                  caption: "\nID: @uTubeVideoDownloadBot",
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
                fs.unlinkSync(filePath);
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
      });
    }
  } catch (err) {
    bot.sendMessage(chatId, "Please enter a valid youtube url");
    console.log(err);
  }
});
