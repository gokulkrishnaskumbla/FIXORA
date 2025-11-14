const { 
    register, 
    login, 
    logout,
    getPendingProviders,
    getAllProviders,
    verifyProvider,
    getProviderDetails,
    getAnalytics,
} = require('../../Controllers/adminController')
const { authAdmin } = require('../../Middlewares/auth')

const adminRouter=require('express').Router()

adminRouter.post("/register",register)
adminRouter.post("/login",login)
adminRouter.post("/logout",logout)

// Provider Management
adminRouter.get("/providers/pending", authAdmin, getPendingProviders)
adminRouter.get("/providers", authAdmin, getAllProviders)
adminRouter.get("/providers/:providerId", authAdmin, getProviderDetails)
adminRouter.put("/providers/:providerId/verify", authAdmin, verifyProvider)

// Analytics
adminRouter.get("/analytics", authAdmin, getAnalytics)

module.exports=adminRouter