import { body } from 'express-validator';

const validateNewUser = [
  body('name').not().isEmpty().withMessage('Name is a required field.'),
  body('email')
    .not()
    .isEmpty()
    .withMessage('Email is a required field.')
    .bail()
    .isEmail()
    .withMessage('Email is invalid.'),
  body('password')
    .not()
    .isEmpty()
    .withMessage('Password is a required field.')
    .bail()
    .isLength({ min: 8 })
    .withMessage('Password is too short.'),
  body('confirmPassword')
    .not()
    .isEmpty()
    .withMessage('Confirm Password is a required field.')
    .bail()
    .custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error('Passwords do not match');
      return true;
    }),
];

const validateLoginUser = [
  body('email')
    .not()
    .isEmpty()
    .withMessage('Email is a required field.')
    .bail()
    .isEmail()
    .withMessage('Email is invalid.'),
  body('password').not().isEmpty().withMessage('Password is a required field.'),
];

const validateResetPassword = [
  body('password')
    .not()
    .isEmpty()
    .withMessage('Password is a required field.')
    .bail()
    .isLength({ min: 8 })
    .withMessage('Password is too short.'),
  body('confirmPassword')
    .not()
    .isEmpty()
    .withMessage('Confirm Password is a required field.')
    .bail()
    .custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error('Passwords do not match');
      return true;
    }),
];

export { validateNewUser, validateLoginUser, validateResetPassword };
