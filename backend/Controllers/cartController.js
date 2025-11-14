const cartDb = require("../Models/cartModel");
const serviceDb = require("../Models/serviceModel");

const addToCart = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const userId = req.user._id || req.user;
    const serviceId = req.params.serviceId;

    console.log("🛒 addToCart called:", { userId, serviceId, userRole: req.userRole });

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. Please login first." });
    }

    if (!serviceId) {
      return res.status(400).json({ error: "Service ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ error: `Invalid service ID format: ${serviceId}` });
    }

    const serviceObjectId = new mongoose.Types.ObjectId(serviceId);

    const service = await serviceDb.findById(serviceObjectId);
    if (!service) {
      return res.status(404).json({ error: `Service not found with ID: ${serviceId}` });
    }

    console.log("✅ Service found:", service.title);

    let cart = await cartDb.findOne({ userId });
    if (!cart) {
      cart = new cartDb({ userId, services: [], totalPrice: 0 });
      console.log("🆕 New cart created for user:", userId);
    } else {
      console.log("📦 Existing cart found with", cart.services.length, "items");
    }

    const serviceAlreadyExist = cart.services.some((item) => {
      if (!item.serviceId) return false;

      const itemIdStr = item.serviceId.toString();
      const serviceIdStr = serviceObjectId.toString();
      
      return itemIdStr === serviceIdStr;
    });

    if (serviceAlreadyExist) {
      console.log("⚠️ Service already in cart");
      return res.status(400).json({ 
        error: "Service already in cart",
        message: "This service is already in your cart"
      });
    }

    cart.services.push({
      serviceId: serviceObjectId,
      price: service.price,
    });

    cart.totalPrice = cart.services.reduce((sum, item) => sum + (item.price || 0), 0);

    await cart.save();
    console.log("✅ Service added to cart successfully. Cart total:", cart.totalPrice);
    
    res.status(200).json({ 
      message: "Added to cart successfully", 
      cart: {
        _id: cart._id,
        userId: cart.userId,
        services: cart.services,
        totalPrice: cart.totalPrice
      }
    });
  } catch (error) {
    console.error("❌ addToCart Error:", error);
    console.error("Error details:", {
      message: error.message,
      name: error.name,
      code: error.code,
      keyValue: error.keyValue
    });

    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: `Invalid ID format: ${error.message}`,
        details: "Please provide a valid service ID"
      });
    }

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({ 
        error: `Validation error: ${validationErrors}`,
        details: error.message
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({ 
        error: "Duplicate entry",
        details: "This service is already in your cart"
      });
    }

    res.status(500).json({ 
      error: error.message || "Internal Server Error",
      details: "An unexpected error occurred while adding to cart"
    });
  }
};

// Get user's cart with populated service details
const getMyCart = async (req, res) => {
  try {
    const userId = req.user._id || req.user;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. Please login first." });
    }

    let cart = await cartDb.findOne({ userId }).populate({
      path: 'services.serviceId',
      model: 'Service'
    });

    if (!cart) {
      return res.status(200).json({ 
        message: "Cart is empty",
        cart: {
          services: [],
          totalPrice: 0
        }
      });
    }

    if (cart.services.length === 0) {
      return res.status(200).json({ 
        message: "Cart is empty",
        cart: {
          _id: cart._id,
          userId: cart.userId,
          services: [],
          totalPrice: 0
        }
      });
    }

    // Recalculate total price
    cart.totalPrice = cart.services.reduce((sum, item) => sum + (item.price || 0), 0);
    await cart.save();

    res.status(200).json({ 
      message: "Cart retrieved successfully",
      cart: {
        _id: cart._id,
        userId: cart.userId,
        services: cart.services,
        totalPrice: cart.totalPrice
      }
    });
  } catch (error) {
    console.error("❌ getMyCart Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

// Remove service from cart
const removeFromCart = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const userId = req.user._id || req.user;
    const serviceId = req.params.serviceId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. Please login first." });
    }

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ error: "Invalid service ID" });
    }

    const cart = await cartDb.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Remove service from cart
    cart.services = cart.services.filter((item) => {
      const itemIdStr = item.serviceId?.toString() || item.serviceId;
      return itemIdStr !== serviceId;
    });

    // Recalculate total price
    cart.totalPrice = cart.services.reduce((sum, item) => sum + (item.price || 0), 0);

    await cart.save();

    res.status(200).json({ 
      message: "Service removed from cart successfully",
      cart: {
        _id: cart._id,
        userId: cart.userId,
        services: cart.services,
        totalPrice: cart.totalPrice
      }
    });
  } catch (error) {
    console.error("❌ removeFromCart Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

// Clear entire cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user._id || req.user;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. Please login first." });
    }

    const cart = await cartDb.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    cart.services = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json({ 
      message: "Cart cleared successfully",
      cart: {
        _id: cart._id,
        userId: cart.userId,
        services: [],
        totalPrice: 0
      }
    });
  } catch (error) {
    console.error("❌ clearCart Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

module.exports = { addToCart, getMyCart, removeFromCart, clearCart };
