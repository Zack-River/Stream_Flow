const { body, param } = require('express-validator');
const mongoose = require('mongoose');

exports.audioUploadValidator = [
  body('title').isString().isLength({ min: 3 }).withMessage('Title must be at least 3 chars.'),
  body('genre').isString().notEmpty().withMessage('Genre is required.'),
  body('isPrivate').optional().isBoolean().withMessage('isPrivate must be boolean.'),
];

exports.audioUpdateValidator = [
  param('id').custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid audio ID.'),
  body('title').optional().isString().isLength({ min: 3 }),
  body('genre').optional().isString(),
  body('isPrivate').optional().isBoolean(),
];

exports.audioIdValidator = [
  param('id').custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid audio ID.'),
];