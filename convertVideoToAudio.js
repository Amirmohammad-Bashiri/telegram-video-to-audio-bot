const cp = require("child_process");
// External modules
const ffmpeg = require("ffmpeg-static");
const ytdl = require("ytdl-core");

function convertVideoToAudio(url, filename, chatId, bot) {
  return new Promise((resolve, reject) => {
    console.log("Downloading video...");
    bot.sendMessage(chatId, "Downloading video...");

    // Get audio and video streams
    const audio = ytdl(url, { quality: "highestaudio" }).on("end", () => {
      console.log("Converting to mp3...");
      bot.sendMessage(chatId, "Converting to mp3...");
    });

    // Start the ffmpeg child process
    const ffmpegProcess = cp.spawn(
      ffmpeg,
      [
        // Remove ffmpeg's console spamming
        "-loglevel",
        "8",
        "-hide_banner",
        // Redirect/Enable progress messages
        "-progress",
        "pipe:3",
        // Set inputs
        "-i",
        "pipe:4",
        // Map audio & video from streams
        "-map",
        "0:a",
        // Keep encoding
        "-c:v",
        "copy",
        // Define output file
        filename,
      ],
      {
        windowsHide: true,
        stdio: [
          /* Standard: stdin, stdout, stderr */
          "inherit",
          "inherit",
          "inherit",
          /* Custom: pipe:3, pipe:4 */
          "pipe",
          "pipe",
        ],
      }
    );

    // Link streams
    // FFmpeg creates the transformer streams and we just have to insert / read data
    ffmpegProcess.stdio[3]
      .on("data", chunk => {
        // Parse the param=value list returned by ffmpeg
        const lines = chunk.toString().trim().split("\n");
        const args = {};
        for (const l of lines) {
          const [key, value] = l.split("=");
          args[key.trim()] = value.trim();
        }
      })
      .on("end", () => resolve())
      .on("error", err => reject(err));
    audio.pipe(ffmpegProcess.stdio[4]);
  });
}

module.exports = convertVideoToAudio;
