function removeSpecialChars(filename) {
  return filename.replace(/[^a-zA-Z0-9]/g, " ");
}

module.exports = removeSpecialChars;
