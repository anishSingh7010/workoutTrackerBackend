import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import User from '../models/users.js';
import { getAccessToken, getRefreshToken } from '../util/jwtHelper.js';

const registerUser = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json(errors.array());
    return;
  }

  // email shouldnt exist already in database
  const userExists = await User.find({ email: req.body.email });
  if (userExists.length) {
    res.status(409).json({ path: 'email', msg: 'User already exists' });
    return;
  }

  let hashedPassword = '';
  try {
    hashedPassword = await getHashedPassword(req.body.password);
  } catch (error) {
    // server log error about hashing
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

  // email shouldnt exist already in database
  const user = await User.find({ email: req.body.email });

  // if user doesnt exist
  if (!user.length) {
    res.status(401).json({
      status: 'FAILURE',
      msg: 'This combination of email/password is invalid',
    });
    return;
  }

  const isPasswordValid = await bcrypt.compare(
    req.body.password,
    user[0].password
  );
  if (!isPasswordValid) {
    res.status(401).json({
      status: 'FAILURE',
      msg: 'This combination of email/password is invalid',
    });
    return;
  }

  const accessToken = getAccessToken(user[0].email);
  const refreshToken = getRefreshToken(user[0].email);

  // setting the refresh token
  res.cookie('jwt', refreshToken, {
    httpOnly: true, // accessible by web server only
    secure: true,
    maxAge: (7 * 24 * 60 * 60) & 1000,
  });

  res
    .status(200)
    .json({ status: 'SUCCESS', msg: 'Login Successful!', token: accessToken });
  return;
};

const getHashedPassword = async (password) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

export { registerUser, loginUser };
