const fs = require("fs");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");

const removeSpecialChars = require("./utils/removeSpecialChars");

function convertVideoToMp3(url, filename, chatId, bot) {
  return new Promise((resolve, reject) => {
    const trimedFilename = removeSpecialChars(filename);
    console.log("Downloading video...");
    bot.sendMessage(chatId, "Downloading video...");
    ytdl(url, { quality: "highestaudio" })
      .pipe(fs.createWriteStream(`./downloads/${trimedFilename}.mp4`))
      .on("close", () => {
        console.log("Converting to mp3...");
        bot.sendMessage(chatId, "Converting to mp3...");
        new ffmpeg({ source: `./downloads/${trimedFilename}.mp4`, nolog: true })
          .toFormat("mp3")
          .on("end", () => resolve())
          .on("error", err => reject(err))
          .saveToFile(`./downloads/${trimedFilename}.mp3`);
      });
  }).catch(err => console.log(err));
}

module.exports = convertVideoToMp3;
