// exports.setAuthCookies = function (res, accessToken, refreshToken) {
//   createCookie(res, 'accessToken', accessToken, 60 * 60 * 1000); // 1 hour
//   createCookie(res, 'refreshToken', refreshToken, 7 * 24 * 60 * 60 * 1000); // 7 days
// };

exports.setAccessTokenCookie = function (res, accessToken) {
  createCookie(res, 'accessToken', accessToken, 60 * 60 * 1000); // 1 hour
};

exports.setResetCookie = function (res, resetToken) {
  createCookie(res, 'resetToken', resetToken, 10 * 60 * 1000); // 10 minutes
};

exports.clearResetCookie = function (res) {
  removeCookie(res, 'resetToken');
};

exports.clearAuthCookies = function (res) {
  removeCookie(res, 'accessToken');
};

function createCookie(res, name, token, maxAge) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie(name, token, {
    httpOnly: false,
    secure: isProduction, // Set to true in production, false in development
    sameSite: isProduction ? 'none' : 'lax', // Adjust sameSite based on environment
    maxAge: maxAge,
    path: '/',
  });
}

function removeCookie(res, name) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.clearCookie(name, {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });
}