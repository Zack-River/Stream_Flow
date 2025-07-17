const jwt = require('jsonwebtoken');

exports.generateRefreshToken = function (user) {
  return generateToken(user, process.env.REFRESH_SECRET, '7d');
}

exports.generateAccessToken = function (user) {
  return generateToken(user, process.env.ACCESS_SECRET, '1h');
}

exports.generateResetToken = function (user) {
  return generateToken(user, process.env.RESET_SECRET, '10m');
}

exports.verifyToken = function (token , type) {
  if(type === 'reset') {
    return jwt.verify(token, process.env.RESET_SECRET);
  } else if (type === 'access') {
    return jwt.verify(token, process.env.ACCESS_SECRET);
  } else if (type === 'refresh') {
    return jwt.verify(token, process.env.REFRESH_SECRET);
  } else {
    throw new Error('Invalid token type');
  }
};

exports.checkExpiry = function (token) {
  const payload = jwt.decode(token);
  const now = Math.floor(Date.now() / 1000); // ✅ add this
  return payload.exp < now;
};

function generateToken(user, secret, period) {
  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
    },
    secret,
    {
      expiresIn: period,
    }
  );
  return token;
}