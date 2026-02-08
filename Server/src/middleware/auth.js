const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization;

  // Expect: "Bearer <token>"
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id, role, email, iat, exp }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
