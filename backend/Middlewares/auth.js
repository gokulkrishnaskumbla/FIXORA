const jwt = require("jsonwebtoken");

/**
 * Unified authentication middleware
 * Checks token from Authorization header and verifies role
 * 
 * @param {string|string[]} allowedRoles - Role(s) allowed to access the route
 * @returns {Function} Express middleware function
 */
const authenticate = (allowedRoles = ["user", "admin"]) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "JWT not found. Please provide a valid token." });
      }

      const token = authHeader.split(" ")[1];

      // Verify token
      const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);

      if (!verifiedToken || !verifiedToken.id) {
        return res.status(401).json({ error: "Invalid token" });
      }

      // Convert single role to array for consistent checking
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      // Check if user's role is allowed
      if (!roles.includes(verifiedToken.role)) {
        return res.status(403).json({ 
          error: `Access denied. Required role: ${roles.join(" or ")}` 
        });
      }

      // Attach user info to request
      // Set req.user as object for backward compatibility with existing controllers
      req.user = {
        _id: verifiedToken.id,
        id: verifiedToken.id, // Also available as .id for convenience
        role: verifiedToken.role
      };
      req.userRole = verifiedToken.role; // Also available separately
      req.token = verifiedToken; // Full token if needed

      next();
    } catch (error) {
      console.error("Auth error:", error.message);
      
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token has expired. Please login again." });
      }
      
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ error: "Invalid token" });
      }

      return res.status(401).json({ error: "Authorization failed" });
    }
  };
};

/**
 * Convenience middleware for routes that should be accessible by any authenticated
 * non-admin role (including providers). Historically this was restricted to
 * the literal 'user' role which caused providers (role: 'provider') to be
 * rejected with "Required role: user". Allow user, provider and admin here to
 * avoid those access-denied errors while preserving admin-only guards via
 * `authAdmin` where needed.
 */
const authUser = authenticate(["user", "provider", "admin"]);

/**
 * Convenience middleware for admin-only routes
 */
const authAdmin = authenticate("admin");

/**
 * Middleware for routes accessible by both users and admins
 */
const authUserOrAdmin = authenticate(["user", "admin"]);

/**
 * Middleware for provider routes (providers are users with provider profile)
 */
const authProvider = authenticate(["user", "provider"]);

module.exports = {
  authenticate,
  authUser,
  authAdmin,
  authUserOrAdmin,
  authProvider,
};

/**
 * Middleware that ensures authenticated user has a verified provider profile.
 * Uses the authenticate middleware first to populate req.user, then checks the
 * Provider collection for a matching profile with verificationStatus === 'verified'.
 */
const Provider = require("../Models/providerModel");

const authVerifiedProvider = (req, res, next) => {
  // First run the standard auth (user/provider/admin allowed)
  authenticate(["user", "provider"])(req, res, async () => {
    try {
      const userId = req.user && (req.user._id || req.user.id);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const provider = await Provider.findOne({ user: userId });
      if (!provider) return res.status(403).json({ error: "Provider profile not found" });

      if (provider.verificationStatus !== "verified") {
        return res.status(403).json({ error: "Provider not verified by admin" });
      }

      // attach provider to request for downstream handlers
      req.provider = provider;
      next();
    } catch (error) {
      console.error("authVerifiedProvider error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
};

module.exports.authVerifiedProvider = authVerifiedProvider;

