const mongoose = require('mongoose');

module.exports = function validateObjectId(req, res, next) {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }
  next();
};