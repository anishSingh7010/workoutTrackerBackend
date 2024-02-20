import { body } from 'express-validator';

export const validateExercise = [
  body('exerciseName')
    .not()
    .isEmpty()
    .withMessage('Exercise name is a required field.'),
  body('exerciseType')
    .not()
    .isEmpty()
    .withMessage('Exercise type is a required field.')
    .isIn(['push', 'pull', 'legs'])
    .withMessage(
      'Exercise type needs to be one of the following: push, pull or legs'
    ),
];
