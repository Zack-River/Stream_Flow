const hash = require("../utils/hash");
const User = require("../models/user.Model");
const jwt = require('../utils/jwt');
const { sendEmail } = require("../utils/sendEmail");
const cookieHelper = require('../utils/cookie');

// Constants
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

const MESSAGES = {
  ALL_FIELDS_REQUIRED: "All fields are required!",
  EMAIL_IN_USE: "Email already in use!",
  USERNAME_IN_USE: "Username already in use!",
  USER_CREATED: "User Created Successfully!",
  ALREADY_LOGGED_IN: "Already logged in.",
  LOGGED_IN_SUCCESS: "Logged In successfully.",
  INVALID_CREDENTIALS: "Email or Username and Password are required!",
  WRONG_CREDENTIALS: "Wrong Email / Username or Password!",
  ACCOUNT_DEACTIVATED: "Account is deactivated!",
  INVALID_EMAIL: "Invalid Email",
  USER_NOT_FOUND: "User Not Found or Invalid Email",
  RESET_LINK_SENT: "Reset link sent to email:",
  TOKEN_PASSWORD_REQUIRED: "Token and new password are required!",
  PASSWORD_SAME: "New password must be different from the old password!",
  PASSWORD_RESET_SUCCESS: "Password reset successfully!",
  INVALID_TOKEN: "Invalid or expired token!",
  NO_REFRESH_TOKEN: "No refresh token!",
  ACCESS_TOKEN_REFRESHED: "Access token refreshed successfully.",
  INVALID_REFRESH_TOKEN: "Invalid or expired refresh token!",
  LOGGED_OUT: "Logged out successfully.",
  LOGOUT_ERROR: "Something went wrong while logging out.",
  INTERNAL_ERROR: "Internal Server Error"
};

/**
 * Helper function to create standardized API responses
 */
const createResponse = (message, result = 1, metadata = {}, data = {}) => ({
  message,
  result,
  metadata,
  data
});

/**
 * Helper function to handle errors consistently
 */
const handleError = (res, statusCode, message, error = null) => {
  if (error) {
    console.error(`Error: ${message}`, error);
  }
  return res.status(statusCode).json({ message });
};

/**
 * Helper function to normalize email
 */
const normalizeEmail = (email) => email?.toLowerCase().trim();

/**
 * Helper function to create user data object for responses
 */
const createUserData = (user) => ({
  id: user._id,
  name: user.username,
  username: user.username,
  email: user.email,
  role: user.role,
  profileImg: user.profileImg,
  createdAt: user.createdAt
});

/**
 * Helper function to check if tokens are valid and user is already logged in
 */
const checkExistingAuth = async (accessToken, refreshToken) => {
  // Check access token first
  if (accessToken) {
    try {
      jwt.verifyToken(accessToken, "access");
      return { isLoggedIn: true, tokenType: 'access' };
    } catch (error) {
      console.error("Access token invalid:", error.message);
    }
  }

  // Check refresh token if access token is invalid
  if (refreshToken) {
    try {
      jwt.verifyToken(refreshToken, "refresh");
      return { isLoggedIn: true, tokenType: 'refresh' };
    } catch (error) {
      console.error("Refresh token invalid:", error.message);
    }
  }

  return { isLoggedIn: false };
};

/**
 * Register a new user
 */
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Input validation
    if (!username?.trim() || !email?.trim() || !password?.trim()) {
      return handleError(res, HTTP_STATUS.BAD_REQUEST, MESSAGES.ALL_FIELDS_REQUIRED);
    }

    const normalizedEmail = normalizeEmail(email);
    const trimmedUsername = username.trim();

    // Check for existing email
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return handleError(res, HTTP_STATUS.BAD_REQUEST, MESSAGES.EMAIL_IN_USE);
    }

    // Check for existing username
    const existingUsername = await User.findOne({ username: trimmedUsername });
    if (existingUsername) {
      return handleError(res, HTTP_STATUS.BAD_REQUEST, MESSAGES.USERNAME_IN_USE);
    }

    // Hash password
    const hashedPassword = await hash.hashPassword(password);

    // Create new user
    const newUser = new User({
      name: trimmedUsername,
      username: trimmedUsername,
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Handle profile image if provided
    if (req.file) {
      newUser.profileImg = `/uploads/profiles/${req.file.filename}`;
    }

    await newUser.save();

    // Generate tokens
    const accessToken = jwt.generateAccessToken({ id: newUser._id });
    const refreshToken = jwt.generateRefreshToken({ id: newUser._id });

    // Set cookies
    cookieHelper.setAccessTokenCookie(res, accessToken);
    cookieHelper.setRefreshTokenCookie(res, refreshToken);
    
    return res.status(HTTP_STATUS.CREATED).json(
      createResponse(
        MESSAGES.USER_CREATED,
        1,
        { accessToken },
        createUserData(newUser)
      )
    );

  } catch (error) {
    return handleError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.INTERNAL_ERROR, error);
  }
};

/**
 * Login user
 */
