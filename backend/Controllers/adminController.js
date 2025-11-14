const adminDb = require("../Models/adminModel");
const userDb = require("../Models/userModel");
const { hashPassword, comparePassword } = require("../Utilities/passwordUtilities")
const { createToken } = require("../Utilities/generateToken");

const register = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ error: "All fields are required" })
        }
        const alreadyExist = await userDb.findOne({ email })
        if (alreadyExist) {
            return res.status(400).json({ error: "Email already exist" })
        }
        const hashedPassword = await hashPassword(password)
        const newAdmin = new adminDb({
            email, password: hashedPassword
        })
        const saved = await newAdmin.save();
        if (saved) {
            return res.status(200).json({ message: "Admin created", saved })
        }

    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" })

    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ error: "All fields are required" })
        }
        const adminExist = await adminDb.findOne({ email })
        if (!adminExist) {
            return res.status(400).json({ error: "User not found" })
        }

        const passwordMatch = await comparePassword(password, adminExist.password)
        console.log(passwordMatch)
        if (!passwordMatch) {
            return res.status(400).json({ error: "passwords does not match" })
        }
        const token = createToken(adminExist._id, "admin")
        
        // Set cookie for backward compatibility (optional)
        res.cookie("Admin_token", token, {
          httpOnly: true,
          sameSite: "strict",
          maxAge: 24 * 60 * 60 * 1000,
        })

        return res.status(200).json({ 
          message: "admin login successfull", 
          token, // Return token for header-based auth
          admin: adminExist 
        })
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" })
    }
}

const logout = async (req, res) => {
    try {
        res.clearCookie("Admin_token")
        res.status(200).json({ message: 'logout successfull' })
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" })
    }
}

// Provider Verification Functions
const Provider = require("../Models/providerModel");
const Notification = require("../Models/notificationModel");

// Get All Pending Providers
const getPendingProviders = async (req, res) => {
    try {
        const providers = await Provider.find({ verificationStatus: "pending" })
            .populate("user", "name email phone")
            .populate("services", "title")
            .sort({ createdAt: -1 });

        res.json({ success: true, providers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Providers
const getAllProviders = async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { verificationStatus: status } : {};
        
        const providers = await Provider.find(query)
            .populate("user", "name email phone")
            .populate("services", "title")
            .sort({ createdAt: -1 });

        res.json({ success: true, providers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Verify Provider
const verifyProvider = async (req, res) => {
    try {
        const { providerId } = req.params;
        const { status, notes } = req.body; // status: "verified" or "rejected"

        if (!["verified", "rejected"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const provider = await Provider.findById(providerId);
        if (!provider) {
            return res.status(404).json({ error: "Provider not found" });
        }

        provider.verificationStatus = status;
        provider.verificationNotes = notes || "";
        await provider.save();

        // Create notification for provider
        await Notification.create({
            user: provider.user,
            userModel: "Provider",
            type: status === "verified" ? "provider_verified" : "provider_rejected",
            title: status === "verified" ? "Provider Verified" : "Provider Verification Rejected",
            message: status === "verified" 
                ? "Your provider account has been verified. You can now accept service requests."
                : `Your provider verification was rejected. ${notes || ""}`,
            relatedId: provider._id,
        });

        res.json({ 
            success: true, 
            message: `Provider ${status} successfully`,
            provider 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Provider Details
const getProviderDetails = async (req, res) => {
    try {
        const { providerId } = req.params;
        
        const provider = await Provider.findById(providerId)
            .populate("user", "name email phone")
            .populate("services", "title description price");

        if (!provider) {
            return res.status(404).json({ error: "Provider not found" });
        }

        res.json({ success: true, provider });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Analytics/Reports
const getAnalytics = async (req, res) => {
    try {
        const ServiceRequest = require("../Models/serviceRequestModel");
        const Booking = require("../Models/bookingModel");
        const Service = require("../Models/serviceModel");

        // Total providers
        const totalProviders = await Provider.countDocuments();
        const verifiedProviders = await Provider.countDocuments({ verificationStatus: "verified" });
        const pendingProviders = await Provider.countDocuments({ verificationStatus: "pending" });

        // Total service requests
        const totalRequests = await ServiceRequest.countDocuments();
        const completedRequests = await ServiceRequest.countDocuments({ status: "completed" });
        const pendingRequests = await ServiceRequest.countDocuments({ status: "pending" });

        // Total bookings (old system)
        const totalBookings = await Booking.countDocuments();
        const completedBookings = await Booking.countDocuments({ status: "completed" });

        // Total services
        const totalServices = await Service.countDocuments();

        // Revenue
        const completedServiceRequests = await ServiceRequest.find({ 
            status: "completed", 
            paymentStatus: "paid" 
        });
        const serviceRequestRevenue = completedServiceRequests.reduce(
            (sum, req) => sum + (req.totalAmount || 0), 
            0
        );

        const completedBookingsList = await Booking.find({ 
            status: "completed", 
            paymentStatus: "paid" 
        });
        const bookingRevenue = completedBookingsList.reduce(
            (sum, booking) => sum + (booking.totalAmount || 0), 
            0
        );

        const totalRevenue = serviceRequestRevenue + bookingRevenue;

        // Service trends
        const serviceTrends = await ServiceRequest.aggregate([
            {
                $group: {
                    _id: "$service",
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);

        res.json({
            success: true,
            analytics: {
                providers: {
                    total: totalProviders,
                    verified: verifiedProviders,
                    pending: pendingProviders,
                },
                requests: {
                    total: totalRequests,
                    completed: completedRequests,
                    pending: pendingRequests,
                },
                bookings: {
                    total: totalBookings,
                    completed: completedBookings,
                },
                services: {
                    total: totalServices,
                },
                revenue: {
                    total: totalRevenue,
                    fromRequests: serviceRequestRevenue,
                    fromBookings: bookingRevenue,
                },
                serviceTrends,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { 
    register, 
    login, 
    logout,
    getPendingProviders,
    getAllProviders,
    verifyProvider,
    getProviderDetails,
    getAnalytics,
}