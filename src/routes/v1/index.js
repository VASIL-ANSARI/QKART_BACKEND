const express = require("express");
const userRoute = require("./user.route");
const router = express.Router();
const authRoute = require("./auth.route");
const productRoute = require("./product.route");
const cartRoute = require("./cart.route");


router.use("/auth",authRoute);
router.use("/products", productRoute);
router.use("/users", userRoute);
router.use("/cart", cartRoute);

module.exports = router;
