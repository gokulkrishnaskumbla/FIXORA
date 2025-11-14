const userDb = require("../Models/userModel");
const Provider = require("../Models/providerModel");
const { createToken } = require("../Utilities/generateToken");
const { hashPassword, comparePassword } = require("../Utilities/passwordUtilities");

const register = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const emailExist = await userDb.findOne({ email });
    if (emailExist) return res.status(400).json({ error: "Email already exists" });

    const phoneExist = await userDb.findOne({ phone });
    if (phoneExist) return res.status(400).json({ error: "Phone number already exists" });

    const hashedPassword = await hashPassword(password);
    const newUser = new userDb({ name, email, phone, password: hashedPassword });
    const saved = await newUser.save();

    if (saved) {
      const token = createToken(saved._id, "user");
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });

      const { password: pwd, ...userData } = saved._doc;

      return res.status(201).json({
        message: "User created successfully",
        token,
        role: "user",
        user: userData,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "All fields are required" });

    const userExist = await userDb.findOne({ email });
    if (!userExist) return res.status(400).json({ error: "User not found" });

    const passwordMatch = await comparePassword(password, userExist.password);
    if (!passwordMatch)
      return res.status(400).json({ error: "Invalid password" });

    const providerProfile = await Provider.findOne({ user: userExist._id });
    const role = providerProfile ? "provider" : "user";

    const token = createToken(userExist._id, role);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    const { password: pwd, ...userData } = userExist._doc;

    return res.status(200).json({
      message: "User login successful",
      token,
      role,
      user: userData,
      provider: providerProfile || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

const logout = (req, res) => {
  try {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Logout failed" });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await userDb.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

module.exports = { register, login, logout, getAllUsers };
