const { body, param } = require('express-validator');

exports.registerValidator = [
  body('name')
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters.'),
  body('email')
    .isEmail()
    .withMessage('Email must be valid.'),
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be 8-16 characters.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter.')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password must contain at least one special character.'),
  body('address')
    .optional()
    .isLength({ max: 400 })
    .withMessage('Address must be at most 400 characters.'),
  body('role')
    .optional()
    .isIn(['Admin', 'User', 'Owner'])
    .withMessage('Role must be Admin, User, or Owner.')
];

exports.loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Email must be valid.'),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
];

exports.createStoreValidator = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Store name must be between 1 and 100 characters.'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Store email must be valid.'),
  body('address')
    .isLength({ min: 1, max: 400 })
    .withMessage('Address is required and must be at most 400 characters.')
];

exports.ratingValidator = [
  body('storeId')
    .isInt({ min: 1 })
    .withMessage('Store ID must be a positive integer.'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5.')
];

exports.updateRatingValidator = [
  param('storeId')
    .isInt({ min: 1 })
    .withMessage('Store ID must be a positive integer.'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5.')
]; 