exports.login = async (req, res) => {
  try {
    const { accessToken, refreshToken } = req.cookies || {};
    
    // Check if user is already authenticated
    const authCheck = await checkExistingAuth(accessToken, refreshToken);
    if (authCheck.isLoggedIn) {
      return res.status(HTTP_STATUS.OK).json({ 
        message: MESSAGES.ALREADY_LOGGED_IN, 
        loggedIn: true 
      });
    }

    const { email, password } = req.body;
    const remember = req.body.remember === "on";

    // Input validation
    if (!email?.trim() || !password?.trim()) {
      return handleError(res, HTTP_STATUS.BAD_REQUEST, MESSAGES.INVALID_CREDENTIALS);
    }

    const normalizedEmail = normalizeEmail(email);

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: email.trim() }]
    }).select("+password");

    // Validate user and password
    if (!user || !(await hash.comparePassword(password, user.password))) {
      return handleError(res, HTTP_STATUS.BAD_REQUEST, MESSAGES.WRONG_CREDENTIALS);
    }

    // Check if account is active
    if (!user.isActive) {
      return handleError(res, HTTP_STATUS.FORBIDDEN, MESSAGES.ACCOUNT_DEACTIVATED);
    }

    // Generate new access token
    const newAccessToken = jwt.generateAccessToken({ id: user._id });
    cookieHelper.setAccessTokenCookie(res, newAccessToken);

    // Generate refresh token if remember me is checked
    if (remember) {
      const newRefreshToken = jwt.generateRefreshToken({ id: user._id });
      cookieHelper.setRefreshTokenCookie(res, newRefreshToken);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return res.status(HTTP_STATUS.OK).json(
      createResponse(
        MESSAGES.LOGGED_IN_SUCCESS,
        1,
        { accessToken: newAccessToken },
        createUserData(user)
      )
    );

  } catch (error) {
    return handleError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.INTERNAL_ERROR, error);
  }
};

/**
 * Send password reset email
 */
exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return handleError(res, HTTP_STATUS.BAD_REQUEST, MESSAGES.INVALID_EMAIL);
    }

    const normalizedEmail = normalizeEmail(email);

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ username: normalizedEmail }, { email: normalizedEmail }]
    }).select("+email");

    if (!user || !user.email) {
      return handleError(res, HTTP_STATUS.NOT_FOUND, MESSAGES.USER_NOT_FOUND);
    }

    // Generate reset token and link
    const resetToken = jwt.generateResetToken({ id: user._id });
    const resetLink = `${process.env.BASE_URL || 'https://soundwave-api-n480.onrender.com'}/user/reset-password?resetToken=${resetToken}`;

    // Set reset cookie
    cookieHelper.setResetCookie(res, resetToken);

    // Send email
    const emailTitle = "Reset Your Password";
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Hello, ${user.name}!</h1>
        <p style="font-size: 16px;">You requested to reset your password.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">This link will expire in 10 minutes.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `;

    await sendEmail(user.email, emailTitle, emailHtml);

    return res.status(HTTP_STATUS.OK).json(
      createResponse(
        `${MESSAGES.RESET_LINK_SENT} ${user.email}`,
        1,
        { token: resetToken },
        { link: resetLink }
      )
    );

  } catch (error) {
    return handleError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.INTERNAL_ERROR, error);
  }
};

/**
 * Reset user password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const token = req.query?.resetToken || req.cookies?.resetToken || req.body.resetToken;

    if (!token?.trim() || !password?.trim()) {
      return handleError(res, HTTP_STATUS.BAD_REQUEST, MESSAGES.TOKEN_PASSWORD_REQUIRED);
    }

    // Verify reset token
    const decoded = jwt.verifyToken(token, 'reset');
    
    const user = await User.findById(decoded.id).select("+password");
    if (!user) {
      return handleError(res, HTTP_STATUS.NOT_FOUND, MESSAGES.USER_NOT_FOUND);
    }

    // Check if new password is different from current
    if (await hash.comparePassword(password, user.password)) {
      return handleError(res, HTTP_STATUS.BAD_REQUEST, MESSAGES.PASSWORD_SAME);
    }

    // Update password
    user.password = await hash.hashPassword(password);
    await user.save();

    // Clear reset cookie
    cookieHelper.clearResetCookie(res);

    return res.status(HTTP_STATUS.OK).json({ 
      message: MESSAGES.PASSWORD_RESET_SUCCESS 
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return handleError(res, HTTP_STATUS.BAD_REQUEST, MESSAGES.INVALID_TOKEN);
    }
    return handleError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.INTERNAL_ERROR, error);
  }
};

/**
 * Refresh access token using refresh token
 */
exports.refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies || {};
    
    if (!refreshToken) {
      return handleError(res, HTTP_STATUS.UNAUTHORIZED, MESSAGES.NO_REFRESH_TOKEN);
    }

    // Verify refresh token
    const decoded = jwt.verifyToken(refreshToken, 'refresh');
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return handleError(res, HTTP_STATUS.NOT_FOUND, MESSAGES.USER_NOT_FOUND);
    }

    // Generate new access token
    const newAccessToken = jwt.generateAccessToken({ id: user._id });
    cookieHelper.setAccessTokenCookie(res, newAccessToken);

    return res.status(HTTP_STATUS.OK).json(
      createResponse(
        MESSAGES.ACCESS_TOKEN_REFRESHED,
        1,
        { accessToken: newAccessToken },
        {}
      )
    );

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return handleError(res, HTTP_STATUS.FORBIDDEN, MESSAGES.INVALID_REFRESH_TOKEN);
    }
    return handleError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.INTERNAL_ERROR, error);
  }
};

/**
 * Logout user by clearing authentication cookies
 */
exports.logout = async (req, res) => {
  try {
    cookieHelper.clearAuthCookies(res);
    return res.status(HTTP_STATUS.OK).json({ 
      message: MESSAGES.LOGGED_OUT 
    });
  } catch (error) {
    return handleError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.LOGOUT_ERROR, error);
  }
};