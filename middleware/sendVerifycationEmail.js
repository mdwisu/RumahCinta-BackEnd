const nodemailer = require("nodemailer");
const config = require("../config");
const { encryptID } = require("../helpers/encryptedID");
const configAuth = require("../config/configAuth");

const sendVerificationEmail = (email, userId) => {
  // create verify
  const encryptedID = encryptID(userId);

  // send email verification
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: configAuth.email,
      pass: configAuth.password,
    },
  });
  let mailOptions = {
    from: configAuth.email,
    to: email,
    subject: "Verify your email address",
    html: `Please click this link to verify your email: <a href="${config.url}/auth/verify/${encryptedID}">${config.url}/verify/${encryptedID}</a> <br/>jika tidak bisa di klik mohon untuk mengcopy link dan buka di browser anda`,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
  return {
    message: "User created successfully, please check your email for verification",
  };
};

const sendPasswordEmail = async (email, password) => {
  // send email with password
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: configAuth.email,
      pass: configAuth.password,
    },
  });

  let mailOptions = {
    from: configAuth.email,
    to: email,
    subject: "Your Password",
    html: `Silakan Login Di Website Rumah cinta dengan email anda dan password, password anda: <strong>${password}</strong>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password email sent successfully");
  } catch (error) {
    console.log("Error sending password email:", error);
    throw error;
  }
};
module.exports = { sendPasswordEmail, sendVerificationEmail };
