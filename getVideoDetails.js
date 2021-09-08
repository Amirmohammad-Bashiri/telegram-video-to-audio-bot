const path = require("path");

// External modules
const ytdl = require("ytdl-core");

const getThumbnail = require("./utils/getThumbnail");
const removeSpecialChars = require("./utils/removeSpecialChars");

function getVideoDetails(url, chatId, bot) {
  console.log("Getting video info...");
  return new Promise((resolve, reject) => {
    ytdl
      .getInfo(url)
      .then(data => {
        if (data.videoDetails.isLiveContent) {
          bot.sendMessage(
            chatId,
            "This video is currently live, Please wait for it to finish first."
          );
          return;
        }

        const filename = `${data.videoDetails.title}_${chatId}`;
        const caption = data.videoDetails.title;
        const thumbnails = data.videoDetails.thumbnails;
        const thumbUrl = thumbnails[thumbnails.length - 1];
        const thumbFilePath = path.join(
          process.cwd(),
          "downloads",
          `${removeSpecialChars(filename)}.jpg`
        );

        getThumbnail(thumbUrl, thumbFilePath);

        resolve({
          url,
          filename,
          caption,
        });
      })
      .catch(err => reject(err));
  });
}

module.exports = getVideoDetails;
