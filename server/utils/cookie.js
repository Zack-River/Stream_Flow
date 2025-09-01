// exports.setAuthCookies = function (res, accessToken, refreshToken) {
//   createCookie(res, 'accessToken', accessToken, 60 * 60 * 1000); // 1 hour
//   createCookie(res, 'refreshToken', refreshToken, 7 * 24 * 60 * 60 * 1000); // 7 days
// };

exports.setAccessTokenCookie = function (res, accessToken) {
  createCookie(res, 'accessToken', accessToken, 60 * 60 * 1000); // 1 hour
};

exports.setRefreshTokenCookie = function (res, refreshToken) {
  createCookie(res, 'refreshToken', refreshToken, 7 * 24 * 60 * 60 * 1000); // 7 days
};

exports.setResetCookie = function (res, resetToken) {
  createCookie(res, 'resetToken', resetToken, 10 * 60 * 1000); // 10 minutes
};

exports.clearResetCookie = function (res) {
  removeCookie(res, 'resetToken');
};

exports.clearAuthCookies = function (res) {
  removeCookie(res, 'accessToken');
  removeCookie(res, 'refreshToken');
};

function createCookie(res, name, token, maxAge) {
  res.cookie(name, token, {
    httpOnly: true,
    secure: false, // Only HTTPS in prod
    sameSite: 'none',          // Prevent CSRF
    maxAge: maxAge,
    path: '/',                   // Available to entire app
  });
}

function removeCookie(res, name) {
  res.clearCookie(name, {
    httpOnly: true,
    secure: false,
    sameSite: 'none',
    path: '/',
  });
}