import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper function to generate JWT
export const generateToken = (id, jwtVersion = 0) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined.');
  }
  return jwt.sign({ id, jwtVersion }, secret, {
    expiresIn: '7d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, college, role } = req.body;

    // Validate inputs
    if (!name || !email || !password || !college) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, college',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please login instead.',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      college,
      role: role || 'student',
    });

    if (user) {
      const token = generateToken(user._id, user.jwtVersion || 0);

      // Return user without password
      const userObj = user.toObject();
      delete userObj.password;

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: userObj,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user data',
      });
    }
  } catch (error) {
    console.error('Registration error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

/**
 * @desc    Authenticate a user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate presence of email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Query user and explicitly select password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account not found.',
      });
    }

    // Check if password matches (if user signed up via OAuth, password may not be set)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google or GitHub sign-in. Please log in using the correct social button.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id, user.jwtVersion || 0);

    // Return user details without password field
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userObj,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    // req.user is already set by protect middleware
    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching user profile',
    });
  }
};

/**
 * @desc    Redirect to Google OAuth consent screen
 * @route   GET /api/auth/google
 * @access  Public
 */
export const googleAuthRedirect = (req, res) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL;

  if (!googleClientId || !callbackUrl) {
    console.error('Google OAuth client configuration missing.');
    return res.status(500).json({
      success: false,
      message: 'Google OAuth configuration is missing on the server.',
    });
  }

  const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(
    callbackUrl
  )}&response_type=code&scope=profile%20email&prompt=select_account`;

  res.redirect(googleUrl);
};

/**
 * @desc    Handle Google OAuth callback and token exchange
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
export const googleAuthCallback = async (req, res) => {
  const { code, error: queryError } = req.query;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  if (queryError || !code) {
    console.error('Google OAuth callback error or missing code:', queryError);
    return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(queryError || 'Google authentication failed')}`);
  }

  try {
    // Exchange Auth Code for Access Token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Failed to exchange Google OAuth code: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // Fetch Google User Profile
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to retrieve Google profile data.');
    }

    const profileData = await profileResponse.json();
    const { id: googleId, email, name, picture } = profileData;

    if (!email) {
      throw new Error('Google account is missing an email address.');
    }

    // Authenticate / Link / Create User
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Link Google OAuth if user matches by email but hasn't linked Google yet
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user (college default placeholder since it's OAuth)
      user = await User.create({
        name: name || 'Google User',
        email,
        googleId,
        college: 'Google Authenticated',
        role: 'student',
      });
    }

    // Generate JWT
    const token = generateToken(user._id, user.jwtVersion || 0);

    // Redirect to frontend callback page
    res.redirect(`${clientUrl}/oauth-success?token=${token}`);
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect(`${clientUrl}/login?error=${encodeURIComponent(error.message || 'Google OAuth internal error')}`);
  }
};

/**
 * @desc    Redirect to GitHub OAuth screen
 * @route   GET /api/auth/github
 * @access  Public
 */
export const githubAuthRedirect = (req, res) => {
  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const callbackUrl = process.env.GITHUB_CALLBACK_URL;

  if (!githubClientId || !callbackUrl) {
    console.error('GitHub OAuth configuration is missing.');
    return res.status(500).json({
      success: false,
      message: 'GitHub OAuth configuration is missing on the server.',
    });
  }

  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${encodeURIComponent(
    callbackUrl
  )}&scope=user:email`;

  res.redirect(githubUrl);
};

/**
 * @desc    Handle GitHub OAuth callback and token exchange
 * @route   GET /api/auth/github/callback
 * @access  Public
 */
export const githubAuthCallback = async (req, res) => {
  const { code, error: queryError } = req.query;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  if (queryError || !code) {
    console.error('GitHub OAuth callback error or missing code:', queryError);
    return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(queryError || 'GitHub authentication failed')}`);
  }

  try {
    // Exchange Auth Code for Access Token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        code,
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Failed to exchange GitHub OAuth code: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    if (!access_token) {
      throw new Error('Access token was not returned by GitHub.');
    }

    // Fetch GitHub User Profile
    const profileResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'User-Agent': 'PrepSphere-AI-Backend',
      },
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to retrieve GitHub profile data.');
    }

    const profileData = await profileResponse.json();
    const githubId = String(profileData.id);
    const name = profileData.name || profileData.login;
    let email = profileData.email;

    // Fetch primary email if user profile has private email
    if (!email) {
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'User-Agent': 'PrepSphere-AI-Backend',
        },
      });

      if (emailsResponse.ok) {
        const emailsData = await emailsResponse.json();
        const primaryEmailObj = emailsData.find((e) => e.primary && e.verified);
        email = primaryEmailObj ? primaryEmailObj.email : (emailsData[0] ? emailsData[0].email : null);
      }
    }

    if (!email) {
      throw new Error('GitHub account must have a verified public or primary email address.');
    }

    // Authenticate / Link / Create User
    let user = await User.findOne({ $or: [{ githubId }, { email }] });

    if (user) {
      // Link GitHub account if user exists by email but hasn't linked GitHub yet
      if (!user.githubId) {
        user.githubId = githubId;
        await user.save();
      }
    } else {
      // Create new user (college default placeholder since it's OAuth)
      user = await User.create({
        name: name || 'GitHub User',
        email,
        githubId,
        college: 'GitHub Authenticated',
        role: 'student',
      });
    }

    // Generate JWT
    const token = generateToken(user._id, user.jwtVersion || 0);

    // Redirect to frontend callback page
    res.redirect(`${clientUrl}/oauth-success?token=${token}`);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.redirect(`${clientUrl}/login?error=${encodeURIComponent(error.message || 'GitHub OAuth internal error')}`);
  }
};
