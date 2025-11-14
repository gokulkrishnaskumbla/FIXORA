const { image } = require("../config/cloudinary")
const serviceDb = require("../Models/serviceModel");
const uploadToCloudinary = require("../Utilities/imageUpload")

const create = async (req, res) => {
    try {
        const { title, description, duration, price, category } = req.body

        if (!title || !description || !duration || !price) {
            return res.status(400).json({ error: "All fields are required" })
        }
        if (!req.file) {
            return res.status(400).json({ error: 'image not found' })
        }

        const cloudinaryRes = await uploadToCloudinary(req.file.path)
        console.log(req.file, "image uploaded by cloudinary")
        const newService = new serviceDb({
            title,
            description,
            duration,
            price,
            category: category || 'others',
            image: cloudinaryRes,
            owner: req.user && req.user._id,
            ownerModel: 'Admin'
        })
        let savedService = await newService.save()
        if (savedService) {
            return res.status(200).json({ message: "service added", savedService })
        }
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" })
    }
}

const listServices = async (req, res) => {
    try {
        const { category } = req.query;
        let filter = {};
        if (category) filter.category = category;
        const serviceList = await serviceDb.find(filter);
        res.status(200).json(serviceList)

    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" })
    }
}

const serviceDetails = async (req, res) => {
    try {
        const { serviceId } = req.params;

        const serviceDetails = await serviceDb.findById({ _id: serviceId })
        if (!serviceDetails) {
            return res.status(400).json({ error: "service not found" })
        }
        return res.status(200).json(serviceDetails)
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" })
    }
}

const updateService = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { title, description, duration, price, category } = req.body
        let imageUrl;

        let isServiceExist = await serviceDb.findById(serviceId)

        if (!isServiceExist) {
            return res.status(400).json({ error: "service not found" })
        }
        if (req.file) {
            const cloudinaryRes = await uploadToCloudinary(req.file.path)
            imageUrl = cloudinaryRes
        }

    const updatePayload = { title, description, duration, price };
    if (imageUrl) updatePayload.image = imageUrl;
    if (category) updatePayload.category = category;

    const updatedService = await serviceDb.findByIdAndUpdate(serviceId, updatePayload, { new: true })
        res.json({ message: 'service updated', updatedService })
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" })
    }
}

const deleteService = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const deleteService = await serviceDb.findByIdAndDelete(serviceId)
        if (!deleteService) {
            return res.status(400).json({ error: "service not found" })

        }
        res.status(200).json({ message: "service deleted" })

    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" })
    }
}

module.exports = {
    create,
    listServices,
    serviceDetails,
    updateService,
    deleteService
}