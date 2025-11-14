const cartRouter = require('express').Router()
const { addToCart, getMyCart, removeFromCart, clearCart } = require('../../Controllers/cartController')
const { authUser } = require('../../Middlewares/auth')

cartRouter.post("/addtocart/:serviceId", authUser, addToCart)
cartRouter.get("/mycart", authUser, getMyCart)
cartRouter.delete("/remove/:serviceId", authUser, removeFromCart)
cartRouter.delete("/clear", authUser, clearCart)

module.exports = cartRouter