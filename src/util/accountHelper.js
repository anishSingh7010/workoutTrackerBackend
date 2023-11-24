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

  userObject.uniqueActivationId = hashedUniqueString;
  userObject.save();

  const url = `http://localhost:${process.env.PORT}`;
  const path = '/verify/';
  const emailHTML = `<p>Activate your account by clicking on the below link</p></br><a target="blank" href=${
    url + path + userId + '/' + uniqueString
  }>Click here</a>`;

  return await sendEmail(userObject.email, emailHTML, req);
};

const sendResetPasswordLink = async (userObject, req) => {
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

  userObject.resetPasswordId = hashedUniqueString;
  userObject.save();

  const url = `http://localhost:${process.env.PORT}`;
  const path = '/account/reset-password/';
  const emailHTML = `<p>Reset your password by clicking on the below link</p></br><a target="blank" href=${
    url + path + userId + '/' + uniqueString
  }>Click here</a>`;

  return await sendEmail(userObject.email, emailHTML, req);
};

/**
 *
 * @param {String} email
 * @param {String} userId
 * @param {String} uniqueString
 * @param {String} path
 * @param {Object} req
 * @returns {Promise} object
 */
const sendEmail = async (email, emailHTML, req) => {
  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: email,
    subject: 'Activate Account',
    html: emailHTML,
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

export { getHashedString, sendActivationLink, sendResetPasswordLink };
