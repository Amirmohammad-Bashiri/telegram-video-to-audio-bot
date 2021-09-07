const ytdl = require("ytdl-core");

function getVideoDetails(url, chatId) {
  console.log("Getting video info...");
  return new Promise((resolve, reject) => {
    ytdl
      .getBasicInfo(url)
      .then(data =>
        resolve({ url, filename: `${data.videoDetails.title}_${chatId}` })
      )
      .catch(err => reject(err));
  });
}

module.exports = getVideoDetails;
