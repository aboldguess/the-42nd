const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

module.exports = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
};
