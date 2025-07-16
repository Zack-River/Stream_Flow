const {body} = require('express-validator');

exports.registerValidator = [
    body('name')
    .notEmpty().withMessage('name is required')
    .isString().withMessage('Name must be a string'),
    body('username')
    .notEmpty().withMessage('Username is required')
    .isString().withMessage('Username must be a string')
    .length({ min:2 , max:20 })
    .withMessage('Username must be between 2 and 20 characters'),
    body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be a valid email')
    .normalizeEmail(),
    body('password')
    .length({ min: 6, max: 20 }).withMessage('Password must be between 6 and 20 characters')
    .notEmpty().withMessage('Password is required')
    .isString().withMessage('Password must be a string')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];

exports.loginValidator = [
    body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be a valid email')
    .normalizeEmail(),
    body('password')
    .notEmpty().withMessage('Password is required')
    .isString().withMessage('Password must be a string')
];