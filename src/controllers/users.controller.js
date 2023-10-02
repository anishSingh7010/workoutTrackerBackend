import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import User from '../models/users.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verify,
} from '../util/jwtHelper.js';
import { logEvents } from '../middleware/logger.js';

const registerUser = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json(errors.array());
    return;
  }

  // email shouldnt exist already in database
  const userExists = await User.find({ email: req.body.email }).lean();
  if (userExists.length) {
    res.status(409).json({ path: 'email', msg: 'User already exists' });
    return;
  }

  let hashedPassword = '';
  try {
    hashedPassword = await getHashedPassword(req.body.password);
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
    res.status(201).json({
      status: 'SUCCESS',
      msg: 'User created successfully',
      email: newUser.email,
    });
  } catch (error) {
    logEvents(req, error, 'errorLogs');
    res.status(500).json({ status: 'FAILED', message: error.message });
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
    res.status(401).json({
      status: 'FAILURE',
      msg: 'This combination of email/password is invalid',
    });
    return;
  }

  const isPasswordValid = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!isPasswordValid) {
    res.status(401).json({
      status: 'FAILURE',
      msg: 'This combination of email/password is invalid',
    });
    return;
  }

  const accessToken = generateAccessToken(user.email, user.role);
  const refreshToken = generateRefreshToken(user.email, user.role);

  // setting the refresh token
  res.cookie('jwt', refreshToken, {
    httpOnly: true, // accessible by web server only
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res
    .status(200)
    .json({ status: 'SUCCESS', msg: 'Login Successful!', token: accessToken });
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

const getHashedPassword = async (password) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

export { registerUser, loginUser, useRefreshToken, logoutUser };
