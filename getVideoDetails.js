const path = require("path");
const ytdl = require("ytdl-core");

const getThumbnail = require("./utils/getThumbnail");
const removeSpecialChars = require("./utils/removeSpecialChars");

function getVideoDetails(url, chatId) {
  console.log("Getting video info...");
  return new Promise((resolve, reject) => {
    ytdl
      .getBasicInfo(url)
      .then(data => {
        const filename = `${data.videoDetails.title}_${chatId}`;
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
          caption: data.videoDetails.title,
        });
      })
      .catch(err => reject(err));
  });
}

module.exports = getVideoDetails;
