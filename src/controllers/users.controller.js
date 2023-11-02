import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import User from '../models/users.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verify,
} from '../util/jwtHelper.js';
import { logEvents } from '../middleware/logger.js';
import {
  getHashedString,
  sendActivationLink,
  sendResetPasswordLink,
} from '../util/accountHelper.js';

const registerUser = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json(errors.array());
    return;
  }

  // email shouldnt exist already in database
  const userExists = await User.find({ email: req.body.email }).lean();
  if (userExists.length) {
    res.status(409).json([{ path: 'email', msg: 'User already exists' }]);
    return;
  }

  let hashedPassword = '';
  try {
    hashedPassword = await getHashedString(req.body.password);
  } catch (error) {
    // server log error about hashing
    logEvents(req, error, 'errorLogs');
    res.status(500).json({
      status: 'FAILED',
      msg: 'Something went wrong. Please try again!',
    });
    return;
  }

  const userDetailsJSON = {
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  };

  const user = new User(userDetailsJSON);

  try {
    const newUser = await user.save();
    const activationEmailResult = await sendActivationLink(newUser, req);
    if (activationEmailResult.error) {
      throw new Error(activationEmailResult.errorMsg);
    }
    res.status(201).json({
      status: 'SUCCESS',
      msg: 'User created successfully',
      email: newUser.email,
    });
  } catch (error) {
    logEvents(req, error, 'errorLogs');
    // delete user if activation link fails to send
    user.deleteOne();
    res.status(500).json([
      {
        status: 'FAILED',
        message: 'Something went wrong! Please try again.',
      },
    ]);
  }

  return;
};

const loginUser = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json(errors.array());
    return;
  }

  // email should exist already in database
  const user = await User.findOne({ email: req.body.email }).lean();

  // if user doesnt exist
  if (!user) {
    res.status(401).json([
      {
        status: 'FAILURE',
        msg: 'This combination of email/password is invalid',
        path: 'email',
      },
    ]);
    return;
  }

  const isPasswordValid = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!isPasswordValid) {
    res.status(401).json([
      {
        status: 'FAILURE',
        msg: 'This combination of email/password is invalid',
        path: 'email',
      },
    ]);
    return;
  }

  // if user hasnt activated their account yet
  if (!user.active) {
    res.status(400).json([
      {
        status: 'FAILED',
        msg: 'Please activate your account before logging in',
        path: 'email',
      },
    ]);
    return;
  }

  const accessToken = generateAccessToken(user.email, user.role);
  const refreshToken = generateRefreshToken(user.email, user.role);

  // setting the refresh token
  res
    .cookie('jwt', refreshToken, {
      httpOnly: true, // accessible by web server only
      //secure: true, //disabled because of localhost testing
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    })
    .status(200)
    .json({
      status: 'SUCCESS',
      msg: 'Login Successful!',
      accessToken: accessToken,
      refreshToken: refreshToken,
      name: user.name,
    });

  return;
};

const useRefreshToken = async (req, res) => {
  const refreshToken = req.cookies['jwt'];
  // no refresh token found
  if (!refreshToken) {
    return res.status(401).json({ status: 'FAILED', msg: 'Unauthorized' });
  }

  // refresh token rotation here

  const { result, errorMsg, isError } = await verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  if (isError) {
    logEvents(req, errorMsg, 'errorLogs');
    return res
      .status(401)
      .json({ status: 'FAILED', msg: 'Refresh Token Invalid' });
  }

  // if the user using the refresh token does not exist in the database
  const user = await User.findOne({ email: result.email }).lean();

  if (!user) {
    return res.status(401).json({ status: 'FAILED', msg: 'Invalid user' });
  }

  const newAccessToken = generateAccessToken(user.email, user.role);
  return res.status(200).json({
    status: 'SUCCESS',
    msg: 'New token generated!',
    token: newAccessToken,
    role: user.role,
  });
};

const activateAccount = async (req, res) => {
  const { userId, uniqueString } = req.params;
  const userObject = await User.findOne({ _id: userId });
  if (!userObject) {
    return res.status(404).json({
      status: 'FAILED',
      msg: 'User does not exists',
    });
  }

  if (userObject.active) {
    return res.status(400).json({
      status: 'FAILED',
      msg: 'Account is already active.',
    });
  }

  const isUniqueStringValid = await bcrypt.compare(
    uniqueString,
    userObject.uniqueActivationId
  );

  if (!isUniqueStringValid) {
    return res.status(400).json({
      status: 'FAILED',
      msg: 'Invalid activation id',
    });
  }

  userObject.active = true;
  userObject.uniqueActivationId = '';
  await userObject.save();

  return res.status(200).json({
    status: 'SUCCESS',
    msg: 'Account activated successfully',
  });
};

const logoutUser = (req, res) => {
  const refreshToken = req.cookies['jwt'];
  // no refresh token found
  if (refreshToken) {
    res.clearCookie('jwt');
  }

  res.status(200).json({
    status: 'SUCCESS',
    msg: 'Logged out successfully',
  });
};

const resetPasswordRequest = async (req, res) => {
  const { email } = req.body;
  // check if user is in the database
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      status: 'FAILED',
      msg: 'User does not exist',
    });
  }

  const resetPasswordRequestResult = await sendResetPasswordLink(user, req);
  if (resetPasswordRequestResult.error) {
    return res.status(500).json({
      status: 'FAILED',
      msg: 'Something went wrong. Please try again.',
    });
  }
  return res.status(200).json({
    status: 'SUCCESS',
    msg: 'Reset Password Email Sent',
    email: user.email,
  });
};

const resetPassword = async (req, res) => {
  // checking if password and confirmPassword are validated
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json(errors.array());
    return;
  }

  const { userId, uniqueString } = req.params;
  const { password } = req.body;

  const user = await User.findOne({ _id: userId });
  if (!user) {
    return res.status(404).json({
      status: 'FAILED',
      msg: 'User not found',
    });
  }

  if (!user.resetPasswordId) {
    return res.status(400).json({
      status: 'FAILED',
      msg: 'No reset request ID found. Request for reset password.',
    });
  }

  // if user found, compare the uniqueString with database
  const isMatch = await bcrypt.compare(uniqueString, user.resetPasswordId);

  if (!isMatch) {
    return res.status(400).json({
      status: 'FALIED',
      msg: 'Invalid request password id',
    });
  }

  // hash and save new password
  let hashedPassword = '';
  try {
    hashedPassword = await getHashedString(password);
  } catch (error) {
    // server log error about hashing
    logEvents(req, error, 'errorLogs');
    res.status(500).json({
      status: 'FAILED',
      msg: 'Something went wrong. Please try again!',
    });
    return;
  }

  // updating password and reset password ID
  user.password = hashedPassword;
  user.resetPasswordId = '';
  user.save();
  return res.status(201).json({
    status: 'SUCCESS',
    msg: 'Password changed successfully',
  });
};

export {
  registerUser,
  loginUser,
  useRefreshToken,
  logoutUser,
  activateAccount,
  resetPasswordRequest,
  resetPassword,
};
