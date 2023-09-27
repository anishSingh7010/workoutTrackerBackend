import { validationResult } from 'express-validator';
import User from '../models/users.js';

const registerUser = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json(errors.array());
    return;
  }

  const userDetailsJSON = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  };

  const user = new User(userDetailsJSON);

  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export { registerUser };
