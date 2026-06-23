const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5; // 5 requests per minute
const requestsCache = new Map();

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
