const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "hw-pos-secret-change-in-production";

function generateToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, role: "admin" },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

function verifyToken(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) {
    return res.status(401).json({ error: "No authorization header" });
  }
  const token = header.startsWith("Bearer ") ? header.slice(7) : header;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { generateToken, verifyToken, JWT_SECRET };
