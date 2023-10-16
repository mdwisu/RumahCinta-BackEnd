require('dotenv').config();

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 5000;
const url = process.env.URL;

module.exports = {
  host: process.env.HOST || host,
  port: process.env.PORT || port,
  url: url || `http://${host}:${port}`,
};
