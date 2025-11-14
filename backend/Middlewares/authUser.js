const jwt = require("jsonwebtoken");

const authUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "JWT not found" });
    }

    const token = authHeader.split(" ")[1];
    const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!verifiedToken) {
      return res.status(401).json({ error: "User not authorized" });
    }
    req.user = verifiedToken.id;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ error: "User authorization failed" });
  }
};

module.exports = authUser;
