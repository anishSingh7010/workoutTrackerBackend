// Helper functions used in login/signup/reset/forgot password etc.

import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { v4 as uuid } from 'uuid';
import { logEvents } from '../middleware/logger.js';

/**
 *
 * @param {string} password
 * @returns {string} hashedPassword
 */
const getHashedString = async (string) => {
  const saltRounds = 10;
  const hashedString = await bcrypt.hash(string, saltRounds);
  return hashedString;
};

/**
 *
 * @param {String} userId
 * @param {String} email
 * @param {Object} req
 * @returns
 */
const sendActivationLink = async (userObject, req) => {
  // unique string formed with uuid library + document id of the user from mongodb
  const userId = userObject['_id'];
  const uniqueString = uuid() + userId;
  // hash the unique id using bcrypt
  let hashedUniqueString = '';
  try {
    hashedUniqueString = await getHashedString(uniqueString);
  } catch (error) {
    // server log error about hashing
    logEvents(req, error, 'errorLogs');
    return {
      error: true,
      errorMsg: error,
    };
  }

  const url = `http://localhost:${process.env.PORT}`;
  userObject.uniqueActivationId = hashedUniqueString;
  userObject.save();

  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: userObject.email,
    subject: 'Activate Account',
    html: `<p>Activate your account by clicking on the below link</p></br><a target="blank" href=${
      url + '/account/verify/' + userId + '/' + uniqueString
    }>Click here</a>`,
  };

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });

  // sending email and handling success and error scenario
  return transporter
    .sendMail(mailOptions)
    .then(() => {
      logEvents(req, 'Email Sent Successfully', 'debugLogs');
      return {
        error: false,
      };
    })
    .catch((error) => {
      return {
        error: true,
        errorMsg: error,
      };
    });
};

export { getHashedString, sendActivationLink };
