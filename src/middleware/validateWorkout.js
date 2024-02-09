import { body } from 'express-validator';

const validateWorkout = [
  body('workout').not().isEmpty().withMessage('No workouts added.'),
  body('workout[exercises]*.reps')
    .not()
    .isEmpty()
    .withMessage('no reps added.'),
  body('workout[exercises]*.weights')
    .not()
    .isEmpty()
    .withMessage('no weights added.'),
  body('workout[exercises]*._exercise')
    .not()
    .isEmpty()
    .withMessage('Exercise not specified.'),
];

export { validateWorkout };
