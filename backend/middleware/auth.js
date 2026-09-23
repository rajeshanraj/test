module.exports = function (req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.replace("Bearer ", "");
  if (token === process.env.ADMIN_TOKEN) {
    return next();
  }

  return res.status(403).json({ success: false, message: "Invalid or expired token" });
};