const mongoose = require('mongoose');
require('dotenv').config();


const DB_URL = process.env.MONGO_URL == null ? 'mongodb://localhost:27017/mewell' : process.env.MONGO_URL

const db = mongoose.connect(DB_URL, {
  useNewUrlParser: true, // handle deprecated url
  useUnifiedTopology: true, // handle server deprecated
});

// // check connection opsi 2
// const checkdb = mongoose.connection;
// checkdb.on('error', (error) => console.log(error));
// checkdb.once('open', () => console.log("Database Connected.."))

module.exports = db;
