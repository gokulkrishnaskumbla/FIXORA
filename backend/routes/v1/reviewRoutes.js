const express = require("express");
const { addReview, getAllReviews, getReviewsByService, deleteReview } = require("../../Controllers/reviewController");
const { authUser, authAdmin } = require("../../Middlewares/auth");

const router = express.Router();

router.post("/add", authUser, addReview);
router.get("/all", getAllReviews);
router.get("/service/:serviceId", getReviewsByService);
router.delete("/delete/:id", authUser, deleteReview);
router.delete("/admin/delete/:id", authAdmin, deleteReview); // Admin can delete any review

module.exports = router;
