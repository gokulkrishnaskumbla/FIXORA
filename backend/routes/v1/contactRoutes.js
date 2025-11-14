const express = require("express");
const { authAdmin } = require("../../Middlewares/auth");
const { submitContact, getAllContacts, deleteContact } = require("../../Controllers/contactController");


const router = express.Router();

router.post("/create", submitContact); // Public route

router.get("/all-contacts", authAdmin, getAllContacts); // Admin only
router.delete("/delete/:id", authAdmin, deleteContact); // Admin only

module.exports = router;
