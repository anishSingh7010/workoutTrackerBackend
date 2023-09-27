import { body } from 'express-validator';

const validateUser = [
  body('name').not().isEmpty().withMessage('Name is a required field.'),
  body('email')
    .not()
    .isEmpty()
    .bail()
    .withMessage('Email is a required field.')
    .isEmail()
    .withMessage('Email is invalid.'),
  body('password')
    .not()
    .isEmpty()
    .withMessage('Password is a required field.')
    .isLength({ min: 8 })
    .withMessage('Password is too short.'),
  body('confirmPassword')
    .not()
    .isEmpty()
    .withMessage('Confirm Password is a required field.')
    .custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error('Passwords do not match');
    }),
];

export { validateUser };
