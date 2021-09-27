function userDetailsLogger(bot, chatId) {
  bot.getChat(chatId).then(data => {
    console.log("User ID: ", data.id);
    console.log("Username: ", data.username);
    console.log("First Name: ", data.first_name);
    console.log("Last Name: ", data.last_name);
  });
}

module.exports = userDetailsLogger;
