const { create, listServices, serviceDetails, updateService, deleteService } = require('../../Controllers/serviceController')
const { authAdmin } = require('../../Middlewares/auth')
const upload = require('../../Middlewares/multer')

const serviceRouter= require('express').Router()

serviceRouter.post("/create",authAdmin,upload.single("image"),create)
serviceRouter.get("/listservices",listServices)
serviceRouter.get("/serviceDetails/:serviceId",serviceDetails)
serviceRouter.put("/update/:serviceId",authAdmin,upload.single("image"),updateService)
serviceRouter.delete("/delete/:serviceId",authAdmin,deleteService)

module.exports=serviceRouter