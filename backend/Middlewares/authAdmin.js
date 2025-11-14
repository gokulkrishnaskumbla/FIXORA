const jwt = require("jsonwebtoken");

const authAdmin = (req, res, next) => {
  try {
    const { Admin_token } = req.cookies;

    if (!Admin_token) {
      return res.status(401).json({ error: "Admin JWT not found" });
    }
    const verifiedToken = jwt.verify(Admin_token, process.env.JWT_SECRET);

    if (!verifiedToken) {
      return res.status(401).json({ error: "Admin not authorized" });
    }
    if (verifiedToken.role !== "admin") {
      return res.status(403).json({ error: "Access denied — admin only" });
    }
    req.admin = verifiedToken.id;
    next();
  } catch (error) {
    console.error("Admin Auth Error:", error);
    res
      .status(401)
      .json({ error: error.message || "Admin authorization failed" });
  }
};

module.exports = authAdmin;
