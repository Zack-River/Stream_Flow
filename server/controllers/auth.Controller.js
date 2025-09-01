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
  NO_ACCESS_TOKEN: "No access token found!",
  ACCESS_TOKEN_REFRESHED: "Access token refreshed successfully.",
  INVALID_ACCESS_TOKEN: "Invalid or expired access token!",
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
 * Helper function to extract device information from request
 */
const getDeviceInfo = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || '';
  
  // Simple device detection (you might want to use a library like 'ua-parser-js' for better detection)
  let device = 'Unknown';
  let os = 'Unknown';
  let browser = 'Unknown';

  if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
    device = 'Mobile';
  } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
    device = 'Tablet';
  } else {
    device = 'Desktop';
  }

  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';

  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  return { device, os, browser, ip };
};

/**
 * Helper function to check if user is already logged in on this device
 */
const checkExistingAuth = async (accessToken, req) => {
  if (!accessToken) {
    return { isLoggedIn: false };
  }

  try {
    const decoded = jwt.verifyToken(accessToken, "access");
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive) {
      return { isLoggedIn: false };
    }

    const deviceInfo = getDeviceInfo(req);
    
    // Check if there's an active session for this device
    const activeSession = user.sessions.find(session => 
      session.ip === deviceInfo.ip && 
      session.device === deviceInfo.device &&
      session.expires > new Date()
    );

    if (activeSession) {
      return { isLoggedIn: true, user, sessionId: activeSession._id };
    }

    return { isLoggedIn: false };
  } catch (error) {
    console.error("Access token verification failed:", error.message);
    return { isLoggedIn: false };
  }
};

/**
 * Helper function to create or update session
 */
const createOrUpdateSession = async (user, refreshToken, deviceInfo) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Find existing session for this device/IP
  const existingSessionIndex = user.sessions.findIndex(session => 
    session.ip === deviceInfo.ip && 
    session.device === deviceInfo.device
  );

  const sessionData = {
    token: refreshToken,
    expires: expiresAt,
    device: deviceInfo.device,
    os: deviceInfo.os,
    browser: deviceInfo.browser,
    ip: deviceInfo.ip
  };

  if (existingSessionIndex !== -1) {
    // Update existing session
    user.sessions[existingSessionIndex] = sessionData;
  } else {
    // Add new session
    user.sessions.push(sessionData);
  }

  // Clean up expired sessions
  user.sessions = user.sessions.filter(session => session.expires > new Date());
  
  await user.save();
  return sessionData;
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

    // Get device info and create session
    const deviceInfo = getDeviceInfo(req);
    await createOrUpdateSession(newUser, refreshToken, deviceInfo);

    // Set only access token in cookies (refresh token is stored in DB)
    cookieHelper.setAccessTokenCookie(res, accessToken);
    
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
    const { accessToken } = req.cookies || {};
    
    // Check if user is already authenticated on this device
    const authCheck = await checkExistingAuth(accessToken, req);
    if (authCheck.isLoggedIn) {
      return res.status(HTTP_STATUS.OK).json({ 
        message: MESSAGES.ALREADY_LOGGED_IN, 
        loggedIn: true,
        data: createUserData(authCheck.user)
      });
    }

    const { email, password } = req.body;
    const remember = req.body.remember === "on" || req.body.remember === true;

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
    
    // Only set access token in cookies
    cookieHelper.setAccessTokenCookie(res, newAccessToken);

    // Create session with refresh token if remember me is checked
    if (remember) {
      const refreshToken = jwt.generateRefreshToken({ id: user._id });
      const deviceInfo = getDeviceInfo(req);
      await createOrUpdateSession(user, refreshToken, deviceInfo);
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
 * Reset user password - this will invalidate all sessions
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

    // Update password and clear all sessions (security measure)
    user.password = await hash.hashPassword(password);
    user.sessions = []; // Clear all sessions when password is reset
    await user.save();

    // Clear reset cookie and access token
    cookieHelper.clearResetCookie(res);
    cookieHelper.clearAccessTokenCookie(res);

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
 * Refresh access token using device session
 */
exports.refreshAccessToken = async (req, res) => {
  try {
    const { accessToken } = req.cookies || {};
    
    if (!accessToken) {
      return handleError(res, HTTP_STATUS.UNAUTHORIZED, MESSAGES.NO_ACCESS_TOKEN);
    }

    let decoded;
    try {
      decoded = jwt.verifyToken(accessToken, 'access');
    } catch (error) {
      return handleError(res, HTTP_STATUS.UNAUTHORIZED, MESSAGES.INVALID_ACCESS_TOKEN);
    }
    
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return handleError(res, HTTP_STATUS.NOT_FOUND, MESSAGES.USER_NOT_FOUND);
    }

    const deviceInfo = getDeviceInfo(req);
    
    // Find active session for this device
    const activeSession = user.sessions.find(session => 
      session.ip === deviceInfo.ip && 
      session.device === deviceInfo.device &&
      session.expires > new Date()
    );

    if (!activeSession) {
      return handleError(res, HTTP_STATUS.FORBIDDEN, MESSAGES.INVALID_ACCESS_TOKEN);
    }

    // Verify the refresh token from the session
    try {
      jwt.verifyToken(activeSession.token, 'refresh');
    } catch (error) {
      // Remove invalid session
      user.sessions = user.sessions.filter(s => s._id.toString() !== activeSession._id.toString());
      await user.save();
      return handleError(res, HTTP_STATUS.FORBIDDEN, MESSAGES.INVALID_ACCESS_TOKEN);
    }

    // Generate new access token
    const newAccessToken = jwt.generateAccessToken({ id: user._id });
    cookieHelper.setAccessTokenCookie(res, newAccessToken);

    // Update session expiry
    activeSession.expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    return res.status(HTTP_STATUS.OK).json(
      createResponse(
        MESSAGES.ACCESS_TOKEN_REFRESHED,
        1,
        { accessToken: newAccessToken },
        {}
      )
    );

  } catch (error) {
    return handleError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.INTERNAL_ERROR, error);
  }
};

