/**
 * Settings Validation Middlewares
 */

export const validateProfileUpdate = (req, res, next) => {
  let { name, college, degree, graduationYear, branch, bio } = req.body;

  // Trim inputs
  name = name ? name.trim() : '';
  college = college ? college.trim() : '';
  degree = degree ? degree.trim() : '';
  graduationYear = graduationYear ? graduationYear.trim() : '';
  branch = branch ? branch.trim() : '';
  bio = bio ? bio.trim() : '';

  // Update req.body with trimmed values
  req.body.name = name;
  req.body.college = college;
  req.body.degree = degree;
  req.body.graduationYear = graduationYear;
  req.body.branch = branch;
  req.body.bio = bio;

  // Validate Name
  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Name is required and cannot be empty',
    });
  }

  // Validate College
  if (!college) {
    return res.status(400).json({
      success: false,
      message: 'College is required and cannot be empty',
    });
  }

  // Validate Branch
  if (!branch) {
    return res.status(400).json({
      success: false,
      message: 'Branch is required and cannot be empty',
    });
  }

  // Validate Graduation Year (must be a valid 4 digit year between 1900 and 2100)
  const gradYearInt = parseInt(graduationYear, 10);
  const gradYearRegex = /^\d{4}$/;
  if (!graduationYear || !gradYearRegex.test(graduationYear) || isNaN(gradYearInt) || gradYearInt < 1900 || gradYearInt > 2100) {
    return res.status(400).json({
      success: false,
      message: 'Graduation year must be a valid 4-digit year between 1900 and 2100',
    });
  }

  next();
};

export const validatePasswordChange = (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password is required',
    });
  }

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 8 characters long',
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Confirm password must match the new password',
    });
  }

  next();
};

export const validateEmailChange = (req, res, next) => {
  const { password, newEmail } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Current password is required to change email',
    });
  }

  // Validate email format
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!newEmail || !emailRegex.test(newEmail.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid new email address',
    });
  }

  req.body.newEmail = newEmail.trim().toLowerCase();
  next();
};
