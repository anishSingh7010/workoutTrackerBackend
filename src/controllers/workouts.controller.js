import { validationResult } from 'express-validator';
import User from '../models/users.js';

const addWorkout = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json(errors.array());
    return;
  }

  const userEmail = req['userEmail'];
  if (!userEmail) {
    res.status(500).json({
      status: 'FAILED',
      msg: 'Something went wrong, please try again',
    });
    return;
  }

  const user = await User.findOne({ email: userEmail });
  if (!user) {
    return res.status(404).json({
      status: 'FAILED',
      msg: 'User does not exist',
    });
  }
};

export { addWorkout };
