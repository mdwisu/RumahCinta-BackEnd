require("dotenv").config();
const crypto = require("crypto");

// ! Deprecated
// exports.encryptID = (id) => {
//   const cipher = crypto.createCipher('aes-256-cbc', process.env.SECRET_KEY);
//   let encryptedID = cipher.update(id.toString(), 'utf8', 'hex');
//   encryptedID += cipher.final('hex');
//   return encryptedID;
// };
// exports.decryptID = (encryptedID) => {
//   const decipher = crypto.createDecipher('aes-256-cbc', process.env.SECRET_KEY);
//   let decryptedID = decipher.update(encryptedID, 'hex', 'utf8');
//   decryptedID += decipher.final('utf8');
//   return decryptedID;
// };

function generateAESKey(key) {
  // Use a cryptographic hash function (SHA-256) to derive a 32-byte key
  const hash = crypto.createHash("sha256");
  hash.update(key);
  return hash.digest().slice(0, 32); // Get the first 32 bytes
}

exports.encryptID = (id) => {
  const iv = crypto.randomBytes(16); // Generate a random Initialization Vector (IV)
  const key = generateAESKey(process.env.SECRET_KEY); // Generate a 32-byte key
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  let encryptedID = cipher.update(id.toString(), "utf8", "hex");
  encryptedID += cipher.final("hex");

  // Append the IV to the encrypted data (you'll need it for decryption)
  encryptedID = iv.toString("hex") + encryptedID;

  return encryptedID;
};

exports.decryptID = (encryptedID) => {
  // Extract the IV from the encrypted data
  const iv = Buffer.from(encryptedID.slice(0, 32), "hex");
  encryptedID = encryptedID.slice(32); // Remove the IV from the encrypted data

  const key = generateAESKey(process.env.SECRET_KEY); // Generate a 32-byte key
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    key,
    iv
  );

  let decryptedID = decipher.update(encryptedID, "hex", "utf8");
  decryptedID += decipher.final("utf8");

  return decryptedID;
};
