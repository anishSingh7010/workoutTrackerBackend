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

  let volume = 0;
  const workoutRequest = req.body.workout;
  let exercises = workoutRequest.exercises;

  // calculating total volume
  for (let i = 0; i < exercises.length; i++) {
    for (let j = 0; j < exercises[i].weights.length; j++) {
      if (exercises[i].reps.length !== exercises[i].weights.length) {
        return res.status(400).json({
          status: 'FAILIURE',
          msg: 'Reps and weights are not equal in length',
        });
      }
      volume += exercises[i].weights[j] * exercises[i].reps[j];
    }
  }

  const workoutObject = {
    name: req.body.name,
    date: new Date().toISOString(),
    volume: volume,
    exercises: workoutRequest.exercises,
  };

  user.workouts.push(workoutObject);
  await user.save();

  return res.status(200).json({
    status: 'SUCCESS',
    msg: 'Workout added successfully',
  });
};

const getWorkouts = async (req, res) => {
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

  return res.status(200).json({
    status: 'SUCCESS',
    msg: 'Retrieved workouts successfully',
    workouts: user.workouts,
  });
};

export { addWorkout, getWorkouts };
