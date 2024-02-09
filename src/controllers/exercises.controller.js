import { validationResult } from 'express-validator';
import User from '../models/users.js';

const addExercise = async (req, res) => {
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

  const exerciseJSON = {
    name: req.body.exerciseName,
    type: req.body.exerciseType,
  };

  user.exercises.push(exerciseJSON);
  await user.save();
  return res.status(200).json({
    status: 'SUCCESS',
    msg: 'Exercise added successfully',
  });
};

const getExercises = async (req, res) => {
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

  const exercises = user.exercises || [];
  return res.status(200).json({
    status: 'SUCCESS',
    msg: 'Exercises retrieved successfully',
    exercises: exercises,
  });
};

const deleteExercise = async (req, res) => {
  const exerciseId = req.body['exerciseId'];
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

  user.exercises = user.exercises.filter(
    (exercise) => exercise['id'] != exerciseId
  );
  await user.save();
  return res.status(200).json({
    status: 'SUCCESS',
    msg: 'Exercises deleted successfully',
  });
};

export { addExercise, getExercises, deleteExercise };
