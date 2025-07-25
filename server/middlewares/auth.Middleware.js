const jwtHelper = require('../utils/jwt');
const User = require('../models/user.Model');
const cookie = require('../utils/cookie');


exports.checkAuthenticated = async (req, res, next) => {
  try {
    let accessToken, refreshToken;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      accessToken = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      accessToken = req.cookies.accessToken;
    }

    refreshToken = req.cookies?.refreshToken;

    let decoded;
    if (accessToken) {
      try {
        decoded = jwtHelper.verifyAccessToken(accessToken);
      } catch (err) {
        decoded = null;
      }
    }

    if (!decoded && refreshToken) {
  try {
    const decodedRefresh = jwtHelper.verifyToken(refreshToken, 'refresh');

    if (!decodedRefresh || !decodedRefresh.id) {
      return res.status(401).json({ message: 'Invalid refresh token payload.' });
    }

    const user = await User.findById(decodedRefresh.id)
    if (!user) return res.status(401).json({ message: 'Invalid refresh token user.' });

    const newAccessToken = jwtHelper.generateAccessToken(user);
    cookie.setAccessTokenCookie(res, newAccessToken);

    req.user = user;
    req.isAuthenticated = true;
    return next();
  } catch (err) {
    console.error('Refresh token invalid:', err);
    return res.redirect('/login');
  }
}

    if (!decoded && !refreshToken) {
        return res.redirect('/login');
    }


    const user = await User.findById(decoded.id);
    console.log('Mongoose Doc?', user instanceof User);
    console.log('Has save?', typeof user.save);

    if (!user) {
      return res.status(401).json({ message: 'User not found!' });
    }

    req.user = user;
    req.isAuthenticated = true;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong in auth check!' });
  }
};


exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden! Insufficient permissions.' });
    }
    next();
  };
};