const jwt = require('jsonwebtoken');

/**
 * Middleware: Verifies JWT token AND checks isAdmin flag.
 * Must be used AFTER authMiddleware or standalone on admin routes.
 */
const adminMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

module.exports = adminMiddleware;
