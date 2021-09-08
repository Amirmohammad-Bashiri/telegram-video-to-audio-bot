const fs = require("fs");

function checkFileSize(filepath) {
  const fileStats = fs.statSync(filepath);
  const fileSizeInBytes = fileStats.size;
  const fileSizeInMb = fileSizeInBytes / (1024 * 1024);

  return fileSizeInMb <= 50;
}

module.exports = checkFileSize;
