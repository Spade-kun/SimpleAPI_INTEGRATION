const crypto = require("crypto");
require("dotenv").config();
const algorithm = "aes-256-cbc";
const secretKey = process.env.ENCRYPTION_SECRET_KEY;
const ivLength = 16;

console.log("Secret Key:", secretKey);
console.log("Secret Key:", process.env.ENCRYPTION_SECRET_KEY);

const encrypt = (text) => {
  if (!secretKey) {
    console.error("Encryption secret key is not set");
    throw new Error("Encryption secret key is not set");
  }
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(secretKey, "hex"),
    iv
  );
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

module.exports = { encrypt };
