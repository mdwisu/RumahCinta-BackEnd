const nodemailer = require('nodemailer');
const config = require('../config');
const { encryptID } = require('../helpers/encryptedID');

exports.sendVerificationEmail = (email, userId) => {
  // create verify
  const encryptedID = encryptID(userId);

  // send email verification
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sendm2896@gmail.com',
      pass: 'vdeptakeleapsbds',
    },
  });
  let mailOptions = {
    from: 'sendm2896@gmail.com',
    to: email,
    subject: 'Verify your email address',
    html: `Please click this link to verify your email: <a href="${config.url}/auth/verify/${encryptedID}">${config.url}/verify/${encryptedID}</a> <br/>jika tidak bisa di klik mohon untuk mengcopy link dan buka di browser anda`,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  return {
    message:
      'User created successfully, please check your email for verification',
  };
};