/**
 * Logout user from current device only
 */
exports.logout = async (req, res) => {
  try {
    const { accessToken } = req.cookies || {};
    
    if (accessToken) {
      try {
        const decoded = jwt.verifyToken(accessToken, 'access');
        const user = await User.findById(decoded.id);
        
        if (user) {
          const deviceInfo = getDeviceInfo(req);
          
          // Remove session for this specific device
          user.sessions = user.sessions.filter(session => 
            !(session.ip === deviceInfo.ip && session.device === deviceInfo.device)
          );
          
          await user.save();
        }
      } catch (error) {
        console.error("Error during logout session cleanup:", error.message);
      }
    }

    // Clear access token cookie
    cookieHelper.clearAccessTokenCookie(res);
    
    return res.status(HTTP_STATUS.OK).json({ 
      message: MESSAGES.LOGGED_OUT 
    });
    
  } catch (error) {
    return handleError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.LOGOUT_ERROR, error);
  }
};

/**
 * Logout from all devices
 */
exports.logoutAllDevices = async (req, res) => {
  try {
    const { accessToken } = req.cookies || {};
    
    if (!accessToken) {
      return handleError(res, HTTP_STATUS.UNAUTHORIZED, MESSAGES.NO_ACCESS_TOKEN);
    }

    const decoded = jwt.verifyToken(accessToken, 'access');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return handleError(res, HTTP_STATUS.NOT_FOUND, MESSAGES.USER_NOT_FOUND);
    }

    // Clear all sessions
    user.sessions = [];
    await user.save();

    // Clear access token cookie
    cookieHelper.clearAccessTokenCookie(res);
    
    return res.status(HTTP_STATUS.OK).json({ 
      message: "Logged out from all devices successfully." 
    });
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return handleError(res, HTTP_STATUS.UNAUTHORIZED, MESSAGES.INVALID_ACCESS_TOKEN);
    }
    return handleError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.LOGOUT_ERROR, error);
  }
};

/**
 * Get active sessions for current user
 */
exports.getActiveSessions = async (req, res) => {
  try {
    const { accessToken } = req.cookies || {};
    
    if (!accessToken) {
      return handleError(res, HTTP_STATUS.UNAUTHORIZED, MESSAGES.NO_ACCESS_TOKEN);
    }

    const decoded = jwt.verifyToken(accessToken, 'access');
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive) {
      return handleError(res, HTTP_STATUS.NOT_FOUND, MESSAGES.USER_NOT_FOUND);
    }

    // Filter out expired sessions and clean them up
    const activeSessions = user.sessions.filter(session => session.expires > new Date());
    
    // Update user if expired sessions were found
    if (activeSessions.length !== user.sessions.length) {
      user.sessions = activeSessions;
      await user.save();
    }

    // Return sessions without the actual tokens for security
    const sessionData = activeSessions.map(session => ({
      id: session._id,
      device: session.device,
      os: session.os,
      browser: session.browser,
      ip: session.ip,
      expires: session.expires,
      isCurrentDevice: session.ip === getDeviceInfo(req).ip && session.device === getDeviceInfo(req).device
    }));

    return res.status(HTTP_STATUS.OK).json(
      createResponse(
        "Active sessions retrieved successfully.",
        1,
        { totalSessions: sessionData.length },
        { sessions: sessionData }
      )
    );

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return handleError(res, HTTP_STATUS.UNAUTHORIZED, MESSAGES.INVALID_ACCESS_TOKEN);
    }
    return handleError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.INTERNAL_ERROR, error);
  }
};

/**
 * Logout from specific device/session
 */
exports.logoutDevice = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { accessToken } = req.cookies || {};
    
    if (!accessToken) {
      return handleError(res, HTTP_STATUS.UNAUTHORIZED, MESSAGES.NO_ACCESS_TOKEN);
    }

    const decoded = jwt.verifyToken(accessToken, 'access');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return handleError(res, HTTP_STATUS.NOT_FOUND, MESSAGES.USER_NOT_FOUND);
    }

    // Remove specific session
    const initialSessionCount = user.sessions.length;
    user.sessions = user.sessions.filter(session => session._id.toString() !== sessionId);
    
    if (user.sessions.length === initialSessionCount) {
      return handleError(res, HTTP_STATUS.NOT_FOUND, "Session not found!");
    }

    await user.save();
    
    return res.status(HTTP_STATUS.OK).json({ 
      message: "Device logged out successfully." 
    });
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return handleError(res, HTTP_STATUS.UNAUTHORIZED, MESSAGES.INVALID_ACCESS_TOKEN);
    }
    return handleError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.LOGOUT_ERROR, error);
  }
};