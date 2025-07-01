exports.verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) return res.status(403).json({ message: "Accès refusé : pas de token" });

  // Split "Bearer <token>"
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(403).json({ message: "Accès refusé : pas de token" });

  try {
    const decoded = require("jsonwebtoken").verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Token invalide" });
  }
};
