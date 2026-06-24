const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5; // 5 requests per minute
const requestsCache = new Map();

// Periodic cleanup of expired rate limit entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestsCache.entries()) {
    if (now > value.resetTime) {
      requestsCache.delete(key);
    }
  }
}, 60 * 1000);

/**
 * Custom in-memory rate limiting middleware.
 * Restricts requests based on req.user._id if available, falling back to req.ip.
 */
export const rateLimiter = (req, res, next) => {
  const key = req.user ? req.user._id.toString() : req.ip;
  const now = Date.now();

  if (!requestsCache.has(key)) {
    requestsCache.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS
    });
    return next();
  }

  const data = requestsCache.get(key);

  if (now > data.resetTime) {
    // Window expired, reset counter and window time
    data.count = 1;
    data.resetTime = now + RATE_LIMIT_WINDOW_MS;
    return next();
  }

  data.count += 1;
  if (data.count > MAX_REQUESTS) {
    const timeLeft = Math.ceil((data.resetTime - now) / 1000);
    return res.status(429).json({
      success: false,
      message: `Too many requests. Please wait ${timeLeft} seconds before generating another question.`
    });
  }

  next();
};

/**
 * In-memory rate limiting middleware for submissions.
 * Restricts code submissions to 10 per minute per user.
 */
export const submissionRateLimiter = (req, res, next) => {
  const key = req.user ? `sub_${req.user._id.toString()}` : `sub_${req.ip}`;
  const now = Date.now();
  const SUBMISSION_WINDOW_MS = 60 * 1000; // 1 minute
  const MAX_SUBMISSIONS = 10; // 10 submissions per minute

  if (!requestsCache.has(key)) {
    requestsCache.set(key, {
      count: 1,
      resetTime: now + SUBMISSION_WINDOW_MS
    });
    return next();
  }

  const data = requestsCache.get(key);

  if (now > data.resetTime) {
    // Window expired, reset counter and window time
    data.count = 1;
    data.resetTime = now + SUBMISSION_WINDOW_MS;
    return next();
  }

  data.count += 1;
  if (data.count > MAX_SUBMISSIONS) {
    const timeLeft = Math.ceil((data.resetTime - now) / 1000);
    return res.status(429).json({
      success: false,
      message: `Too many submissions. Please wait ${timeLeft} seconds before submitting another solution.`
    });
  }

  next();
};

