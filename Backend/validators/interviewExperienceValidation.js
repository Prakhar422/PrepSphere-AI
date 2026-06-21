/**
 * Interview Experiences Validation Middlewares
 */

export const validateInterviewExperience = (req, res, next) => {
  const {
    company,
    role,
    interviewType,
    package: packageAmt,
    college,
    graduationYear,
    difficulty,
    overallExperience,
    result,
  } = req.body;

  // Reject empty submissions or missing required fields
  if (!company || !String(company).trim()) {
    return res.status(400).json({ success: false, message: 'Company is required' });
  }
  if (!role || !String(role).trim()) {
    return res.status(400).json({ success: false, message: 'Role is required' });
  }
  if (!interviewType || !['Internship', 'Full Time', 'On Campus', 'Off Campus'].includes(interviewType)) {
    return res.status(400).json({ success: false, message: 'Valid interview type is required' });
  }
  if (!difficulty || !['Easy', 'Medium', 'Hard'].includes(difficulty)) {
    return res.status(400).json({ success: false, message: 'Valid difficulty level is required' });
  }
  if (!overallExperience || !String(overallExperience).trim()) {
    return res.status(400).json({ success: false, message: 'Overall experience is required' });
  }
  if (!result || !['Selected', 'Rejected', 'Waiting'].includes(result)) {
    return res.status(400).json({ success: false, message: 'Valid interview result is required' });
  }

  // Length constraints
  const trimmedCompany = String(company).trim();
  if (trimmedCompany.length > 100) {
    return res.status(400).json({ success: false, message: 'Company name must not exceed 100 characters' });
  }

  const trimmedRole = String(role).trim();
  if (trimmedRole.length > 100) {
    return res.status(400).json({ success: false, message: 'Role must not exceed 100 characters' });
  }

  const trimmedOverall = String(overallExperience).trim();
  if (trimmedOverall.length < 50) {
    return res.status(400).json({ success: false, message: 'Overall experience description must be at least 50 characters long' });
  }
  if (trimmedOverall.length > 10000) {
    return res.status(400).json({ success: false, message: 'Overall experience description must not exceed 10000 characters' });
  }

  // Package verification (optional, must be positive if supplied)
  if (packageAmt !== undefined && packageAmt !== null && packageAmt !== '') {
    const pkgNum = Number(packageAmt);
    if (isNaN(pkgNum) || pkgNum < 0) {
      return res.status(400).json({ success: false, message: 'Package must be a positive number' });
    }
    req.body.package = pkgNum;
  } else {
    req.body.package = undefined;
  }

  // Graduation year verification (optional, must be valid year between 1900 and 2100)
  if (graduationYear !== undefined && graduationYear !== null && graduationYear !== '') {
    const gradInt = parseInt(graduationYear, 10);
    if (isNaN(gradInt) || gradInt < 1900 || gradInt > 2100) {
      return res.status(400).json({ success: false, message: 'Graduation year must be between 1900 and 2100' });
    }
    req.body.graduationYear = gradInt;
  } else {
    req.body.graduationYear = undefined;
  }

  // Helper to sanitize text from html tags to prevent XSS
  const sanitizeText = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/<[^>]*>/g, '') // strip HTML tags
      .trim();
  };

  // Sanitize all text inputs
  req.body.company = sanitizeText(company);
  req.body.role = sanitizeText(role);
  if (college) req.body.college = sanitizeText(college);
  if (req.body.onlineAssessment) req.body.onlineAssessment = sanitizeText(req.body.onlineAssessment);
  if (req.body.technicalRound1) req.body.technicalRound1 = sanitizeText(req.body.technicalRound1);
  if (req.body.technicalRound2) req.body.technicalRound2 = sanitizeText(req.body.technicalRound2);
  if (req.body.technicalRound3) req.body.technicalRound3 = sanitizeText(req.body.technicalRound3);
  if (req.body.hrRound) req.body.hrRound = sanitizeText(req.body.hrRound);
  if (req.body.preparationTips) req.body.preparationTips = sanitizeText(req.body.preparationTips);
  req.body.overallExperience = sanitizeText(overallExperience);

  // Sanitize tags
  if (Array.isArray(req.body.tags)) {
    req.body.tags = req.body.tags
      .map(tag => sanitizeText(tag))
      .filter(tag => tag.length > 0);
  } else {
    req.body.tags = [];
  }

  next();
};
