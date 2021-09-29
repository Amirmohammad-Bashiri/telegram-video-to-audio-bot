const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri);

async function runDB(chatId) {
  try {
    console.log(chatId);
    await client.connect();

    const database = client.db("telegram-users");
    const users = database.collection("users");

    const user = await users.findOne({ chatId });

    if (!user) {
      await users.insertOne({ chatId, usageCount: 1 });
    } else {
      await users.updateOne(
        { chatId: user.chatId },
        { $set: { usageCount: user.usageCount + 1 } }
      );
    }
  } finally {
    await client.close();
  }
}

module.exports = runDB;
